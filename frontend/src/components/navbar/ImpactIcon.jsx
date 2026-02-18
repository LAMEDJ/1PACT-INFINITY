/**
 * Icône Points Impact (éclair) avec badge du nombre de points.
 * Animation pulse légère si nouveaux points.
 */
import { motion } from 'framer-motion';
import { useImpact } from '../../context/ImpactContext';
import './SmartNavbar.css';

export default function ImpactIcon({ onClick, isOpen, hasNewPoints }) {
  const { totalPoints } = useImpact();
  const points = totalPoints ?? 0;

  return (
    <motion.button
      type="button"
      className={`smart-nav-icon smart-nav-icon--impact ${isOpen ? 'smart-nav-icon--open' : ''} ${hasNewPoints ? 'smart-nav-icon--pulse' : ''}`}
      onClick={onClick}
      aria-label={`Points Impact : ${points}`}
      aria-expanded={isOpen}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <span className="smart-nav-icon__svg-wrap" aria-hidden="true">
        <svg className="smart-nav-icon__svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      </span>
      <span className="smart-nav-badge smart-nav-badge--impact" aria-hidden="true">
        {points > 99 ? '99+' : points}
      </span>
    </motion.button>
  );
}
