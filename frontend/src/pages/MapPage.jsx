/**
 * Page Carte 1PACT – Module GPS & Itinéraire 100% lié à la carte, suivi temps réel.
 * Carte Satellite/Hybride, quêtes géolocalisées, itinéraires OSRM, panneau GPS au-dessus.
 */
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.markercluster';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useGeolocation } from '../hooks/useGeolocation';
import { useMapController } from '../hooks/useMapController';
import { getQuests, DEFAULT_QUEST_RADIUS_M } from '../lib/quests';
import { haversineMeters, formatDistance, isWithinRadius } from '../utils/geo';
import MapControlPanel from '../components/map/MapControlPanel';
import './PageCommon.css';
import './MapPage.css';

/** Injecte l’instance Leaflet dans mapRef (pour le module GPS) */
function MapControllerInjector({ mapRef }) {
  const map = useMap();
  useEffect(() => {
    mapRef.current = map;
    return () => { mapRef.current = null; };
  }, [map, mapRef]);
  return null;
}

// ——— Icônes Leaflet (éviter 404)
const defaultMarkerIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

/** Icône utilisateur (point bleu type GPS) */
function createUserIcon() {
  return L.divIcon({
    className: 'map-user-marker',
    html: '<span class="map-user-marker-dot"></span>',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

/** Icône quête (cercle avec glow, personnalisable par image plus tard) */
function createQuestIcon(iconUrl, inRange = false) {
  return L.divIcon({
    className: `map-quest-marker ${inRange ? 'map-quest-marker--in-range' : ''}`,
    html: iconUrl
      ? `<img src="${iconUrl}" alt="" class="map-quest-marker-img" />`
      : '<span class="map-quest-marker-dot"></span>',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
}

/** Icônes départ / arrivée de l’itinéraire */
function createRouteEndpointIcon(type) {
  const baseClass = type === 'start' ? 'map-route-marker-start' : 'map-route-marker-end';
  return L.divIcon({
    className: `map-route-marker ${baseClass}`,
    html: '<span class="map-route-marker-dot"></span>',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

/** Recentre la carte sur la position une fois qu’on l’a obtenue */
function LocateButton({ userPos }) {
  const map = useMap();
  useEffect(() => {
    if (userPos) map.setView([userPos.lat, userPos.lng], Math.max(map.getZoom(), 14));
  }, [map, userPos?.lat, userPos?.lng]);
  return null;
}

/** Marqueurs quêtes avec clustering */
function QuestMarkersCluster({ quests, userPos, inRangeIds, onQuestClick }) {
  const map = useMap();
  const groupRef = useRef(null);

  useEffect(() => {
    if (!map || !quests.length) return;
    const group = L.markerClusterGroup({ chunkedLoading: true, maxClusterRadius: 60 });
    groupRef.current = group;

    quests.forEach((q) => {
      const inRange = inRangeIds.has(q.id);
      const icon = createQuestIcon(q.icon_url, inRange);
      const marker = L.marker([q.lat, q.lng], { icon })
        .bindPopup(
          `<div class="map-popup-quest">
            <strong>${q.title || 'Quête'}</strong>
            ${q.description ? `<p>${q.description}</p>` : ''}
            ${q.reward ? `<span class="map-popup-reward">${q.reward}</span>` : ''}
            ${userPos ? `<span class="map-popup-distance">${formatDistance(haversineMeters(userPos, q))}</span>` : ''}
          </div>`,
          { className: 'map-popup-quest-wrap' }
        );
      marker.questId = q.id;
      marker.on('click', () => onQuestClick && onQuestClick(q));
      group.addLayer(marker);
    });

    map.addLayer(group);
    return () => {
      map.removeLayer(group);
      groupRef.current = null;
    };
  }, [map, quests, userPos, inRangeIds, onQuestClick]);

  return null;
}

/** Polyline d’itinéraire (coordonnées [lat,lng][]) */
function RouteLayer({ points }) {
  if (!points || points.length < 2) return null;
  const positions = points.map((p) => [p.lat, p.lng]);
  return (
    <Polyline
      positions={positions}
      pathOptions={{
        className: 'map-route-line',
        color: 'var(--map-route-color)',
        weight: 5,
        opacity: 0.95,
      }}
    />
  );
}

/** Marqueurs départ / arrivée de l’itinéraire */
function RouteEndpoints({ points, startIcon, endIcon }) {
  if (!points || points.length < 2) return null;
  const start = points[0];
  const end = points[points.length - 1];
  return (
    <>
      <Marker position={[start.lat, start.lng]} icon={startIcon} />
      <Marker position={[end.lat, end.lng]} icon={endIcon} />
    </>
  );
}

export default function MapPage() {
  const { user } = useAuth();
  const [associations, setAssociations] = useState([]);
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [geoEnabled, setGeoEnabled] = useState(false);
  const [mapStyle, setMapStyle] = useState('street');
  const [inRangeIds, setInRangeIds] = useState(new Set());
  const [routePoints, setRoutePoints] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);
  const [selectedQuestIds, setSelectedQuestIds] = useState([]);
  const [gpsPositionFromPanel, setGpsPositionFromPanel] = useState(null);

  const { mapRef, centerOnRoute, centerOnUser, fitBounds } = useMapController();
  const mapController = useMemo(() => ({ centerOnRoute, centerOnUser, fitBounds }), [centerOnRoute, centerOnUser, fitBounds]);

  const { position: userPos, error: geoError, requestLocation } = useGeolocation({
    enabled: geoEnabled,
    intervalMs: 2000,
  });

  const displayPosition = gpsPositionFromPanel ?? userPos;
  const onRouteCalculated = useCallback((data) => {
    setRoutePoints(data?.points ?? []);
    setRouteInfo(data?.points?.length >= 2 ? { distance_m: data.distance_m, duration_s: data.duration_s } : null);
  }, []);
  const onGpsPositionChange = useCallback((pos) => setGpsPositionFromPanel(pos), []);

  // Charger associations + quêtes
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      api.associations.list().catch(() => []),
      getQuests(),
    ]).then(([list, qList]) => {
      if (cancelled) return;
      setAssociations(Array.isArray(list) ? list.filter((a) => a.latitude != null && a.longitude != null) : []);
      setQuests(Array.isArray(qList) ? qList : []);
    }).catch(() => {}).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // Déclencher quêtes dans le rayon (50 m)
  useEffect(() => {
    if (!userPos || !quests.length) {
      setInRangeIds(new Set());
      return;
    }
    const next = new Set();
    quests.forEach((q) => {
      if (isWithinRadius(userPos, q, DEFAULT_QUEST_RADIUS_M)) next.add(q.id);
    });
    setInRangeIds(next);
  }, [userPos, quests]);

  const toggleQuestForRoute = (questId) => {
    setSelectedQuestIds((prev) =>
      prev.includes(questId) ? prev.filter((id) => id !== questId) : [...prev, questId]
    );
  };

  const userIcon = createUserIcon();
  const startRouteIcon = useMemo(() => createRouteEndpointIcon('start'), []);
  const endRouteIcon = useMemo(() => createRouteEndpointIcon('end'), []);

  return (
    <div className="page map-page map-page--gps map-page--immersive">
      <div className="map-background-layer" aria-hidden="true" />
      <div className="map-layer">
        {/* Module GPS & Itinéraire – au-dessus de la carte, 100% lié */}
        <MapControlPanel
          mapRef={mapRef}
          mapController={mapController}
          onRouteCalculated={onRouteCalculated}
          onGpsPositionChange={onGpsPositionChange}
          routePoints={routePoints}
          compact={false}
        />

        {/* Carte principale */}
        <div className="map-container map-container--full map-container--centered">
          <div className="map-container__vignette" aria-hidden="true" />
          {loading ? (
            <div className="map-placeholder">Chargement de la carte…</div>
          ) : (
          <MapContainer
            center={[46.603354, 2.381132]}
            zoom={6}
            scrollWheelZoom
            className="map-leaflet map-leaflet--gps"
            style={{ height: '100%', width: '100%' }}
          >
            <MapControllerInjector mapRef={mapRef} />
            <TileLayer
              attribution={
                mapStyle === 'satellite'
                  ? '&copy; Esri'
                  : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              }
              url={
                mapStyle === 'satellite'
                  ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                  : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
              }
            />
            {displayPosition && <LocateButton userPos={displayPosition} />}

            {/* Marqueur utilisateur (GPS panel ou bouton Activer ma position) */}
            {displayPosition && (
              <Marker position={[displayPosition.lat, displayPosition.lng]} icon={userIcon} zIndexOffset={1000} />
            )}

            {/* Quêtes (clustering) */}
            <QuestMarkersCluster
              quests={quests}
              userPos={userPos}
              inRangeIds={inRangeIds}
              onQuestClick={(q) => toggleQuestForRoute(q.id)}
            />

            {/* Itinéraire */}
            <RouteLayer points={routePoints} />
            <RouteEndpoints points={routePoints} startIcon={startRouteIcon} endIcon={endRouteIcon} />

            {/* Marqueurs associations (existants) */}
            {associations.map((a) => (
              <Marker
                key={`a-${a.id}`}
                position={[a.latitude, a.longitude]}
                icon={defaultMarkerIcon}
              >
                <Popup className="map-popup-association">
                  <strong>{a.name}</strong>
                  {a.category && <><br /><span className="map-popup-category">{a.category}</span></>}
                  {a.location && <><br /><span>{a.location}</span></>}
                  <br />
                  <Link to={`/association/${a.id}`} className="map-popup-link">Voir le profil</Link>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
          )}
        </div>

        <section className="map-controls">
          <h2 className="map-page__title">Carte 1PACT</h2>
          <p className="map-page__desc">
            Module GPS & itinéraire 100% lié à la carte avec suivi en temps réel. Explorez les associations et les quêtes.
          </p>
          <div className="map-page__controls">
            <button
              type="button"
              className="map-page__btn map-page__btn--geo"
              onClick={() => {
                setGeoEnabled((e) => !e);
                if (!geoEnabled) requestLocation();
              }}
            >
              {userPos ? '✓ Position active' : 'Activer ma position'}
            </button>
            <div className="map-page__tile-toggle">
              <button
                type="button"
                className={mapStyle === 'street' ? 'active' : ''}
                onClick={() => setMapStyle('street')}
              >
                Plan
              </button>
              <button
                type="button"
                className={mapStyle === 'satellite' ? 'active' : ''}
                onClick={() => setMapStyle('satellite')}
              >
                Satellite
              </button>
            </div>
          </div>
          {geoError && <p className="map-page__geo-error">{geoError}</p>}
          <p className="map-page__rgpd">
            La position n'est utilisée qu'après activation et sert uniquement aux quêtes et itinéraires sur cette page.
          </p>
        </section>
      </div>
    </div>
  );
}
