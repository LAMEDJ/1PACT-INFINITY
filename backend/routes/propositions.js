/**
 * API propositions : envoi d’une proposition par un utilisateur (catégorie, public cible, titre, description).
 * Authentification requise (user ou association).
 */
import { Router } from 'express';
import { db } from '../db.js';
import { authUser } from '../middleware/auth.js';

const router = Router();

// Enregistrer une nouvelle proposition (utilisateur connecté)
router.post('/', authUser, async (req, res) => {
  const { category, public_cible, titre, description, association_id } = req.body;
  const payload = {
    user_id: req.userType === 'user' ? req.userId : null,
    association_id: association_id || null,
    category: (category || '').toString().trim().slice(0, 100),
    public_cible: (public_cible || '').toString().trim().slice(0, 200),
    titre: (titre || '').toString().trim().slice(0, 300),
    description: (description || '').toString().trim().slice(0, 2000),
  };
  try {
    const id = await db.propositions.add(payload);
    const row = { id, ...payload, created_at: new Date().toISOString() };
    return res.status(201).json(row);
  } catch (err) {
    return res.status(500).json({ error: 'Impossible d’enregistrer la proposition.' });
  }
});

export default router;
