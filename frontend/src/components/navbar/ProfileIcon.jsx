/**
 * Icône Avatar / Profil pour la navbar flottante.
 */
import { motion } from 'framer-motion';
import './SmartNavbar.css';

export default function ProfileIcon({ user, onClick, isOpen }) {
  const initial = user?.name?.trim().charAt(0)?.toUpperCase() || '?';

  return (
    <motion.button
      type="button"
      className={`smart-nav-icon smart-nav-icon--profile ${isOpen ? 'smart-nav-icon--open' : ''}`}
      onClick={onClick}
      aria-label="Profil"
      aria-expanded={isOpen}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <span className="smart-nav-icon__svg-wrap smart-nav-icon__avatar" aria-hidden="true">
        {initial}
      </span>
    </motion.button>
  );
}
