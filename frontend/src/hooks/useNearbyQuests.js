/**
 * Hook quêtes à proximité – chargement lazy (au clic), tri par distance puis date.
 * Option géolocalisation pour tri "nearby".
 */
import { useState, useCallback, useRef } from 'react';
import { getQuests } from '../lib/quests';

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function useNearbyQuests(options = {}) {
  const { enabled = true, userPosition = null } = options;
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const fetchRef = useRef(null);

  const fetchQuests = useCallback(() => {
    if (!enabled) return Promise.resolve();
    setLoading(true);
    return getQuests()
      .then((data) => {
        let list = data.map((q) => ({ ...q, id: String(q.id) }));
        if (userPosition?.lat != null && userPosition?.lng != null) {
          list = list
            .map((q) => ({
              ...q,
              distanceKm: Math.round(haversineKm(userPosition.lat, userPosition.lng, q.lat, q.lng) * 10) / 10,
            }))
            .sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));
        } else {
          list = list.map((q) => ({ ...q, distanceKm: null }));
        }
        setQuests(list);
        setLoaded(true);
      })
      .catch(() => setQuests([]))
      .finally(() => setLoading(false));
  }, [enabled, userPosition?.lat, userPosition?.lng]);

  const refresh = useCallback(() => {
    setLoaded(false);
    return fetchQuests();
  }, [fetchQuests]);

  const loadIfNeeded = useCallback(() => {
    if (!loaded && !loading) fetchQuests();
  }, [loaded, loading, fetchQuests]);

  return {
    quests,
    loading,
    loaded,
    refetch: fetchQuests,
    refresh,
    loadIfNeeded,
  };
}
