import { Router } from 'express';
import { db } from '../db.js';
import { authUser } from '../middleware/auth.js';

const router = Router();

router.get('/stats', authUser, async (req, res) => {
  if (req.userType !== 'association') return res.status(403).json({ error: 'Réservé aux associations' });
  const a = await db.associations.get(req.userId);
  if (!a) return res.status(404).json({ error: 'Association introuvable' });
  const pubs = await db.publications.getByAssociation(req.userId);
  let likesTotal = 0;
  let commentsTotal = 0;
  for (const p of pubs) {
    likesTotal += await db.publicationLikes.count(p.id);
    commentsTotal += (await db.publicationComments.getByPublication(p.id)).length;
  }
  const subscribers = await db.follows.countByAssociation(req.userId);
  return res.json({
    profileViews: a.profile_views || 0,
    subscribers,
    publications: pubs.length,
    likes: likesTotal,
    comments: commentsTotal,
    impact_points: a.impact_points ?? 0,
  });
});

router.get('/publications', authUser, async (req, res) => {
  if (req.userType !== 'association') return res.status(403).json({ error: 'Réservé aux associations' });
  const rows = await db.publications.getByAssociation(req.userId);
  const result = [];
  for (const r of rows) {
    const likes = await db.publicationLikes.count(r.id);
    result.push({ ...r, likes });
  }
  return res.json(result);
});

router.get('/publications/:id', authUser, async (req, res) => {
  if (req.userType !== 'association') return res.status(403).json({ error: 'Réservé aux associations' });
  const pub = await db.publications.get(Number(req.params.id));
  if (!pub || pub.association_id !== req.userId) return res.status(404).json({ error: 'Publication introuvable' });
  return res.json(pub);
});

export default router;
