/**
 * Widget Points Impact étendu pour le Fil : badge visible + progression vers prochain niveau.
 * - Section Badge : badge actuel, nom du niveau, icône.
 * - Progression : points actuels, barre vers 24 pts, texte "Il te reste X points pour atteindre le prochain niveau".
 * - Barre animée, effet glow si proche du niveau suivant.
 */
import { motion } from 'framer-motion';
import { getLevelFromPoints, getProgressToNextLevel, POINTS_PER_LEVEL } from '../../lib/levelMapping';
import './ImpactWidgetExtended.css';

const BADGE_ICONS = {
  1: '🧭',
  2: '🗺️',
  3: '🏴‍☠️',
  4: '👑',
};

export default function ImpactWidgetExtended({ totalPoints = 0, onClick }) {
  const { level, label } = getLevelFromPoints(totalPoints);
  const progress = getProgressToNextLevel(totalPoints);
  const pointsRestants = POINTS_PER_LEVEL - (totalPoints % POINTS_PER_LEVEL);
  const isNearNext = progress.pointsRemaining > 0 && progress.pointsRemaining <= 6;
  const isMaxLevel = level >= 4 && progress.pointsInLevel === 0 && totalPoints > 0;

  return (
    <section
      className={`impact-extended ${isNearNext ? 'impact-extended--glow' : ''}`}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      role="button"
      tabIndex={0}
      aria-label="Voir le détail des Points Impact"
    >
      <div className="impact-extended__content">
        <div className="impact-extended__badge-wrap">
          <span className="impact-extended__badge-icon" aria-hidden="true">
            {BADGE_ICONS[level] ?? '🏆'}
          </span>
          <div>
            <h3 className="impact-extended__title">Points d&apos;impact</h3>
            <p className="impact-extended__value">{totalPoints} pts</p>
            <p className="impact-extended__level">
              <span className="impact-extended__level-badge">{label}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="impact-extended__progress-wrap">
        <div className="impact-extended__progress-bar">
          <motion.span
            className="impact-extended__progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progress.percent}%` }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          />
        </div>
        <p className="impact-extended__progress-text">
          {isMaxLevel ? (
            <>Niveau max atteint !</>
          ) : progress.pointsRemaining != null && progress.pointsRemaining > 0 ? (
            <>Il te reste <strong>{pointsRestants}</strong> point{pointsRestants > 1 ? 's' : ''} pour atteindre le prochain niveau</>
          ) : null}
        </p>
      </div>
    </section>
  );
}
