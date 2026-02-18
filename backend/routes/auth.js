import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db.js';
import { JWT_SECRET, authUser } from '../middleware/auth.js';
import { applyRegistrationBonus } from '../impactSystem.js';

const router = Router();

// Limite : 10 tentatives login/register par IP / 15 min (sécurité brute-force)
const authAttempts = new Map();
const AUTH_WINDOW_MS = 15 * 60 * 1000;
const AUTH_MAX = 10;
function authRateLimit(req, res, next) {
  const ip = req.ip || req.socket?.remoteAddress || 'unknown';
  const now = Date.now();
  let list = authAttempts.get(ip) || [];
  list = list.filter((t) => now - t < AUTH_WINDOW_MS);
  if (list.length >= AUTH_MAX) {
    return res.status(429).json({ error: 'Trop de tentatives. Réessaie dans 15 minutes.' });
  }
  list.push(now);
  authAttempts.set(ip, list);
  next();
}

function signToken(id, userType) {
  return jwt.sign({ userId: id, userType }, JWT_SECRET, { expiresIn: '30d' });
}

function isDuplicateError(e) {
  const msg = (e?.message || '').toLowerCase();
  return e?.code === '23505' || /unique|duplicate|unicité|violates.*constraint/i.test(msg);
}

router.post('/register/user', authRateLimit, async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) return res.status(400).json({ error: 'Email, mot de passe et nom requis' });
    if (password.length < 8) return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 8 caractères' });
    const emailNorm = String(email).trim().toLowerCase();
    if (!emailNorm) return res.status(400).json({ error: 'Email invalide' });
    const existing = await db.users.getByEmail(emailNorm);
    if (existing) return res.status(400).json({ error: 'Email déjà utilisé' });
    const password_hash = bcrypt.hashSync(password, 10);
    const id = await db.users.add({ email: emailNorm, password_hash, name: String(name).trim() });
    await applyRegistrationBonus(id);
    const token = signToken(id, 'user');
    // Renvoyer un payload utilisateur robuste, même si la lecture en base échoue
    let safeUser = {
      id,
      email: emailNorm,
      name: String(name).trim(),
      type: 'user',
      impact_points: 0,
      impact_level: 1,
    };
    try {
      const user = await db.users.get(id);
      if (user) {
        safeUser = {
          id: user.id ?? id,
          email: user.email ?? emailNorm,
          name: user.name ?? String(name).trim(),
          type: 'user',
          impact_points: user.impact_points ?? 0,
          impact_level: user.impact_level ?? 1,
        };
      }
    } catch {
      // On ignore l'erreur de lecture : l'inscription reste valide, on renvoie safeUser.
    }
    return res.status(201).json({ token, user: safeUser });
  } catch (e) {
    if (isDuplicateError(e)) return res.status(400).json({ error: 'Email déjà utilisé' });
    return res.status(500).json({ error: e?.message || 'Erreur serveur' });
  }
});

router.post('/register/association', authRateLimit, async (req, res) => {
  try {
    const { email, password, name, bio, category, public_cible, location, contact } = req.body;
    if (!email || !password || !name) return res.status(400).json({ error: 'Email, mot de passe et nom requis' });
    if (password.length < 8) return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 8 caractères' });
    const emailNorm = String(email).trim().toLowerCase();
    if (!emailNorm) return res.status(400).json({ error: 'Email invalide' });
    const existing = await db.associations.getByEmail(emailNorm);
    if (existing) return res.status(400).json({ error: 'Email déjà utilisé' });
    const password_hash = bcrypt.hashSync(password, 10);
    const id = await db.associations.add({ email: emailNorm, password_hash, name: String(name).trim(), bio: bio || '', category: category || '', public_cible: public_cible || '', location: location || '', contact: contact || emailNorm });
    const token = signToken(id, 'association');
    let loginUser = { id, email: emailNorm, name: String(name).trim(), type: 'association' };
    try {
      const user = await db.associations.get(id);
      if (user) {
        loginUser = {
          id: user.id ?? id,
          email: user.email ?? emailNorm,
          name: user.name ?? String(name).trim(),
          type: 'association',
        };
        loginUser.bio = user.bio ?? null;
        loginUser.category = user.category ?? null;
        loginUser.location = user.location ?? null;
        loginUser.contact = user.contact ?? null;
      }
    } catch {
      // On garde loginUser minimal si la lecture échoue.
    }
    return res.status(201).json({ token, user: loginUser });
  } catch (e) {
    if (isDuplicateError(e)) return res.status(400).json({ error: 'Email déjà utilisé' });
    return res.status(500).json({ error: e?.message || 'Erreur serveur' });
  }
});

