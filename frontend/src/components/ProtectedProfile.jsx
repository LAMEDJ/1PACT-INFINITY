/**
 * Protection de la page Profil : reste dans le Layout global.
 * - Loading → écran de vérification.
 * - Non connecté → AuthFallback (Connexion/Inscription dans le panneau, header + menu visibles).
 * - Connecté → contenu Profil.
 */
import { useAuth } from '../context/AuthContext';
import AuthFallback from './profile/AuthFallback';

export default function ProtectedProfile({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="page profile-page profile-page-loading">
        <div className="profile-top-bar">
          <span className="profile-top-bar__placeholder" />
          <span className="profile-top-bar__title">Profil</span>
          <span className="profile-top-bar__placeholder" />
        </div>
        <div className="profile-loading-state" aria-live="polite" aria-busy="true">
          <div className="profile-loading-state__spinner" aria-hidden="true" />
          <p className="profile-loading-state__text">Vérification de la session…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthFallback />;
  }

  return children;
}
