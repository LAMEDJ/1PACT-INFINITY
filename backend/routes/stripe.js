/**
 * Paiement / abonnement Stripe (préparation MVP).
 * À activer avec STRIPE_SECRET_KEY et Stripe SDK en production.
 */
import { Router } from 'express';
import { authUser } from '../middleware/auth.js';

const router = Router();

// POST /stripe/create-checkout-session – créer une session de paiement (abonnement)
router.post('/create-checkout-session', authUser, (req, res) => {
  if (req.userType !== 'association') return res.status(403).json({ error: 'Réservé aux associations' });
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    return res.status(503).json({
      error: 'Paiement non configuré',
      message: 'Ajoutez STRIPE_SECRET_KEY dans les variables d\'environnement pour activer Stripe.',
    });
  }
  // En production : const stripe = require('stripe')(secret);
  // const session = await stripe.checkout.sessions.create({ ... });
  // return res.json({ url: session.url });
  return res.status(503).json({
    error: 'Stripe non configuré pour ce démo',
    message: 'Configurez STRIPE_SECRET_KEY et le produit/prix Stripe pour activer l\'abonnement.',
  });
});

// GET /stripe/portal – accès au portail client Stripe (gérer abonnement)
router.get('/portal', authUser, (req, res) => {
  if (req.userType !== 'association') return res.status(403).json({ error: 'Réservé aux associations' });
  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(503).json({ error: 'Paiement non configuré' });
  }
  return res.status(503).json({ message: 'Portail Stripe à configurer' });
});

export default router;
