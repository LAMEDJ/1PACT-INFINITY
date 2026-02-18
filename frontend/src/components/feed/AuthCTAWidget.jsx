/**
 * CTA Connexion – affiché si l’utilisateur n’est pas connecté (transféré depuis Accueil).
 */
import { Link } from 'react-router-dom';
import './AuthCTAWidget.css';

export default function AuthCTAWidget() {
  return (
    <section className="auth-cta-widget" aria-label="Connexion">
      <Link
        to="/login"
        className="auth-cta-widget__link"
        aria-label="Se connecter ou s'inscrire"
      >
        Se connecter ou s&apos;inscrire
      </Link>
    </section>
  );
}
