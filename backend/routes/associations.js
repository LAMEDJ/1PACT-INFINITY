import { Router } from 'express';
import { db } from '../db.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    let list = await db.associations.getAll();
    if (req.query.category) list = list.filter((a) => a.category === req.query.category);
    if (req.query.public_cible) list = list.filter((a) => (a.public_cible || '').includes(req.query.public_cible));
    if (req.query.q) {
      const q = (req.query.q || '').toLowerCase();
      list = list.filter((a) => (a.name || '').toLowerCase().includes(q) || (a.bio || '').toLowerCase().includes(q));
    }
    list = list.sort((a, b) => (b.impact_points || 0) - (a.impact_points || 0));
    const result = [];
    for (const a of list) {
      const pubs = await db.publications.getByAssociation(a.id);
      result.push({
        id: a.id,
        name: a.name,
        logo_url: a.logo_url,
        banner_url: a.banner_url,
        bio: a.bio,
        category: a.category,
        public_cible: a.public_cible,
        location: a.location,
        contact: a.contact,
        impact_points: a.impact_points,
        publications_count: pubs.length,
        latitude: a.latitude,
        longitude: a.longitude,
      });
    }
    return res.json(result);
  } catch (e) {
    console.error('Associations list error:', e);
    return res.status(500).json({ error: e?.message || 'Erreur serveur' });
  }
});

router.get('/:id', optionalAuth, async (req, res) => {
  const a = await db.associations.get(Number(req.params.id));
  if (!a) return res.status(404).json({ error: 'Association introuvable' });
  await db.associations.incrementViews(a.id);
  const publications = (await db.publications.getByAssociation(a.id)).slice(0, 20);
  let followed = false;
  if (req.userId && req.userType === 'user') {
    const userFollows = await db.follows.getByUser(req.userId);
    followed = userFollows.some((f) => f.association_id === a.id);
  }
  const assoc = await db.associations.get(Number(req.params.id));
  const publicationsCount = (await db.publications.getByAssociation(a.id)).length;
  const subscribersCount = await db.follows.countByAssociation(a.id);
  return res.json({
    id: assoc.id,
    name: assoc.name,
    logo_url: assoc.logo_url,
    banner_url: assoc.banner_url,
    bio: assoc.bio,
    category: assoc.category,
    public_cible: assoc.public_cible,
    location: assoc.location,
    contact: assoc.contact,
    impact_points: assoc.impact_points ?? 0,
    profile_views: assoc.profile_views || 0,
    publications,
    publicationsCount,
    subscribersCount,
    latitude: assoc.latitude,
    longitude: assoc.longitude,
    followed,
  });
});

export default router;
