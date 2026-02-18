/**
 * Hook contrôle carte : ref vers l'instance Leaflet + actions (centrer sur itinéraire, sur utilisateur).
 * La ref est alimentée par un composant enfant rendu dans MapContainer (useMap).
 */
import { useRef, useCallback } from 'react';

/**
 * @returns {{
 *   mapRef: React.MutableRefObject<L.Map | null>,
 *   centerOnRoute: (points: Array<{ lat: number, lng: number }>) => void,
 *   centerOnUser: (position: { lat: number, lng: number }, zoom?: number) => void,
 *   fitBounds: (points: Array<{ lat: number, lng: number }>, padding?: [number, number]) => void
 * }}
 */
export function useMapController() {
  const mapRef = useRef(null);

  const centerOnRoute = useCallback((points) => {
    if (!mapRef.current || !Array.isArray(points) || points.length < 2) return;
    import('leaflet').then((m) => {
      const L = m.default || m;
      const latlngs = points.map((p) => L.latLng(p.lat, p.lng));
      if (mapRef.current) mapRef.current.fitBounds(L.latLngBounds(latlngs), { padding: [40, 40], maxZoom: 15 });
    });
  }, []);

  const fitBounds = useCallback((points, padding = [40, 40]) => {
    if (!mapRef.current || !Array.isArray(points) || points.length < 2) return;
    import('leaflet').then((m) => {
      const L = m.default || m;
      const latlngs = points.map((p) => L.latLng(p.lat, p.lng));
      if (mapRef.current) mapRef.current.fitBounds(L.latLngBounds(latlngs), { padding, maxZoom: 15 });
    });
  }, []);

  const centerOnUser = useCallback((position, zoom = 16) => {
    if (!mapRef.current || !position) return;
    mapRef.current.setView([position.lat, position.lng], Math.max(mapRef.current.getZoom(), zoom));
  }, []);

  return {
    mapRef,
    centerOnRoute,
    centerOnUser,
    fitBounds,
  };
}
