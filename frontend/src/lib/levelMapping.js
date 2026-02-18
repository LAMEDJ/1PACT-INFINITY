/**
 * Système Points Impact vs Niveau Impact.
 * - Points Impact : valeur numérique cumulée (servent à calculer le niveau).
 * - Niveau Impact : badge / rang. Règle : 24 Points = +1 Niveau.
 * Formule niveau : Math.floor(impact_points / 24) + 1 (min 1).
 */

/** Points nécessaires pour passer au niveau suivant */
export const POINTS_PER_LEVEL = 24;

/** Mapping des niveaux (badges) – évolutif si niveaux > 4 */
export const impactLevels = {
  1: 'Explorateur',
  2: 'Aventurier',
  3: 'Pirate',
  4: 'Légende',
};

/** Alias pour compatibilité */
export const LEVELS = impactLevels;

/**
 * Retourne le niveau (1, 2, 3, 4, …) à partir des points.
 * Règle : 24 Points Impact = +1 Niveau. Niveau minimum 1.
 * @param {number} points - Points Impact cumulés
 * @returns {{ level: number, label: string, class: string }}
 */
export function getLevelFromPoints(points = 0) {
  const level = Math.max(1, Math.floor((points || 0) / POINTS_PER_LEVEL) + 1);
  const label = impactLevels[level] ?? `Niveau ${level}`;
  const classKey = ['explorateur', 'aventurier', 'pirate', 'legende'][level - 1] ?? 'legende';
  return { level, label, class: classKey };
}

/**
 * Progression vers le prochain niveau (pour la barre de progression).
 * points_restants = 24 - (impact_points % 24) ; au niveau max, reste 0.
 * @param {number} points - Points Impact actuels
 * @returns {{ current: number, next: number, percent: number, pointsInLevel: number, pointsRemaining: number }}
 */
export function getProgressToNextLevel(points = 0) {
  const p = points || 0;
  const pointsInLevel = p % POINTS_PER_LEVEL; // points dans la tranche courante (0–23)
  const pointsRemaining = POINTS_PER_LEVEL - pointsInLevel; // points restants avant +1 niveau
  const percent = p <= 0 ? 0 : Math.min(100, (pointsInLevel / POINTS_PER_LEVEL) * 100);
  const { level } = getLevelFromPoints(p);
  const nextLevelPoints = level * POINTS_PER_LEVEL;
  return {
    current: p,
    next: nextLevelPoints,
    percent: Math.round(percent),
    pointsInLevel,
    pointsRemaining,
  };
}
