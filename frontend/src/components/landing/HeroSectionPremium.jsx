/**
 * Hero section immersive – headline, sous-titre, CTA Commencer / Découvrir.
 * Si connecté → Fil ; sinon → /login. Animation fade-in + slide-up, float mockup.
 */
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const DURATION = 0.35;
const EASE = [0.4, 0, 0.2, 1];

export default function HeroSectionPremium({ user, onGoToPage }) {
  const goToFil = () => {
    if (typeof onGoToPage === 'function') onGoToPage(2);
  };

  return (
    <section className="landing-hero relative overflow-hidden rounded-2xl py-16 px-6 sm:py-20 sm:px-10">
      {/* Gradient subtil en arrière-plan */}
      <div
        className="absolute inset-0 opacity-90 rounded-2xl"
        style={{
          background: 'linear-gradient(160deg, rgba(34, 52, 69, 0.92) 0%, rgba(61, 82, 104, 0.85) 50%, rgba(20, 40, 60, 0.9) 100%)',
        }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(143,183,255,0.15),transparent)]" aria-hidden="true" />

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <motion.h1
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-4"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATION, ease: EASE }}
        >
          Donne du sens à ton engagement
        </motion.h1>
        <motion.p
          className="text-lg sm:text-xl text-[var(--color-mist-light)] opacity-95 mb-10 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATION, ease: EASE, delay: 0.08 }}
        >
          Publie ou cherche des missions, connecte-toi localement, gagne des Points Impact.
        </motion.p>
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: DURATION, ease: EASE, delay: 0.16 }}
        >
          {user ? (
            <button
              type="button"
              onClick={goToFil}
              className="landing-cta-primary"
            >
              Commencer
            </button>
          ) : (
            <Link to="/login" className="landing-cta-primary">
              Commencer
            </Link>
          )}
          <button
            type="button"
            onClick={() => typeof onGoToPage === 'function' && onGoToPage(2)}
            className="landing-cta-secondary"
          >
            Découvrir
          </button>
        </motion.div>
      </div>

      {/* Mockup flottant */}
      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-64 h-40 rounded-2xl flex items-center justify-center text-white/20 text-6xl border border-white/10 bg-white/5 backdrop-blur-sm"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, ease: 'easeInOut', repeat: Infinity }}
        aria-hidden="true"
      >
        📱
      </motion.div>
    </section>
  );
}
