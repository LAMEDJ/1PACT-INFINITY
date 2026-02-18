/**
 * Hook GPS : position actuelle, permission, suivi en temps réel (watchPosition).
 * Throttle des mises à jour pour limiter la batterie et les re-renders.
 * Production ready : gestion refus permission, erreurs, nettoyage.
 */
import { useState, useEffect, useCallback, useRef } from 'react';

const DEFAULT_WATCH_THROTTLE_MS = 2000;
const PERMISSION_DENIED_MSG = 'Accès à la position refusé. Activez la localisation dans les paramètres.';
const NOT_SUPPORTED_MSG = 'Géolocalisation non supportée par ce navigateur.';

/**
 * @param {Object} options
 * @param {number} [options.watchThrottleMs=2000] - Intervalle min entre deux mises à jour en mode suivi
 * @param {number} [options.timeout=10000] - Délai max pour obtenir une position (ms)
 * @returns {{
 *   position: { lat: number, lng: number } | null,
 *   error: string | null,
 *   permissionState: 'prompt'|'granted'|'denied',
 *   isWatching: boolean,
 *   requestLocation: () => void,
 *   startWatching: () => void,
 *   stopWatching: () => void,
 *   clearError: () => void
 * }}
 */
export function useUserLocation({
  watchThrottleMs = DEFAULT_WATCH_THROTTLE_MS,
  timeout = 10000,
} = {}) {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const [permissionState, setPermissionState] = useState('prompt');
  const [isWatching, setIsWatching] = useState(false);

  const watchIdRef = useRef(null);
  const lastUpdateRef = useRef(0);

  const onSuccess = useCallback((pos) => {
    const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    setPosition(coords);
    setError(null);
    setPermissionState('granted');
  }, []);

  const onError = useCallback((err) => {
    setError(err?.message || PERMISSION_DENIED_MSG);
    if (err?.code === 1) setPermissionState('denied');
    if (err?.code === 2) setError('Position temporairement indisponible.');
    if (err?.code === 3) setError('Délai dépassé pour obtenir la position.');
  }, []);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError(NOT_SUPPORTED_MSG);
      return;
    }
    setError(null);
    navigator.geolocation.getCurrentPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      timeout,
      maximumAge: 0,
    });
  }, [onSuccess, onError, timeout]);

  const startWatching = useCallback(() => {
    if (!navigator.geolocation) {
      setError(NOT_SUPPORTED_MSG);
      return;
    }
    setError(null);
    lastUpdateRef.current = 0;
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const now = Date.now();
        if (now - lastUpdateRef.current < watchThrottleMs) return;
        lastUpdateRef.current = now;
        onSuccess(pos);
      },
      onError,
      {
        enableHighAccuracy: true,
        timeout,
        maximumAge: watchThrottleMs,
      }
    );
    setIsWatching(true);
  }, [onSuccess, onError, timeout, watchThrottleMs]);

  const stopWatching = useCallback(() => {
    if (watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsWatching(false);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  useEffect(() => {
    if (typeof navigator?.permissions?.query !== 'function') return;
    let cancelled = false;
    navigator.permissions.query({ name: 'geolocation' }).then((result) => {
      if (cancelled) return;
      setPermissionState(result.state);
      result.onchange = () => {
        if (!cancelled) setPermissionState(result.state);
      };
    }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    return () => {
      if (watchIdRef.current != null) {
        navigator.geolocation?.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, []);

  return {
    position,
    error,
    permissionState,
    isWatching,
    requestLocation,
    startWatching,
    stopWatching,
    clearError,
  };
}
