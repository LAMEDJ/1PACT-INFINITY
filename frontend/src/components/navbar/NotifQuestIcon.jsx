/**
 * Un seul bouton pour Notifications + Quêtes à proximité.
 * Affiche cloche + badge notif (nombre) et indicateur quêtes (point si présentes).
 */
import { motion } from 'framer-motion';
import './SmartNavbar.css';

export default function NotifQuestIcon({ notifCount, hasQuests, onClick, isOpen }) {
  const hasNewNotif = notifCount > 0;

  return (
    <motion.button
      type="button"
      className={`smart-nav-icon smart-nav-icon--notif-quest ${isOpen ? 'smart-nav-icon--open' : ''}`}
      onClick={onClick}
      aria-label={
        hasNewNotif && hasQuests
          ? `${notifCount} notification(s), quêtes à proximité`
          : hasNewNotif
            ? `${notifCount} notification(s)`
            : hasQuests
              ? 'Quêtes à proximité'
              : 'Notifications & Quêtes'
      }
      aria-expanded={isOpen}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <span className="smart-nav-icon__svg-wrap" aria-hidden="true">
        {/* Cloche = notifs, petit point cible = quêtes */}
        <svg className="smart-nav-icon__svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      </span>
      {hasNewNotif && (
        <span className={`smart-nav-badge smart-nav-badge--notif ${hasNewNotif ? 'smart-nav-badge--pulse' : ''}`} aria-hidden="true">
          {notifCount > 99 ? '99+' : notifCount}
        </span>
      )}
      {hasQuests && !hasNewNotif && <span className="smart-nav-badge smart-nav-badge--quest" aria-hidden="true" />}
      {hasQuests && hasNewNotif && (
        <span className="smart-nav-badge smart-nav-badge--quest smart-nav-badge--quest-dot" aria-hidden="true" title="Quêtes à proximité" />
      )}
    </motion.button>
  );
}
