/**
 * Menu paramètres : slide-in depuis la droite (desktop) ou bottom sheet (mobile).
 * Liste : Modifier le profil (formulaire photo, nom, bio, ville, tél), Thème, Déconnexion.
 */
import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggleSwitch from './ThemeToggleSwitch';
import { api, UPLOAD_BASE } from '../../api';

function useMediaQuery(query) {
  const [match, setMatch] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false
  );
  useEffect(() => {
    const m = window.matchMedia(query);
    setMatch(m.matches);
    const fn = () => setMatch(m.matches);
    m.addEventListener('change', fn);
    return () => m.removeEventListener('change', fn);
  }, [query]);
  return match;
}

const ITEMS = [
  { id: 'edit', icon: '✏️', title: 'Modifier le profil', desc: 'Ajouter une photo de profil, nom, bio, ville, numéro', path: null },
  { id: 'account', icon: '👤', title: 'Paramètres du compte', desc: 'Email, mot de passe', path: null },
  { id: 'privacy', icon: '🔒', title: 'Confidentialité', desc: 'Visibilité du profil', path: null },
  { id: 'notifications', icon: '🔔', title: 'Notifications', desc: 'Alertes et préférences', path: null },
  { id: 'security', icon: '🛡️', title: 'Sécurité', desc: 'Connexion et authentification', path: null },
];

const stagger = { visible: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } }, hidden: {} };
const itemVariants = { hidden: { opacity: 0, x: 12 }, visible: { opacity: 1, x: 0 } };

const PANEL_TITLES = {
  edit: 'Modifier le profil',
  account: 'Paramètres du compte',
  privacy: 'Confidentialité',
  notifications: 'Notifications',
  security: 'Sécurité',
};

