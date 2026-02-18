/**
 * En-tête profil type Instagram : avatar centré, nom, @username, bio, badge optionnel, CTA unique "Proposition d'abonnement".
 * Pas de bouton S'abonner ni abonnés/abonnements.
 */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.02 },
  },
};

const containerNoMotion = {
  hidden: { opacity: 1 },
  visible: { opacity: 1 },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
  },
};

const itemNoMotion = {
  hidden: { opacity: 1, y: 0 },
  visible: { opacity: 1, y: 0 },
};

export default function ProfileHeader({
  displayName,
  username,
  bio,
  avatarLetter,
  avatarUrl,
  isPremium,
  levelBadge,
  onPropositionClick,
  propositionSent,
  propositionLoading,
  onEditProfile,
  /** Pour le profil utilisateur : libellé "Proposer une aide" au lieu de "Proposition d'abonnement" */
  propositionCtaLabel = "Proposition d'abonnement",
  propositionSentLabel = 'Proposition envoyée',
}) {
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const m = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(m.matches);
    const fn = () => setReducedMotion(m.matches);
    m.addEventListener('change', fn);
    return () => m.removeEventListener('change', fn);
  }, []);

  const cont = reducedMotion ? containerNoMotion : container;
  const it = reducedMotion ? itemNoMotion : item;

  return (
    <motion.header
      className="profile-header-new"
      variants={cont}
      initial="hidden"
      animate="visible"
      aria-label="En-tête du profil"
    >
      <motion.div className="profile-header-new__avatar-wrap" variants={it}>
        <div
          className="profile-header-new__avatar"
          style={avatarUrl ? { backgroundImage: `url(${avatarUrl})` } : undefined}
        >
          {!avatarUrl && (avatarLetter || displayName?.charAt(0) || '?')}
        </div>
        {isPremium && (
          <span className="profile-header-new__badge-premium" aria-hidden="true">
            ★
          </span>
        )}
      </motion.div>

      <motion.h1 className="profile-header-new__name" variants={it}>
        {displayName || 'Profil'}
      </motion.h1>
      {username && (
        <motion.p className="profile-header-new__handle" variants={it}>
          @{username.replace(/^@/, '')}
        </motion.p>
      )}
      {bio && (
        <motion.p className="profile-header-new__bio" variants={it}>
          {bio}
        </motion.p>
      )}
      {levelBadge && (
        <motion.span
          className={`profile-header-new__badge profile-header-new__badge--${levelBadge.class}`}
          variants={it}
        >
          {levelBadge.label}
        </motion.span>
      )}

      <motion.div className="profile-header-new__cta-wrap" variants={it}>
        {onEditProfile && (
          <button
            type="button"
            className="profile-header-new__cta profile-header-new__cta--secondary"
            onClick={onEditProfile}
            aria-label="Modifier le profil"
          >
            Modifier profil
          </button>
        )}
        <button
          type="button"
          className="profile-header-new__cta"
          onClick={onPropositionClick}
          disabled={propositionSent || propositionLoading}
          aria-busy={propositionLoading}
          aria-pressed={propositionSent}
          title={propositionSent ? propositionSentLabel : propositionCtaLabel}
          aria-label={propositionSent ? propositionSentLabel : propositionCtaLabel}
        >
          {propositionLoading && <span className="profile-header-new__cta-spinner" aria-hidden="true" />}
          {propositionSent ? propositionSentLabel : propositionCtaLabel}
        </button>
      </motion.div>
    </motion.header>
  );
}
