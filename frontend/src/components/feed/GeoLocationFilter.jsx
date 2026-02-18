/**
 * Filtre géolocalisation "Autour de moi".
 * - Chercheur : géolocalisation gratuite (tous rayons selon UI).
 * - Proposant : rayon limité par abonnement (user.subscriptionLevel).
 * Structure évolutive pour abonnement : free = 5km, standard = 20km, premium = illimité.
 */
import { useState, useCallback, useEffect } from 'react';
import './GeoLocationFilter.css';

const RADIUS_OPTIONS_KM = [5, 10, 25];
const SUBSCRIPTION_RADIUS = {
  free: 5,
  standard: 20,
  premium: null, // illimité
};

export default function GeoLocationFilter({
  mode = 'search',
  enabled = false,
  radiusKm = 5,
  onToggle,
  onRadiusChange,
  onPosition,
  subscriptionLevel,
}) {
  const [status, setStatus] = useState('idle'); // idle | asking | ok | error
  const [errorMessage, setErrorMessage] = useState('');

  const level = subscriptionLevel ?? 'free';
  const maxRadiusPropose = SUBSCRIPTION_RADIUS[level] ?? 5;
  const radiusOptions =
    mode === 'propose' && maxRadiusPropose != null
      ? RADIUS_OPTIONS_KM.filter((r) => r <= maxRadiusPropose)
      : RADIUS_OPTIONS_KM;

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus('error');
      setErrorMessage('Géolocalisation non supportée');
      return;
    }
    setStatus('asking');
    setErrorMessage('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setStatus('ok');
        onPosition?.({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          radiusKm: radiusKm,
        });
      },
      (err) => {
        setStatus('error');
        setErrorMessage(err.message || 'Position indisponible');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, [radiusKm, onPosition]);

  useEffect(() => {
    if (enabled && status === 'idle') requestLocation();
  }, [enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleToggle = () => {
    const next = !enabled;
    onToggle?.(next);
    if (next) requestLocation();
    else setStatus('idle');
  };

  const currentRadius = maxRadiusPropose != null
    ? Math.min(radiusKm, maxRadiusPropose)
    : radiusKm;
  const effectiveOptions =
    mode === 'propose' && maxRadiusPropose != null
      ? radiusOptions
      : RADIUS_OPTIONS_KM;

  return (
    <div className="geo-filter">
      <div className="geo-filter__row">
        <label className="geo-filter__toggle-label">
          <input
            type="checkbox"
            className="geo-filter__toggle"
            checked={enabled}
            onChange={handleToggle}
            aria-describedby={errorMessage ? 'geo-error' : undefined}
          />
          <span className="geo-filter__toggle-text">Autour de moi</span>
        </label>
        {mode === 'propose' && maxRadiusPropose && (
          <span className="geo-filter__hint">
            Max {maxRadiusPropose} km (abonnement {level})
          </span>
        )}
      </div>
      {enabled && (
        <>
          <div className="geo-filter__radius">
            <span className="geo-filter__radius-label">Rayon :</span>
            <select
              className="geo-filter__radius-select"
              value={currentRadius}
              onChange={(e) => onRadiusChange?.(Number(e.target.value))}
              aria-label="Rayon en kilomètres"
            >
              {effectiveOptions.map((km) => (
                <option key={km} value={km}>
                  {km} km
                </option>
              ))}
              {mode === 'search' && (
                <option value={50}>50 km</option>
              )}
            </select>
          </div>
          {status === 'error' && (
            <p id="geo-error" className="geo-filter__error" role="alert">
              {errorMessage}
            </p>
          )}
        </>
      )}
    </div>
  );
}
