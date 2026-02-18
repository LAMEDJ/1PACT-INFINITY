/**
 * Page Profil – Utilisateur (et invité / association).
 * Refonte utilisateur : header simplifié, carte identité impact, tabs fluides, badges gamification.
 * Design system, transitions < 200ms, mobile-first.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useSettings } from '../context/SettingsContext';
import { api, UPLOAD_BASE } from '../api';
import ProtectedProfile from '../components/ProtectedProfile';
import ProfileHeader from '../components/profile/ProfileHeader';
import ImpactStats from '../components/profile/ImpactStats';
import ProfileTabs from '../components/profile/ProfileTabs';
import { getLevelFromPoints } from '../lib/levelMapping';
import { useImpact } from '../context/ImpactContext';
import './PageCommon.css';
import './ProfilePage.css';

const COUNT_UP_MS = 500;
/** Badges = 4 niveaux gamifiés (labels uniquement) */
const BADGES = [
  { id: 'niv1', icon: '🧭', label: 'Explorateur', level: 1 },
  { id: 'niv2', icon: '🗺️', label: 'Aventurier', level: 2 },
  { id: 'niv3', icon: '🏴‍☠️', label: 'Pirate', level: 3 },
  { id: 'niv4', icon: '👑', label: 'Légende', level: 4 },
];

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const diff = (Date.now() - d) / 60000;
  if (diff < 60) return 'À l\'instant';
  if (diff < 1440) return `Il y a ${Math.floor(diff / 60)} h`;
  if (diff < 43200) return `Il y a ${Math.floor(diff / 1440)} j`;
  return d.toLocaleDateString('fr-FR');
}

function useCountUp(value, enabled) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef(null);
  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
      const ease = 1 - (1 - t) * (1 - t);
      setDisplay(Math.round(ease * value));
      if (t < 1) requestAnimationFrame(step);
    };
    const id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
  }, [value, enabled, reduced]);

  return reduced ? value : display;
}

/** Utilise le mapping niveaux 1–4 (Explorateur → Légende) */
function getLevelBadge(points = 0) {
  return getLevelFromPoints(points);
}

