/**
 * Modal connexion / inscription (utilisateur ou association).
 * Validation email, mot de passe 8 caractères min, confirmation mot de passe.
 */
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './LoginModal.css';

export default function LoginModal({ onClose, defaultTab = 'login' }) {
  const { login, registerUser, registerAssociation } = useAuth();
  const [tab, setTab] = useState(defaultTab);
  const [type, setType] = useState('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [category, setCategory] = useState('');
  const [publicCible, setPublicCible] = useState('');
  const [location, setLocation] = useState('');
  const [contact, setContact] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const emailTrim = email.trim();
    if (!emailTrim) {
      setError('Veuillez entrer votre adresse e-mail.');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim)) {
      setError('Adresse e-mail invalide.');
      return false;
    }
    if (!password) {
      setError('Veuillez entrer votre mot de passe.');
      return false;
    }
    if (tab === 'register') {
      if (password.length < 8) {
        setError('Le mot de passe doit contenir au moins 8 caractères.');
        return false;
      }
      if (password !== confirmPassword) {
        setError('Les deux mots de passe ne correspondent pas.');
        return false;
      }
      if (!name.trim()) {
        setError('Veuillez entrer votre nom.');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;
    setLoading(true);
    try {
      if (tab === 'login') {
        await login(email.trim(), password, type);
      } else if (type === 'user') {
        await registerUser(email.trim(), password, name.trim());
      } else {
        await registerAssociation({
          email: email.trim(),
          password,
          name: name.trim(),
          bio: bio.trim(),
          category: category.trim(),
          public_cible: publicCible.trim(),
          location: location.trim(),
          contact: (contact || email).trim(),
        });
      }
      onClose?.();
    } catch (err) {
      setError(err?.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-modal-overlay" onClick={onClose}>
      <div className="login-modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="login-modal-close" onClick={onClose} aria-label="Fermer">×</button>
        <h2>{tab === 'login' ? 'Connexion' : 'Inscription'}</h2>
        <div className="login-tabs">
          <button type="button" className={tab === 'login' ? 'active' : ''} onClick={() => { setTab('login'); setError(''); }}>Connexion</button>
          <button type="button" className={tab === 'register' ? 'active' : ''} onClick={() => { setTab('register'); setError(''); }}>Inscription</button>
        </div>
        <form onSubmit={handleSubmit}>
          {tab === 'register' && (
            <div className="login-type">
              <label><input type="radio" name="type" checked={type === 'user'} onChange={() => setType('user')} /> Utilisateur</label>
              <label><input type="radio" name="type" checked={type === 'association'} onChange={() => setType('association')} /> Association</label>
            </div>
          )}
          {tab === 'login' && (
            <div className="login-type">
              <label><input type="radio" name="type" checked={type === 'user'} onChange={() => setType('user')} /> Utilisateur</label>
              <label><input type="radio" name="type" checked={type === 'association'} onChange={() => setType('association')} /> Association</label>
            </div>
          )}
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
          <input type="password" placeholder="Mot de passe (8 car. min)" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={tab === 'login' ? 'current-password' : 'new-password'} required />
          {tab === 'register' && (
            <>
              <input type="password" placeholder="Confirmer le mot de passe" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" required />
              <input type="text" placeholder="Nom" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
              {type === 'association' && (
                <>
                  <textarea placeholder="Bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={2} />
                  <input type="text" placeholder="Catégorie (ex. Humanitaire)" value={category} onChange={(e) => setCategory(e.target.value)} />
                  <input type="text" placeholder="Public cible" value={publicCible} onChange={(e) => setPublicCible(e.target.value)} />
                  <input type="text" placeholder="Localisation" value={location} onChange={(e) => setLocation(e.target.value)} />
                  <input type="text" placeholder="Contact" value={contact} onChange={(e) => setContact(e.target.value)} />
                </>
              )}
            </>
          )}
          {error && <p className="login-error">{error}</p>}
          <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Chargement...' : (tab === 'login' ? 'Se connecter' : 'Créer le compte')}</button>
        </form>
      </div>
    </div>
  );
}
