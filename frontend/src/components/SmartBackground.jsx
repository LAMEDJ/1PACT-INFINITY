/**
 * Fond d'écran intelligent global : arrière-plan + octogone animé.
 * Purement décoratif, n'affecte pas le DOM existant.
 * position: fixed, inset: 0, z-index: -1, pointer-events: none.
 */
import './SmartBackground.css';

export default function SmartBackground() {
  return (
    <div
      className="smart-background"
      aria-hidden="true"
      role="presentation"
    >
      {/* Couche 1 : fond type Photo 1 (full screen, cover, center) */}
      <div className="smart-background-base" />

      {/* Couche 2 : octogone intelligent centré (50% / 50% + translate -50% -50%) */}
      <div className="smart-background-octagon-wrap">
        <svg
          className="smart-background-octagon"
          viewBox="0 0 400 400"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Noyau lumineux chaud (orange / or) */}
            <radialGradient id="oct-core" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fff8e7" stopOpacity="1" />
              <stop offset="25%" stopColor="#ffd54f" stopOpacity="0.95" />
              <stop offset="50%" stopColor="#ff9800" stopOpacity="0.7" />
              <stop offset="75%" stopColor="#e65100" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#1a1a1a" stopOpacity="0" />
            </radialGradient>
            {/* Halo doux */}
            <filter id="oct-glow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="oct-soft" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="20" result="blur2" />
              <feColorMatrix in="blur2" type="matrix" values="1 0 0 0 0  0 0.9 0 0 0  0 0 0.6 0 0  0 0 0 0.4 0" />
              <feMerge>
                <feMergeNode in="blur2" />
              </feMerge>
            </filter>
            {/* Reflet / lens flare */}
            <radialGradient id="oct-flare" cx="55%" cy="45%" r="45%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
              <stop offset="60%" stopColor="#ffecb3" stopOpacity="0.15" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Réseau / mesh sombre (structure type captures 2–6, plus dense et vivant) */}
          <g className="octagon-mesh" stroke="#0d0d0d" strokeWidth="0.7" fill="none" strokeLinecap="round">
            {/* Contour octogonal irrégulier */}
            <path d="M 200 88 L 296 126 L 312 220 L 272 312 L 200 328 L 128 312 L 88 220 L 104 126 Z" opacity="0.9" />
            {/* Arêtes principales (facettes) */}
            <path d="M 200 88 L 200 200 L 296 126" opacity="0.75" />
            <path d="M 296 126 L 200 200 L 312 220" opacity="0.75" />
            <path d="M 312 220 L 200 200 L 272 312" opacity="0.75" />
            <path d="M 272 312 L 200 200 L 200 328" opacity="0.75" />
            <path d="M 200 328 L 200 200 L 128 312" opacity="0.75" />
            <path d="M 128 312 L 200 200 L 88 220" opacity="0.75" />
            <path d="M 88 220 L 200 200 L 104 126" opacity="0.75" />
            <path d="M 104 126 L 200 200 L 200 88" opacity="0.75" />
            {/* Réseau secondaire (plus de profondeur) */}
            <path d="M 200 200 L 244 160 L 272 212" opacity="0.55" />
            <path d="M 200 200 L 244 244 L 252 296" opacity="0.55" />
            <path d="M 200 200 L 156 244 L 148 296" opacity="0.55" />
            <path d="M 200 200 L 156 160 L 124 184" opacity="0.55" />
            <path d="M 244 160 L 272 212 L 268 260" opacity="0.4" />
            <path d="M 156 160 L 124 184 L 132 232" opacity="0.4" />
            <path d="M 252 296 L 268 260 L 228 280" opacity="0.4" />
            <path d="M 148 296 L 132 232 L 172 280" opacity="0.4" />
          </g>

          {/* Noyau lumineux (centre chaud) */}
          <circle cx="200" cy="200" r="38" fill="url(#oct-core)" filter="url(#oct-glow)" className="octagon-core" />
          <circle cx="200" cy="200" r="22" fill="url(#oct-core)" opacity="0.9" />

          {/* Reflet / flare */}
          <ellipse cx="218" cy="182" rx="50" ry="45" fill="url(#oct-flare)" opacity="0.35" />

          {/* Particules (points lumineux, répartis comme captures 2–6) */}
          <g className="octagon-particles" fill="#ffd54f">
            {[
              [200, 172], [220, 184], [232, 204], [224, 232], [200, 244], [176, 232], [168, 204], [180, 184],
              [200, 196], [212, 200], [200, 216], [188, 200], [200, 204], [208, 208], [192, 208], [208, 192],
              [184, 192], [216, 192], [184, 216], [216, 216], [190, 206], [210, 194], [210, 210], [190, 190],
              [198, 188], [202, 212], [214, 202], [186, 198], [200, 220], [220, 212], [180, 212], [222, 220],
              [178, 220], [218, 188], [188, 218], [212, 222], [228, 198], [198, 228], [204, 184], [196, 216],
            ].map(([x, y], i) => (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={1 + (i % 4) * 0.4}
                opacity={0.55 + (i % 7) / 14}
                className="octagon-particle"
              />
            ))}
          </g>
          {/* Noyau central très lumineux (comme les captures) */}
          <g fill="#fff8e7" className="octagon-core-dots">
            <circle cx="200" cy="200" r="2.5" opacity="0.98" />
            <circle cx="204" cy="197" r="1.2" opacity="0.85" />
            <circle cx="196" cy="203" r="1.2" opacity="0.85" />
            <circle cx="200" cy="198" r="0.8" opacity="0.9" />
          </g>
        </svg>
      </div>
    </div>
  );
}
