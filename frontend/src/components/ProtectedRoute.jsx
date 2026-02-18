/**
 * Protège une route : redirige vers /login si l'utilisateur n'est pas connecté.
 * Préserve l'URL demandée dans ?redirect= pour y renvoyer après connexion.
 */
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requireAssociation = false }) {
  const { user, loading, isAssociation } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40vh' }}>
        <p>Chargement…</p>
      </div>
    );
  }

  if (!user) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirect}`} state={{ from: location }} replace />;
  }

  if (requireAssociation && !isAssociation) {
    return (
      <div className="page">
        <div className="page-inner">
          <p>Cette page est réservée aux associations.</p>
        </div>
      </div>
    );
  }

  return children;
}
