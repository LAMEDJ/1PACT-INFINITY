/**
 * CTA final – fond contrasté, message fort, bouton principal avec glow au hover.
 */
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function FinalCTASection({ user, onGoToPage }) {
  const goToFil = () => {
    if (typeof onGoToPage === 'function') onGoToPage(2);
  };

  return (
    <section className="landing-cta-final">
      <div className="landing-cta-final-inner">
        <motion.h2
          className="landing-cta-final-title"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
        >
          Rejoins le mouvement et génère ton Impact.
        </motion.h2>
        <motion.p
          className="landing-cta-final-sub"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35, delay: 0.08 }}
        >
          Des milliers d&apos;actions déjà réalisées. À toi de jouer.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35, delay: 0.12 }}
        >
          {user ? (
            <button
              type="button"
              onClick={goToFil}
              className="landing-cta-final-btn"
            >
              Voir le fil d&apos;actualité
            </button>
          ) : (
            <Link to="/login" className="landing-cta-final-btn">
              Commencer maintenant
            </Link>
          )}
        </motion.div>
      </div>
    </section>
  );
}
