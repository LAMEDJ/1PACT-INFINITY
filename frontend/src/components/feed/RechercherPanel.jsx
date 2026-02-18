/**
 * Panneau « Rechercher » : filtres de recherche (texte, catégorie, public, géo).
 * Bouton principal « Chercher » (désactivé si rien saisi ou selon règles métier).
 */
import { useState, useEffect } from 'react';
import GeoLocationFilter from './GeoLocationFilter';
import './RechercherPanel.css';

/** Catégories pour le filtre Recherche (section Recherche > Proposer) – liste complète */
const CATEGORIES = [
  { id: '', label: 'Toutes les catégories' },
  { id: 'environnement', label: 'Environnement / Écologie' },
  { id: 'humanitaire', label: 'Humanitaire' },
  { id: 'social', label: 'Social / Solidarité' },
  { id: 'sante', label: 'Santé' },
  { id: 'education', label: 'Éducation' },
  { id: 'sport', label: 'Sport' },
  { id: 'culture_arts', label: 'Culture / Arts' },
  { id: 'protection_animale', label: 'Protection animale' },
  { id: 'handicap', label: 'Handicap' },
  { id: 'droits_humains', label: 'Droits humains' },
  { id: 'aide_alimentaire', label: 'Aide alimentaire' },
  { id: 'logement', label: 'Logement / Précarité' },
  { id: 'insertion_pro', label: 'Insertion professionnelle' },
  { id: 'jeunesse', label: 'Jeunesse' },
  { id: 'seniors', label: 'Seniors' },
  { id: 'developpement_durable', label: 'Développement durable' },
  { id: 'climat', label: 'Climat' },
  { id: 'egalite_inclusion', label: 'Égalité / Inclusion' },
  { id: 'migration', label: 'Migration' },
  { id: 'secours_urgence', label: 'Secours / Urgence' },
  { id: 'numerique_solidaire', label: 'Numérique solidaire' },
  { id: 'recherche_scientifique', label: 'Recherche scientifique' },
  { id: 'droits_civiques', label: 'Défense des droits civiques' },
  { id: 'communautaire', label: 'Communautaire' },
  { id: 'international', label: 'International' },
  { id: 'benevolat_local', label: 'Bénévolat local' },
  { id: 'autres', label: 'Autres' },
];

const PUBLIC_OPTIONS = [
  { value: '', label: 'Public' },
  { value: 'ados', label: 'Ados' },
  { value: 'adultes', label: 'Adultes' },
  { value: 'parents', label: 'Parents' },
];

export default function RechercherPanel({
  initialQuery = '',
  initialCategory = '',
  initialPublicCible = '',
  onSearch,
  subscriptionLevel,
}) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [publicCible, setPublicCible] = useState(initialPublicCible);
  const [geoEnabled, setGeoEnabled] = useState(false);
  const [radiusKm, setRadiusKm] = useState(5);
  const [geoPosition, setGeoPosition] = useState(null);

  useEffect(() => {
    setSearchQuery(initialQuery);
    setCategory(initialCategory);
    setPublicCible(initialPublicCible);
  }, [initialQuery, initialCategory, initialPublicCible]);

  const canSearch = true;
  const hasActiveFilters = Boolean(searchQuery.trim() || category || publicCible || geoEnabled);

  const resetFilters = () => {
    setSearchQuery('');
    setCategory('');
    setPublicCible('');
    setGeoEnabled(false);
    setRadiusKm(5);
    setGeoPosition(null);
    onSearch?.({ q: '', category: undefined, public_cible: undefined, around_me: false, radius_km: 5 });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch?.({
      q: searchQuery.trim(),
      category: category || undefined,
      public_cible: publicCible || undefined,
      around_me: geoEnabled,
      radius_km: radiusKm,
      lat: geoPosition?.lat,
      lng: geoPosition?.lng,
    });
  };

  return (
    <div
      id="feed-panel-rechercher"
      role="tabpanel"
      aria-labelledby="tab-rechercher"
      className="rechercher-panel"
    >
      <form onSubmit={handleSubmit} className="rechercher-panel__form">
        <div className="rechercher-panel__section">
          <input
            type="search"
            placeholder="Rechercher une association, une mission..."
            className="rechercher-panel__input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Recherche"
          />
        </div>

        <div className="rechercher-panel__section">
          <label className="rechercher-panel__label" htmlFor="rechercher-category">Catégorie</label>
          <select
            id="rechercher-category"
            className="rechercher-panel__select rechercher-panel__select--category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Filtrer par catégorie"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.id || 'all'} value={cat.id}>{cat.label}</option>
            ))}
          </select>
        </div>

        <div className="rechercher-panel__section">
          <label className="rechercher-panel__label">Public cible</label>
          <select
            className="rechercher-panel__select"
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

        <div className="rechercher-panel__section">
          <GeoLocationFilter
            mode="search"
            enabled={geoEnabled}
            radiusKm={radiusKm}
            onToggle={setGeoEnabled}
            onRadiusChange={setRadiusKm}
            onPosition={setGeoPosition}
            subscriptionLevel={subscriptionLevel}
          />
        </div>

        {hasActiveFilters && (
          <div className="rechercher-panel__filter-indicator">
            <span className="rechercher-panel__filter-badge" aria-live="polite">Filtres actifs</span>
            <button type="button" className="rechercher-panel__reset" onClick={resetFilters} aria-label="Réinitialiser les filtres">
              Réinitialiser filtres
            </button>
          </div>
        )}

        <button
          type="submit"
          className="rechercher-panel__btn"
          disabled={!canSearch}
        >
          Chercher
        </button>
      </form>
    </div>
  );
}
