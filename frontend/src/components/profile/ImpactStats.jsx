/**
 * Statistiques Impact en ligne horizontale (type Instagram) : Points, Niveau, Propositions envoyées, Propositions acceptées.
 * Count-up au chargement, hover, optionnellement cliquable pour ouvrir un détail.
 */
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const COUNT_UP_MS = 500;
const easeOut = (t) => 1 - (1 - t) * (1 - t);

function useCountUp(value, enabled) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef(null);
  const reduced =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (!enabled || reduced) {
      setDisplay(value);
      return;
    }
    setDisplay(0);
    startRef.current = null;
    const step = (now) => {
      if (startRef.current == null) startRef.current = now;
      const t = Math.min((now - startRef.current) / COUNT_UP_MS, 1);
      setDisplay(Math.round(easeOut(t) * value));
      if (t < 1) requestAnimationFrame(step);
    };
    const id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
  }, [value, enabled, reduced]);

  return reduced ? value : display;
}

const STATS = [
  { key: 'points', label: 'Points Impact', tooltip: 'Points cumulés grâce à vos actions' },
  { key: 'level', label: 'Niveau Impact', tooltip: 'Explorateur, Aventurier, Pirate ou Légende' },
  { key: 'sent', label: 'Propositions envoyées', tooltip: 'Nombre de propositions d’abonnement envoyées' },
  { key: 'accepted', label: 'Propositions acceptées', tooltip: 'Propositions acceptées par des associations' },
];

export default function ImpactStats({
  pointsImpact = 0,
  levelLabel = 'Explorateur',
  propositionsSent = 0,
  propositionsAccepted = 0,
  onStatClick,
  mounted = true,
}) {
  const pointsDisplay = useCountUp(pointsImpact, mounted);
  const sentDisplay = useCountUp(propositionsSent, mounted);
  const acceptedDisplay = useCountUp(propositionsAccepted, mounted);

  const getDisplayValue = (key) => {
    if (key === 'points') return pointsDisplay;
    if (key === 'level') return levelLabel;
    if (key === 'sent') return sentDisplay;
    if (key === 'accepted') return acceptedDisplay;
    return 0;
  };

  const reducedMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <section className="impact-stats" aria-label="Statistiques Impact">
      <div className="impact-stats__list">
        {STATS.map(({ key, label, tooltip }) => (
          <motion.button
            key={key}
            type="button"
            className="impact-stats__item"
            onClick={() => onStatClick?.(key)}
            whileHover={reducedMotion ? undefined : { y: -4 }}
            whileTap={reducedMotion ? undefined : { scale: 0.98 }}
            title={tooltip}
            aria-label={`${label} : ${getDisplayValue(key)}`}
          >
            <span className="impact-stats__value">{getDisplayValue(key)}</span>
            <span className="impact-stats__label">{label}</span>
          </motion.button>
        ))}
      </div>
    </section>
  );
}
