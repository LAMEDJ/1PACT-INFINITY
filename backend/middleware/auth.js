/**
 * Vérification du token JWT pour protéger les routes.
 */
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || '1pact-dev-secret-change-in-production';
if (process.env.NODE_ENV === 'production' && (JWT_SECRET.length < 24 || JWT_SECRET === '1pact-dev-secret-change-in-production')) {
  console.error('Production : JWT_SECRET doit être défini et fort (min. 24 caractères) dans .env');
}

export function authUser(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: 'Token manquant' });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.userId;
    req.userType = payload.userType; // 'user' | 'association'
    next();
  } catch {
    return res.status(401).json({ error: 'Token invalide' });
  }
}

/** Optionnel : si token présent, remplit req.userId/req.userType ; sinon next quand même */
export function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return next();
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.userId;
    req.userType = payload.userType;
  } catch {}
  next();
}

export { JWT_SECRET };