function AccountSettingsForm({ user, onBack, onSaved, onClose }) {
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleUpdate = useCallback(async (e) => {
    e.preventDefault();
    setError(null);
    const hasEmail = newEmail.trim() && newEmail.trim() !== user?.email;
    const hasPassword = newPassword.trim();
    if (!hasEmail && !hasPassword) {
      setError('Renseignez un nouvel email et/ou un nouveau mot de passe.');
      return;
    }
    if (hasPassword && newPassword.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (hasPassword && newPassword !== confirmPassword) {
      setError('Les deux mots de passe ne correspondent pas.');
      return;
    }
    if (!currentPassword.trim()) {
      setError('Le mot de passe actuel est requis.');
      return;
    }
    setLoading(true);
    try {
      const payload = { currentPassword: currentPassword.trim() };
      if (hasEmail) payload.newEmail = newEmail.trim();
      if (hasPassword) payload.newPassword = newPassword.trim();
      const data = await api.auth.updateAccount(payload);
      if (data?.user) onSaved?.(data.user);
      onClose?.();
    } catch (err) {
      setError(err?.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  }, [user?.email, newEmail, currentPassword, newPassword, confirmPassword, onSaved, onClose]);

  const handleDelete = useCallback(async (e) => {
    e.preventDefault();
    if (!deletePassword.trim()) {
      setError('Entrez votre mot de passe pour confirmer la suppression.');
      return;
    }
    setDeleteLoading(true);
    setError(null);
    try {
      await api.auth.deleteAccount(deletePassword.trim());
      onClose?.();
      window.location.href = '/';
    } catch (err) {
      setError(err?.message || 'Impossible de supprimer le compte');
    } finally {
      setDeleteLoading(false);
    }
  }, [deletePassword, onClose]);

  return (
    <div className="settings-drawer__edit-panel">
      <div className="settings-drawer__edit-panel__top">
        <button type="button" className="settings-drawer__back" onClick={onBack} aria-label="Retour">← Retour</button>
        <h3 className="settings-drawer__edit-title">Email, mot de passe</h3>
        <p className="settings-drawer__edit-desc">Email actuel : <strong>{user?.email ?? '—'}</strong></p>
      </div>
      <form onSubmit={handleUpdate} className="settings-drawer__edit-form settings-drawer__edit-form--panel">
        <div className="settings-drawer__edit-panel__scroll">
        <label className="settings-drawer__edit-field">
          <span>Nouvel email (optionnel)</span>
          <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="nouveau@email.fr" className="settings-drawer__input" autoComplete="email" />
        </label>
        <label className="settings-drawer__edit-field">
          <span>Mot de passe actuel (requis)</span>
          <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="settings-drawer__input" autoComplete="current-password" required />
        </label>
        <label className="settings-drawer__edit-field">
          <span>Nouveau mot de passe (optionnel)</span>
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="settings-drawer__input" autoComplete="new-password" minLength={8} />
        </label>
        <label className="settings-drawer__edit-field">
          <span>Confirmer le nouveau mot de passe</span>
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="settings-drawer__input" autoComplete="new-password" />
        </label>
        {error && <p className="settings-drawer__edit-error" role="alert">{error}</p>}
        <hr className="settings-drawer__hr" />
      <h4 className="settings-drawer__edit-subtitle">Supprimer le compte</h4>
      <p className="settings-drawer__edit-desc">Cette action est irréversible. Entrez votre mot de passe pour confirmer.</p>
      {!deleteConfirm ? (
        <button type="button" className="settings-drawer__btn settings-drawer__btn--danger-outline" onClick={() => setDeleteConfirm(true)}>Supprimer mon compte</button>
      ) : (
        <form onSubmit={handleDelete} className="settings-drawer__edit-form">
          <label className="settings-drawer__edit-field">
            <span>Mot de passe</span>
            <input type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} className="settings-drawer__input" placeholder="Votre mot de passe" autoComplete="current-password" />
          </label>
          <div className="settings-drawer__edit-actions">
            <button type="button" className="settings-drawer__btn settings-drawer__btn--secondary" onClick={() => { setDeleteConfirm(false); setDeletePassword(''); setError(null); }}>Annuler</button>
            <button type="submit" className="settings-drawer__btn settings-drawer__btn--danger" disabled={deleteLoading}>{deleteLoading ? 'Suppression…' : 'Supprimer définitivement'}</button>
          </div>
        </form>
      )}
        </div>
        <div className="settings-drawer__edit-panel__bottom">
          <div className="settings-drawer__edit-actions">
            <button type="button" className="settings-drawer__btn settings-drawer__btn--secondary" onClick={onBack}>Annuler</button>
            <button type="submit" className="settings-drawer__btn settings-drawer__btn--primary" disabled={loading}>{loading ? 'Mise à jour…' : 'Mettre à jour'}</button>
          </div>
        </div>
      </form>
    </div>
  );
}

function PrivacyForm({ user, onBack, onSaved }) {
  const [profileVisibility, setProfileVisibility] = useState(user?.profile_visibility ?? 'public');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setProfileVisibility(user?.profile_visibility ?? 'public');
  }, [user?.profile_visibility]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await api.auth.updatePreferences({ profile_visibility: profileVisibility });
      if (data?.user) onSaved?.(data.user);
    } catch (err) {
      setError(err?.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  }, [profileVisibility, onSaved]);

  return (
    <div className="settings-drawer__edit-panel">
      <div className="settings-drawer__edit-panel__top">
        <button type="button" className="settings-drawer__back" onClick={onBack} aria-label="Retour">← Retour</button>
        <h3 className="settings-drawer__edit-title">Visibilité du profil</h3>
      </div>
      <form onSubmit={handleSubmit} className="settings-drawer__edit-form settings-drawer__edit-form--panel">
        <div className="settings-drawer__edit-panel__scroll">
        <label className="settings-drawer__edit-field">
          <span>Qui peut voir votre profil</span>
          <select value={profileVisibility} onChange={(e) => setProfileVisibility(e.target.value)} className="settings-drawer__input">
            <option value="public">Public (tout le monde)</option>
            <option value="friends">Amis / abonnements</option>
            <option value="private">Privé (vous seul)</option>
          </select>
        </label>
        {error && <p className="settings-drawer__edit-error" role="alert">{error}</p>}
        </div>
        <div className="settings-drawer__edit-panel__bottom">
          <div className="settings-drawer__edit-actions">
            <button type="button" className="settings-drawer__btn settings-drawer__btn--secondary" onClick={onBack}>Annuler</button>
            <button type="submit" className="settings-drawer__btn settings-drawer__btn--primary" disabled={loading}>{loading ? 'Enregistrement…' : 'Mettre à jour'}</button>
          </div>
        </div>
      </form>
    </div>
  );
}

