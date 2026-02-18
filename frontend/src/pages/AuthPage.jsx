/**
 * Page Connexion / Inscription – Design 2026 PathFinders × Explore Travel.
 * Fond atmosphérique, formulaire glassmorphism, CTA dégradé.
 */
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import './AuthPage.css';

export default function AuthPage({ embedded = false }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab') === 'signup' ? 'signup' : 'login';
  const { user, login, registerUser, registerAssociation } = useAuth();

  const [tab, setTab] = useState(tabFromUrl);
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

  useEffect(() => {
    setTab(tabFromUrl);
  }, [tabFromUrl]);

  const rawRedirect = searchParams.get('redirect');
  const redirectPath = rawRedirect && rawRedirect.startsWith('/') && !rawRedirect.startsWith('//') ? rawRedirect : '/';

  useEffect(() => {
    if (user && !embedded) navigate(redirectPath, { replace: true });
  }, [user, navigate, redirectPath, embedded]);

  const validate = () => {
    const emailTrim = email.trim();
    if (!emailTrim) {
      setError('Veuillez entrer votre adresse e-mail.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrim)) {
      setError('Adresse e-mail invalide.');
      return false;
    }
    if (!password) {
      setError('Veuillez entrer votre mot de passe.');
      return false;
    }
    if (tab === 'signup') {
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
      if (!embedded) navigate(redirectPath, { replace: true });
    } catch (err) {
      setError(err?.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`auth-page ${embedded ? 'auth-page--embedded' : ''}`}>
      {!embedded && (
        <>
          {/* Zone supérieure : fond + logo + nom app + slogan */}
          <header className="auth-header">
            <div className="auth-header-bg" />
            <div className="auth-header-content">
              <div className="auth-logo" aria-hidden="true">1P</div>
              <h1 className="auth-app-name">1PACT</h1>
              <p className="auth-tagline">Application associations</p>
            </div>
          </header>
        </>
      )}

      {/* Zone formulaire : glassmorphism, micro-animation d'entrée */}
      <motion.section
        className="auth-form-section"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${tab === 'login' ? 'active' : ''}`}
            onClick={() => { setTab('login'); setError(''); }}
          >
            Connexion
          </button>
          <button
            type="button"
            className={`auth-tab ${tab === 'signup' ? 'active' : ''}`}
            onClick={() => { setTab('signup'); setError(''); }}
          >
            Inscription
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {/* Type de compte (utilisateur ou association) */}
          <div className="auth-type">
            <label className="auth-type-label">
              <input
                type="radio"
                name="type"
                checked={type === 'user'}
                onChange={() => setType('user')}
              />
              <span>Utilisateur</span>
            </label>
            <label className="auth-type-label">
              <input
                type="radio"
                name="type"
                checked={type === 'association'}
                onChange={() => setType('association')}
              />
              <span>Association</span>
            </label>
          </div>

          <div className="auth-field">
            <label htmlFor="auth-email">Adresse e-mail</label>
            <input
              id="auth-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemple@email.com"
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="auth-password">Mot de passe</label>
            <input
              id="auth-password"
              type="password"
              autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={tab === 'signup' ? 'Min. 8 caractères' : '••••••••'}
              required
            />
            {tab === 'signup' && <span className="auth-hint">8 caractères minimum</span>}
          </div>

          {tab === 'signup' && (
            <div className="auth-field">
              <label htmlFor="auth-confirm">Confirmer le mot de passe</label>
              <input
                id="auth-confirm"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          )}

          {tab === 'signup' && (
            <div className="auth-field">
              <label htmlFor="auth-name">Nom {type === 'association' ? 'de l’association' : ''}</label>
              <input
                id="auth-name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={type === 'user' ? 'Votre nom' : 'Nom de l’association'}
                required
              />
            </div>
          )}

          {tab === 'signup' && type === 'association' && (
            <>
              <div className="auth-field">
                <label htmlFor="auth-bio">Bio (optionnel)</label>
                <textarea
                  id="auth-bio"
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Présentation courte"
                />
              </div>
              <div className="auth-field">
                <label htmlFor="auth-category">Catégorie (optionnel)</label>
                <input
                  id="auth-category"
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="ex. Humanitaire"
                />
              </div>
              <div className="auth-field">
                <label htmlFor="auth-public">Public cible (optionnel)</label>
                <input
                  id="auth-public"
                  type="text"
                  value={publicCible}
                  onChange={(e) => setPublicCible(e.target.value)}
                  placeholder="ex. Jeunes, familles"
                />
              </div>
              <div className="auth-field">
                <label htmlFor="auth-location">Localisation (optionnel)</label>
                <input
                  id="auth-location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ville ou région"
                />
              </div>
              <div className="auth-field">
                <label htmlFor="auth-contact">Contact (optionnel)</label>
                <input
                  id="auth-contact"
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="E-mail ou téléphone"
                />
              </div>
            </>
          )}

          {error && <p className="auth-error" role="alert">{error}</p>}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Chargement...' : tab === 'login' ? 'Se connecter' : 'Créer le compte'}
          </button>

          {tab === 'login' && (
            <p className="auth-link">
              Pas encore de compte ?{' '}
              <button type="button" className="auth-link-btn" onClick={() => { setTab('signup'); setError(''); }}>
                S’inscrire ici
              </button>
            </p>
          )}
          {tab === 'signup' && (
            <p className="auth-link">
              Déjà un compte ?{' '}
              <button type="button" className="auth-link-btn" onClick={() => { setTab('login'); setError(''); }}>
                Se connecter
              </button>
            </p>
          )}

          {tab === 'login' && (
            <div className="auth-demo-hint" role="note">
              <strong>Comptes démo pour tester :</strong>
              <br />
              <span className="auth-demo-user">Utilisateur</span> → <kbd>user@demo.fr</kbd> / <kbd>demo123</kbd>
              <br />
              <span className="auth-demo-asso">Association</span> → <kbd>contact@solidaritejeunes.fr</kbd> / <kbd>demo123</kbd>
              <br />
              <small>Le backend doit être lancé (dossier backend : <code>npm run dev</code>).</small>
            </div>
          )}
        </form>
      </motion.section>
    </div>
  );
}
