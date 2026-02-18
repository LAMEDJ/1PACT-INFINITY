/**
 * Panneau « Proposer » : formulaire pour proposer une action / mission / besoin.
 * Filtres visibles uniquement ici (catégorie, public, géolocalisation).
 * Bouton principal « Proposer » (désactivé si champs incomplets).
 */
import { useState } from 'react';
import GeoLocationFilter from './GeoLocationFilter';
import './ProposerPanel.css';

const CATEGORIES = [
  { id: 'humanitaire', label: 'Humanitaire', icon: '❤️' },
  { id: 'culturel', label: 'Culturel', icon: '📚' },
  { id: 'sport', label: 'Sport', icon: '⚽' },
];

const PUBLIC_OPTIONS = [
  { value: '', label: 'Public cible' },
  { value: 'ados', label: 'Ados' },
  { value: 'adultes', label: 'Adultes' },
  { value: 'parents', label: 'Parents' },
];

export default function ProposerPanel({
  onPropose,
  subscriptionLevel,
}) {
  const [category, setCategory] = useState('');
  const [publicCible, setPublicCible] = useState('');
  const [geoEnabled, setGeoEnabled] = useState(false);
  const [radiusKm, setRadiusKm] = useState(5);
  const [geoPosition, setGeoPosition] = useState(null);

  const isComplete = Boolean(category && publicCible);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isComplete) return;
    onPropose?.({
      category,
      public_cible: publicCible,
      around_me: geoEnabled,
      radius_km: radiusKm,
      lat: geoPosition?.lat,
      lng: geoPosition?.lng,
    });
  };

  return (
    <div
      id="feed-panel-proposer"
      role="tabpanel"
      aria-labelledby="tab-proposer"
      className="proposer-panel"
    >
      <form onSubmit={handleSubmit} className="proposer-panel__form">
        <div className="proposer-panel__section">
          <label className="proposer-panel__label">Catégorie</label>
          <div className="proposer-panel__categories">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`proposer-panel__cat ${category === cat.id ? 'active' : ''}`}
                onClick={() => setCategory(cat.id)}
              >
                <span className="proposer-panel__cat-icon">{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="proposer-panel__section">
          <label className="proposer-panel__label">Public cible</label>
          <select
            className="proposer-panel__select"
            value={publicCible}
            onChange={(e) => setPublicCible(e.target.value)}
            aria-label="Public cible"
          >
            {PUBLIC_OPTIONS.map((opt) => (
              <option key={opt.value || 'all'} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="proposer-panel__section">
          <GeoLocationFilter
            mode="propose"
            enabled={geoEnabled}
            radiusKm={radiusKm}
            onToggle={setGeoEnabled}
            onRadiusChange={setRadiusKm}
            onPosition={setGeoPosition}
            subscriptionLevel={subscriptionLevel}
          />
        </div>

        <button
          type="submit"
          className="proposer-panel__btn"
          disabled={!isComplete}
        >
          Proposer
        </button>
      </form>
    </div>
  );
}
