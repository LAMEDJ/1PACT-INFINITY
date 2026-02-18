/**
 * Section Pour qui ? – 3 cartes : Associations, Participants, Porteurs de projet.
 * Hover lift, border glow, stagger à l'apparition.
 */
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const CARDS = [
  {
    icon: '🏢',
    title: 'Associations',
    desc: 'Publiez vos missions et besoins, trouvez des bénévoles engagés.',
  },
  {
    icon: '👥',
    title: 'Participants',
    desc: 'Découvrez des actions près de chez vous et gagnez des Points Impact.',
  },
  {
    icon: '🚀',
    title: 'Porteurs de projet',
    desc: 'Lancez des initiatives et fédérez une communauté locale.',
  },
];

const EASE = [0.4, 0, 0.2, 1];

export default function TargetAudienceSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="landing-section">
      <motion.h2
        className="landing-section-title"
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.35, ease: EASE }}
      >
        Pour qui ?
      </motion.h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {CARDS.map((card, i) => (
          <motion.div
            key={card.title}
            className="landing-card landing-card--glow"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.35, ease: EASE, delay: 0.08 * i }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
          >
            <span className="text-4xl mb-4 block">{card.icon}</span>
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
