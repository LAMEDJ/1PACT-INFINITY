/**
 * Lien "Rechercher" dans la navbar : ouvre le Fil avec le panneau Chercher.
 * Même style que le bouton Tableau de bord (icône + libellé).
 */
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './SmartNavbar.css';

export default function NavSearch() {
  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Link
        to="/"
        state={{ openPage: 2, unifiedActionMode: 'chercher' }}
        className="floating-nav__search-btn"
        aria-label="Rechercher"
      >
        <span className="floating-nav__search-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </span>
        <span className="floating-nav__search-label">Rechercher</span>
      </Link>
    </motion.div>
  );
}
