/**
 * Suivre / ne plus suivre une association (utilisateurs uniquement).
 */
import { Router } from 'express';
import { db } from '../db.js';
import { authUser } from '../middleware/auth.js';
import { updateImpactSystem } from '../impactSystem.js';

const router = Router();

router.get('/', authUser, async (req, res) => {
  if (req.userType !== 'user') return res.status(403).json({ error: 'Réservé aux utilisateurs' });
  const followList = await db.follows.getByUser(req.userId);
  const ids = followList.map((f) => f.association_id);
  const result = [];
  for (const id of ids) {
    const a = await db.associations.get(id);
    if (a) result.push({ id: a.id, name: a.name, category: a.category, location: a.location, logo_url: a.logo_url });
  }
  return res.json(result);
});

router.post('/:id', authUser, async (req, res) => {
  if (req.userType !== 'user') return res.status(403).json({ error: 'Réservé aux utilisateurs' });
  const id = Number(req.params.id);
  const assoc = await db.associations.get(id);
  if (!assoc) return res.status(404).json({ error: 'Association introuvable' });
  await db.follows.add(req.userId, id);
  await updateImpactSystem(req.userId).catch(() => {});
  return res.json({ followed: true });
});

router.delete('/:id', authUser, async (req, res) => {
  if (req.userType !== 'user') return res.status(403).json({ error: 'Réservé aux utilisateurs' });
  const id = Number(req.params.id);
  await db.follows.remove(req.userId, id);
  return res.status(204).send();
});

export default router;
