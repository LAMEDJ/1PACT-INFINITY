/**
 * Bande slogan défilante en haut de page.
 * Défilement horizontal continu, pause au hover, texte configurable / rotatif.
 */
import { useState } from 'react';
import './FloatingNavbar.css';

const DEFAULT_SLOGANS = [
  '1PACT Explore, rencontre, vis ce qui compte !',
];

export default function TopTickerBanner({ slogans = DEFAULT_SLOGANS, enabled = true }) {
  const [paused, setPaused] = useState(false);
  const text = Array.isArray(slogans) && slogans.length > 0 ? slogans[0] : DEFAULT_SLOGANS[0];

  if (!enabled) return null;

  return (
    <div
      className="ticker-banner"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      role="marquee"
      aria-live="polite"
    >
      <div className={`ticker-banner__track ${paused ? 'ticker-banner__track--paused' : ''}`}>
        <span className="ticker-banner__text">{text}</span>
        <span className="ticker-banner__text" aria-hidden="true">{text}</span>
      </div>
    </div>
  );
}
