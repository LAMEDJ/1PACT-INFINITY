/**
 * Section Comment ça marche – 3 cartes : Publie ou cherche, Connecte localement, Gagne des Points Impact.
 * Apparition au scroll, hover lift, icônes.
 */
import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';

const CARDS = [
  {
    icon: '📢',
    title: 'Publie ou cherche',
    desc: 'Propose des missions ou trouve des actions près de chez toi.',
  },
  {
    icon: '📍',
    title: 'Connecte localement',
    desc: 'Rencontre associations et participants autour de toi.',
  },
  {
    icon: '⭐',
    title: 'Gagne des Points Impact',
    desc: 'Chaque action compte : like, commentaire, suivi… et fait monter ton niveau.',
  },
];

const EASE = [0.4, 0, 0.2, 1];

export default function HowItWorksAnimated() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [hovered, setHovered] = useState(null);

  return (
    <section ref={ref} className="landing-section">
      <motion.h2
        className="landing-section-title"
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.35, ease: EASE }}
      >
        Comment ça marche
      </motion.h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {CARDS.map((card, i) => (
          <motion.div
            key={card.title}
            className="landing-card"
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, ease: EASE, delay: i * 0.1 }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            <motion.span
              className="text-4xl mb-4 block"
              animate={hovered === i ? { scale: 1.1 } : { scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              {card.icon}
            </motion.span>
            <h3 className="text-xl font-semibold text-[var(--color-panel-text-primary)] mb-2">
              {card.title}
            </h3>
            <p className="text-[var(--color-panel-text-secondary)] text-sm leading-relaxed opacity-90">
              {card.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
