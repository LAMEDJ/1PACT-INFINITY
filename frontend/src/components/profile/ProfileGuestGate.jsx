/**
 * Écran affiché quand un invité tente d'accéder au Profil.
 * Message + boutons Connexion / Inscription, design cohérent avec le thème.
 */
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function ProfileGuestGate({ onGoToFeed }) {
  const location = useLocation();
  const redirectTo = encodeURIComponent(location.pathname + location.search || '/?page=4');

  return (
    <div className="page profile-page profile-page-guest profile-guest-gate">
      <div className="profile-top-bar">
        <button
          type="button"
          className="profile-top-bar__back"
          onClick={onGoToFeed}
          aria-label="Retour"
        >
          ←
        </button>
        <span className="profile-top-bar__title">Profil</span>
        <span className="profile-top-bar__placeholder" aria-hidden="true" />
      </div>

      <motion.div
        className="profile-guest-gate__inner"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        <motion.div
          className="profile-guest-gate__card"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, delay: 0.08, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="profile-guest-gate__icon" aria-hidden="true">
            👤
          </div>
          <h2 className="profile-guest-gate__title">
            Connecte-toi pour accéder à ton profil
          </h2>
          <p className="profile-guest-gate__text">
            Accède à tes publications, ton impact et tes projets en te connectant ou en créant un compte.
          </p>

          <div className="profile-guest-gate__actions">
            <Link
              to={`/login?redirect=${redirectTo}`}
              className="profile-guest-gate__btn profile-guest-gate__btn--primary"
            >
              Connexion
            </Link>
            <Link
              to={`/login?tab=signup&redirect=${redirectTo}`}
              className="profile-guest-gate__btn profile-guest-gate__btn--secondary"
            >
              Inscription
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
