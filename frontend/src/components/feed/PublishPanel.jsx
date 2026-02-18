/**
 * Panneau « Publier » style Instagram : photo, vidéo ou texte.
 * Upload drag & drop, preview, description, hashtags, localisation, public/privé.
 * Réservé aux associations : api.publications.create.
 */
import { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api, UPLOAD_BASE } from '../../api';
import './UnifiedAction.css';

const CONTENT_TYPES = [
  { id: 'photo', label: 'Photo', icon: '🖼️' },
  { id: 'video', label: 'Vidéo', icon: '🎬' },
  { id: 'text', label: 'Texte', icon: '📝' },
];

export default function PublishPanel({ user, isAssociation, onPublished }) {
  const [contentType, setContentType] = useState('photo');
  const [text, setText] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [location, setLocation] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [mention, setMention] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragover, setDragover] = useState(false);
  const fileInputRef = useRef(null);

  const canPublish = text.trim().length > 0 || imageUrl || videoUrl;

  const handleFile = useCallback(async (file, type) => {
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const url = await api.upload.file(file);
      if (type === 'image') setImageUrl(url);
      else setVideoUrl(url);
    } catch (err) {
      setError(err.message || "Erreur lors de l'envoi du fichier");
    } finally {
      setUploading(false);
    }
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragover(false);
    const file = e.dataTransfer?.files?.[0];
    if (!file) return;
    if (file.type.startsWith('image/')) handleFile(file, 'image');
    else if (file.type.startsWith('video/')) handleFile(file, 'video');
    else setError('Accepté : image ou vidéo.');
  }, [handleFile]);

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    setDragover(true);
  }, []);

  const onDragLeave = useCallback(() => setDragover(false), []);

  const openFilePicker = () => {
    if (contentType === 'video') fileInputRef.current?.setAttribute('accept', 'video/*');
    else fileInputRef.current?.setAttribute('accept', 'image/*');
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e) => {
    const file = e.target?.files?.[0];
    if (contentType === 'video') handleFile(file, 'video');
    else handleFile(file, 'image');
    e.target.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canPublish) return;
    setError('');
    setLoading(true);
    try {
      await api.publications.create({
        text: text.trim() || undefined,
        visibility,
        image_url: imageUrl || undefined,
        video_url: videoUrl || undefined,
      });
      setText('');
      setHashtags('');
      setLocation('');
      setImageUrl('');
      setVideoUrl('');
      onPublished?.();
    } catch (err) {
      setError(err.message || 'Erreur lors de la publication');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="publish-panel unified-action__panel-inner">
        <div className="publish-panel__restricted">
          <p>Connectez-vous pour publier.</p>
          <Link to="/login">Se connecter</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="publish-panel unified-action__panel-inner">
      <form onSubmit={handleSubmit}>
        <div className="publish-panel__type-tabs">
          {CONTENT_TYPES.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`publish-panel__type-btn ${contentType === t.id ? 'active' : ''}`}
              onClick={() => setContentType(t.id)}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {(contentType === 'photo' || contentType === 'video') && (
          <div
            className={`publish-panel__dropzone ${dragover ? 'dragover' : ''}`}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onClick={openFilePicker}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={contentType === 'video' ? 'video/*' : 'image/*'}
              className="publish-file-input"
              style={{ display: 'none' }}
              onChange={handleFileInputChange}
              disabled={uploading}
            />
            <p>{contentType === 'video' ? 'Déposez une vidéo ou cliquez pour choisir' : 'Déposez une photo ou cliquez pour choisir'}</p>
            {uploading && <p>Envoi en cours…</p>}
            {contentType === 'photo' && imageUrl && (
              <div className="publish-panel__preview">
                <img src={imageUrl.startsWith('/') ? UPLOAD_BASE + imageUrl : imageUrl} alt="Aperçu" />
                <button type="button" className="publish-panel__remove-media" onClick={(e) => { e.stopPropagation(); setImageUrl(''); }}>Supprimer</button>
              </div>
            )}
            {contentType === 'video' && videoUrl && (
              <div className="publish-panel__preview">
                <video src={videoUrl.startsWith('/') ? UPLOAD_BASE + videoUrl : videoUrl} controls style={{ maxHeight: 200 }} />
                <button type="button" className="publish-panel__remove-media" onClick={(e) => { e.stopPropagation(); setVideoUrl(''); }}>Supprimer</button>
              </div>
            )}
          </div>
        )}

        <div className="publish-panel__field">
          <label>Description</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Décrivez votre publication..."
            rows={3}
          />
        </div>
        <div className="publish-panel__field">
          <label>Hashtags (optionnel)</label>
          <input
            type="text"
            value={hashtags}
            onChange={(e) => setHashtags(e.target.value)}
            placeholder="#solidarité #bénévolat"
          />
        </div>
        <div className="publish-panel__field">
          <label>Localisation (optionnel)</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Ville ou lieu"
          />
        </div>
        <div className="publish-panel__field">
          <label>Visibilité</label>
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
            className="unified-panel__select"
          >
            <option value="public">Public</option>
            <option value="nearby">Proximité uniquement</option>
            <option value="subscribers">Abonnés uniquement</option>
          </select>
        </div>
        <div className="publish-panel__field">
          <label>Mention (optionnel)</label>
          <input
            type="text"
            value={mention}
            onChange={(e) => setMention(e.target.value)}
            placeholder="@utilisateur"
          />
        </div>
        {error && <p className="login-error" style={{ marginTop: 8 }}>{error}</p>}
        <button type="submit" className="publish-panel__submit" disabled={!canPublish || loading}>
          {loading ? 'Publication…' : 'Publier'}
        </button>
      </form>
    </div>
  );
}
