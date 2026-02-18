/**
 * Hook de géolocalisation temps réel pour la carte 1PACT.
 * Suivi GPS avec rafraîchissement configurable (1–3 secondes).
 */
import { useState, useEffect, useCallback } from 'react';

/** Intervalle de rafraîchissement en ms (2 secondes par défaut) */
const DEFAULT_WATCH_INTERVAL_MS = 2000;

/**
 * Suivi GPS temps réel du joueur.
 * @param {Object} options
 * @param {boolean} [options.enabled=true] - Activer le suivi
 * @param {number} [options.intervalMs=2000] - Intervalle entre deux mises à jour (1000–3000 recommandé)
 * @param {number} [options.maxAge=0] - Cache position (ms) ; 0 = toujours nouveau
 * @param {number} [options.timeout=10000] - Délai max pour obtenir une position (ms)
 * @returns {{ position: { lat: number, lng: number } | null, error: string | null, loading: boolean, requestLocation: function }}
 */
export function useGeolocation({
  enabled = true,
  intervalMs = DEFAULT_WATCH_INTERVAL_MS,
  maxAge = 0,
  timeout = 10000,
} = {}) {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const onSuccess = useCallback((pos) => {
    setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    setError(null);
    setLoading(false);
  }, []);

  const onError = useCallback((err) => {
    setError(err.message || 'Géolocalisation indisponible');
    setLoading(false);
  }, []);

  // Demande unique (pour le bouton "Ma position")
  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Géolocalisation non supportée par ce navigateur.');
      return;
    }
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      timeout,
      maximumAge: maxAge,
    });
  }, [onSuccess, onError, timeout, maxAge]);

  // Suivi continu quand activé
  useEffect(() => {
    if (!enabled || !navigator.geolocation) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const id = navigator.geolocation.watchPosition(
      onSuccess,
      onError,
      {
        enableHighAccuracy: true,
        timeout,
        maximumAge: Math.min(maxAge, intervalMs),
      }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, [enabled, intervalMs, maxAge, timeout, onSuccess, onError]);

  return { position, error, loading, requestLocation };
}
