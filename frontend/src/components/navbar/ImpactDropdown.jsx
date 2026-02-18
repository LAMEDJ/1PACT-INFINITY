/**
 * Dropdown Points Impact : toutes les stats + barre de niveau + options futur jeu.
 */
import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useImpact } from '../../context/ImpactContext';
import { getProgressToNextLevel } from '../../lib/levelMapping';
import './SmartNavbar.css';

export default function ImpactDropdown({ open, onClose, onOpenFullDetail }) {
  const ref = useRef(null);
  const {
    totalPoints,
    levelLabel,
    actionsCount,
    missionsCount,
    besoinsCombles,
    propositionsSent,
    propositionsAccepted,
  } = useImpact();
  const progress = getProgressToNextLevel(totalPoints ?? 0);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose?.();
    };
    const t = setTimeout(() => document.addEventListener('click', handleClickOutside), 0);
    return () => {
      clearTimeout(t);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={ref}
          className="smart-nav-dropdown smart-nav-dropdown--impact"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="smart-nav-dropdown__head">
            <h3 className="smart-nav-dropdown__title">Points Impact</h3>
            <button type="button" className="smart-nav-dropdown__close" onClick={onClose} aria-label="Fermer">✕</button>
          </div>
          <div className="smart-nav-dropdown__body">
            {/* Total + Niveau */}
            <div className="impact-dropdown__total">
              <span className="impact-dropdown__points">⭐ {totalPoints ?? 0}</span>
              <span className="impact-dropdown__label">Total</span>
            </div>
            <div className="impact-dropdown__level">
              <span className="impact-dropdown__level-badge">{levelLabel || 'Explorateur'}</span>
            </div>
            <div className="impact-dropdown__progress">
              <div className="impact-dropdown__progress-bar">
                <motion.span
                  className="impact-dropdown__progress-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress.percent}%` }}
                  transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                />
              </div>
              <p className="impact-dropdown__progress-text">
                {progress.pointsRemaining ?? 0} pts avant le prochain niveau
              </p>
            </div>

            {/* Toutes les stats */}
            <div className="impact-dropdown__stats">
              <div className="impact-dropdown__stats-title">Statistiques</div>
              <ul className="impact-dropdown__stats-list">
                <li className="impact-dropdown__stat">
                  <span className="impact-dropdown__stat-label">Actions validées</span>
                  <span className="impact-dropdown__stat-value">{actionsCount ?? 0}</span>
                </li>
                <li className="impact-dropdown__stat">
                  <span className="impact-dropdown__stat-label">Missions</span>
                  <span className="impact-dropdown__stat-value">{missionsCount ?? 0}</span>
                </li>
                <li className="impact-dropdown__stat">
                  <span className="impact-dropdown__stat-label">Besoins comblés</span>
                  <span className="impact-dropdown__stat-value">{besoinsCombles ?? 0}</span>
                </li>
                <li className="impact-dropdown__stat">
                  <span className="impact-dropdown__stat-label">Propositions envoyées</span>
                  <span className="impact-dropdown__stat-value">{propositionsSent ?? 0}</span>
                </li>
                <li className="impact-dropdown__stat">
                  <span className="impact-dropdown__stat-label">Propositions acceptées</span>
                  <span className="impact-dropdown__stat-value">{propositionsAccepted ?? 0}</span>
                </li>
              </ul>
            </div>

            {/* Options futur jeu */}
            <div className="impact-dropdown__future">
              <div className="impact-dropdown__future-title">Options futur jeu</div>
              <p className="impact-dropdown__future-teaser">
                Défis, badges, classements et récompenses… Bientôt disponible.
              </p>
            </div>
          </div>
          <div className="smart-nav-dropdown__foot">
            <button
              type="button"
              className="smart-nav-dropdown__btn"
              onClick={() => { onOpenFullDetail?.(); onClose?.(); }}
            >
              Voir le détail
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
