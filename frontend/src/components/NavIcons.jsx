/**
 * Icônes de navigation – style outline (sans emojis).
 * Utilisées dans BottomNav et Sidebar.
 */
const iconProps = { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };

export function IconAccueil() {
  return (
    <svg {...iconProps} aria-hidden="true">
      <path d="M12 2L2 7l10 5 10-5L12 2z" />
      <path d="M2 17l10 5 10-5" />
    </svg>
  );
}

export function IconCarte() {
  return (
    <svg {...iconProps} aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export function IconFil() {
  /* Fil d'actualité : lignes type flux / liste de contenus */
  return (
    <svg {...iconProps} aria-hidden="true">
      <rect x="3" y="4" width="18" height="4" rx="1" />
      <rect x="3" y="10" width="14" height="3" rx="1" />
      <rect x="3" y="15" width="16" height="3" rx="1" />
    </svg>
  );
}

export function IconMessages() {
  return (
    <svg {...iconProps} aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

export function IconProfil() {
  return (
    <svg {...iconProps} aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

const ICONS = {
  accueil: IconAccueil,
  map: IconCarte,
  feed: IconFil,
  messenger: IconMessages,
  profile: IconProfil,
};

export function NavIcon({ id }) {
  const Icon = ICONS[id];
  return Icon ? <Icon /> : null;
}
