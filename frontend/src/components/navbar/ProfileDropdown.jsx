/**
 * Dropdown Profil / Avatar : lien tableau de bord, déconnexion.
 */
import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './SmartNavbar.css';

export default function ProfileDropdown({ open, onClose, user, onLogout }) {
  const ref = useRef(null);

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

  if (!user) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={ref}
          className="smart-nav-dropdown smart-nav-dropdown--profile"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="smart-nav-dropdown__head">
            <h3 className="smart-nav-dropdown__title">{user.name}</h3>
          </div>
          <div className="smart-nav-dropdown__body">
            {user.type === 'association' && (
              <Link to="/dashboard" className="smart-nav-dropdown__btn smart-nav-dropdown__btn--block" onClick={onClose}>
                Tableau de bord
              </Link>
            )}
            <Link to="/" className="smart-nav-dropdown__btn smart-nav-dropdown__btn--block" onClick={onClose}>
              Mon fil
            </Link>
            <button type="button" className="smart-nav-dropdown__btn smart-nav-dropdown__btn--block" onClick={() => { onLogout?.(); onClose?.(); }}>
              Déconnexion
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
