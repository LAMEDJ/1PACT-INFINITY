import { Router } from 'express';
import { db } from '../db.js';
import { authUser } from '../middleware/auth.js';
import { updateImpactSystem } from '../impactSystem.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
    const category = req.query.category;
    const public_cible = req.query.public_cible;
    const q = (req.query.q || '').trim().toLowerCase();
    let rows = (await db.publications.getAll()).filter((p) => p.visibility === 'public');
    if (category || public_cible || q) {
      const allAssocs = await db.associations.getAll();
      const assocIds = allAssocs
        .filter((a) => {
          if (category && a.category !== category) return false;
          if (public_cible && !(a.public_cible || '').toLowerCase().includes(public_cible.toLowerCase())) return false;
          if (q && !(a.name || '').toLowerCase().includes(q) && !(a.bio || '').toLowerCase().includes(q)) return false;
          return true;
        })
        .map((a) => a.id);
      rows = rows.filter((p) => assocIds.includes(p.association_id));
    }
    rows = rows.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, limit);
    const withCounts = [];
    for (const row of rows) {
      const assoc = await db.associations.get(row.association_id);
      const likes = await db.publicationLikes.count(row.id);
      const commentsList = await db.publicationComments.getByPublication(row.id);
      withCounts.push({
        ...row,
        association_name: assoc?.name,
        association_logo: assoc?.logo_url,
        likes,
        comments: commentsList.length,
      });
    }
    return res.json(withCounts);
  } catch (e) {
    console.error('Publications list error:', e);
    return res.status(500).json({ error: e?.message || 'Erreur serveur' });
  }
});

router.post('/', authUser, async (req, res) => {
  if (req.userType !== 'association') return res.status(403).json({ error: 'Réservé aux associations' });
  const { text, image_url, video_url, visibility } = req.body;
  if (!text) return res.status(400).json({ error: 'Texte requis' });
  const id = await db.publications.add({
    association_id: req.userId,
    text: text || '',
    image_url: image_url || null,
    video_url: video_url || null,
    visibility: visibility || 'public',
  });
  const row = await db.publications.get(id);
  return res.status(201).json(row);
});

router.patch('/:id', authUser, async (req, res) => {
  if (req.userType !== 'association') return res.status(403).json({ error: 'Réservé aux associations' });
  const pub = await db.publications.get(Number(req.params.id));
  if (!pub || pub.association_id !== req.userId) return res.status(404).json({ error: 'Publication introuvable' });
  const { text, image_url, video_url, visibility } = req.body;
  const upd = {};
  if (text !== undefined) upd.text = text;
  if (image_url !== undefined) upd.image_url = image_url;
  if (video_url !== undefined) upd.video_url = video_url;
  if (visibility !== undefined) upd.visibility = visibility;
  await db.publications.update(pub.id, upd);
  const updated = await db.publications.get(pub.id);
  return res.json(updated);
});

router.delete('/:id', authUser, async (req, res) => {
  if (req.userType !== 'association') return res.status(403).json({ error: 'Réservé aux associations' });
  const pub = await db.publications.get(Number(req.params.id));
  if (!pub || pub.association_id !== req.userId) return res.status(404).json({ error: 'Publication introuvable' });
  await db.publications.delete(pub.id);
  return res.status(204).send();
});

router.post('/:id/like', authUser, async (req, res) => {
  if (req.userType !== 'user') return res.status(403).json({ error: 'Réservé aux utilisateurs' });
  const pub = await db.publications.get(Number(req.params.id));
  if (!pub) return res.status(404).json({ error: 'Publication introuvable' });
  const liked = await db.publicationLikes.toggle(Number(req.params.id), req.userId);
  if (liked) {
    await updateImpactSystem(req.userId).catch(() => {});
    // Notification like → association propriétaire de la publication
    const user = await db.users.get(req.userId);
    await db.notifications.add({
      user_id: null,
      association_id: pub.association_id,
      type: 'like',
      payload: {
        publication_id: pub.id,
        from_user_id: req.userId,
        from_user_name: user?.name || 'Utilisateur',
      },
    });
  }
  return res.json({ liked });
});

router.get('/:id/comments', async (req, res) => {
  const list = await db.publicationComments.getByPublication(Number(req.params.id));
  const result = [];
  for (const c of list) {
    const u = c.user_id ? await db.users.get(c.user_id) : null;
    const a = c.association_id ? await db.associations.get(c.association_id) : null;
    result.push({ id: c.id, text: c.text, created_at: c.created_at, user_name: u?.name, association_name: a?.name });
  }
  return res.json(result);
});

const COMMENT_MAX_LENGTH = 2000;

router.post('/:id/comments', authUser, async (req, res) => {
  const { text: raw } = req.body;
  if (raw === undefined || raw === null) return res.status(400).json({ error: 'Texte requis' });
  const text = String(raw).trim();
  if (!text) return res.status(400).json({ error: 'Texte requis' });
  if (text.length > COMMENT_MAX_LENGTH) return res.status(400).json({ error: `Commentaire trop long (max ${COMMENT_MAX_LENGTH} caractères)` });
  const pub = await db.publications.get(Number(req.params.id));
  if (!pub) return res.status(404).json({ error: 'Publication introuvable' });
  const userId = req.userType === 'user' ? req.userId : null;
  const associationId = req.userType === 'association' ? req.userId : null;
  await db.publicationComments.add({ publication_id: Number(req.params.id), user_id: userId, association_id: associationId, text });
  if (userId) await updateImpactSystem(userId).catch(() => {});
  const comments = await db.publicationComments.getByPublication(Number(req.params.id));
  const row = comments[comments.length - 1];
  // Notification commentaire → association propriétaire de la publication
  if (pub.association_id) {
    let actorName = 'Utilisateur';
    if (userId) {
      const u = await db.users.get(userId);
      if (u?.name) actorName = u.name;
    } else if (associationId) {
      const a = await db.associations.get(associationId);
      if (a?.name) actorName = a.name;
    }
    await db.notifications.add({
      user_id: null,
      association_id: pub.association_id,
      type: 'comment',
      payload: {
        publication_id: pub.id,
        from_user_id: userId,
        from_association_id: associationId,
        from_name: actorName,
        text,
      },
    });
  }
  return res.status(201).json(row);
});

export default router;
