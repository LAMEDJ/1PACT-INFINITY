/**
 * Un seul dropdown : Notifications + Quêtes à proximité (deux blocs dans le même panneau).
 */
import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './SmartNavbar.css';

const ICON_MAP = {
  like: '❤️',
  comment: '💬',
  star: '⭐',
  message: '✉️',
  activity: '🔔',
};

export default function NotifQuestDropdown({
  open,
  onClose,
  notifItems,
  notifLoading,
  onMarkAllRead,
  onSeeAllNotif,
  quests,
  questLoading,
  onRefreshQuests,
  onExploreAllQuests,
  onGoToMap,
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    onMarkAllRead?.();
  }, [open, onMarkAllRead]);

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
          className="smart-nav-dropdown smart-nav-dropdown--notif-quest"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="smart-nav-dropdown__head">
            <h3 className="smart-nav-dropdown__title">Notifications & Quêtes</h3>
            <button type="button" className="smart-nav-dropdown__close" onClick={onClose} aria-label="Fermer">✕</button>
          </div>
          <div className="smart-nav-dropdown__body smart-nav-dropdown__body--sections">
            {/* Bloc Notifications */}
            <section className="smart-nav-dropdown__section">
              <h4 className="smart-nav-dropdown__section-title">🔔 Notifications</h4>
              {notifLoading && (
                <div className="smart-nav-dropdown__empty smart-nav-dropdown__empty--inline">
                  <span className="smart-nav-dropdown__loader" aria-hidden="true" />
                  <span>Chargement...</span>
                </div>
              )}
              {!notifLoading && notifItems.length === 0 && (
                <p className="smart-nav-dropdown__empty-text">Aucune notification</p>
              )}
              {!notifLoading && notifItems.length > 0 && (
                <ul className="smart-nav-dropdown__list">
                  {notifItems.slice(0, 10).map((item) => (
                    <li key={item.id} className={`smart-nav-dropdown__item ${item.new ? 'smart-nav-dropdown__item--new' : ''}`}>
                      <span className="smart-nav-dropdown__item-icon">{ICON_MAP[item.iconType] || ICON_MAP.activity}</span>
                      <div className="smart-nav-dropdown__item-content">
                        <strong>{item.title}</strong>
                        {item.subtitle && <span className="smart-nav-dropdown__item-sub">{item.subtitle}</span>}
                        <span className="smart-nav-dropdown__item-time">{item.relativeTime || item.time}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Bloc Quêtes à proximité */}
            <section className="smart-nav-dropdown__section">
              <div className="smart-nav-dropdown__section-head">
                <h4 className="smart-nav-dropdown__section-title">🎯 Quêtes à proximité</h4>
                <button type="button" className="smart-nav-dropdown__refresh" onClick={onRefreshQuests} aria-label="Actualiser">Actualiser</button>
              </div>
              {questLoading && (
                <div className="smart-nav-dropdown__empty smart-nav-dropdown__empty--inline">
                  <span className="smart-nav-dropdown__loader" aria-hidden="true" />
                  <span>Chargement...</span>
                </div>
              )}
              {!questLoading && quests.length === 0 && (
                <p className="smart-nav-dropdown__empty-text">Aucune quête pour le moment</p>
              )}
              {!questLoading && quests.length > 0 && (
                <ul className="smart-nav-dropdown__list smart-nav-dropdown__list--quests">
                  {quests.slice(0, 5).map((q) => (
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
            </section>
          </div>
          <div className="smart-nav-dropdown__foot">
            <button type="button" className="smart-nav-dropdown__btn" onClick={onSeeAllNotif}>
              Voir toutes les notifications
            </button>
            <button type="button" className="smart-nav-dropdown__btn" onClick={onExploreAllQuests}>
              Explorer les quêtes
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
