/**
 * Barre de tri algorithmique – Pour toi / Récent / Populaire / Proche de moi.
 * Tri 100 % côté client, sans rechargement.
 */
import { useCallback } from 'react';
import './FeedAlgorithmBar.css';

const MODES = [
  { id: 'for_you', label: 'Pour toi', icon: '✨' },
  { id: 'recent', label: 'Récent', icon: '🕐' },
  { id: 'popular', label: 'Populaire', icon: '🔥' },
  { id: 'near', label: 'Proche de moi', icon: '📍' },
];

export default function FeedAlgorithmBar({ mode, onChange }) {
  const handleSelect = useCallback(
    (id) => {
      onChange?.(id);
    },
    [onChange]
  );

  return (
    <nav className="feed-algo-bar" role="tablist" aria-label="Ordre du fil">
      <div className="feed-algo-bar__scroll">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            role="tab"
            aria-selected={mode === m.id}
            className={`feed-algo-bar__tab ${mode === m.id ? 'feed-algo-bar__tab--active' : ''}`}
            onClick={() => handleSelect(m.id)}
          >
            <span className="feed-algo-bar__icon" aria-hidden="true">{m.icon}</span>
            <span className="feed-algo-bar__label">{m.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
