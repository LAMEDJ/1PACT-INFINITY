/**
 * Icône cloche avec badge animé (pulse si non lues).
 * Micro-animation hover scale 1.05.
 */
import { motion } from 'framer-motion';
import './SmartNavbar.css';

export default function NotificationIcon({ count, onClick, isOpen }) {
  const hasNew = count > 0;

  return (
    <motion.button
      type="button"
      className={`smart-nav-icon smart-nav-icon--bell ${isOpen ? 'smart-nav-icon--open' : ''}`}
      onClick={onClick}
      aria-label={count > 0 ? `${count} nouvelle(s) notification(s)` : 'Notifications'}
      aria-expanded={isOpen}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <span className="smart-nav-icon__svg-wrap" aria-hidden="true">
        <svg className="smart-nav-icon__svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      </span>
      {hasNew && (
        <span className={`smart-nav-badge smart-nav-badge--notif ${hasNew ? 'smart-nav-badge--pulse' : ''}`} aria-hidden="true">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </motion.button>
  );
}
