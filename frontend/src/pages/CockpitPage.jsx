/**
 * Page Cockpit – vue globale, statistiques principales, résumé activité, accès rapide aux modules.
 * Utilisateurs : tableau de bord principal. Associations : redirection vers /dashboard.
 */
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useImpact } from '../context/ImpactContext';
import { getLevelFromPoints } from '../lib/levelMapping';
import './PageCommon.css';
import './CockpitPage.css';

const QUICK_LINKS = [
  { page: 1, label: 'Carte & itinéraires', icon: '🗺️', desc: 'Explorer la carte et les quêtes' },
  { page: 2, label: 'Fil d\'actualité', icon: '📰', desc: 'Publications et actions' },
  { page: 3, label: 'Messagerie', icon: '✉️', desc: 'Messages et conversations' },
  { page: 4, label: 'Mon profil', icon: '👤', desc: 'Profil et Points Impact' },
];

export default function CockpitPage() {
  const navigate = useNavigate();
  const { user, isAssociation } = useAuth();
  const { totalPoints, levelLabel, actionsCount } = useImpact();
  const impactPoints = user?.points ?? user?.impact_points ?? 0;

  if (!user) {
    return (
      <div className="page cockpit-page">
        <div className="page-inner cockpit-page__inner">
          <button type="button" className="cockpit-page__back" onClick={() => navigate('/')}>
            ← Retour
          </button>
          <p>Connectez-vous pour accéder au Cockpit.</p>
          <Link to="/login" className="cockpit-page__btn cockpit-page__btn--primary">
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  if (isAssociation) {
    return <Navigate to="/dashboard" replace />;
  }

  const { label: levelBadgeLabel } = getLevelFromPoints(impactPoints);

  return (
    <div className="page cockpit-page">
      <div className="page-inner cockpit-page__inner">
        <button
          type="button"
          className="cockpit-page__back"
          onClick={() => navigate('/')}
          aria-label="Retour à l'accueil"
        >
          ← Retour
        </button>

        <header className="cockpit-page__header">
          <h1 className="cockpit-page__title">Cockpit</h1>
          <p className="cockpit-page__subtitle">Vue globale et accès rapide</p>
        </header>

        <section className="cockpit-page__stats" aria-label="Statistiques principales">
          <h2 className="cockpit-page__section-title">Statistiques principales</h2>
          <div className="cockpit-page__stats-grid">
            <div className="cockpit-page__stat-card">
              <span className="cockpit-page__stat-value">⭐ {totalPoints ?? impactPoints ?? 0}</span>
              <span className="cockpit-page__stat-label">Points Impact</span>
            </div>
            <div className="cockpit-page__stat-card">
              <span className="cockpit-page__stat-value">{levelBadgeLabel || levelLabel || 'Explorateur'}</span>
              <span className="cockpit-page__stat-label">Niveau</span>
            </div>
            <div className="cockpit-page__stat-card">
              <span className="cockpit-page__stat-value">{actionsCount ?? 0}</span>
              <span className="cockpit-page__stat-label">Actions validées</span>
            </div>
          </div>
        </section>

        <section className="cockpit-page__quick" aria-label="Accès rapide">
          <h2 className="cockpit-page__section-title">Accès rapide</h2>
          <ul className="cockpit-page__quick-list">
            {QUICK_LINKS.map(({ page, label, icon, desc }) => (
              <li key={page}>
                <Link
                  to="/"
                  state={{ openPage: page }}
                  className="cockpit-page__quick-link"
                >
                  <span className="cockpit-page__quick-icon" aria-hidden="true">{icon}</span>
                  <div className="cockpit-page__quick-text">
                    <span className="cockpit-page__quick-label">{label}</span>
                    <span className="cockpit-page__quick-desc">{desc}</span>
                  </div>
                  <span className="cockpit-page__quick-arrow" aria-hidden="true">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="cockpit-page__resume">
          <h2 className="cockpit-page__section-title">Résumé activité</h2>
          <p className="cockpit-page__resume-text">
            Participez à des actions, validez des missions et cumulez des Points Impact pour faire évoluer votre niveau.
          </p>
          <Link
            to="/"
            state={{ openPage: 4, profileTab: 'impact' }}
            className="cockpit-page__btn cockpit-page__btn--secondary"
          >
            Voir mon détail Impact
          </Link>
        </section>
      </div>
    </div>
  );
}