function NotificationsForm({ user, onBack, onSaved }) {
  const [enabled, setEnabled] = useState(user?.notifications_enabled !== false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setEnabled(user?.notifications_enabled !== false);
  }, [user?.notifications_enabled]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await api.auth.updatePreferences({ notifications_enabled: enabled });
      if (data?.user) onSaved?.(data.user);
    } catch (err) {
      setError(err?.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  }, [enabled, onSaved]);

  return (
    <div className="settings-drawer__edit-panel">
      <div className="settings-drawer__edit-panel__top">
        <button type="button" className="settings-drawer__back" onClick={onBack} aria-label="Retour">← Retour</button>
        <h3 className="settings-drawer__edit-title">Alertes et préférences</h3>
      </div>
      <form onSubmit={handleSubmit} className="settings-drawer__edit-form settings-drawer__edit-form--panel">
        <div className="settings-drawer__edit-panel__scroll">
        <label className="settings-drawer__edit-field settings-drawer__edit-field--row">
          <span>Activer les notifications</span>
          <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} className="settings-drawer__checkbox" />
        </label>
        {error && <p className="settings-drawer__edit-error" role="alert">{error}</p>}
        </div>
        <div className="settings-drawer__edit-panel__bottom">
          <div className="settings-drawer__edit-actions">
            <button type="button" className="settings-drawer__btn settings-drawer__btn--secondary" onClick={onBack}>Annuler</button>
            <button type="submit" className="settings-drawer__btn settings-drawer__btn--primary" disabled={loading}>{loading ? 'Enregistrement…' : 'Mettre à jour'}</button>
          </div>
        </div>
      </form>
    </div>
  );
}

function SecurityForm({ user, onBack, onSaved }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError(null);
    if (!newPassword.trim() || newPassword.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Les deux mots de passe ne correspondent pas.');
      return;
    }
    if (!currentPassword.trim()) {
      setError('Le mot de passe actuel est requis.');
      return;
    }
    setLoading(true);
    try {
      await api.auth.updateAccount({ currentPassword: currentPassword.trim(), newPassword: newPassword.trim() });
      onSaved?.();
      onBack?.();
    } catch (err) {
      setError(err?.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  }, [currentPassword, newPassword, confirmPassword, onSaved, onBack]);

  return (
    <div className="settings-drawer__edit-panel">
      <div className="settings-drawer__edit-panel__top">
        <button type="button" className="settings-drawer__back" onClick={onBack} aria-label="Retour">← Retour</button>
        <h3 className="settings-drawer__edit-title">Connexion et authentification</h3>
        <p className="settings-drawer__edit-desc">Changer votre mot de passe pour sécuriser votre compte.</p>
      </div>
      <form onSubmit={handleSubmit} className="settings-drawer__edit-form settings-drawer__edit-form--panel">
        <div className="settings-drawer__edit-panel__scroll">
        <label className="settings-drawer__edit-field">
          <span>Mot de passe actuel</span>
          <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="settings-drawer__input" autoComplete="current-password" required />
        </label>
        <label className="settings-drawer__edit-field">
          <span>Nouveau mot de passe</span>
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="settings-drawer__input" autoComplete="new-password" minLength={8} required />
        </label>
        <label className="settings-drawer__edit-field">
          <span>Confirmer le nouveau mot de passe</span>
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="settings-drawer__input" autoComplete="new-password" required />
        </label>
        {error && <p className="settings-drawer__edit-error" role="alert">{error}</p>}
        </div>
        <div className="settings-drawer__edit-panel__bottom">
          <div className="settings-drawer__edit-actions">
            <button type="button" className="settings-drawer__btn settings-drawer__btn--secondary" onClick={onBack}>Annuler</button>
            <button type="submit" className="settings-drawer__btn settings-drawer__btn--primary" disabled={loading}>{loading ? 'Mise à jour…' : 'Mettre à jour'}</button>
          </div>
        </div>
      </form>
    </div>
  );
}

