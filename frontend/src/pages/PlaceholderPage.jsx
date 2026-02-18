/**
 * Page "À venir" – liens vers Carte et Fil pour garder la navigation opérationnelle.
 */
import { useNavigate, Link, useLocation } from 'react-router-dom';
import './PageCommon.css';

export default function PlaceholderPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = encodeURIComponent(location.pathname + location.search || '/');

  return (
    <div className="page placeholder-page">
      <div className="page-inner">
        <span className="page-emoji">🔮</span>
        <h2>À venir</h2>
        <p>Cette section sera dédiée à une future fonctionnalité.</p>
        <p className="page-hint">En attendant, accédez à la carte des associations ou au fil d'actualité :</p>
        <div className="placeholder-actions">
          <button type="button" className="btn-primary" onClick={() => navigate('/', { state: { openPage: 1 } })}>
            🗺️ Voir la carte
          </button>
          <button type="button" className="btn-secondary" onClick={() => navigate('/', { state: { openPage: 2 } })}>
            📰 Voir le fil
          </button>
          <Link to={`/login?redirect=${redirectTo}`} className="btn-secondary">Se connecter</Link>
        </div>
      </div>
    </div>
  );
}
