/**
 * Publication de contenu – création et modification (API + upload médias).
 */
import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { api, UPLOAD_BASE } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './PageCommon.css';
import './PublishPage.css';

export default function PublishPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const { user, isAssociation } = useAuth();
  const { addToast } = useToast();
  const [text, setText] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadEdit, setLoadEdit] = useState(!!editId);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  useEffect(() => {
    if (!editId || !isAssociation) return;
    setLoadEdit(true);
    api.dashboard.getPublication(editId)
      .then((pub) => {
        setText(pub.text || '');
        setVisibility(pub.visibility || 'public');
        setImageUrl(pub.image_url || '');
        setVideoUrl(pub.video_url || '');
      })
      .catch(() => setError('Publication introuvable'))
      .finally(() => setLoadEdit(false));
  }, [editId, isAssociation]);

  const handleFile = async (file, type) => {
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const url = await api.upload.file(file);
      if (type === 'image') setImageUrl(url);
      else setVideoUrl(url);
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const body = {
        text,
        visibility,
        image_url: imageUrl || undefined,
        video_url: videoUrl || undefined,
      };
      if (editId) {
        await api.publications.update(editId, body);
        addToast('Publication modifiée.', 'success');
        navigate('/dashboard');
      } else {
        await api.publications.create(body);
        addToast('Publication publiée.', 'success');
        setText('');
        setImageUrl('');
        setVideoUrl('');
        setShowPreview(false);
        navigate('/');
      }
    } catch (err) {
      setError(err?.message || 'Erreur');
      addToast(err?.message || 'Erreur', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="page publish-page">
        <div className="page-inner">
          <button type="button" className="back-link" onClick={() => navigate('/')}>← Retour</button>
          <p>Connectez-vous pour publier.</p>
          <Link to="/login" className="btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>Se connecter</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page publish-page">
      <div className="page-inner">
        <button type="button" className="back-link" onClick={() => navigate(editId ? '/dashboard' : '/')}>← Retour</button>
        <h2>{editId ? '✏️ Modifier la publication' : '📝 Nouvelle publication'}</h2>
        <p className="publish-desc">
          {editId ? 'Modifiez le texte, la visibilité ou les médias.' : 'Publiez une actualité, une annonce ou une proposition (texte, photo, vidéo).'}
        </p>

        {loadEdit && <p className="publish-loading">Chargement...</p>}
        {!loadEdit && (
          <form onSubmit={handleSubmit} className="publish-form">
            <label className="publish-label">Description</label>
            <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Décrivez votre actualité ou proposition..." className="publish-textarea" rows={4} />

            <label className="publish-label">Photo</label>
            <div className="publish-upload">
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="publish-file-input"
                onChange={(e) => handleFile(e.target.files?.[0], 'image')}
                disabled={uploading}
              />
              {imageUrl && (
                <div className="publish-preview-media">
                  <img src={imageUrl.startsWith('/') ? UPLOAD_BASE + imageUrl : imageUrl} alt="Aperçu" />
                  <button type="button" className="publish-remove-media" onClick={() => setImageUrl('')}>Supprimer</button>
                </div>
              )}
              {uploading && <p className="publish-uploading">Envoi en cours...</p>}
            </div>

            <label className="publish-label">Vidéo</label>
            <div className="publish-upload">
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                className="publish-file-input"
                onChange={(e) => handleFile(e.target.files?.[0], 'video')}
                disabled={uploading}
              />
              {videoUrl && (
                <div className="publish-preview-media">
                  <video src={videoUrl.startsWith('/') ? UPLOAD_BASE + videoUrl : videoUrl} controls style={{ maxWidth: '100%', maxHeight: 200 }} />
                  <button type="button" className="publish-remove-media" onClick={() => setVideoUrl('')}>Supprimer</button>
                </div>
              )}
            </div>

            <label className="publish-label">Visibilité</label>
            <select value={visibility} onChange={(e) => setVisibility(e.target.value)} className="publish-select">
              <option value="public">Visible par tous</option>
              <option value="nearby">Proximité uniquement</option>
              <option value="subscribers">Abonnés uniquement</option>
            </select>
            {error && <p className="login-error">{error}</p>}
            <div className="publish-actions">
              <button type="button" className="btn-secondary" onClick={() => setShowPreview(true)}>Aperçu</button>
              <button type="submit" className="btn-primary" disabled={loading || uploading || !text.trim()}>
                {loading ? (editId ? 'Enregistrement...' : 'Publication...') : (editId ? 'Enregistrer' : 'Publier')}
              </button>
            </div>
          </form>
        )}

        {showPreview && (
          <div className="publish-preview">
            <h3>Aperçu</h3>
            <div className="publish-preview-card">
              <p>{text || 'Votre texte apparaîtra ici.'}</p>
              {imageUrl && <img src={imageUrl.startsWith('/') ? UPLOAD_BASE + imageUrl : imageUrl} alt="Aperçu" style={{ maxWidth: '100%', marginTop: 8 }} />}
              {videoUrl && <video src={videoUrl.startsWith('/') ? UPLOAD_BASE + videoUrl : videoUrl} controls style={{ maxWidth: '100%', marginTop: 8 }} />}
            </div>
            <button type="button" className="btn-secondary" onClick={() => setShowPreview(false)}>Fermer l'aperçu</button>
          </div>
        )}
      </div>
    </div>
  );
}
