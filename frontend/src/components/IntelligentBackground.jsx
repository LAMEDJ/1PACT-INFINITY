/**
 * Fond d'écran intelligent global – purement décoratif.
 * Couche photo (ÉTAPE 1) + octogone SVG vectoriel (ÉTAPE 2) avec mouvement (ÉTAPE 3).
 * Contraintes : position fixed, inset 0, z-index -1, pointer-events none.
 * Ne modifie pas le DOM existant ; s’affiche derrière tout le contenu.
 */
import './IntelligentBackground.css';

export default function IntelligentBackground() {
  return (
    <div
      className="intelligent-background"
      aria-hidden="true"
    >
      {/* ÉTAPE 1 : fond d’écran principal (Photo 1) – full screen, cover, center */}
      <div className="intelligent-background-photo" />

      {/* ÉTAPE 2 : octogone intelligent centré (50% / 50% + translate -50% -50%) */}
      <div className="intelligent-background-octagon">
        <svg
          className="intelligent-background-octagon-svg"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Lumière douce centrale (glow orange / doré) */}
            <radialGradient id="octagon-core-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fff8e7" stopOpacity="0.95" />
              <stop offset="35%" stopColor="#ffb347" stopOpacity="0.7" />
              <stop offset="60%" stopColor="#e67e22" stopOpacity="0.25" />
              <stop offset="85%" stopColor="#2c1810" stopOpacity="0.08" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>
            {/* Reflet / halo diffus */}
            <filter id="octagon-glow-filter" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="octagon-soft-glow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="8" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Cœur lumineux (lumière douce) */}
          <circle cx="100" cy="100" r="28" fill="url(#octagon-core-glow)" filter="url(#octagon-soft-glow)" />

          {/* Réseau type wireframe – 8 sommets d’un octogone + lignes internes */}
          <g stroke="rgba(20,12,8,0.75)" strokeWidth="0.8" fill="none" opacity="0.9">
            {/* Octogone externe (proportions régulières) */}
            <path
              d="M 100 30 L 136.6 50 L 136.6 100 L 100 170 L 63.4 100 L 63.4 50 Z"
              className="octagon-ring"
            />
            {/* Lignes vers le centre (effet réseau) */}
            <line x1="100" y1="30" x2="100" y2="100" />
            <line x1="136.6" y1="50" x2="100" y2="100" />
            <line x1="136.6" y1="100" x2="100" y2="100" />
            <line x1="100" y1="170" x2="100" y2="100" />
            <line x1="63.4" y1="100" x2="100" y2="100" />
            <line x1="63.4" y1="50" x2="100" y2="100" />
            {/* Lignes secondaires (maillage) */}
            <line x1="100" y1="30" x2="136.6" y2="50" />
            <line x1="136.6" y1="50" x2="136.6" y2="100" />
            <line x1="136.6" y1="100" x2="100" y2="170" />
            <line x1="100" y1="170" x2="63.4" y2="100" />
            <line x1="63.4" y1="100" x2="63.4" y2="50" />
            <line x1="63.4" y1="50" x2="100" y2="30" />
          </g>

          {/* Reflet / particules (petits points lumineux) */}
          <g fill="#ffb347" opacity="0.85">
            <circle cx="100" cy="85" r="1.5" />
            <circle cx="115" cy="95" r="1" />
            <circle cx="88" cy="98" r="1.2" />
            <circle cx="105" cy="110" r="1" />
          </g>
        </svg>
      </div>
    </div>
  );
}
