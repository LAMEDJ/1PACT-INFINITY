/**
 * Bloc Connexion / Inscription affiché dans le panneau Profil quand l'utilisateur n'est pas connecté.
 * Reste dans le Layout global (header + menu du bas visibles), pas de redirection.
 */
import { motion } from 'framer-motion';
import AuthPage from '../../pages/AuthPage';

export default function AuthFallback() {
  return (
    <div className="page profile-page profile-page-guest auth-fallback">
      <motion.div
        className="auth-fallback__inner"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      >
        <h2 className="auth-fallback__title">
          Connecte-toi pour accéder à ton profil
        </h2>
        <p className="auth-fallback__subtitle">
          Utilise le formulaire ci-dessous pour te connecter ou créer un compte.
        </p>
        <div className="auth-fallback__form">
          <AuthPage embedded />
        </div>
      </motion.div>
    </div>
  );
}