export default function ProfilePage({ onGoToFeed, onGoToPage }) {
  const { user, isUser, isAssociation, logout, refreshUser } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [tab, setTab] = useState(location.state?.profileTab === 'impact' ? 'impact' : 'publications');
  const [followedAssociations, setFollowedAssociations] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [myPublications, setMyPublications] = useState([]);
  const [feedPosts, setFeedPosts] = useState([]);
  const [, setLoadingFollows] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { openSettings } = useSettings();
  const [propositionSent, setPropositionSent] = useState(false);
  const [propositionLoading, setPropositionLoading] = useState(false);
  const [showAideModal, setShowAideModal] = useState(false);
  const contentRef = useRef(null);

  const loadFollows = useCallback(() => {
    if (!user || !isUser) return;
    setLoadingFollows(true);
    api.follows.list().then(setFollowedAssociations).catch(() => setFollowedAssociations([])).finally(() => setLoadingFollows(false));
  }, [user, isUser]);

  useEffect(() => setMounted(true), []);
  useEffect(() => { queueMicrotask(() => loadFollows()); }, [loadFollows]);
  useEffect(() => {
    if (location.state?.profileTab === 'impact') setTab('impact');
  }, [location.state?.profileTab]);

  useEffect(() => {
    if (!user) return;
    if (isAssociation) {
      api.dashboard.stats().then(setDashboardStats).catch(() => setDashboardStats(null));
      api.dashboard.publications().then(setMyPublications).catch(() => setMyPublications([]));
    } else {
      setLoadingPosts(true);
      api.publications.list({ limit: 50 })
        .then(setFeedPosts)
        .catch(() => setFeedPosts([]))
        .finally(() => setLoadingPosts(false));
    }
  }, [user, isAssociation]);

  const handleUnfollow = async (associationId) => {
    try {
      await api.follows.unfollow(associationId);
      setFollowedAssociations((prev) => prev.filter((a) => a.id !== associationId));
    } catch (e) {
      addToast(e?.message || 'Erreur', 'error');
    }
  };

  const goToFeed = () => {
    if (typeof onGoToFeed === 'function') onGoToFeed();
    else if (typeof onGoToPage === 'function') onGoToPage(2);
  };

  const followedIds = new Set(followedAssociations.map((a) => a.id));
  const postsForList = isAssociation ? myPublications : feedPosts.filter((p) => followedIds.has(p.association_id));
  const mediaItems = postsForList
    .filter((p) => p.image_url || p.video_url)
    .map((p) => ({ url: p.image_url || p.video_url, id: p.id, isVideo: !!p.video_url }));

  const impactPoints = isAssociation
    ? (dashboardStats?.impact_points ?? 0)
    : (user?.impact_points ?? 0);
  const displayImpact = useCountUp(impactPoints, mounted);
  const { setImpactStats } = useImpact();

  useEffect(() => {
    if (!user) return;
    const { level, label } = getLevelBadge(impactPoints);
    if (isAssociation && dashboardStats) {
      setImpactStats({
        totalPoints: dashboardStats.impact_points ?? 0,
        level,
        levelLabel: label,
        actionsCount: dashboardStats.publications ?? 0,
        missionsCount: dashboardStats.subscribers ?? 0,
        besoinsCombles: 0,
        propositionsSent: 0,
        propositionsAccepted: 0,
      });
    } else {
      setImpactStats({
        totalPoints: impactPoints,
        level,
        levelLabel: label,
        actionsCount: user?.total_valid_actions ?? 0,
        missionsCount: 0,
        besoinsCombles: 0,
        propositionsSent: propositionSent ? 1 : 0,
        propositionsAccepted: 0,
      });
    }
  }, [user, isAssociation, dashboardStats, impactPoints, propositionSent, setImpactStats]);

  useEffect(() => {
    const list = contentRef.current?.querySelector('.profile-posts-list');
    if (!list) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      list.querySelectorAll('.profile-post-item').forEach((el) => el.classList.add('profile-post-item--visible'));
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('profile-post-item--visible')),
      { rootMargin: '0px 0px 60px 0px', threshold: 0.05 }
    );
    list.querySelectorAll('.profile-post-item').forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [tab, postsForList.length, myPublications.length]);

  const displayName = user?.name || 'Profil';
  const handleStr = user
    ? (isAssociation ? `@${(user.name || '').replace(/\s+/g, '').toLowerCase()}` : '@' + (user.email?.split('@')[0] || 'membre'))
    : '';

  return (
    <ProtectedProfile>
      {user &&
        (isAssociation ? (
          <div className="page profile-page profile-page--asso">
            <div className="profile-page__glass">
              {/* En-tête association – inspiré de la maquette mobile fournie */}
              <section className="profile-asso-header">
                <div className="profile-asso-header__top">
                  <div className="profile-asso-header__avatar-block">
                    <div className="profile-asso-header__avatar-ring">
                      <div
                        className="profile-asso-header__avatar"
                        style={user?.avatar_url ? { backgroundImage: `url(${user.avatar_url.startsWith('http') ? user.avatar_url : UPLOAD_BASE + user.avatar_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
                      >
                        {!user?.avatar_url && displayName.charAt(0)}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="profile-asso-header__avatar-edit"
                      aria-label="Modifier la photo de profil"
                      onClick={() => openSettings('edit', { backFromEditCloses: true })}
                    >
                      📷
                    </button>
                  </div>

                  <div className="profile-asso-header__stats">
                    <div className="profile-asso-header__stat">
                      <span className="profile-asso-header__stat-value">
                        {dashboardStats?.publications ?? myPublications.length ?? 0}
                      </span>
                      <span className="profile-asso-header__stat-label">Publications</span>
                    </div>
                    <div className="profile-asso-header__stat">
                      <span className="profile-asso-header__stat-value">
                        {dashboardStats?.participants ?? 0}
                      </span>
                      <span className="profile-asso-header__stat-label">Participations</span>
                    </div>
                    <div className="profile-asso-header__stat">
                      <span className="profile-asso-header__stat-value">
                        {dashboardStats?.impact_points ?? impactPoints ?? 0}
                      </span>
                      <span className="profile-asso-header__stat-label">Impact</span>
                    </div>
                  </div>
                </div>

                <div className="profile-asso-header__info">
                  <div className="profile-asso-header__title-row">
                    <h1 className="profile-asso-header__title">{displayName}</h1>
                    <div className="profile-asso-header__title-actions">
                      <button
                        type="button"
                        className="profile-asso-header__share"
                        aria-label="Partager le profil"
                        onClick={() => {
                          const url = window.location.origin + `/association/${user.id}`;
                          if (navigator.share) {
                            navigator
                              .share({ title: displayName, url })
                              .catch(() => {});
                          } else if (navigator.clipboard?.writeText) {
                            navigator.clipboard
                              .writeText(url)
                              .then(() => addToast('Lien du profil copié dans le presse-papiers', 'success'))
                              .catch(() => addToast('Impossible de copier le lien. Copiez-le manuellement.', 'error'));
                          } else {
                            window.prompt('Copiez ce lien vers votre profil association :', url);
                          }
                        }}
                      >
                        ↗
                      </button>
                      <button
                        type="button"
                        className="profile-asso-header__settings"
                        aria-label="Réglages"
                        onClick={() => openSettings('list')}
                      >
                        ⚙ Réglages
                      </button>
                    </div>
                  </div>

                  <div className="profile-asso-header__identity-row">
                    <span className="profile-asso-header__name">{displayName}</span>
                    <span className="profile-asso-header__tag">Association</span>
                  </div>

                  <p className="profile-asso-header__bio">
                    {user?.bio ||
                      "Fondateur d'1PACT Explore, rencontre, vis ce qui compte !"}
                  </p>

                  <div className="profile-asso-header__location">
                    <span aria-hidden="true">📍</span>
                    <span>{user?.city || user?.location || 'Ville non renseignée'}</span>
                  </div>
                </div>

                <div className="profile-asso-header__actions">
                  <Link
                    to="/publish"
                    className="profile-btn profile-btn--primary profile-asso-header__btn-primary"
                  >
                    + Proposer
                  </Link>
                  <button
                    type="button"
                    className="profile-btn profile-btn--outline profile-asso-header__btn-secondary"
                    onClick={() => openSettings('edit', { backFromEditCloses: true })}
                  >
                    Modifier profil
                  </button>
                </div>
              </section>

              <div className="profile-tabs profile-tabs--two profile-asso-tabs">
                <div
                  className="profile-tabs__indicator"
                  style={{ transform: 'translateX(0)' }}
                  aria-hidden="true"
                />
                <button type="button" className="profile-tabs__tab active">
                  Publications
                </button>
                <button
                  type="button"
                  className="profile-tabs__tab"
                  onClick={() => navigate(`/association/${user.id}`)}
                >
                  Participations
                </button>
              </div>

              <div className="profile-content" ref={contentRef}>
                <div className="profile-tab-panel profile-tab-panel--active">
                  <div className="profile-posts">
                    {loadingPosts && <p className="profile-loading">Chargement...</p>}
                    {!loadingPosts && myPublications.length === 0 && (
                      <p className="profile-empty">Aucune publication.</p>
                    )}
                    {myPublications.length > 0 && (
                      <ul className="profile-posts-list">
                        {myPublications.map((pub) => (
                          <li key={pub.id} className="profile-post-item">
                            <div className="profile-post-item__meta">
                              <span className="profile-post-item__avatar">
                                {displayName.charAt(0)}
                              </span>
                              <div className="profile-post-item__head">
                                <span className="profile-post-item__author">
                                  {displayName}
                                </span>
                                <span className="profile-post-item__time">
                                  {formatDate(pub.created_at)}
                                </span>
                              </div>
                              <button
                                type="button"
                                className="profile-post-item__menu"
                                aria-label="Options"
                              >
                                ⋯
                              </button>
                            </div>
                            <p className="profile-post-item__text">{pub.text}</p>
                            {(pub.image_url || pub.video_url) && (
                              <div className="profile-post-item__media">
                                {pub.image_url && (
                                  <img
                                    src={UPLOAD_BASE + pub.image_url}
                                    alt=""
                                    loading="lazy"
                                  />
                                )}
                                {pub.video_url && !pub.image_url && (
                                  <video src={UPLOAD_BASE + pub.video_url} controls />
                                )}
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <Link
              to="/"
              state={{ openPage: 2, unifiedActionMode: 'publier' }}
              className="profile-fab"
              aria-label="Publier"
            >
              +
            </Link>
          </div>
        ) : (
          (() => {
  const levelBadge = getLevelBadge(impactPoints);
  const bio = user?.bio || `${displayName} soutient activement l'éducation et l'accès à l'eau potable.`;

  const handlePropositionClick = () => {
    setShowAideModal(true);
  };

  const handleAideSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const description = form.querySelector('[name="aide-description"]')?.value?.trim();
    const category = form.querySelector('[name="aide-category"]')?.value || '';
    if (!description) return;
    setPropositionLoading(true);
    api.propositions
      .create({
        titre: 'Proposer une aide',
        description,
        category: category || undefined,
        public_cible: '',
      })
      .then(() => {
        setPropositionSent(true);
        setShowAideModal(false);
        addToast('Votre aide a bien été proposée.', 'success');
      })
      .catch((err) => addToast(err?.message || 'Erreur lors de l\'envoi.', 'error'))
      .finally(() => setPropositionLoading(false));
  };

  const renderTabContent = () => {
    if (tab === 'publications') {
      return (
        <div className="profile-posts" ref={contentRef}>
          {loadingPosts && <p className="profile-loading">Chargement...</p>}
          {!loadingPosts && postsForList.length === 0 && (
            <p className="profile-empty">Suivez des associations pour voir leurs publications ici.</p>
          )}
          {postsForList.length > 0 && (
            <ul className="profile-posts-list">
              {postsForList.slice(0, 30).map((pub) => (
                <li key={pub.id} className="profile-post-item">
                  <div className="profile-post-item__meta">
                    <span className="profile-post-item__avatar">{(pub.association_name || 'A').charAt(0)}</span>
                    <div className="profile-post-item__head">
                      <span className="profile-post-item__author">{pub.association_name || 'Association'}</span>
                      <span className="profile-post-item__time">{formatDate(pub.created_at)}</span>
                    </div>
                    <button type="button" className="profile-post-item__menu" aria-label="Options">⋯</button>
                  </div>
                  <p className="profile-post-item__text">{pub.text}</p>
                  {(pub.image_url || pub.video_url) && (
                    <div className="profile-post-item__media">
                      {pub.image_url && <img src={UPLOAD_BASE + pub.image_url} alt="" loading="lazy" />}
                      {pub.video_url && !pub.image_url && <video src={UPLOAD_BASE + pub.video_url} controls />}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      );
    }
    if (tab === 'activite') {
      return (
        <div className="profile-tab-panel--active">
          {followedAssociations.length === 0 ? (
            <p className="profile-empty">Aucune association suivie. Aucun événement à venir.</p>
          ) : (
            <>
              <ul className="profile-follow-list">
                {followedAssociations.map((a) => (
                  <li key={a.id} className="profile-follow-item">
                    <span className="profile-follow-item__avatar">{a.name?.charAt(0) || '?'}</span>
                    <div className="profile-follow-item__info">
                      <strong>{a.name}</strong>
                      <span>{[a.category, a.location].filter(Boolean).join(' · ') || 'Association'}</span>
                    </div>
                    <Link to={`/association/${a.id}`} className="profile-btn profile-btn--small">Voir</Link>
                    <button type="button" className="profile-unfollow-btn" onClick={() => handleUnfollow(a.id)}>Ne plus suivre</button>
                  </li>
                ))}
              </ul>
              <p className="profile-empty" style={{ marginTop: '1rem' }}>Aucun événement à venir.</p>
            </>
          )}
        </div>
      );
    }
    if (tab === 'projets') {
      return <p className="profile-empty">Aucun projet pour le moment.</p>;
    }
    if (tab === 'impact') {
      return (
        <div className="profile-impact-card">
          <span className="profile-impact-card__value">{displayImpact}</span>
          <span className="profile-impact-card__label">Points Impact</span>
          <p className="profile-impact-card__desc">Participez à des actions pour gagner des points.</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="page profile-page profile-page--user">
      <div className="profile-page__glass">
      <ProfileHeader
        displayName={displayName}
        username={handleStr.replace('@', '')}
        bio={bio}
        avatarLetter={displayName.charAt(0)}
        avatarUrl={user?.avatar_url ? (user.avatar_url.startsWith('http') ? user.avatar_url : UPLOAD_BASE + user.avatar_url) : null}
        isPremium={false}
        levelBadge={levelBadge}
        onPropositionClick={handlePropositionClick}
        propositionSent={propositionSent}
        propositionLoading={propositionLoading}
        onEditProfile={isUser ? () => openSettings('edit', { backFromEditCloses: true }) : undefined}
        propositionCtaLabel="Proposer une aide"
        propositionSentLabel="Aide proposée"
      />

      <ImpactStats
        pointsImpact={impactPoints}
        levelLabel={levelBadge?.label ?? 'Explorateur'}
        propositionsSent={propositionSent ? 1 : 0}
        propositionsAccepted={0}
        mounted={mounted}
      />

      <div className="profile-top-actions" aria-label="Actions du profil">
        <button type="button" className="profile-top-actions__btn" aria-label="Partager le profil">
          ↗
        </button>
        <button
          type="button"
          className="profile-top-actions__btn profile-top-actions__btn--settings"
          aria-label="Réglages"
          onClick={() => openSettings('list')}
        >
          ⚙ Réglages
        </button>
      </div>

      <ProfileTabs activeTab={tab} onTabChange={setTab}>
        {renderTabContent()}
      </ProfileTabs>

      <section className="profile-badges">
        <h3 className="profile-badges__title">Badges</h3>
        <div className="profile-badges__grid">
          {BADGES.map((b) => (
            <div
              key={b.id}
              className={`profile-badge-card ${levelBadge?.level === b.level ? 'profile-badge-card--current' : ''}`}
            >
              <span className="profile-badge-card__icon">{b.icon}</span>
              <span className="profile-badge-card__label">{b.label}</span>
            </div>
          ))}
        </div>
      </section>
      </div>

      {showAideModal && (
        <div className="profile-aide-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="profile-aide-modal-title">
          <div className="profile-aide-modal">
            <h2 id="profile-aide-modal-title" className="profile-aide-modal__title">Proposer une aide</h2>
            <form onSubmit={handleAideSubmit} className="profile-aide-modal__form">
              <label className="profile-aide-modal__label">Description de votre aide</label>
              <textarea
                name="aide-description"
                className="profile-aide-modal__textarea"
                placeholder="Décrivez brièvement l'aide que vous souhaitez proposer..."
                rows={4}
                required
              />
              <label className="profile-aide-modal__label">Type d'aide (optionnel)</label>
              <select name="aide-category" className="profile-aide-modal__select" aria-label="Type d'aide">
                <option value="">— Choisir —</option>
                <option value="humanitaire">Humanitaire</option>
                <option value="social">Social / Solidarité</option>
                <option value="sante">Santé</option>
                <option value="education">Éducation</option>
                <option value="environnement">Environnement</option>
                <option value="autre">Autres</option>
              </select>
              <div className="profile-aide-modal__actions">
                <button type="button" className="profile-btn profile-btn--outline" onClick={() => setShowAideModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="profile-btn profile-btn--primary" disabled={propositionLoading}>
                  {propositionLoading ? 'Envoi...' : 'Envoyer'}
                </button>
              </div>
            </form>
            <button type="button" className="profile-aide-modal__close" aria-label="Fermer" onClick={() => setShowAideModal(false)}>×</button>
          </div>
        </div>
      )}

      <Link to="/" state={{ openPage: 2 }} className="profile-fab" aria-label="Voir le fil">+</Link>
    </div>
  );
          })()
        )
      )}
    </ProtectedProfile>
  );
}
