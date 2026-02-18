/**
 * Profil Association – refonte impact-driven, Instagram-like.
 * Header moderne, stats d’impact, bio mission, tabs fluides, projets, feed 2 cols, Agir maintenant.
 */
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, UPLOAD_BASE } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import StoryModal from '../components/StoryModal';
import './PageCommon.css';
import './AssociationProfilePage.css';
import '../components/StoryModal.css';

const COUNT_UP_MS = 500;
const TABS = ['publications', 'projets', 'evenements', 'medias', 'soutiens'];

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

export default function AssociationProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isUser, refreshUser } = useAuth();
  const { addToast } = useToast();
  const [association, setAssociation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [followed, setFollowed] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('publications');
  const [mounted, setMounted] = useState(false);
  const [storyItem, setStoryItem] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    api.associations
      .get(id)
      .then((data) => {
        setAssociation(data);
        setFollowed(!!data.followed);
      })
      .catch(() => setAssociation(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleContact = useCallback(async () => {
    if (!user) {
      navigate('/login?redirect=' + encodeURIComponent('/association/' + id));
      return;
    }
    try {
      const { id: convId } = await api.conversations.create(null, Number(id));
      navigate('/', { state: { openConv: convId } });
    } catch {
      navigate('/');
    }
  }, [user, id, navigate]);

  const handleFollow = useCallback(async () => {
    if (!isUser || !user) return;
    setFollowLoading(true);
    try {
      if (followed) {
        await api.follows.unfollow(Number(id));
        setFollowed(false);
      } else {
        await api.follows.follow(Number(id));
        setFollowed(true);
        refreshUser?.();
      }
    } catch (e) {
      addToast(e?.message || 'Erreur', 'error');
    } finally {
      setFollowLoading(false);
    }
  }, [id, followed, isUser, user, refreshUser, addToast]);

  const openStory = useCallback((item) => setStoryItem(item), []);
  const closeStory = useCallback(() => setStoryItem(null), []);

  if (loading) {
    return (
      <div className="page asso-page">
        <div className="asso-skeleton asso-skeleton--header" />
        <div className="asso-skeleton asso-skeleton--stats" />
        <div className="asso-skeleton asso-skeleton--body" />
      </div>
    );
  }

  if (!association) {
    return (
      <div className="page asso-page">
        <div className="page-inner">
          <button type="button" className="back-link" onClick={() => navigate('/')}>
            ← Retour
          </button>
          <p>Association introuvable.</p>
          <button type="button" className="btn-primary" onClick={() => navigate('/')}>
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  const publications = association.publications || [];
  const publicationsCount = association.publicationsCount ?? 0;
  const subscribersCount = association.subscribersCount ?? 0;
  const profileViews = association.profile_views ?? 0;
  const impactPoints = association.impact_points ?? 0;
  const verified = !!association.verified;
  const handleStr = '@' + (association.name || '').replace(/\s+/g, '').toLowerCase().slice(0, 20);

  const displayProposition = useCountUp(publicationsCount, mounted);
  const displayAbonnes = useCountUp(subscribersCount, mounted);
  const displayExplorateurs = useCountUp(profileViews, mounted);
  const displayImpact = useCountUp(impactPoints, mounted);

  const mediaItems = useMemo(
    () =>
      publications
        .filter((p) => p.image_url || p.video_url)
        .map((p) => ({
          id: p.id,
          src: UPLOAD_BASE + (p.image_url || p.video_url),
          isVideo: !!p.video_url,
          badge: 'Publication',
          impact: null,
        })),
    [publications]
  );

  const feedCards = useMemo(
    () =>
      publications.slice(0, 12).map((p) => ({
        id: p.id,
        src: p.image_url ? UPLOAD_BASE + p.image_url : null,
        text: p.text,
        badge: 'Projet',
        impact: 32,
      })),
    [publications]
  );

  /* Projets : aucune donnée mock – affichage vide ou future API projets */
  const projects = useMemo(() => [], []);

  const logoUrl = association.logo_url?.startsWith('/') ? UPLOAD_BASE + association.logo_url : association.logo_url;
  const bannerUrl = association.banner_url?.startsWith('/') ? UPLOAD_BASE + association.banner_url : association.banner_url;

  return (
    <div className="page asso-page">
      <button type="button" className="asso-back" onClick={() => navigate('/')} aria-label="Retour">
        ←
      </button>

      <header className="asso-header">
        <div className="asso-header__banner" style={bannerUrl ? { backgroundImage: `url(${bannerUrl})` } : undefined}>
          {!bannerUrl && <div className="asso-header__banner-gradient" />}
        </div>
        <div className="asso-header__profile">
          <div className="asso-header__logo-wrap">
            {logoUrl ? (
              <img src={logoUrl} alt="" className="asso-header__logo" loading="eager" />
            ) : (
              <span className="asso-header__logo-initial">{association.name?.charAt(0) || '?'}</span>
            )}
          </div>
          <h1 className="asso-header__name">{association.name}</h1>
          <p className="asso-header__handle">{handleStr}</p>
          {verified && <span className="asso-header__verified" aria-label="Vérifié">✓</span>}
          <div className="asso-header__actions">
            <button
              type="button"
              className={`asso-btn asso-btn--primary ${followed ? 'asso-btn--followed' : ''}`}
              onClick={handleFollow}
              disabled={followLoading}
            >
              {followed ? '✓ Abonné' : 'S\'abonner'}
            </button>
            <button type="button" className="asso-btn asso-btn--secondary" onClick={handleContact}>
              🤝 Avis
            </button>
            <button type="button" className="asso-btn asso-btn--secondary" onClick={handleContact}>
              💬 Message
            </button>
          </div>
        </div>
      </header>

      <section className="asso-stats">
        <div className="asso-stats__item">
          <span className="asso-stats__value">{displayProposition}</span>
          <span className="asso-stats__label">🤝 Proposition</span>
        </div>
        <div className="asso-stats__item">
          <span className="asso-stats__value">{displayAbonnes}</span>
          <span className="asso-stats__label">⭐ Abonnés</span>
        </div>
        <div className="asso-stats__item">
          <span className="asso-stats__value">{displayExplorateurs}</span>
          <span className="asso-stats__label">🌍 Explorateurs actifs</span>
        </div>
        <div className="asso-stats__item">
          <span className="asso-stats__value">{displayImpact}</span>
          <span className="asso-stats__label">⚡ Points Impact</span>
        </div>
      </section>

      <section className="asso-bio">
        <p className="asso-bio__mission">{association.bio || 'Agir ensemble pour un impact réel.'}</p>
        <p className="asso-bio__desc">
          {association.category && `${association.category}. `}
          {association.location && `📍 ${association.location}`}
        </p>
        <div className="asso-bio__tags">
          {[association.category, association.public_cible].filter(Boolean).map((tag) => (
            <span key={tag} className="asso-tag">{tag}</span>
          ))}
        </div>
        <button type="button" className="asso-cta" onClick={() => setActiveTab('projets')}>Voir les projets</button>
      </section>

      <div className="asso-tabs">
        <div className="asso-tabs__scroll">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`asso-tabs__tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'publications' && 'Publications'}
              {tab === 'projets' && 'Projets'}
              {tab === 'evenements' && 'Événements'}
              {tab === 'medias' && 'Médias'}
              {tab === 'soutiens' && 'Soutiens'}
            </button>
          ))}
        </div>
      </div>

      <div className="asso-content">
        {activeTab === 'publications' && (
          <div className="asso-panel asso-panel--active">
            <ul className="asso-feed">
              {feedCards.map((card) => (
                <li key={card.id} className="asso-feed__card" onClick={() => card.src && openStory({ src: card.src, badge: card.badge, impact: card.impact })}>
                  <div className="asso-feed__thumb">
                    {card.src ? (
                      <img src={card.src} alt="" loading="lazy" />
                    ) : (
                      <div className="asso-feed__placeholder" />
                    )}
                    {card.badge && <span className="asso-feed__badge">{card.badge}</span>}
                    {card.impact != null && <span className="asso-feed__impact">+{card.impact} aidés</span>}
                  </div>
                </li>
              ))}
            </ul>
            {feedCards.length === 0 && <p className="asso-empty">Aucune publication.</p>}
          </div>
        )}

        {activeTab === 'projets' && (
          <div className="asso-panel asso-panel--active">
            <div className="asso-projects">
              {projects.length === 0 ? (
                <p className="asso-empty">Aucun projet pour le moment. Contacter l'association pour proposer une idée.</p>
              ) : (
                projects.map((proj) => (
                  <article key={proj.id} className="asso-project-card">
                    <div className="asso-project-card__cover">
                      <div className="asso-project-card__cover-placeholder" />
                    </div>
                    <h3 className="asso-project-card__title">{proj.title}</h3>
                    <p className="asso-project-card__location">📍 {proj.location}</p>
                    <div className="asso-project-card__progress">
                      <div className="asso-project-card__progress-bar" style={{ width: proj.progress + '%' }} />
                    </div>
                    <div className="asso-project-card__footer">
                      <span>{proj.participants} participants</span>
                      <button type="button" className="asso-btn asso-btn--small">Soutenir</button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'evenements' && (
          <div className="asso-panel asso-panel--active">
            <p className="asso-empty">Aucun événement à venir.</p>
          </div>
        )}

        {activeTab === 'medias' && (
          <div className="asso-panel asso-panel--active">
            <div className="asso-media-grid">
              {mediaItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="asso-media-grid__item"
                  onClick={() => openStory(item)}
                >
                  {item.isVideo ? (
                    <video src={item.src} muted preload="metadata" />
                  ) : (
                    <img src={item.src} alt="" loading="lazy" />
                  )}
                </button>
              ))}
            </div>
            {mediaItems.length === 0 && <p className="asso-empty">Aucun média.</p>}
          </div>
        )}

        {activeTab === 'soutiens' && (
          <div className="asso-panel asso-panel--active">
            <p className="asso-empty">Soutiens à venir.</p>
          </div>
        )}
      </div>

      <section className="asso-agir">
        <h3 className="asso-agir__title">Agir maintenant</h3>
        <div className="asso-agir__grid">
          <button type="button" className="asso-agir__btn" onClick={handleContact}>Faire un don</button>
          <button type="button" className="asso-agir__btn" onClick={handleContact}>Devenir bénévole</button>
          <button type="button" className="asso-agir__btn" onClick={() => setActiveTab('evenements')}>Participer à un événement</button>
          <button type="button" className="asso-agir__btn" onClick={() => { try { navigator.share({ title: association?.name, url: window.location.href }); } catch { navigator.clipboard?.writeText(window.location.href); } }}>Partager</button>
        </div>
      </section>

      <StoryModal item={storyItem} onClose={closeStory} />
    </div>
  );
}
