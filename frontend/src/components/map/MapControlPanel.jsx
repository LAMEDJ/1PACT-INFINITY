/**
 * Module GPS & Itinéraire – au-dessus de la carte.
 * Saisie adresse, position actuelle (optionnelle), calcul OSRM, suivi temps réel, modes transport.
 * 100% lié à la carte (ref + callbacks).
 */
import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useUserLocation } from '../../hooks/useUserLocation';
import { useDirections, DIRECTIONS_MODES } from '../../hooks/useDirections';
import { useLiveTracking } from '../../hooks/useLiveTracking';
import { formatDistance } from '../../utils/geo';
import { useAddressAutocomplete } from '../../hooks/useAddressAutocomplete';
import './MapControlPanel.css';

const MODE_LABELS = {
  [DIRECTIONS_MODES.driving]: 'Voiture',
  [DIRECTIONS_MODES.cycling]: 'Vélo',
  [DIRECTIONS_MODES.walking]: 'À pied',
};

function formatDuration(seconds) {
  if (seconds == null || seconds < 0) return '—';
  const min = Math.round(seconds / 60);
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

// Estimation très simple des calories (ordre de grandeur uniquement)
// marche ~ 60 kcal / km, vélo ~ 30 kcal / km
function estimateCalories(distanceM, mode) {
  if (!distanceM || distanceM <= 0) return null;
  const km = distanceM / 1000;
  if (mode === DIRECTIONS_MODES.walking) {
    return Math.round(km * 60);
  }
  if (mode === DIRECTIONS_MODES.cycling) {
    return Math.round(km * 30);
  }
  return null;
}

/**
 * @param {Object} props
 * @param {React.MutableRefObject<L.Map | null>} props.mapRef
 * @param {{ centerOnRoute: (points) => void, centerOnUser: (pos) => void, fitBounds: (points) => void }} props.mapController
 * @param {(data: { points: Array<{lat,lng}>, distance_m: number, duration_s: number }) => void} props.onRouteCalculated
 * @param {(position: { lat: number, lng: number } | null) => void} props.onGpsPositionChange
 * @param {Array<{ lat: number, lng: number }>} props.routePoints - Itinéraire affiché (pour suivi)
 * @param {boolean} [props.compact] - Mode mobile compact
 */
export default function MapControlPanel({
  mapRef,
  mapController,
  onRouteCalculated,
  onGpsPositionChange,
  routePoints = [],
  compact = false,
}) {
  const [startAddress, setStartAddress] = useState('');
  const [endAddress, setEndAddress] = useState('');
  const [useCurrentPositionForStart, setUseCurrentPositionForStart] = useState(false);
  const [transportMode, setTransportMode] = useState(DIRECTIONS_MODES.driving);
  const [trackingActive, setTrackingActive] = useState(false);
  const [activeField, setActiveField] = useState(null); // 'start' | 'end' | null

  const {
    suggestions,
    loading: acLoading,
    fetchSuggestions,
    clearSuggestions,
  } = useAddressAutocomplete();

  const {
    position: userPosition,
    error: gpsError,
    permissionState,
    isWatching,
    requestLocation,
    startWatching,
    stopWatching,
    clearError: clearGpsError,
  } = useUserLocation({ watchThrottleMs: 2000 });

  const {
    points,
    distance_m,
    duration_s,
    loading: directionsLoading,
    error: directionsError,
    calculate,
    reset: resetDirections,
    setError: setDirectionsError,
  } = useDirections();

  const { centerOnRoute, centerOnUser, fitBounds } = mapController || {};
  const hasRoute = Array.isArray(routePoints) && routePoints.length >= 2;

  const { remainingDistanceM, isDeviated } = useLiveTracking({
    active: trackingActive && hasRoute,
    userPosition: isWatching ? userPosition : null,
    routePoints,
  });

  // Synchroniser l’itinéraire calculé vers le parent (carte)
  useEffect(() => {
    if (points.length >= 2 && distance_m != null && duration_s != null) {
      onRouteCalculated?.({ points, distance_m, duration_s });
    }
  }, [points, distance_m, duration_s, onRouteCalculated]);

  // Position GPS vers le parent (marqueur sur la carte)
  useEffect(() => {
    onGpsPositionChange?.(userPosition);
  }, [userPosition?.lat, userPosition?.lng, onGpsPositionChange]);

  // Centrer la carte sur l’itinéraire après calcul
  useEffect(() => {
    if (points.length >= 2 && fitBounds) fitBounds(points);
  }, [points.length, fitBounds]);

  // Suivi : centrer sur l’utilisateur en temps réel
  useEffect(() => {
    if (!trackingActive || !userPosition || !mapRef?.current) return;
    centerOnUser?.(userPosition, 15);
  }, [trackingActive, userPosition?.lat, userPosition?.lng, centerOnUser, mapRef]);

  const handleUseMyPosition = useCallback(() => {
    // Si la géolocalisation est refusée, l'utilisateur peut quand même saisir manuellement.
    clearGpsError();
    setDirectionsError(null);
    requestLocation();
    startWatching();
    setUseCurrentPositionForStart(true);
    setStartAddress('Position actuelle');
    setActiveField(null);
    clearSuggestions();
  }, [requestLocation, startWatching, clearGpsError, setDirectionsError, clearSuggestions]);

  const handleCalculate = useCallback(() => {
    const start = useCurrentPositionForStart && userPosition ? userPosition : startAddress;
    const end = endAddress?.trim();
    if (!end) {
      setDirectionsError('Saisissez une adresse d\'arrivée.');
      return;
    }
    if (!useCurrentPositionForStart && !startAddress?.trim()) {
      setDirectionsError('Saisissez une adresse de départ ou utilisez « Utiliser ma position ».');
      return;
    }
    setDirectionsError(null);
    calculate(start, end, transportMode);
  }, [useCurrentPositionForStart, userPosition, startAddress, endAddress, transportMode, calculate, setDirectionsError]);

  const handleReset = useCallback(() => {
    resetDirections();
    setTrackingActive(false);
    stopWatching();
    setUseCurrentPositionForStart(false);
    setStartAddress('');
    setEndAddress('');
    setActiveField(null);
    clearSuggestions();
    onRouteCalculated?.({ points: [], distance_m: null, duration_s: null });
  }, [resetDirections, stopWatching, onRouteCalculated, clearSuggestions]);

  const handleStopTracking = useCallback(() => {
    setTrackingActive(false);
    stopWatching();
  }, [stopWatching]);

  const handleRecenter = useCallback(() => {
    if (hasRoute && routePoints.length >= 2 && fitBounds) {
      fitBounds(routePoints);
    } else if (userPosition && centerOnUser) {
      centerOnUser(userPosition);
    }
  }, [hasRoute, routePoints, fitBounds, userPosition, centerOnUser]);

  const googleMapsUrl = useMemo(() => {
    if (!hasRoute || routePoints.length < 2) return null;
    const origin = routePoints[0];
    const dest = routePoints[routePoints.length - 1];
    return `https://www.google.com/maps/dir/${origin.lat},${origin.lng}/${dest.lat},${dest.lng}`;
  }, [hasRoute, routePoints]);

  const canCalculate = !directionsLoading && (useCurrentPositionForStart ? !!userPosition : !!startAddress?.trim()) && !!endAddress?.trim();

  // Recalcul automatique quand on change le mode de transport (même départ/arrivée)
  const prevModeRef = useRef(transportMode);
  useEffect(() => {
    if (prevModeRef.current === transportMode || routePoints.length < 2 || directionsLoading) return;
    prevModeRef.current = transportMode;
    const start = useCurrentPositionForStart && userPosition ? userPosition : startAddress;
    const end = endAddress?.trim();
    if (!end || (!useCurrentPositionForStart && !startAddress?.trim())) return;
    calculate(start, end, transportMode);
  }, [transportMode, routePoints.length, directionsLoading, useCurrentPositionForStart, userPosition, startAddress, endAddress, calculate]);

  return (
    <section className={`map-gps-panel ${compact ? 'map-gps-panel--compact' : ''}`} aria-label="GPS et itinéraire">
      <h2 className="map-gps-panel__title">GPS & Itinéraire</h2>
      <p className="map-gps-panel__subtitle">Suivi en temps réel, 100% lié à la carte</p>

      <div className="map-gps-panel__fields">
        <label className="map-gps-panel__label">
          <span>Départ</span>
          <div className="map-gps-panel__input-row">
            <input
              type="text"
              className="map-gps-panel__input"
              placeholder="Adresse de départ"
              value={startAddress}
              onFocus={() => setActiveField('start')}
              onChange={(e) => {
                const value = e.target.value;
                setStartAddress(value);
                setUseCurrentPositionForStart(false);
                setActiveField('start');
                fetchSuggestions(value);
              }}
              onBlur={() => {
                const end = endAddress?.trim();
                const hasStart = useCurrentPositionForStart ? !!userPosition : !!startAddress?.trim();
                if (!hasStart || !end) return;
                setDirectionsError(null);
                const startVal = useCurrentPositionForStart && userPosition ? userPosition : startAddress;
                calculate(startVal, end, transportMode);
              }}
              disabled={useCurrentPositionForStart}
              aria-label="Adresse de départ"
            />
            <button
              type="button"
              className="map-gps-panel__btn map-gps-panel__btn--geo"
              onClick={handleUseMyPosition}
              aria-label="Utiliser ma position"
            >
              Utiliser ma position
            </button>
          </div>
        </label>
        <label className="map-gps-panel__label">
          <span>Arrivée</span>
          <input
            type="text"
            className="map-gps-panel__input"
            placeholder="Adresse d'arrivée"
            value={endAddress}
            onFocus={() => setActiveField('end')}
            onChange={(e) => {
              const value = e.target.value;
              setEndAddress(value);
              setActiveField('end');
              fetchSuggestions(value);
            }}
            onBlur={() => {
              const end = endAddress?.trim();
              const hasStart = useCurrentPositionForStart ? !!userPosition : !!startAddress?.trim();
              if (!hasStart || !end) return;
              setDirectionsError(null);
              const startVal = useCurrentPositionForStart && userPosition ? userPosition : startAddress;
              calculate(startVal, end, transportMode);
            }}
            aria-label="Adresse d'arrivée"
          />
        </label>
      </div>

      <div className="map-gps-panel__swap-row">
        <button
          type="button"
          className="map-gps-panel__btn map-gps-panel__btn--swap"
          onClick={() => {
            const trimmedStart = startAddress?.trim();
            const trimmedEnd = endAddress?.trim();
            // Inversion visuelle
            setUseCurrentPositionForStart(false);
            setStartAddress(endAddress);
            setEndAddress(startAddress);
            setActiveField(null);
            clearSuggestions();
            // Recalcul immédiat si les deux adresses sont renseignées
            if (trimmedStart && trimmedEnd) {
              setDirectionsError(null);
              calculate(trimmedEnd, trimmedStart, transportMode);
            }
          }}
        >
          ↕ Inverser départ / arrivée
        </button>
      </div>

      {/* Suggestions d’adresses (auto-complétion Nominatim, côté client) */}
      {activeField && suggestions.length > 0 && (
        <div className="map-gps-panel__suggestions" role="listbox">
          {acLoading && (
            <div className="map-gps-panel__suggestion map-gps-panel__suggestion--loading">
              Recherche d’adresses…
            </div>
          )}
          {suggestions.map((s, index) => (
            <button
              key={`${s.lat}-${s.lng}-${index}`}
              type="button"
              className="map-gps-panel__suggestion"
              onMouseDown={(e) => {
                // onMouseDown pour éviter le blur avant le click
                e.preventDefault();
                if (activeField === 'start') {
                  setStartAddress(s.display);
                  setUseCurrentPositionForStart(false);
                } else if (activeField === 'end') {
                  setEndAddress(s.display);
                }
                clearSuggestions();
                setActiveField(null);
              }}
            >
              {s.display}
            </button>
          ))}
        </div>
      )}

      <div className="map-gps-panel__transport" role="group" aria-label="Mode de transport">
        {(Object.keys(MODE_LABELS)).map((mode) => (
          <button
            key={mode}
            type="button"
            className={`map-gps-panel__transport-btn ${transportMode === mode ? 'active' : ''}`}
            onClick={() => setTransportMode(mode)}
            aria-pressed={transportMode === mode}
          >
            {MODE_LABELS[mode]}
          </button>
        ))}
      </div>

      <div className="map-gps-panel__actions">
        <button
          type="button"
          className="map-gps-panel__btn map-gps-panel__btn--cta"
          onClick={handleCalculate}
          disabled={!canCalculate || directionsLoading}
          aria-busy={directionsLoading}
        >
          {directionsLoading ? 'Calcul en cours…' : 'Calculer l\'itinéraire'}
        </button>
      </div>

      {(gpsError || directionsError) && (
        <div className="map-gps-panel__error" role="alert">
          {gpsError || directionsError}
          {permissionState === 'denied' && ' Activez la localisation dans les paramètres du navigateur.'}
        </div>
      )}

      {hasRoute && (
        <div className="map-gps-panel__result">
          <p className="map-gps-panel__stats">
            <span>{formatDistance(distance_m)}</span>
            <span>{formatDuration(duration_s)}</span>
            <span className="map-gps-panel__mode-chip">
              {MODE_LABELS[transportMode] || 'Trajet'}
            </span>
          </p>
          {estimateCalories(distance_m, transportMode) && (
            <p className="map-gps-panel__remaining">
              ≈ {estimateCalories(distance_m, transportMode)} kcal&nbsp;(*estimé pour ce trajet*)
            </p>
          )}
          {trackingActive && remainingDistanceM != null && (
            <p className="map-gps-panel__remaining">
              Reste {formatDistance(remainingDistanceM)}
              {isDeviated && ' (écart détecté)'}
            </p>
          )}
          <div className="map-gps-panel__result-actions">
            {!trackingActive ? (
              <button
                type="button"
                className="map-gps-panel__btn map-gps-panel__btn--track"
                onClick={() => {
                  if (!userPosition) handleUseMyPosition();
                  setTrackingActive(true);
                  startWatching();
                }}
              >
                Démarrer le suivi
              </button>
            ) : (
              <button
                type="button"
                className="map-gps-panel__btn map-gps-panel__btn--stop"
                onClick={handleStopTracking}
              >
                Arrêter le suivi
              </button>
            )}
            <button type="button" className="map-gps-panel__btn map-gps-panel__btn--secondary" onClick={handleRecenter}>
              Recentrer la carte
            </button>
            <button type="button" className="map-gps-panel__btn map-gps-panel__btn--secondary" onClick={handleReset}>
              Reset itinéraire
            </button>
            {googleMapsUrl && (
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="map-gps-panel__btn map-gps-panel__btn--link"
              >
                Ouvrir dans Google Maps
              </a>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
