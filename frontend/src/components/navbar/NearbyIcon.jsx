/**
 * Icône localisation / cible pour quêtes à proximité.
 * Badge discret si nouvelles quêtes disponibles.
 */
import { motion } from 'framer-motion';
import './SmartNavbar.css';

export default function NearbyIcon({ hasNew, onClick, isOpen }) {
  return (
    <motion.button
      type="button"
      className={`smart-nav-icon smart-nav-icon--nearby ${isOpen ? 'smart-nav-icon--open' : ''}`}
      onClick={onClick}
      aria-label="Quêtes à proximité"
      aria-expanded={isOpen}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <span className="smart-nav-icon__svg-wrap" aria-hidden="true">
        <svg className="smart-nav-icon__svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      </span>
      {hasNew && <span className="smart-nav-badge smart-nav-badge--quest" aria-hidden="true" />}
    </motion.button>
  );
}
