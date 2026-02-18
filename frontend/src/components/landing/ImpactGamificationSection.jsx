/**
 * Section Système Impact – Points, niveaux, badges, barre de progression, compteur animé.
 */
import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { impactLevels, POINTS_PER_LEVEL } from '../../lib/levelMapping';

const EASE = [0.4, 0, 0.2, 1];

function AnimatedCount({ to, duration = 1.5 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const end = to;
    const startTime = performance.now();
    const step = (now) => {
      const elapsed = (now - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      setCount(Math.round(progress * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, to, duration]);

  return <span ref={ref}>{count}</span>;
}

export default function ImpactGamificationSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const examplePoints = 18;
  const pointsInLevel = examplePoints % POINTS_PER_LEVEL;
  const percent = (pointsInLevel / POINTS_PER_LEVEL) * 100;
  const level = Math.floor(examplePoints / POINTS_PER_LEVEL) + 1;
  const badgeLabel = impactLevels[level] ?? 'Explorateur';

  return (
    <section ref={ref} className="landing-section landing-section--glass">
      <motion.h2
        className="landing-section-title"
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.35, ease: EASE }}
      >
        Système Impact
      </motion.h2>
      <motion.p
        className="text-center text-[var(--color-panel-text-secondary)] max-w-xl mx-auto mb-10"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.35, delay: 0.1 }}
      >
        Chaque action te rapporte des points. Tous les 24 points, tu passes au niveau supérieur.
      </motion.p>

      <motion.div
        className="max-w-sm mx-auto p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.4, ease: EASE, delay: 0.15 }}
      >
        <div className="flex items-center gap-4 mb-4">
          <motion.span
            className="text-5xl"
            animate={inView ? { scale: [0.8, 1.05, 1] } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            🏆
          </motion.span>
          <div>
            <p className="text-2xl font-bold text-[var(--color-panel-text-primary)]">
              <AnimatedCount to={examplePoints} /> pts
            </p>
            <p className="text-sm font-semibold text-[var(--color-impact-green)]">
              {badgeLabel}
            </p>
          </div>
        </div>
        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-impact-green)]"
            initial={{ width: 0 }}
            animate={inView ? { width: `${percent}%` } : { width: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.4 }}
          />
        </div>
        <p className="text-xs text-[var(--color-panel-text-secondary)] mt-2 opacity-90">
          {24 - pointsInLevel} pts pour le prochain niveau
        </p>
      </motion.div>
    </section>
  );
}
