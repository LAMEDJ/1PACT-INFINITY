/**
 * Sélecteur du type d'action : Publier | Proposer | Chercher.
 * Un seul bouton actif à la fois, design large avec icônes, animation douce.
 */
import { motion } from 'framer-motion';
import './UnifiedAction.css';

const MODES = [
  { id: 'publier', label: 'Publier' },
  { id: 'proposer', label: 'Proposer' },
  { id: 'chercher', label: 'Chercher' },
];

export default function ActionModeSelector({ value, onChange }) {
  return (
    <div className="action-mode-selector" role="tablist" aria-label="Type d'action">
      {MODES.map((mode) => {
        const isActive = value === mode.id;
        return (
          <motion.button
            key={mode.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`panel-${mode.id}`}
            id={`tab-${mode.id}`}
            className={`action-mode-btn ${isActive ? 'action-mode-btn--active' : ''}`}
            onClick={() => onChange(mode.id)}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            <span className="action-mode-btn__label">{mode.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