router.post('/login', authRateLimit, async (req, res) => {
  const { email, password, type } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis' });
  const emailNorm = String(email).trim().toLowerCase();
  const isAssoc = type === 'association';
  const row = isAssoc ? await db.associations.getByEmail(emailNorm) : await db.users.getByEmail(emailNorm);
  if (!row || !bcrypt.compareSync(password, row.password_hash)) return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
  const userType = isAssoc ? 'association' : 'user';
  const token = signToken(row.id, userType);
  const loginUser = { id: row.id, email: row.email, name: row.name, type: userType };
  if (userType === 'user') {
    loginUser.impact_points = row.impact_points ?? 0;
    loginUser.impact_level = row.impact_level ?? 1;
    loginUser.total_valid_actions = row.total_valid_actions ?? 0;
    loginUser.bio = row.bio ?? null;
    loginUser.avatar_url = row.avatar_url ?? null;
    loginUser.city = row.city ?? null;
    loginUser.phone = row.phone ?? null;
    loginUser.profile_visibility = row.profile_visibility ?? 'public';
    loginUser.notifications_enabled = row.notifications_enabled !== false;
  } else {
    loginUser.bio = row.bio ?? null;
    loginUser.category = row.category ?? null;
    loginUser.location = row.location ?? null;
    loginUser.contact = row.contact ?? null;
    loginUser.avatar_url = row.avatar_url ?? null;
  }
  return res.json({ token, user: loginUser });
});

router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Non connecté' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const row = payload.userType === 'association' ? await db.associations.get(payload.userId) : await db.users.get(payload.userId);
    if (!row) return res.status(404).json({ error: 'Utilisateur introuvable' });
    const userPayload = { id: row.id, email: row.email, name: row.name, type: payload.userType };
    if (payload.userType === 'user') {
      userPayload.impact_points = row.impact_points ?? 0;
      userPayload.impact_level = row.impact_level ?? 1;
      userPayload.total_valid_actions = row.total_valid_actions ?? 0;
      userPayload.bio = row.bio ?? null;
      userPayload.avatar_url = row.avatar_url ?? null;
      userPayload.city = row.city ?? null;
      userPayload.phone = row.phone ?? null;
      userPayload.profile_visibility = row.profile_visibility ?? 'public';
      userPayload.notifications_enabled = row.notifications_enabled !== false;
    }
    if (payload.userType === 'association') {
      userPayload.bio = row.bio ?? null;
      userPayload.category = row.category ?? null;
      userPayload.location = row.location ?? null;
      userPayload.contact = row.contact ?? null;
      userPayload.avatar_url = row.avatar_url ?? null;
    }
    return res.json({ user: userPayload });
  } catch {
    return res.status(401).json({ error: 'Token invalide' });
  }
});

