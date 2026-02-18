/**
 * Hook d’auto-complétion d’adresses via Nominatim (OpenStreetMap).
 * Respecte la politique 1 requête / seconde. Ne modifie pas le backend.
 */
import { useState, useCallback, useRef, useEffect } from 'react';

const NOMINATIM_SEARCH = 'https://nominatim.openstreetmap.org/search';
const MIN_QUERY_LENGTH = 3;
const DEBOUNCE_MS = 500;
const RATE_LIMIT_MS = 1100;

// Partagé entre toutes les instances pour respecter 1 req/s Nominatim
let lastRequestTime = 0;

/**
 * @param {string} query - Texte saisi par l’utilisateur
 * @returns {Promise<Array<{ display: string, lat: number, lng: number }>>}
 */
async function fetchSuggestions(query) {
  const q = query.trim();
  if (q.length < MIN_QUERY_LENGTH) return [];
  const url = `${NOMINATIM_SEARCH}?q=${encodeURIComponent(q)}&format=json&limit=5`;
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) return [];
  const data = await res.json();
  if (!Array.isArray(data)) return [];
  return data
    .filter((item) => item?.lat != null && item?.lon != null)
    .map((item) => ({
      display: item.display_name || [item.name, item.address?.city, item.address?.country].filter(Boolean).join(', ') || `${item.lat}, ${item.lon}`,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
    }));
}

/**
 * @param {Object} options
 * @param {number} [options.debounceMs=500]
 * @param {boolean} [options.enabled=true]
 * @returns {{
 *   suggestions: Array<{ display: string, lat: number, lng: number }>,
 *   loading: boolean,
 *   fetchSuggestions: (query: string) => void,
 *   clearSuggestions: () => void
 * }}
 */
export function useAddressAutocomplete({ debounceMs = DEBOUNCE_MS, enabled = true } = {}) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setLoading(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const fetchSuggestionsForQuery = useCallback(
    async (query) => {
      if (!enabled || !query || query.trim().length < MIN_QUERY_LENGTH) {
        setSuggestions([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      const now = Date.now();
      const wait = Math.max(0, RATE_LIMIT_MS - (now - lastRequestTime));
      if (wait > 0) await new Promise((r) => setTimeout(r, wait));
      lastRequestTime = Date.now();
      try {
        const list = await fetchSuggestions(query);
        setSuggestions(list);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    },
    [enabled]
  );

  const scheduleFetch = useCallback(
    (query) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (!query || query.trim().length < MIN_QUERY_LENGTH) {
        setSuggestions([]);
        setLoading(false);
        timerRef.current = null;
        return;
      }
      setLoading(true);
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        fetchSuggestionsForQuery(query);
      }, debounceMs);
    },
    [debounceMs, fetchSuggestionsForQuery]
  );

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  return {
    suggestions,
    loading,
    fetchSuggestions: scheduleFetch,
    clearSuggestions,
  };
}
