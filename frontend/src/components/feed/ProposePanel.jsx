/**
 * Panneau « Proposer » étendu : titre, description, catégorie, sous-catégorie,
 * photo optionnelle, localisation, niveau d'urgence, public ciblé, date/durée, conditions.
 */
import { useState, useRef } from 'react';
import { api, UPLOAD_BASE } from '../../api';
import GeoLocationFilter from './GeoLocationFilter';
import './UnifiedAction.css';

/** Catégories associations (section Recherche > Proposer) – liste complète */
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

const SOUS_CATEGORIES = {
  humanitaire: [
    { id: 'alimentaire', label: 'Alimentaire' },
    { id: 'sante', label: 'Santé' },
    { id: 'urgence', label: 'Urgence' },
  ],
  culturel: [
    { id: 'atelier', label: 'Atelier' },
    { id: 'evenement', label: 'Événement' },
    { id: 'mediation', label: 'Médiation' },
  ],
  sport: [
    { id: 'animation', label: 'Animation' },
    { id: 'competition', label: 'Compétition' },
    { id: 'loisir', label: 'Loisir' },
  ],
};

const PUBLIC_OPTIONS = [
  { value: '', label: 'Public cible' },
  { value: 'ados', label: 'Ados' },
  { value: 'adultes', label: 'Adultes' },
  { value: 'parents', label: 'Parents' },
];

const URGENCE_OPTIONS = [
  { value: 'faible', label: 'Faible' },
  { value: 'moderee', label: 'Modérée' },
  { value: 'haute', label: 'Haute' },
];

export default function ProposePanel({ onPropose, subscriptionLevel, loading = false }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [sousCategorie, setSousCategorie] = useState('');
  const [publicCible, setPublicCible] = useState('');
  const [urgence, setUrgence] = useState('moderee');
  const [dateDebut, setDateDebut] = useState('');
  const [duree, setDuree] = useState('');
  const [conditions, setConditions] = useState('');
  const [geoEnabled, setGeoEnabled] = useState(false);
  const [radiusKm, setRadiusKm] = useState(5);
  const [geoPosition, setGeoPosition] = useState(null);
  const [photoUrl, setPhotoUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const sousCats = category ? (SOUS_CATEGORIES[category] || []) : [];

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('');
    setSousCategorie('');
    setPublicCible('');
    setUrgence('moderee');
    setDateDebut('');
    setDuree('');
    setConditions('');
    setGeoEnabled(false);
    setRadiusKm(5);
    setGeoPosition(null);
    setPhotoUrl('');
  };

  const isComplete = Boolean(title.trim() && description.trim() && category && publicCible);

  const handlePhoto = async (e) => {
    const file = e.target?.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await api.upload.file(file);
      setPhotoUrl(url);
    } catch {
      setPhotoUrl('');
    } finally {
      setUploading(false);
    }
    e.target.value = '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isComplete) return;
    onPropose?.({
      titre: title.trim(),
      description: description.trim(),
      category,
      sous_categorie: sousCategorie || undefined,
      public_cible: publicCible,
      urgence,
      date_debut: dateDebut || undefined,
      duree: duree || undefined,
      conditions: conditions.trim() || undefined,
      around_me: geoEnabled,
      radius_km: radiusKm,
      lat: geoPosition?.lat,
      lng: geoPosition?.lng,
      photo_url: photoUrl || undefined,
    });
  };

  return (
    <div id="feed-panel-proposer" role="tabpanel" className="unified-action__panel-inner">
      <form onSubmit={handleSubmit}>
        <div className="unified-panel__section">
          <label className="unified-panel__label">Titre</label>
          <input
            type="text"
            className="unified-panel__input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titre de votre proposition"
          />
        </div>
        <div className="unified-panel__section">
          <label className="unified-panel__label">Description</label>
          <textarea
            className="unified-panel__textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Décrivez votre proposition..."
          />
        </div>
        <div className="unified-panel__section">
          <label className="unified-panel__label">Catégorie</label>
          <select
            className="unified-panel__select unified-panel__select--categories"
            value={category}
            onChange={(e) => { setCategory(e.target.value); setSousCategorie(''); }}
            aria-label="Choisir une catégorie"
          >
            <option value="">— Choisir une catégorie —</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.label}</option>
            ))}
          </select>
        </div>
        {sousCats.length > 0 && (
          <div className="unified-panel__section">
            <label className="unified-panel__label">Sous-catégorie</label>
            <select
              className="unified-panel__select"
              value={sousCategorie}
              onChange={(e) => setSousCategorie(e.target.value)}
            >
              <option value="">—</option>
              {sousCats.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>
        )}
        <div className="unified-panel__section">
          <label className="unified-panel__label">Photo (optionnel)</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhoto}
            disabled={uploading}
            style={{ fontSize: '0.9rem' }}
          />
          {photoUrl && (
            <div style={{ marginTop: 8 }}>
              <img src={photoUrl.startsWith('/') ? UPLOAD_BASE + photoUrl : photoUrl} alt="Aperçu" style={{ maxWidth: 120, maxHeight: 120, borderRadius: 8 }} />
              <button type="button" className="publish-panel__remove-media" onClick={() => setPhotoUrl('')} style={{ marginLeft: 8 }}>Supprimer</button>
            </div>
          )}
        </div>
        <div className="unified-panel__section">
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
        <div className="unified-panel__section">
          <label className="unified-panel__label">Niveau d'urgence</label>
          <select
            className="unified-panel__select"
            value={urgence}
            onChange={(e) => setUrgence(e.target.value)}
          >
            {URGENCE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div className="unified-panel__section">
          <label className="unified-panel__label">Public ciblé</label>
          <select
            className="unified-panel__select"
            value={publicCible}
            onChange={(e) => setPublicCible(e.target.value)}
          >
            {PUBLIC_OPTIONS.map((opt) => (
              <option key={opt.value || 'all'} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div className="unified-panel__row">
          <div className="unified-panel__section">
            <label className="unified-panel__label">Date / début</label>
            <input
              type="date"
              className="unified-panel__input"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
            />
          </div>
          <div className="unified-panel__section">
            <label className="unified-panel__label">Durée</label>
            <input
              type="text"
              className="unified-panel__input"
              value={duree}
              onChange={(e) => setDuree(e.target.value)}
              placeholder="ex. 2h, 1 jour"
            />
          </div>
        </div>
        <div className="unified-panel__section">
          <label className="unified-panel__label">Conditions (optionnel)</label>
          <textarea
            className="unified-panel__textarea"
            value={conditions}
            onChange={(e) => setConditions(e.target.value)}
            placeholder="Conditions particulières si besoin"
            rows={2}
          />
        </div>
        <div className="unified-panel__actions-row">
          <button type="button" className="propose-panel__reset" onClick={resetForm} aria-label="Réinitialiser le formulaire">
            Réinitialiser
          </button>
          <button type="submit" className="propose-panel__btn" disabled={!isComplete || loading}>
            {loading ? 'Envoi...' : 'Proposer'}
          </button>
        </div>
      </form>
    </div>
  );
}
