/**
 * Dropdown quêtes à proximité : titre, distance (km), catégorie, bouton Voir.
 * Tri par distance croissante puis date. Boutons "Explorer tout" et "Actualiser".
 */
import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './SmartNavbar.css';

export default function NearbyDropdown({
  open,
  onClose,
  quests,
  loading,
  onRefresh,
  onExploreAll,
  onGoToMap,
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) onClose?.();
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
          ref={containerRef}
          className="smart-nav-dropdown smart-nav-dropdown--quests"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="smart-nav-dropdown__head">
            <h3 className="smart-nav-dropdown__title">Quêtes à proximité</h3>
            <button type="button" className="smart-nav-dropdown__refresh" onClick={onRefresh} aria-label="Actualiser">
              Actualiser
            </button>
          </div>
          <div className="smart-nav-dropdown__body">
            {loading && (
              <div className="smart-nav-dropdown__empty">
                <span className="smart-nav-dropdown__loader" aria-hidden="true" />
                <p>Chargement...</p>
              </div>
            )}
            {!loading && quests.length === 0 && (
              <div className="smart-nav-dropdown__empty">
                <span className="smart-nav-dropdown__empty-icon" aria-hidden="true">🎯</span>
                <p>Aucune quête pour le moment</p>
              </div>
            )}
            {!loading && quests.length > 0 && (
              <ul className="smart-nav-dropdown__list smart-nav-dropdown__list--quests">
                {quests.slice(0, 10).map((q) => (
                  <li key={q.id} className="smart-nav-dropdown__item smart-nav-dropdown__item--quest">
                    <div className="smart-nav-dropdown__quest-main">
                      <strong>{q.title}</strong>
                      {q.distanceKm != null && (
                        <span className="smart-nav-dropdown__quest-distance">{q.distanceKm} km</span>
                      )}
                    </div>
                    {q.reward && <span className="smart-nav-dropdown__quest-reward">{q.reward}</span>}
                    <button type="button" className="smart-nav-dropdown__quest-btn" onClick={() => onGoToMap?.(q)}>
                      Voir
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="smart-nav-dropdown__foot">
            <button type="button" className="smart-nav-dropdown__btn" onClick={onExploreAll}>
              Explorer tout
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
