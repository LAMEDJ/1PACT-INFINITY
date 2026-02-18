/**
 * Section Social proof – statistiques dynamiques, compteurs animés.
 */
import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';

const EASE = [0.4, 0, 0.2, 1];

function AnimatedStat({ value, suffix = '', label }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1.8;
    let start = 0;
    const end = value;
    const startTime = performance.now();
    const step = (now) => {
      const elapsed = (now - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      setCount(Math.round(progress * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, value]);

  return (
    <div ref={ref} className="text-center">
      <p className="text-3xl sm:text-4xl font-bold text-[var(--color-panel-text-primary)]">
        {count}{suffix}
      </p>
      <p className="text-sm text-[var(--color-panel-text-secondary)] mt-1 opacity-90">
        {label}
      </p>
    </div>
  );
}

const STATS = [
  { value: 1250, suffix: '+', label: 'Actions réalisées' },
  { value: 48000, suffix: '', label: 'Points Impact générés' },
  { value: 42, suffix: '', label: 'Associations actives' },
];

export default function SocialProofSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section ref={ref} className="landing-section landing-section--glass">
      <motion.h2
        className="landing-section-title"
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.35, ease: EASE }}
      >
        Déjà en mouvement
      </motion.h2>
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-3 gap-8 py-6"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        {STATS.map((stat) => (
          <AnimatedStat key={stat.label} {...stat} />
        ))}
      </motion.div>
    </section>
  );
}
