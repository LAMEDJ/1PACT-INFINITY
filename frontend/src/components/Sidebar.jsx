/**
 * Sidebar desktop : menu vertical. Icônes SVG style outline (sans emojis).
 */
import { useCallback } from 'react';
import { NavIcon } from './NavIcons';
import './Sidebar.css';

const PAGES = [
  { id: 'accueil', label: 'Accueil' },
  { id: 'map', label: 'Carte' },
  { id: 'feed', label: 'Fil' },
  { id: 'messenger', label: 'Messages' },
  { id: 'profile', label: 'Profil' },
];

export default function Sidebar({ currentIndex, onSelect }) {
  const handleClick = useCallback(
    (index) => {
      if (typeof onSelect !== 'function') return;
      onSelect(index);
    },
    [onSelect]
  );

  return (
    <aside
      className="sidebar"
      role="navigation"
      aria-label="Menu principal"
    >
      <nav className="sidebar-nav">
        {PAGES.map((page, index) => {
          const isActive = currentIndex === index;
          return (
            <button
              key={page.id}
              type="button"
              className={`sidebar-item ${isActive ? 'active' : ''}`}
              onClick={() => handleClick(index)}
              aria-label={page.label}
              aria-current={isActive ? 'page' : undefined}
              title={page.label}
            >
              <span className="sidebar-icon" aria-hidden="true">
                <NavIcon id={page.id} />
              </span>
              <span className="sidebar-label">{page.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
