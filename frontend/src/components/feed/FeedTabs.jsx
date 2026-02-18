/**
 * Un seul onglet "Proposer & Rechercher" : au clic, le bloc se déroule
 * et affiche les deux panneaux (Proposer + Rechercher) dans le même onglet.
 */
import { motion, AnimatePresence } from 'framer-motion';
import './FeedTabs.css';

export default function FeedTabs({ open, onToggle, children }) {
  return (
    <div className="feed-tabs-wrap">
      <button
        type="button"
        className={`feed-tabs__trigger ${open ? 'feed-tabs__trigger--open' : ''}`}
        onClick={onToggle}
        aria-expanded={open}
        aria-controls="feed-tabs-panel"
        id="feed-tabs-trigger"
      >
        <span className="feed-tabs__trigger-text">Proposer & Rechercher</span>
        <span className="feed-tabs__trigger-icon" aria-hidden="true">
          {open ? '▲' : '▼'}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id="feed-tabs-panel"
            className="feed-tabs__panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            aria-labelledby="feed-tabs-trigger"
          >
            <div className="feed-tabs__content">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
