/**
 * Toast "+X Points Impact" affiché quand l'utilisateur gagne des points (like, commentaire, follow).
 */
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './ImpactToast.css';

const TOAST_DURATION_MS = 3500;

export default function ImpactToast({ pointsGain, onDismiss }) {
  useEffect(() => {
    if (pointsGain <= 0) return;
    const t = setTimeout(() => onDismiss?.(), TOAST_DURATION_MS);
    return () => clearTimeout(t);
  }, [pointsGain, onDismiss]);

  return (
    <AnimatePresence>
      {pointsGain > 0 && (
        <motion.div
          className="impact-toast"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          role="status"
          aria-live="polite"
        >
          <span className="impact-toast__icon">⭐</span>
          <span className="impact-toast__text">
            +{pointsGain} Points Impact
          </span>
          <button
            type="button"
            className="impact-toast__close"
            onClick={onDismiss}
            aria-label="Fermer"
          >
            ×
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
