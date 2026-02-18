/**
 * Panneau Points Impact dans la navbar : badge + barre de niveau visible.
 * Au clic, ouvre le dropdown avec toutes les stats et options futur jeu.
 */
import { motion } from 'framer-motion';
import { useImpact } from '../../context/ImpactContext';
import { getProgressToNextLevel } from '../../lib/levelMapping';
import './SmartNavbar.css';
import './FloatingNavbar.css';

export default function ImpactNavPanel({ onClick, isOpen, hasNewPoints }) {
  const { totalPoints, levelLabel } = useImpact();
  const points = totalPoints ?? 0;
  const progress = getProgressToNextLevel(points);

  return (
    <motion.button
      type="button"
      className={`impact-nav-panel ${isOpen ? 'impact-nav-panel--open' : ''} ${hasNewPoints ? 'impact-nav-panel--pulse' : ''}`}
      onClick={onClick}
      aria-label={`Points Impact : ${points} – ${levelLabel || 'Explorateur'}`}
      aria-expanded={isOpen}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <span className="impact-nav-panel__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      </span>
      <span className="impact-nav-panel__badge" aria-hidden="true">
        {points > 99 ? '99+' : points}
      </span>
      <span className="impact-nav-panel__level-label">{levelLabel || 'Explorateur'}</span>
      <span className="impact-nav-panel__level-bar" aria-hidden="true">
        <span
          className="impact-nav-panel__level-fill"
          style={{ width: `${progress.percent}%` }}
        />
      </span>
    </motion.button>
  );
}
