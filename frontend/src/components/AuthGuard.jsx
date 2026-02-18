/**
 * Garde d'authentification réutilisable.
 * - Affiche un loader pendant la vérification de session.
 * - Si pas de user → redirection vers /login ou /auth (replace, pas de retour arrière).
 * - Si user → affiche les children.
 *
 * Utilisation : <AuthGuard><Profile /></AuthGuard>
 *
 * ⚠️ Projet React + Vite : pas de middleware Next.js.
 * La protection est côté client ; l'API backend doit valider le token pour une sécurité complète.
 */
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DEFAULT_REDIRECT = '/login';

export default function AuthGuard({ children, redirectTo = DEFAULT_REDIRECT }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="auth-guard-loading" aria-live="polite" aria-busy="true">
        <div className="auth-guard-loading__spinner" aria-hidden="true" />
        <p className="auth-guard-loading__text">Vérification de session…</p>
      </div>
    );
  }

  if (!user) {
    const returnUrl = location.pathname + location.search || '/';
    const redirect = encodeURIComponent(returnUrl);
    const target =
      redirectTo === '/auth'
        ? '/auth'
        : redirectTo.includes('?')
          ? redirectTo
          : `${redirectTo}?redirect=${redirect}`;
    return <Navigate to={target} replace />;
  }

  return children;
}
