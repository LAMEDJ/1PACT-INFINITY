/**
 * Barre de navigation fixe en bas (bottom nav).
 * Icônes SVG style outline (sans emojis).
 */
import { useCallback } from 'react';
import { NavIcon } from './NavIcons';
import './BottomNav.css';

const PAGES = [
  { id: 'accueil', label: 'Accueil' },
  { id: 'map', label: 'Carte' },
  { id: 'feed', label: 'Fil' },
  { id: 'messenger', label: 'Messages' },
  { id: 'profile', label: 'Profil' },
];

export default function BottomNav({ currentIndex, onSelect }) {
  const handleClick = useCallback(
    (index) => {
      if (typeof onSelect !== 'function') return;
      onSelect(index);
    },
    [onSelect]
  );

  return (
    <nav
      className="bottom-nav"
      role="navigation"
      aria-label="Navigation principale"
    >
      <div className="bottom-nav-inner">
        {PAGES.map((page, index) => {
          const isActive = currentIndex === index;
          return (
            <button
              key={page.id}
              type="button"
              className={`bottom-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => handleClick(index)}
              aria-label={page.label}
              aria-current={isActive ? 'page' : undefined}
              title={page.label}
            >
              <span className="bottom-nav-icon-wrap">
                <span className="bottom-nav-icon" aria-hidden="true">
                  <NavIcon id={page.id} />
                </span>
              </span>
              <span className="bottom-nav-label">{page.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
