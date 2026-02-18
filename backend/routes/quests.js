/**
 * Route API des quêtes géolocalisées (carte 1PACT).
 * Lecture publique : pas d’auth requise.
 */
import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const list = await db.quests.getAll();
    const out = (list || []).map((q) => ({
      id: q.id,
      title: q.title,
      description: q.description,
      lat: q.lat,
      lng: q.lng,
      radius_m: q.radius_m,
      reward: q.reward,
      icon_url: q.icon_url,
      progression: q.progression,
    }));
    return res.json(out);
  } catch (e) {
    console.error('Quests list error:', e);
    return res.status(500).json({ error: e?.message || 'Erreur serveur' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ error: 'ID invalide' });
    const q = await db.quests.get(id);
    if (!q) return res.status(404).json({ error: 'Quête introuvable' });
    return res.json({
      id: q.id,
      title: q.title,
      description: q.description,
      lat: q.lat,
      lng: q.lng,
      radius_m: q.radius_m,
      reward: q.reward,
      icon_url: q.icon_url,
      progression: q.progression,
    });
  } catch (e) {
    console.error('Quest get error:', e);
    return res.status(500).json({ error: e?.message || 'Erreur serveur' });
  }
});

export default router;
