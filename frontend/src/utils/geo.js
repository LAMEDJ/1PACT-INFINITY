/**
 * Utilitaires de géolocalisation pour la carte 1PACT.
 * Calcul des distances (Haversine) et formatage pour l'affichage.
 */

/** Rayon de la Terre en mètres (approximation sphérique) */
const EARTH_RADIUS_M = 6_371_000;

/**
 * Calcule la distance en mètres entre deux points GPS (formule de Haversine).
 * @param {{ lat: number, lng: number }} a - Premier point { lat, lng } en degrés
 * @param {{ lat: number, lng: number }} b - Second point { lat, lng } en degrés
 * @returns {number} Distance en mètres
 */
export function haversineMeters(a, b) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  return EARTH_RADIUS_M * c;
}

/**
 * Indique si le joueur est dans le rayon d'une quête (déclenchement automatique).
 * @param {{ lat: number, lng: number }} player - Position du joueur
 * @param {{ lat: number, lng: number, radius_m?: number }} point - Point (quête) avec rayon optionnel en m
 * @param {number} defaultRadiusM - Rayon par défaut si point.radius_m absent (ex. 50)
 * @returns {boolean}
 */
export function isWithinRadius(player, point, defaultRadiusM = 50) {
  const radiusM = point.radius_m ?? defaultRadiusM;
  return haversineMeters(player, { lat: point.lat, lng: point.lng }) <= radiusM;
}

/**
 * Formate une distance en mètres pour l'affichage (m ou km).
 * @param {number} meters
 * @returns {string} ex. "120 m" ou "2,3 km"
 */
export function formatDistance(meters) {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1).replace('.', ',')} km`;
}
