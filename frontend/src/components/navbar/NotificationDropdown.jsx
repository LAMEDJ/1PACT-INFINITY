/**
 * Dropdown notifications : slide-down + fade 200ms, glass, 2xl, liste + "Voir toutes".
 * Marquer comme lu à l'ouverture. État vide : illustration + "Aucune notification".
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

export default function NotificationDropdown({
  open,
  onClose,
  items,
  loading,
  onMarkAllRead,
  onSeeAll,
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
          className="smart-nav-dropdown smart-nav-dropdown--notif"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="smart-nav-dropdown__head">
            <h3 className="smart-nav-dropdown__title">Notifications</h3>
          </div>
          <div className="smart-nav-dropdown__body">
            {loading && (
              <div className="smart-nav-dropdown__empty">
                <span className="smart-nav-dropdown__loader" aria-hidden="true" />
                <p>Chargement...</p>
              </div>
            )}
            {!loading && items.length === 0 && (
              <div className="smart-nav-dropdown__empty">
                <span className="smart-nav-dropdown__empty-icon" aria-hidden="true">🔔</span>
                <p>Aucune notification</p>
              </div>
            )}
            {!loading && items.length > 0 && (
              <ul className="smart-nav-dropdown__list">
                {items.slice(0, 20).map((item) => (
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
          </div>
          {!loading && items.length > 0 && (
            <div className="smart-nav-dropdown__foot">
              <button type="button" className="smart-nav-dropdown__btn" onClick={onSeeAll}>
                Voir toutes
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
