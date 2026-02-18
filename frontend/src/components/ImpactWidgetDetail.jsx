/**
 * Widget détail Points Impact : popover (desktop) / bottom sheet (mobile).
 * Ouverture au clic sur l'étoile ou le nombre de points dans le header.
 */
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useImpact } from '../context/ImpactContext';
import { getProgressToNextLevel, POINTS_PER_LEVEL } from '../lib/levelMapping';
import './ImpactWidget.css';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches
  );
  useEffect(() => {
    const m = window.matchMedia('(max-width: 768px)');
    const fn = () => setIsMobile(m.matches);
    m.addEventListener('change', fn);
    return () => m.removeEventListener('change', fn);
  }, []);
  return isMobile;
}

const DURATION_MS = 280;

const ROWS = [
  { key: 'totalPoints', label: 'Total Points Impact', icon: '⭐' },
  { key: 'levelLabel', label: 'Niveau actuel', icon: '🏆' },
  { key: 'actionsCount', label: 'Actions réalisées', icon: '✓' },
  { key: 'missionsCount', label: 'Missions accomplies', icon: '🎯' },
  { key: 'besoinsCombles', label: 'Besoins comblés', icon: '❤️' },
  { key: 'propositionsSent', label: 'Propositions envoyées', icon: '📤' },
  { key: 'propositionsAccepted', label: 'Propositions acceptées', icon: '✅' },
];

export default function ImpactWidgetDetail({ open, onClose }) {
  const stats = useImpact();
  const ref = useRef(null);
  const progress = getProgressToNextLevel(stats.totalPoints);

  useEffect(() => {
    if (!open) return;
    const handle = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose?.();
    };
    document.addEventListener('mousedown', handle);
    document.addEventListener('touchstart', handle, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handle);
      document.removeEventListener('touchstart', handle);
    };
  }, [open, onClose]);

  const getValue = (key) => {
    if (key === 'levelLabel') return stats.levelLabel;
    return stats[key] ?? 0;
  };

  const isMobile = useIsMobile();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="impact-widget-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DURATION_MS / 1000 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            ref={ref}
            className={`impact-widget impact-widget--${isMobile ? 'bottom' : 'popover'}`}
            initial={{ opacity: 0, scale: isMobile ? 1 : 0.95, y: isMobile ? 80 : -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: isMobile ? 1 : 0.95, y: isMobile ? 80 : -8 }}
            transition={{ duration: DURATION_MS / 1000, ease: [0.4, 0, 0.2, 1] }}
            role="dialog"
            aria-labelledby="impact-widget-title"
            aria-modal="true"
          >
            <div className="impact-widget__head">
              <h3 id="impact-widget-title" className="impact-widget__title">
                Points Impact & Niveau
              </h3>
              <button
                type="button"
                className="impact-widget__close"
                onClick={onClose}
                aria-label="Fermer"
              >
                ×
              </button>
            </div>

            <div className="impact-widget__progress-wrap">
              <p className="impact-widget__distinction">
                <span className="impact-widget__points-label">Points Impact</span> (cumul) → calculent le <span className="impact-widget__level-label">Niveau Impact</span> (badge).
              </p>
              <div className="impact-widget__progress-bar">
                <motion.span
                  className="impact-widget__progress-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress.percent}%` }}
                  transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                />
              </div>
              <p className="impact-widget__progress-label">
                Niveau actuel : <strong>{stats.levelLabel}</strong>
                {progress.percent < 100 && progress.pointsRemaining != null && (
                  <span> — {progress.pointsRemaining} pts restants avant le prochain (sur {POINTS_PER_LEVEL})</span>
                )}
                {progress.percent < 100 && progress.pointsRemaining == null && (
                  <span> — {progress.percent}% vers le prochain</span>
                )}
              </p>
            </div>

            <ul className="impact-widget__list">
              {ROWS.map(({ key, label, icon }) => (
                <li key={key} className="impact-widget__row">
                  <span className="impact-widget__row-icon" aria-hidden="true">
                    {icon}
                  </span>
                  <span className="impact-widget__row-label">{label}</span>
                  <span className="impact-widget__row-value">
                    {key === 'levelLabel' ? stats.levelLabel : getValue(key)}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
