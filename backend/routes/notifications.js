import { Router } from 'express';
import { db } from '../db.js';
import { authUser } from '../middleware/auth.js';

const router = Router();

// Liste des notifications les plus récentes pour l'utilisateur connecté
router.get('/', authUser, async (req, res) => {
  try {
    const userId = req.userType === 'user' ? req.userId : null;
    const associationId = req.userType === 'association' ? req.userId : null;
    const rows = await db.notifications.getForUser(userId, associationId, 50);
    return res.json(rows);
  } catch (e) {
    console.error('Notifications list error:', e);
    return res.status(500).json({ error: e?.message || 'Erreur serveur' });
  }
});

// Marquer toutes les notifications comme lues
router.post('/read-all', authUser, async (req, res) => {
  try {
    const userId = req.userType === 'user' ? req.userId : null;
    const associationId = req.userType === 'association' ? req.userId : null;
    await db.notifications.markAllRead(userId, associationId);
    return res.status(204).send();
  } catch (e) {
    console.error('Notifications markAllRead error:', e);
    return res.status(500).json({ error: e?.message || 'Erreur serveur' });
  }
});

export default router;