function EditProfileForm({ user, onClose, onSaved, onBack }) {
  const [name, setName] = useState(user?.name ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [city, setCity] = useState(user?.city ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url ?? '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Réinitialiser les champs quand on rouvre avec un user à jour
  useEffect(() => {
    if (!user) return;
    setName(user.name ?? '');
    setBio(user.bio ?? '');
    setCity(user.city ?? '');
    setPhone(user.phone ?? '');
    setAvatarUrl(user.avatar_url ?? '');
    setAvatarFile(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [user?.id, user?.name, user?.bio, user?.city, user?.phone, user?.avatar_url]);

  const [previewUrl, setPreviewUrl] = useState(() =>
    avatarUrl ? (avatarUrl.startsWith('http') ? avatarUrl : UPLOAD_BASE + avatarUrl) : null
  );
  useEffect(() => {
    if (avatarFile) {
      const url = URL.createObjectURL(avatarFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(avatarUrl ? (avatarUrl.startsWith('http') ? avatarUrl : UPLOAD_BASE + avatarUrl) : null);
  }, [avatarFile, avatarUrl]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError(null);
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Le nom est requis.');
      return;
    }
    setLoading(true);
    try {
      let finalAvatar = avatarUrl;
      if (avatarFile) {
        const url = await api.upload.file(avatarFile);
        finalAvatar = url;
      }
      await api.auth.updateProfile({
        name: trimmedName,
        bio: bio.trim(),
        city: city.trim() || null,
        phone: phone.trim() || null,
        avatar_url: finalAvatar || null,
      });
      onSaved?.();
      onClose?.();
    } catch (err) {
      const msg = err?.message || '';
      setError(msg.includes('upload') || msg.includes('Erreur upload') ? 'Impossible d\'envoyer la photo. Réessayez.' : (msg || 'Erreur lors de la sauvegarde'));
    } finally {
      setLoading(false);
    }
  }, [name, bio, city, phone, avatarUrl, avatarFile, user?.name, onSaved, onClose]);

  const handleRemovePhoto = useCallback(() => {
    setAvatarFile(null);
    setAvatarUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  return (
    <div className="settings-drawer__edit-panel">
      <div className="settings-drawer__edit-panel__top">
        <button type="button" className="settings-drawer__back" onClick={onBack} aria-label="Retour">
          ← Retour
        </button>
        <h3 className="settings-drawer__edit-title">Modifier le profil</h3>
      </div>
      <form onSubmit={handleSubmit} className="settings-drawer__edit-form settings-drawer__edit-form--panel">
        <div className="settings-drawer__edit-panel__scroll">
        <label className="settings-drawer__edit-field">
          <span>Photo de profil</span>
          <div className="settings-drawer__avatar-row">
            <div
              className="settings-drawer__avatar-preview"
              style={previewUrl ? { backgroundImage: `url(${previewUrl})` } : undefined}
            >
              {!previewUrl && (user?.name?.charAt(0) || '?')}
            </div>
            <div className="settings-drawer__avatar-actions">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                className="settings-drawer__file-input"
                id="avatar-upload"
                aria-label="Importer une photo"
              />
              <div className="settings-drawer__avatar-buttons">
                <label htmlFor="avatar-upload" className="settings-drawer__btn settings-drawer__btn--small settings-drawer__btn--photo">
                  {previewUrl ? 'Changer la photo' : '📷 Ajouter une photo de profil'}
                </label>
                {previewUrl && (
                  <button type="button" className="settings-drawer__btn settings-drawer__btn--small settings-drawer__btn--danger" onClick={handleRemovePhoto}>
                    Supprimer
                  </button>
                )}
              </div>
              <label htmlFor="avatar-upload" className="settings-drawer__import-link">
                Importer une photo depuis l&apos;appareil
              </label>
            </div>
          </div>
        </label>
        <label className="settings-drawer__edit-field">
          <span>Nom d&apos;utilisateur <em className="settings-drawer__required">(requis)</em></span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Votre nom"
            className="settings-drawer__input"
            aria-required="true"
            aria-invalid={!!error && !name.trim()}
          />
        </label>
        <label className="settings-drawer__edit-field">
          <span>Bio</span>
          <div className="settings-drawer__field-row">
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Présentez-vous en quelques mots"
              className="settings-drawer__input settings-drawer__input--textarea"
              rows={3}
            />
            <button type="button" className="settings-drawer__clear-btn" onClick={() => setBio('')} title="Effacer">Effacer</button>
          </div>
        </label>
        <label className="settings-drawer__edit-field">
          <span>Ville</span>
          <div className="settings-drawer__field-row">
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Ville"
              className="settings-drawer__input"
            />
            <button type="button" className="settings-drawer__clear-btn" onClick={() => setCity('')} title="Effacer">Effacer</button>
          </div>
        </label>
        <label className="settings-drawer__edit-field">
          <span>Numéro de téléphone</span>
          <div className="settings-drawer__field-row">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="06 12 34 56 78"
              className="settings-drawer__input"
            />
            <button type="button" className="settings-drawer__clear-btn" onClick={() => setPhone('')} title="Effacer">Effacer</button>
          </div>
        </label>
        {error && <p className="settings-drawer__edit-error" role="alert">{error}</p>}
        </div>
        <div className="settings-drawer__edit-panel__bottom">
          <div className="settings-drawer__edit-actions">
            <button type="button" className="settings-drawer__btn settings-drawer__btn--secondary" onClick={onBack}>
              Annuler
            </button>
            <button type="submit" className="settings-drawer__btn settings-drawer__btn--primary" disabled={loading}>
              {loading ? 'Enregistrement…' : 'Sauvegarder'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function EditAssociationForm({ user, onClose, onSaved, onBack }) {
  const [name, setName] = useState(user?.name ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [category, setCategory] = useState(user?.category ?? '');
  const [location, setLocation] = useState(user?.location ?? '');
  const [contact, setContact] = useState(user?.contact ?? '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url ?? '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    setName(user.name ?? '');
    setBio(user.bio ?? '');
    setCategory(user.category ?? '');
    setLocation(user.location ?? '');
    setContact(user.contact ?? '');
    setAvatarUrl(user.avatar_url ?? '');
    setAvatarFile(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [user?.id, user?.name, user?.bio, user?.category, user?.location, user?.contact, user?.avatar_url]);

  const [previewUrl, setPreviewUrl] = useState(() =>
    avatarUrl ? (avatarUrl.startsWith('http') ? avatarUrl : UPLOAD_BASE + avatarUrl) : null
  );
  useEffect(() => {
    if (avatarFile) {
      const url = URL.createObjectURL(avatarFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(avatarUrl ? (avatarUrl.startsWith('http') ? avatarUrl : UPLOAD_BASE + avatarUrl) : null);
  }, [avatarFile, avatarUrl]);

  const handleRemovePhoto = useCallback(() => {
    setAvatarFile(null);
    setAvatarUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError(null);
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Le nom de l\'association est requis.');
      return;
    }
    setLoading(true);
    try {
      let finalAvatar = avatarUrl;
      if (avatarFile) {
        const url = await api.upload.file(avatarFile);
        finalAvatar = url;
      }
      await api.auth.updateProfile({
        name: trimmedName,
        bio: bio.trim(),
        category: category.trim() || null,
        location: location.trim() || null,
        contact: contact.trim() || null,
        avatar_url: finalAvatar || null,
      });
      onSaved?.();
      onClose?.();
    } catch (err) {
      setError(err?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  }, [name, bio, category, location, contact, avatarUrl, avatarFile, user?.name, onSaved, onClose]);

  return (
    <div className="settings-drawer__edit-panel">
      <div className="settings-drawer__edit-panel__top">
        <button type="button" className="settings-drawer__back" onClick={onBack} aria-label="Retour">
          ← Retour
        </button>
        <h3 className="settings-drawer__edit-title">Modifier le profil association</h3>
      </div>
      <form onSubmit={handleSubmit} className="settings-drawer__edit-form settings-drawer__edit-form--panel">
        <div className="settings-drawer__edit-panel__scroll">
        <label className="settings-drawer__edit-field">
          <span>Photo / Logo de l&apos;association</span>
          <div className="settings-drawer__avatar-row">
            <div
              className="settings-drawer__avatar-preview"
              style={previewUrl ? { backgroundImage: `url(${previewUrl})` } : undefined}
            >
              {!previewUrl && (user?.name?.charAt(0) || '?')}
            </div>
            <div className="settings-drawer__avatar-actions">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                className="settings-drawer__file-input"
                id="avatar-upload-asso"
                aria-label="Importer une photo"
              />
              <div className="settings-drawer__avatar-buttons">
                <label htmlFor="avatar-upload-asso" className="settings-drawer__btn settings-drawer__btn--small settings-drawer__btn--photo">
                  {previewUrl ? 'Changer la photo' : '📷 Ajouter une photo de profil'}
                </label>
                {previewUrl && (
                  <button type="button" className="settings-drawer__btn settings-drawer__btn--small settings-drawer__btn--danger" onClick={handleRemovePhoto}>
                    Supprimer
                  </button>
                )}
              </div>
              <label htmlFor="avatar-upload-asso" className="settings-drawer__import-link">
                Importer une photo depuis l&apos;appareil
              </label>
            </div>
          </div>
        </label>
        <label className="settings-drawer__edit-field">
          <span>Nom de l&apos;association <em className="settings-drawer__required">(requis)</em></span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nom"
            className="settings-drawer__input"
            aria-required="true"
            aria-invalid={!!error && !name.trim()}
          />
        </label>
        <label className="settings-drawer__edit-field">
          <span>Bio / Description</span>
          <div className="settings-drawer__field-row">
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Présentez votre association"
              className="settings-drawer__input settings-drawer__input--textarea"
              rows={3}
            />
            <button type="button" className="settings-drawer__clear-btn" onClick={() => setBio('')} title="Effacer">Effacer</button>
          </div>
        </label>
        <label className="settings-drawer__edit-field">
          <span>Catégorie</span>
          <div className="settings-drawer__field-row">
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Ex. Humanitaire, Culturel"
              className="settings-drawer__input"
            />
            <button type="button" className="settings-drawer__clear-btn" onClick={() => setCategory('')} title="Effacer">Effacer</button>
          </div>
        </label>
        <label className="settings-drawer__edit-field">
          <span>Ville / Adresse</span>
          <div className="settings-drawer__field-row">
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Localisation"
              className="settings-drawer__input"
            />
            <button type="button" className="settings-drawer__clear-btn" onClick={() => setLocation('')} title="Effacer">Effacer</button>
          </div>
        </label>
        <label className="settings-drawer__edit-field">
          <span>Contact</span>
          <div className="settings-drawer__field-row">
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="Email ou téléphone"
              className="settings-drawer__input"
            />
            <button type="button" className="settings-drawer__clear-btn" onClick={() => setContact('')} title="Effacer">Effacer</button>
          </div>
        </label>
        {error && <p className="settings-drawer__edit-error" role="alert">{error}</p>}
        </div>
        <div className="settings-drawer__edit-panel__bottom">
          <div className="settings-drawer__edit-actions">
            <button type="button" className="settings-drawer__btn settings-drawer__btn--secondary" onClick={onBack}>
              Annuler
            </button>
            <button type="submit" className="settings-drawer__btn settings-drawer__btn--primary" disabled={loading}>
              {loading ? 'Enregistrement…' : 'Sauvegarder'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function SettingsDrawer({ open, onClose, onNavigate, onLogout, user, initialPanel = 'list', refreshUser, onProfileSaved, backFromEditCloses = false }) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [panel, setPanel] = useState(initialPanel);

  useEffect(() => {
    if (open) setPanel(initialPanel);
  }, [open, initialPanel]);

  // Retour depuis l’édition : fermer le tiroir si on est venu par "Modifier profil", sinon revenir à la liste.
  const handleBackFromEdit = useCallback(() => {
    if (backFromEditCloses) onClose();
    else setPanel('list');
  }, [backFromEditCloses, onClose]);

  useEffect(() => {
    if (!open) return;
    const onEscape = (e) => {
      if (e.key === 'Escape') {
        if (panel === 'edit') {
          if (backFromEditCloses) onClose();
          else setPanel('list');
        } else if (panel !== 'list') setPanel('list');
        else onClose();
      }
    };
    document.addEventListener('keydown', onEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onEscape);
      document.body.style.overflow = '';
    };
  }, [open, onClose, panel, backFromEditCloses]);

  const handleSaved = useCallback(() => {
    refreshUser?.();
  }, [refreshUser]);

  const canEditProfile = user?.type === 'user' || user?.type === 'association';

  const touchStartRef = useRef({ x: 0, y: 0 });
  const handleBackdropTouchStart = useCallback((e) => {
    const t = e.touches?.[0];
    if (t) touchStartRef.current = { x: t.clientX, y: t.clientY };
  }, []);
  const handleBackdropTouchEnd = useCallback((e) => {
    const t = e.changedTouches?.[0];
    if (!t) return;
    const dy = t.clientY - touchStartRef.current.y;
    if (dy > 50) {
      if (panel === 'edit') handleBackFromEdit();
      else if (panel !== 'list') setPanel('list');
      else onClose();
    }
  }, [panel, onClose, handleBackFromEdit]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="settings-drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => { if (panel === 'edit') handleBackFromEdit(); else if (panel !== 'list') setPanel('list'); else onClose(); }}
            onTouchStart={handleBackdropTouchStart}
            onTouchEnd={handleBackdropTouchEnd}
            aria-hidden="true"
          />
          <motion.aside
            className={`settings-drawer ${isMobile ? 'settings-drawer--bottom' : 'settings-drawer--right'}`}
            initial={isMobile ? { y: '100%' } : { x: '100%' }}
            animate={isMobile ? { y: 0 } : { x: 0 }}
            exit={isMobile ? { y: '100%' } : { x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            role="dialog"
            aria-modal="true"
            aria-label="Paramètres"
          >
            <div className="settings-drawer__frame">
              <div className="settings-drawer__head">
                <h2 className="settings-drawer__title">{PANEL_TITLES[panel] || 'Paramètres'}</h2>
                <button type="button" className="settings-drawer__close" onClick={onClose} aria-label="Fermer">✕</button>
              </div>

              {panel === 'edit' && canEditProfile && user?.type === 'user' ? (
              <EditProfileForm
                user={user}
                onClose={onClose}
                onSaved={() => { handleSaved(); if (onProfileSaved) onProfileSaved(); }}
                onBack={handleBackFromEdit}
              />
            ) : panel === 'edit' && canEditProfile && user?.type === 'association' ? (
              <EditAssociationForm
                user={user}
                onClose={onClose}
                onSaved={() => { handleSaved(); if (onProfileSaved) onProfileSaved(); }}
                onBack={handleBackFromEdit}
              />
            ) : panel === 'account' ? (
              <AccountSettingsForm
                user={user}
                onBack={() => setPanel('list')}
                onSaved={(u) => { handleSaved(); if (u) refreshUser?.(u); }}
                onClose={onClose}
              />
            ) : panel === 'privacy' && user?.type === 'user' ? (
              <PrivacyForm user={user} onBack={() => setPanel('list')} onSaved={(u) => { handleSaved(); if (u) refreshUser?.(u); }} />
            ) : panel === 'privacy' && user?.type === 'association' ? (
              <div className="settings-drawer__edit-panel">
                <button type="button" className="settings-drawer__back" onClick={() => setPanel('list')} aria-label="Retour">← Retour</button>
                <p className="settings-drawer__edit-desc">Cette option est disponible pour les comptes utilisateur uniquement.</p>
              </div>
            ) : panel === 'notifications' && user?.type === 'user' ? (
              <NotificationsForm user={user} onBack={() => setPanel('list')} onSaved={(u) => { handleSaved(); if (u) refreshUser?.(u); }} />
            ) : panel === 'notifications' && user?.type === 'association' ? (
              <div className="settings-drawer__edit-panel">
                <button type="button" className="settings-drawer__back" onClick={() => setPanel('list')} aria-label="Retour">← Retour</button>
                <p className="settings-drawer__edit-desc">Cette option est disponible pour les comptes utilisateur uniquement.</p>
              </div>
            ) : panel === 'security' ? (
              <SecurityForm user={user} onBack={() => setPanel('list')} onSaved={() => handleSaved()} />
            ) : (
              <>
                <div className="settings-drawer__edit-panel__top settings-drawer__edit-panel__top--list">
                  <button type="button" className="settings-drawer__back settings-drawer__back--list" onClick={onClose} aria-label="Retour">
                    ← Retour
                  </button>
                </div>
                <motion.nav className="settings-drawer__nav" variants={stagger} initial="hidden" animate="visible">
                {ITEMS.map((it) => (
                  <motion.button
                    key={it.id}
                    type="button"
                    variants={itemVariants}
                    className="settings-drawer__item"
                    onClick={() => {
                      if (it.id === 'edit' && canEditProfile) setPanel('edit');
                      else if (['account', 'privacy', 'notifications', 'security'].includes(it.id)) setPanel(it.id);
                      else if (onNavigate) onNavigate(it.id);
                      else onClose();
                    }}
                  >
                    <span className="settings-drawer__item-icon" aria-hidden="true">{it.icon}</span>
                    <div className="settings-drawer__item-text">
                      <span className="settings-drawer__item-title">{it.title}</span>
                      <span className="settings-drawer__item-desc">{it.desc}</span>
                    </div>
                    <span className="settings-drawer__item-arrow" aria-hidden="true">→</span>
                  </motion.button>
                ))}

                <motion.div variants={itemVariants} className="settings-drawer__item settings-drawer__item--theme">
                  <span className="settings-drawer__item-icon" aria-hidden="true">🌗</span>
                  <div className="settings-drawer__item-text">
                    <span className="settings-drawer__item-title">Thème</span>
                    <span className="settings-drawer__item-desc">Clair / Sombre</span>
                  </div>
                  <ThemeToggleSwitch />
                </motion.div>

                <motion.button
                  type="button"
                  variants={itemVariants}
                  className="settings-drawer__item settings-drawer__item--logout"
                  onClick={() => { onClose(); onLogout?.(); }}
                >
                  <span className="settings-drawer__item-icon" aria-hidden="true">🚪</span>
                  <div className="settings-drawer__item-text">
                    <span className="settings-drawer__item-title">Déconnexion</span>
                    <span className="settings-drawer__item-desc">Se déconnecter du compte</span>
                  </div>
                  <span className="settings-drawer__item-arrow" aria-hidden="true">→</span>
                </motion.button>
              </motion.nav>
              </>
            )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
