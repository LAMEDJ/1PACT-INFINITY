/**
 * Hook itinéraire : géocodage (Nominatim OSM) + calcul route (OSRM).
 * Pas de clé API requise. Production ready, gestion erreurs.
 */
import { useState, useCallback, useRef } from 'react';

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org/search';
const OSRM_BASE = 'https://router.project-osrm.org/route/v1';
const NOMINATIM_DELAY_MS = 1100;
const REQUEST_TIMEOUT_MS = 15000;

const MODES = {
  driving: 'driving',
  cycling: 'cycling',
  walking: 'walking',
};

const OSRM_PROFILES = {
  [MODES.driving]: 'driving',
  [MODES.cycling]: 'cycling',
  [MODES.walking]: 'walking',
};

/**
 * Géocode une adresse via Nominatim (1 req/s respectée).
 * @param {string} address
 * @returns {Promise<{ lat: number, lng: number } | null>}
 */
async function fetchWithTimeout(url, options = {}, timeoutMs = REQUEST_TIMEOUT_MS) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: ctrl.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    if (err.name === 'AbortError') throw new Error('Le calcul a pris trop de temps. Réessayez.');
    throw err;
  }
}

async function geocode(address, signal) {
  const q = encodeURIComponent(address.trim());
  if (!q) return null;
  const url = `${NOMINATIM_BASE}?q=${q}&format=json&limit=1`;
  const res = await fetchWithTimeout(url, {
    headers: { Accept: 'application/json' },
    signal,
  });
  if (!res.ok) return null;
  const data = await res.json();
  const first = data?.[0];
  if (!first?.lat || !first?.lon) return null;
  return { lat: parseFloat(first.lat), lng: parseFloat(first.lon) };
}

/**
 * Délai en ms (pour respecter rate limit Nominatim).
 */
function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * @param {string|{ lat: number, lng: number }} input - Adresse ou coordonnées
 * @returns {Promise<{ lat: number, lng: number } | null>}
 */
async function resolveToCoord(input) {
  if (typeof input === 'object' && input != null && typeof input.lat === 'number' && typeof input.lng === 'number') {
    return input;
  }
  if (typeof input === 'string') return geocode(input);
  return null;
}

/**
 * Calcule un itinéraire OSRM entre deux points.
 * @param {{ lat: number, lng: number }} start
 * @param {{ lat: number, lng: number }} end
 * @param {string} profile - driving | cycling | walking
 * @returns {Promise<{ points: Array<{lat, lng}>, distance_m: number, duration_s: number } | null>}
 */
async function fetchRoute(start, end, profile) {
  const coords = `${start.lng},${start.lat};${end.lng},${end.lat}`;
  const url = `${OSRM_BASE}/${profile}/${coords}?overview=full&geometries=geojson`;
  const res = await fetch(url);
  const data = await res.json();
  if (data?.code !== 'Ok' || !data?.routes?.[0]) return null;
  const route = data.routes[0];
  const geometry = route.geometry?.coordinates || [];
  const points = geometry.map(([lng, lat]) => ({ lat, lng }));
  return {
    points,
    distance_m: Math.round(route.distance),
    duration_s: Math.round(route.duration),
  };
}

/**
 * @returns {{
 *   points: Array<{ lat: number, lng: number }>,
 *   distance_m: number | null,
 *   duration_s: number | null,
 *   loading: boolean,
 *   error: string | null,
 *   calculate: (start: string|{lat,lng}, end: string|{lat,lng}, profile: string) => Promise<void>,
 *   reset: () => void,
 *   setError: (string|null) => void
 * }}
 */
export function useDirections() {
  const [points, setPoints] = useState([]);
  const [distance_m, setDistance_m] = useState(null);
  const [duration_s, setDuration_s] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setErrorState] = useState(null);

  const abortRef = useRef(null);

  const reset = useCallback(() => {
    if (abortRef.current) abortRef.current = true;
    setPoints([]);
    setDistance_m(null);
    setDuration_s(null);
    setErrorState(null);
  }, []);

  const setError = useCallback((msg) => setErrorState(msg), []);

  const calculate = useCallback(async (startInput, endInput, profile = MODES.driving) => {
    const profileKey = OSRM_PROFILES[profile] || 'driving';
    abortRef.current = false;
    setLoading(true);
    setErrorState(null);

    try {
      const start = await resolveToCoord(startInput);
      if (!start) {
        setErrorState('Adresse de départ introuvable.');
        setLoading(false);
        return;
      }
      if (abortRef.current) return;
      await delay(NOMINATIM_DELAY_MS);
      const end = await resolveToCoord(endInput);
      if (!end) {
        setErrorState('Adresse d\'arrivée introuvable.');
        setLoading(false);
        return;
      }
      if (abortRef.current) return;

      const result = await fetchRoute(start, end, profileKey);
      if (abortRef.current) return;
      if (!result) {
        setErrorState('Impossible de calculer l\'itinéraire.');
        setPoints([]);
        setDistance_m(null);
        setDuration_s(null);
      } else {
        setPoints(result.points);
        setDistance_m(result.distance_m);
        setDuration_s(result.duration_s);
      }
    } catch (err) {
      if (!abortRef.current) {
        setErrorState(err?.message || 'Erreur lors du calcul de l\'itinéraire.');
        setPoints([]);
        setDistance_m(null);
        setDuration_s(null);
      }
    } finally {
      if (!abortRef.current) setLoading(false);
    }
  }, []);

  return {
    points,
    distance_m,
    duration_s,
    loading,
    error,
    calculate,
    reset,
    setError,
  };
}

export { MODES as DIRECTIONS_MODES };
