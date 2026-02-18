/**
 * Hook suivi en temps réel : position sur l'itinéraire, segment restant, détection déviation.
 * Utilise la position GPS (watchPosition) et la compare à la polyline de la route.
 */
import { useMemo } from 'react';
import { haversineMeters } from '../utils/geo';

const DEVIATION_THRESHOLD_M = 80;

/**
 * Distance d'un point à un segment [a, b] (approximation par projection).
 * @param {{ lat, lng }} p
 * @param {{ lat, lng }} a
 * @param {{ lat, lng }} b
 * @returns {{ distM: number, t: number }} t in [0,1] = position sur le segment
 */
function distanceToSegment(p, a, b) {
  const d = haversineMeters(a, b);
  if (d < 1e-6) return { distM: haversineMeters(p, a), t: 0 };
  let t = 0;
  let bestDist = haversineMeters(p, a);
  const steps = 20;
  for (let i = 1; i <= steps; i++) {
    const ti = i / steps;
    const lat = a.lat + (b.lat - a.lat) * ti;
    const lng = a.lng + (b.lng - a.lng) * ti;
    const dist = haversineMeters(p, { lat, lng });
    if (dist < bestDist) {
      bestDist = dist;
      t = ti;
    }
  }
  return { distM: bestDist, t };
}

/**
 * Trouve l'index du segment le plus proche et la distance min à la route.
 * @param {{ lat, lng }} position
 * @param {Array<{ lat, lng }>} routePoints
 * @returns {{ segmentIndex: number, distM: number, t: number } }
 */
function closestSegment(position, routePoints) {
  if (!routePoints?.length) return { segmentIndex: 0, distM: Infinity, t: 0 };
  let best = { segmentIndex: 0, distM: Infinity, t: 0 };
  for (let i = 0; i < routePoints.length - 1; i++) {
    const { distM, t } = distanceToSegment(position, routePoints[i], routePoints[i + 1]);
    if (distM < best.distM) best = { segmentIndex: i, distM, t };
  }
  return best;
}

/**
 * Retourne les points de la route à partir du segment courant (pour afficher le "reste").
 * On coupe au début du segment le plus proche (légèrement avancé pour fluidité).
 */
function remainingRoutePoints(routePoints, segmentIndex, t) {
  if (!routePoints?.length || segmentIndex >= routePoints.length - 1) return [];
  const start = segmentIndex + (t > 0.5 ? 1 : 0);
  return routePoints.slice(Math.max(0, start));
}

/**
 * @param {Object} options
 * @param {boolean} options.active - Suivi actif (itinéraire affiché + suivi activé)
 * @param {{ lat: number, lng: number } | null} options.userPosition - Position GPS actuelle
 * @param {Array<{ lat: number, lng: number }>} options.routePoints - Polyline complète de l'itinéraire
 * @returns {{
 *   remainingPoints: Array<{ lat, lng }>,
 *   isDeviated: boolean,
 *   distanceToRouteM: number,
 *   remainingDistanceM: number | null
 * }}
 */
export function useLiveTracking({ active, userPosition, routePoints }) {
  return useMemo(() => {
    if (!active || !userPosition || !routePoints?.length) {
      return {
        remainingPoints: [],
        isDeviated: false,
        distanceToRouteM: 0,
        remainingDistanceM: null,
      };
    }
    const { segmentIndex, distM, t } = closestSegment(userPosition, routePoints);
    const remaining = remainingRoutePoints(routePoints, segmentIndex, t);
    let remDist = null;
    if (remaining.length >= 2) {
      remDist = 0;
      for (let i = 0; i < remaining.length - 1; i++) {
        remDist += haversineMeters(remaining[i], remaining[i + 1]);
      }
    }
    return {
      remainingPoints: remaining,
      isDeviated: distM > DEVIATION_THRESHOLD_M,
      distanceToRouteM: Math.round(distM),
      remainingDistanceM: remDist != null ? Math.round(remDist) : null,
    };
  }, [active, userPosition?.lat, userPosition?.lng, routePoints]);
}
