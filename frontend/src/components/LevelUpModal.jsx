/**
 * Modal "Niveau supérieur atteint !" avec badge et effet glow.
 */
import { motion, AnimatePresence } from 'framer-motion';
import { useImpact } from '../context/ImpactContext';
import './LevelUpModal.css';

export default function LevelUpModal({ open, onClose }) {
  const { levelLabel } = useImpact();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="level-up-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            className="level-up-modal"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            role="dialog"
            aria-labelledby="level-up-title"
            aria-modal="true"
          >
            <div className="level-up-modal__glow" aria-hidden="true" />
            <div className="level-up-modal__badge" aria-hidden="true">
              🏆
            </div>
            <h2 id="level-up-title" className="level-up-modal__title">
              Niveau supérieur atteint !
            </h2>
            <p className="level-up-modal__level">
              Tu es maintenant <strong>{levelLabel}</strong>
            </p>
            <button
              type="button"
              className="level-up-modal__btn"
              onClick={onClose}
            >
              Super !
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
