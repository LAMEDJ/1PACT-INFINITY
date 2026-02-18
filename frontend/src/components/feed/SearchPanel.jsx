/**
 * Panneau Chercher : Type (Action, Mission, Besoin, Événement), Mot-clé,
 * Catégorie multi-sélection, Localisation (ville/code postal + GPS), Public.
 * Logique combinée : tous les filtres actifs s'appliquent ensemble.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import GeoLocationFilter from './GeoLocationFilter';
import './UnifiedAction.css';
import './SearchPanel.css';

const TYPE_RECHERCHE = [
  { id: '', label: 'Tout' },
  { id: 'action', label: 'Action' },
  { id: 'mission', label: 'Mission' },
  { id: 'besoin', label: 'Besoin' },
  { id: 'evenement', label: 'Événement' },
];

const CATEGORIES = [
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

function toggleSet(set, id) {
  const next = new Set(set);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
}

export default function SearchPanel({
  initialQuery = '',
  initialCategory = '',
  initialCategories = [],
  initialPublicCible = '',
  initialTypeRecherche = '',
  initialLocationPlace = '',
  onSearch,
  subscriptionLevel,
}) {
  const [typeRecherche, setTypeRecherche] = useState(initialTypeRecherche || '');
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [categories, setCategories] = useState(() => new Set(Array.isArray(initialCategories) ? initialCategories : []));
  const [publicCible, setPublicCible] = useState(initialPublicCible);
  const [locationPlace, setLocationPlace] = useState(initialLocationPlace || '');
  const [geoEnabled, setGeoEnabled] = useState(false);
  const [radiusKm, setRadiusKm] = useState(5);
  const [geoPosition, setGeoPosition] = useState(null);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const categoryWrapRef = useRef(null);

  useEffect(() => {
    if (!categoryDropdownOpen) return;
    const onDocClick = (e) => {
      if (categoryWrapRef.current && !categoryWrapRef.current.contains(e.target)) {
        setCategoryDropdownOpen(false);
      }
    };
    document.addEventListener('click', onDocClick, true);
    return () => document.removeEventListener('click', onDocClick, true);
  }, [categoryDropdownOpen]);

  useEffect(() => {
    setSearchQuery(initialQuery);
    setCategory(initialCategory);
    setCategories(new Set(Array.isArray(initialCategories) ? initialCategories : []));
    setPublicCible(initialPublicCible);
    setTypeRecherche(initialTypeRecherche || '');
    setLocationPlace(initialLocationPlace || '');
  }, [initialQuery, initialCategory, initialCategories, initialPublicCible, initialTypeRecherche, initialLocationPlace]);

  const toggleCategory = useCallback((id) => {
    setCategories((prev) => toggleSet(prev, id));
  }, []);

  const hasActiveFilters = Boolean(
    searchQuery.trim() ||
    typeRecherche ||
    categories.size > 0 ||
    publicCible ||
    locationPlace.trim() ||
    geoEnabled
  );

  const resetFilters = useCallback(() => {
    setTypeRecherche('');
    setSearchQuery('');
    setCategory('');
    setCategories(new Set());
    setPublicCible('');
    setLocationPlace('');
    setGeoEnabled(false);
    setRadiusKm(5);
    setGeoPosition(null);
    setCategoryDropdownOpen(false);
    onSearch?.({
      q: '',
      type_recherche: undefined,
      category: undefined,
      categories: [],
      public_cible: undefined,
      location_place: undefined,
      around_me: false,
      radius_km: 5,
      lat: undefined,
      lng: undefined,
    });
  }, [onSearch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const catList = Array.from(categories);
    onSearch?.({
      q: searchQuery.trim(),
      type_recherche: typeRecherche || undefined,
      category: catList[0] || category || undefined,
      categories: catList,
      public_cible: publicCible || undefined,
      location_place: locationPlace.trim() || undefined,
      around_me: geoEnabled,
      radius_km: radiusKm,
      lat: geoPosition?.lat,
      lng: geoPosition?.lng,
    });
    setCategoryDropdownOpen(false);
  };

  return (
    <div id="feed-panel-rechercher" role="tabpanel" className="unified-action__panel-inner search-panel" aria-label="Panneau Chercher">
      <form onSubmit={handleSubmit} className="search-panel__form">
        <div className="unified-panel__section">
          <label className="unified-panel__label">Type</label>
          <div className="unified-panel__categories search-panel__type-row">
            {TYPE_RECHERCHE.map((t) => (
              <button
                key={t.id || 'all'}
                type="button"
                className={`unified-panel__cat-btn ${typeRecherche === t.id ? 'active' : ''}`}
                onClick={() => setTypeRecherche(t.id)}
                aria-pressed={typeRecherche === t.id}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="unified-panel__section">
          <label className="unified-panel__label" htmlFor="search-keyword">Mot-clé</label>
          <input
            id="search-keyword"
            type="search"
            className="unified-panel__input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Association, mission, mot-clé..."
            aria-label="Recherche par mot-clé"
          />
        </div>

        <div className="unified-panel__section search-panel__category-wrap" ref={categoryWrapRef}>
          <label className="unified-panel__label">Catégorie</label>
          <div className="search-panel__multiselect">
            <button
              type="button"
              className="search-panel__multiselect-trigger"
              onClick={() => setCategoryDropdownOpen((o) => !o)}
              aria-expanded={categoryDropdownOpen}
              aria-haspopup="listbox"
              aria-label={categories.size > 0 ? `${categories.size} catégorie(s) sélectionnée(s)` : 'Choisir des catégories'}
            >
              <span className="search-panel__multiselect-label">
                {categories.size > 0
                  ? `${categories.size} catégorie(s)`
                  : 'Toutes les catégories'}
              </span>
              <span className="search-panel__multiselect-icon" aria-hidden="true">{categoryDropdownOpen ? '–' : '+'}</span>
            </button>
            {categoryDropdownOpen && (
              <div
                className="search-panel__multiselect-dropdown"
                role="listbox"
                aria-multiselectable="true"
              >
                <div className="search-panel__multiselect-list">
                  {CATEGORIES.map((cat) => (
                    <label key={cat.id} className="search-panel__multiselect-option">
                      <input
                        type="checkbox"
                        checked={categories.has(cat.id)}
                        onChange={() => toggleCategory(cat.id)}
                        aria-label={cat.label}
                      />
                      <span>{cat.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
          {categories.size > 0 && (
            <span className="search-panel__filter-indicator-badge" aria-live="polite">
              {categories.size} sélectionnée(s)
            </span>
          )}
        </div>

        <div className="unified-panel__section">
          <label className="unified-panel__label" htmlFor="search-location">Ville ou code postal</label>
          <input
            id="search-location"
            type="text"
            className="unified-panel__input"
            value={locationPlace}
            onChange={(e) => setLocationPlace(e.target.value)}
            placeholder="Ex. Paris, 75001"
            aria-label="Localisation par ville ou code postal"
          />
        </div>

        <div className="unified-panel__section">
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

        <div className="unified-panel__section">
          <label className="unified-panel__label" htmlFor="search-public">Public cible</label>
          <select
            id="search-public"
            className="unified-panel__select"
            value={publicCible}
            onChange={(e) => setPublicCible(e.target.value)}
            aria-label="Public cible"
          >
            {PUBLIC_OPTIONS.map((opt) => (
              <option key={opt.value || 'all'} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <div className="search-panel__filter-indicator">
            <span className="search-panel__filter-badge" aria-live="polite">Filtres actifs</span>
            <button
              type="button"
              className="search-panel__reset"
              onClick={resetFilters}
              aria-label="Réinitialiser les filtres"
            >
              Réinitialiser filtres
            </button>
          </div>
        )}

        <button type="submit" className="search-panel__btn" disabled={false}>
          Chercher
        </button>
      </form>
    </div>
  );
}
