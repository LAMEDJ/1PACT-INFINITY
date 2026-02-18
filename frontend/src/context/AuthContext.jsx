/**
 * Contexte d'authentification – utilisateur ou association connecté(e).
 */
import { createContext, useContext, useState, useEffect } from 'react';
import { api, getToken, setToken } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [impactFeedback, setImpactFeedback] = useState({ pointsGain: 0, levelUp: false });

  useEffect(() => {
    if (!getToken()) {
      setUser(null);
      setLoading(false);
      return;
    }
    api.auth.me()
      .then((data) => setUser(data.user))
      .catch((err) => {
        if (err?.statusCode === 401) setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const onUnauthorized = () => setUser(null);
    window.addEventListener('1pact_unauthorized', onUnauthorized);
    return () => window.removeEventListener('1pact_unauthorized', onUnauthorized);
  }, []);

  const login = async (email, password, type = 'user') => {
    const data = await api.auth.login(email, password, type);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const registerUser = async (email, password, name) => {
    const data = await api.auth.registerUser(email, password, name);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const registerAssociation = async (body) => {
    const data = await api.auth.registerAssociation(body);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  /** Vérifie si la session (token) est encore valide ; nettoie uniquement si token expiré/invalide (401) */
  const checkSession = async () => {
    if (!getToken()) return false;
    try {
      const data = await api.auth.me();
      setUser(data.user);
      return true;
    } catch (err) {
      if (err?.statusCode === 401) setToken(null);
      setUser(null);
      return false;
    }
  };

  /** Rafraîchit les infos utilisateur (ex. après like/follow pour mettre à jour impact_points) */
  const refreshUser = async () => {
    if (!getToken()) return;
    try {
      const data = await api.auth.me();
      const newUser = data.user;
      const prev = user;
      const pointsGain = prev?.type === 'user' && newUser?.type === 'user'
        ? (newUser.impact_points ?? 0) - (prev.impact_points ?? 0)
        : 0;
      const levelUp = prev?.type === 'user' && newUser?.type === 'user'
        ? (newUser.impact_level ?? 1) > (prev.impact_level ?? 1)
        : false;
      setUser(newUser);
      if (pointsGain > 0 || levelUp) {
        setImpactFeedback({ pointsGain: Math.max(0, pointsGain), levelUp });
      }
    } catch (_) {}
  };

  const clearImpactFeedback = () => setImpactFeedback({ pointsGain: 0, levelUp: false });
  /** Efface uniquement le gain de points (pour que la modal niveau reste affichée) */
  const clearPointsGain = () => setImpactFeedback((prev) => ({ ...prev, pointsGain: 0 }));

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    loading,
    isAssociation: user?.type === 'association',
    isUser: user?.type === 'user',
    login,
    registerUser,
    registerAssociation,
    logout,
    checkSession,
    refreshUser,
    impactFeedback,
    clearImpactFeedback,
    clearPointsGain,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/* eslint-disable react-refresh/only-export-components -- useAuth doit rester avec AuthProvider */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans AuthProvider');
  return ctx;
}
