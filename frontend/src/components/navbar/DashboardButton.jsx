/**
 * Bouton Cockpit : icône dashboard + label compact.
 */
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './SmartNavbar.css';

export default function DashboardButton({ onNavigate, isActive }) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Link
        to="/cockpit"
        className={`floating-nav__dashboard-btn barnav__btn ${isActive ? 'barnav__btn--active' : ''}`}
        aria-label="Cockpit"
        aria-current={isActive ? 'page' : undefined}
        onClick={onNavigate}
      >
        <span className="floating-nav__dashboard-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="9" />
            <rect x="14" y="3" width="7" height="5" />
            <rect x="14" y="12" width="7" height="9" />
            <rect x="3" y="16" width="7" height="5" />
          </svg>
        </span>
        <span className="floating-nav__dashboard-label">Cockpit</span>
      </Link>
    </motion.div>
  );
}