/** Mise à jour du profil (utilisateur ou association). */
router.patch('/me', authUser, async (req, res) => {
  try {
    if (req.userType === 'user') {
      const { name, bio, avatar_url, city, phone } = req.body;
      const upd = {};
      if (typeof name === 'string' && name.trim()) upd.name = name.trim();
      if (typeof bio === 'string') upd.bio = bio.trim();
      if (avatar_url !== undefined) upd.avatar_url = avatar_url === null || avatar_url === '' ? null : String(avatar_url);
      if (typeof city === 'string') upd.city = city.trim() || null;
      if (typeof phone === 'string') upd.phone = phone.trim() || null;
      if (Object.keys(upd).length === 0) return res.status(400).json({ error: 'Aucune donnée à mettre à jour' });
      await db.users.update(req.userId, upd);
      const row = await db.users.get(req.userId);
      const userPayload = { id: row.id, email: row.email, name: row.name, type: 'user' };
      userPayload.impact_points = row.impact_points ?? 0;
      userPayload.impact_level = row.impact_level ?? 1;
      userPayload.total_valid_actions = row.total_valid_actions ?? 0;
      userPayload.bio = row.bio ?? null;
      userPayload.avatar_url = row.avatar_url ?? null;
      userPayload.city = row.city ?? null;
      userPayload.phone = row.phone ?? null;
      return res.json({ user: userPayload });
    }
    if (req.userType === 'association') {
      const { name, bio, category, location, contact, avatar_url } = req.body;
      const upd = {};
      if (typeof name === 'string' && name.trim()) upd.name = name.trim();
      if (typeof bio === 'string') upd.bio = bio.trim();
      if (typeof category === 'string') upd.category = category.trim() || null;
      if (typeof location === 'string') upd.location = location.trim() || null;
      if (typeof contact === 'string') upd.contact = contact.trim() || null;
      if (avatar_url !== undefined) upd.avatar_url = avatar_url === null || avatar_url === '' ? null : String(avatar_url);
      if (Object.keys(upd).length === 0) return res.status(400).json({ error: 'Aucune donnée à mettre à jour' });
      await db.associations.update(req.userId, upd);
      const row = await db.associations.get(req.userId);
      const userPayload = { id: row.id, email: row.email, name: row.name, type: 'association' };
      userPayload.bio = row.bio ?? null;
      userPayload.category = row.category ?? null;
      userPayload.location = row.location ?? null;
      userPayload.contact = row.contact ?? null;
      userPayload.avatar_url = row.avatar_url ?? null;
      return res.json({ user: userPayload });
    }
    return res.status(403).json({ error: 'Type de compte non géré' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

/** Mise à jour email / mot de passe (mot de passe actuel requis). */
router.patch('/me/account', authUser, async (req, res) => {
  try {
    const { currentPassword, newEmail, newPassword } = req.body;
    if (!currentPassword || typeof currentPassword !== 'string') {
      return res.status(400).json({ error: 'Mot de passe actuel requis' });
    }
    const store = req.userType === 'association' ? db.associations : db.users;
    const row = await store.get(req.userId);
    if (!row || !bcrypt.compareSync(currentPassword, row.password_hash)) {
      return res.status(401).json({ error: 'Mot de passe actuel incorrect' });
    }
    const upd = {};
    if (newEmail !== undefined && newEmail !== row.email) {
      const trimmed = String(newEmail).trim().toLowerCase();
      if (!trimmed) return res.status(400).json({ error: 'Nouvel email invalide' });
      const existing = await store.getByEmail(trimmed);
      if (existing) return res.status(400).json({ error: 'Email déjà utilisé' });
      upd.email = trimmed;
    }
    if (newPassword !== undefined && String(newPassword).trim()) {
      const pwd = String(newPassword).trim();
      if (pwd.length < 8) return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 8 caractères' });
      upd.password_hash = bcrypt.hashSync(pwd, 10);
    }
    if (Object.keys(upd).length === 0) return res.status(400).json({ error: 'Aucune donnée à mettre à jour' });
    await store.update(req.userId, upd);
    const updated = await store.get(req.userId);
    const userPayload = { id: updated.id, email: updated.email, name: updated.name, type: req.userType };
    if (req.userType === 'user') {
      userPayload.impact_points = updated.impact_points ?? 0;
      userPayload.bio = updated.bio ?? null;
      userPayload.avatar_url = updated.avatar_url ?? null;
      userPayload.city = updated.city ?? null;
      userPayload.phone = updated.phone ?? null;
      userPayload.profile_visibility = updated.profile_visibility ?? 'public';
      userPayload.notifications_enabled = updated.notifications_enabled !== false;
    } else {
      userPayload.bio = updated.bio ?? null;
      userPayload.category = updated.category ?? null;
      userPayload.location = updated.location ?? null;
      userPayload.contact = updated.contact ?? null;
    }
    return res.json({ user: userPayload });
  } catch (e) {
    if (isDuplicateError(e)) return res.status(400).json({ error: 'Email déjà utilisé' });
    return res.status(500).json({ error: e?.message || 'Erreur serveur' });
  }
});

/** Préférences : confidentialité et notifications. */
router.patch('/me/preferences', authUser, async (req, res) => {
  try {
    if (req.userType !== 'user') {
      return res.status(400).json({ error: 'Préférences disponibles pour les utilisateurs uniquement' });
    }
    const { profile_visibility, notifications_enabled } = req.body;
    const upd = {};
    if (profile_visibility !== undefined) {
      const v = String(profile_visibility).trim();
      if (['public', 'friends', 'private'].includes(v)) upd.profile_visibility = v;
    }
    if (notifications_enabled !== undefined) upd.notifications_enabled = !!notifications_enabled;
    if (Object.keys(upd).length === 0) return res.status(400).json({ error: 'Aucune préférence à mettre à jour' });
    await db.users.update(req.userId, upd);
    const row = await db.users.get(req.userId);
    const userPayload = { id: row.id, email: row.email, name: row.name, type: 'user' };
    userPayload.impact_points = row.impact_points ?? 0;
    userPayload.bio = row.bio ?? null;
    userPayload.avatar_url = row.avatar_url ?? null;
    userPayload.city = row.city ?? null;
    userPayload.phone = row.phone ?? null;
    userPayload.profile_visibility = row.profile_visibility ?? 'public';
    userPayload.notifications_enabled = row.notifications_enabled !== false;
    return res.json({ user: userPayload });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

/** Suppression du compte (mot de passe requis). */
router.delete('/me', authUser, async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || typeof password !== 'string') {
      return res.status(400).json({ error: 'Mot de passe requis pour confirmer la suppression' });
    }
    const store = req.userType === 'association' ? db.associations : db.users;
    const row = await store.get(req.userId);
    if (!row || !bcrypt.compareSync(password, row.password_hash)) {
      return res.status(401).json({ error: 'Mot de passe incorrect' });
    }
    await store.delete(req.userId);
    return res.status(200).json({ message: 'Compte supprimé' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

export default router;
