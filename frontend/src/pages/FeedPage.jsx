/**
 * Fil d'actualité – Refonte 2026 : colonne 650px, stories, tri algorithmique,
 * cartes type Instagram, recommandations, messagerie intégrée, scroll progress, pull-to-refresh.
 */
import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import UnifiedActionContainer from '../components/feed/UnifiedActionContainer';
import QuickNavGrid from '../components/feed/QuickNavGrid';
import AuthCTAWidget from '../components/feed/AuthCTAWidget';
import FeedStories2026 from '../components/feed/FeedStories2026';
import FeedPostCard2026 from '../components/feed/FeedPostCard2026';
import FeedRecommendations2026 from '../components/feed/FeedRecommendations2026';
import { sortPosts } from '../lib/feedAlgorithm';
import { applySearchFilters } from '../lib/searchFilters';
import './PageCommon.css';
import './FeedPage.css';
import './FeedPage2026.css';

export default function FeedPage({ onGoToPage }) {
  const { user, isUser, isAssociation, refreshUser } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likedIds, setLikedIds] = useState(new Set());
  const [likeCounts, setLikeCounts] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');
  const [publicCible, setPublicCible] = useState('');
  const [geo, setGeo] = useState(null);
  const [typeRecherche, setTypeRecherche] = useState('');
  const [searchCategories, setSearchCategories] = useState([]);
  const [locationPlace, setLocationPlace] = useState('');
  const [openCommentsId, setOpenCommentsId] = useState(null);
  const [commentsByPost, setCommentsByPost] = useState({});
  const [commentInput, setCommentInput] = useState({});
  const [sendingComment, setSendingComment] = useState(false);
  const [proposalLoading, setProposalLoading] = useState(false);
  const [proposalMessage, setProposalMessage] = useState(null);
  const [algorithmMode, setAlgorithmMode] = useState('for_you');
  const [messagePanel, setMessagePanel] = useState({ open: false, associationId: null, associationName: '' });
  const [messageQuickText, setMessageQuickText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [newPostsAvailable, setNewPostsAvailable] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [ptrStatus, setPtrStatus] = useState(''); // 'pull' | 'release' | 'loading' | ''

  const scrollColumnRef = useRef(null);
  const engagementMapRef = useRef({});
  const ptrStartYRef = useRef(0);

  const subscriptionLevel = user?.subscriptionLevel ?? 'free';
  // Lire le mode d'action depuis la navigation (bouton "Publier" dans Layout/Profile)
  const unifiedActionMode = location.state?.unifiedActionMode || null;

  const fetchPosts = useCallback(() => {
    setLoading(true);
    const params = { limit: 50 };
    if (category) params.category = category;
    if (publicCible) params.public_cible = publicCible;
    if (searchQuery.trim()) params.q = searchQuery.trim();
    if (geo?.lat != null && geo?.lng != null) {
      params.lat = geo.lat;
      params.lng = geo.lng;
      if (geo.radius_km) params.radius_km = geo.radius_km;
    }
    return api.publications.list(params)
      .then((data) => {
        setPosts(data);
        setLikeCounts(data.reduce((acc, p) => ({ ...acc, [p.id]: p.likes || 0 }), {}));
      })
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, [category, publicCible, searchQuery, geo]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleSearch = useCallback((filters) => {
    setSearchQuery(filters.q ?? '');
    setCategory(filters.category ?? '');
    setPublicCible(filters.public_cible ?? '');
    setTypeRecherche(filters.type_recherche ?? '');
    setSearchCategories(Array.isArray(filters.categories) ? filters.categories : []);
    setLocationPlace(filters.location_place ?? '');
    if (filters.around_me && filters.lat != null && filters.lng != null) {
      setGeo({
        lat: filters.lat,
        lng: filters.lng,
        radius_km: filters.radius_km,
      });
    } else {
      setGeo(null);
    }
  }, []);

  const handlePropose = useCallback(async (data) => {
    if (!user) {
      setProposalMessage({ type: 'error', text: 'Connectez-vous pour envoyer une proposition.' });
      setTimeout(() => setProposalMessage(null), 4000);
      return;
    }
    setProposalLoading(true);
    setProposalMessage(null);
    try {
      await api.propositions.create({
        category: data.category || '',
        public_cible: data.public_cible || '',
        titre: data.titre || '',
        description: data.description || '',
      });
      setProposalMessage({ type: 'success', text: 'Proposition enregistrée. Merci !' });
      setTimeout(() => setProposalMessage(null), 4000);
    } catch (e) {
      setProposalMessage({ type: 'error', text: e?.message || 'Erreur lors de l\'envoi.' });
      setTimeout(() => setProposalMessage(null), 5000);
    } finally {
      setProposalLoading(false);
    }
  }, [user]);

  const handlePublished = useCallback(() => {
    // Rafraîchir les posts après publication
    fetchPosts();
  }, [fetchPosts]);

  const loadComments = (postId) => {
    if (openCommentsId === postId) {
      setOpenCommentsId(null);
      return;
    }
    setOpenCommentsId(postId);
    api.publications.comments(postId).then((list) => {
      setCommentsByPost((prev) => ({ ...prev, [postId]: list }));
    }).catch(() => setCommentsByPost((prev) => ({ ...prev, [postId]: [] })));
  };

  const submitComment = async (postId) => {
    const text = (commentInput[postId] || '').trim();
    if (!text || !user) return;
    setSendingComment(true);
    try {
      await api.publications.addComment(postId, text);
      setCommentInput((prev) => ({ ...prev, [postId]: '' }));
      const list = await api.publications.comments(postId);
      setCommentsByPost((prev) => ({ ...prev, [postId]: list }));
      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, comments: list.length } : p)));
      refreshUser?.();
    } catch (e) {
      addToast(e?.message || 'Erreur envoi commentaire', 'error');
    } finally {
      setSendingComment(false);
    }
  };

  const toggleLike = async (id) => {
    if (!isUser || !user) return;
    const prev = likeCounts[id] ?? 0;
    const wasLiked = likedIds.has(id);
    setLikedIds((s) => { const n = new Set(s); if (wasLiked) n.delete(id); else n.add(id); return n; });
    setLikeCounts((c) => ({ ...c, [id]: prev + (wasLiked ? -1 : 1) }));
    try {
      await api.publications.like(id);
      if (!wasLiked) refreshUser?.();
    } catch {
      setLikedIds((s) => { const n = new Set(s); if (wasLiked) n.add(id); else n.delete(id); return n; });
      setLikeCounts((c) => ({ ...c, [id]: prev }));
    }
  };

  const handleMessageAssociation = async (post) => {
    if (!post?.association_id) return;
    // Empêcher de se message soi-même
    if (user && user.type === 'association' && Number(user.id) === Number(post.association_id)) {
      return;
    }
    if (!user) {
      navigate('/login?redirect=' + encodeURIComponent('/'));
      return;
    }
    try {
      const { id: convId } = await api.conversations.create(null, Number(post.association_id));
      navigate('/', { state: { openConv: convId } });
    } catch (e) {
      // En cas d'erreur, on renvoie simplement vers la messagerie
      navigate('/', { state: { openPage: 3 } });
    }
  };

  const handleParticipate = async (post) => {
    if (!post?.association_id) return;
    if (!user) {
      navigate('/login?redirect=' + encodeURIComponent('/'));
      return;
    }
    if (user.type === 'association' && Number(user.id) === Number(post.association_id)) return;
    try {
      const { id: convId } = await api.conversations.create(null, Number(post.association_id));
      const text = "J'aimerais bien participer, c'est toujours possible ?";
      await api.conversations.sendMessage(convId, text);
      navigate('/', { state: { openConv: convId } });
    } catch (e) {
      navigate('/', { state: { openPage: 3 } });
    }
  };

  const openMessagePanel = useCallback((post) => {
    if (!post?.association_id) return;
    if (user?.type === 'association' && Number(user.id) === Number(post.association_id)) return;
    if (!user) {
      navigate('/login?redirect=' + encodeURIComponent('/'));
      return;
    }
    setMessagePanel({ open: true, associationId: Number(post.association_id), associationName: post.association_name || 'Association' });
    setMessageQuickText('');
  }, [user, navigate]);

  const closeMessagePanel = useCallback(() => {
    setMessagePanel((p) => ({ ...p, open: false }));
    setMessageQuickText('');
  }, []);

  const sendQuickMessage = useCallback(async () => {
    const text = messageQuickText.trim();
    if (!text || !messagePanel.associationId || sendingMessage) return;
    setSendingMessage(true);
    try {
      const { id: convId } = await api.conversations.create(null, messagePanel.associationId);
      await api.conversations.sendMessage(convId, text);
      addToast('Message envoyé', 'success');
      closeMessagePanel();
      navigate('/', { state: { openConv: convId } });
    } catch (e) {
      addToast(e?.message || 'Erreur envoi', 'error');
    } finally {
      setSendingMessage(false);
    }
  }, [messageQuickText, messagePanel.associationId, sendingMessage, closeMessagePanel, navigate, addToast]);

  const handleScrollColumn = useCallback(() => {
    const el = scrollColumnRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const total = scrollHeight - clientHeight;
    setScrollProgress(total > 0 ? Math.min(100, (scrollTop / total) * 100) : 0);
  }, []);

  const handleRefreshFromNewPosts = useCallback(() => {
    setNewPostsAvailable(false);
    scrollColumnRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const doPullRefresh = useCallback(() => {
    setPtrStatus('loading');
    fetchPosts().finally(() => {
      setPtrStatus('');
      if (scrollColumnRef.current && scrollColumnRef.current.scrollTop > 100) {
        setNewPostsAvailable(true);
      }
    });
  }, [fetchPosts]);

  useEffect(() => {
    const el = scrollColumnRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScrollColumn, { passive: true });
    return () => el.removeEventListener('scroll', handleScrollColumn);
  }, [handleScrollColumn, loading]);

  const handlePtrTouchStart = useCallback((e) => {
    if (scrollColumnRef.current?.scrollTop === 0) ptrStartYRef.current = e.touches[0]?.clientY ?? 0;
  }, []);

  const handlePtrTouchMove = useCallback((e) => {
    if (scrollColumnRef.current?.scrollTop !== 0 || !ptrStartYRef.current) return;
    const delta = (e.touches[0]?.clientY ?? 0) - ptrStartYRef.current;
    if (delta > 60) setPtrStatus('release');
    else if (delta < 20) setPtrStatus('');
  }, []);

  const handlePtrTouchEnd = useCallback(() => {
    if (ptrStatus === 'release') {
      doPullRefresh();
    } else {
      setPtrStatus('');
    }
    ptrStartYRef.current = 0;
  }, [ptrStatus, doPullRefresh]);

  const engagementTrack = useCallback((postId, type, value) => {
    if (type === 'view' && value === undefined) {
      const t = Date.now();
      return () => {
        const duration = (Date.now() - t) / 1000;
        engagementMapRef.current[postId] = { ...engagementMapRef.current[postId], viewDuration: (engagementMapRef.current[postId]?.viewDuration || 0) + duration };
      };
    }
  }, []);

  const postsToShow = useMemo(
    () =>
      applySearchFilters(posts, {
        typeRecherche,
        searchCategories,
        locationPlace,
        searchQuery,
      }),
    [posts, typeRecherche, searchCategories, locationPlace, searchQuery]
  );
  const sortedPosts = sortPosts(postsToShow, algorithmMode, likeCounts, engagementMapRef.current);
  const RECOMMENDATION_INTERVAL = 5;
  const feedItems = [];
  sortedPosts.forEach((post, index) => {
    feedItems.push({ type: 'post', post, key: `post-${post.id}` });
    if ((index + 1) % RECOMMENDATION_INTERVAL === 0 && index < sortedPosts.length - 1) {
      feedItems.push({ type: 'recommendations', key: `rec-${index}` });
    }
  });

  return (
    <div className="page feed-page feed-page-2026">
      <div className="feed-2026__progress" role="presentation" aria-hidden>
        <div className="feed-2026__progress-bar" style={{ width: `${scrollProgress}%` }} />
      </div>

      <div className="page-inner feed-inner">
        <UnifiedActionContainer
          initialMode={unifiedActionMode}
          onSearch={handleSearch}
          onPropose={handlePropose}
          onPublished={handlePublished}
          subscriptionLevel={subscriptionLevel}
          user={user}
          isAssociation={isAssociation}
          initialSearchQuery={searchQuery}
          initialSearchCategory={category}
          initialSearchCategories={searchCategories}
          initialSearchPublicCible={publicCible}
          initialSearchTypeRecherche={typeRecherche}
          initialSearchLocationPlace={locationPlace}
          proposalLoading={proposalLoading}
        />

        <div
          className="feed-2026__scroll-container"
          ref={scrollColumnRef}
          onScroll={handleScrollColumn}
          onTouchStart={handlePtrTouchStart}
          onTouchMove={handlePtrTouchMove}
          onTouchEnd={handlePtrTouchEnd}
        >
          {ptrStatus && (
            <div className="feed-2026__ptr" role="status">
              {ptrStatus === 'loading' ? 'Actualisation…' : ptrStatus === 'release' ? 'Relâchez pour actualiser' : 'Tirez pour actualiser'}
            </div>
          )}
          <div className="feed-2026__column">
            <header className="feed-2026__hero feed-hero">
              {user && (
                <p className="feed-2026__hero-user feed-hero-user">Bonjour, <strong>{user.name}</strong></p>
              )}
            </header>

            {proposalMessage && (
              <div className={`feed-proposal-message feed-proposal-message--${proposalMessage.type}`} role="status">
                {proposalMessage.text}
              </div>
            )}

            {!user && <AuthCTAWidget />}

            <FeedStories2026 posts={posts} />

            {newPostsAvailable && (
              <button type="button" className="feed-2026__new-posts" onClick={handleRefreshFromNewPosts}>
                Voir les nouveaux contenus
              </button>
            )}

            <section className="feed-2026__list" aria-label="Fil d’actualité">
              {loading && !posts.length ? (
                <>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="feed-2026-skeleton">
                      <div className="feed-2026-skeleton__header">
                        <div className="feed-2026-skeleton__avatar" />
                        <div className="feed-2026-skeleton__line" />
                      </div>
                      <div className="feed-2026-skeleton__media" />
                    </div>
                  ))}
                </>
              ) : (
                <>
                  {feedItems.map((item) => {
                    if (item.type === 'recommendations') {
                      return <FeedRecommendations2026 key={item.key} posts={sortedPosts} />;
                    }
                    const { post } = item;
                    const isLiked = likedIds.has(post.id);
                    const likeCount = likeCounts[post.id] ?? post.likes ?? 0;
                    const comments = commentsByPost[post.id] ?? [];
                    return (
                      <FeedPostCard2026
                        key={item.key}
                        post={post}
                        isLiked={isLiked}
                        likeCount={likeCount}
                        onLike={() => toggleLike(post.id)}
                        comments={comments}
                        onOpenComments={() => loadComments(post.id)}
                        onCommentSubmit={() => submitComment(post.id)}
                        commentInput={commentInput[post.id] || ''}
                        onCommentInputChange={(value) => setCommentInput((prev) => ({ ...prev, [post.id]: value }))}
                        sendingComment={sendingComment}
                        onMessage={() => openMessagePanel(post)}
                        onParticipate={() => handleParticipate(post)}
                        currentUser={user}
                        engagementTrack={engagementTrack}
                        isCommentsOpen={openCommentsId === post.id}
                      />
                    );
                  })}
                  {!loading && posts.length === 0 && (
                    <p className="feed-empty">Aucune publication.</p>
                  )}
                </>
              )}
            </section>
          </div>
        </div>

        {messagePanel.open && (
          <div className="feed-2026__message-panel-overlay" onClick={closeMessagePanel} role="presentation" aria-hidden />
        )}
        {messagePanel.open && (
          <div className="feed-2026__message-panel" role="dialog" aria-label="Envoyer un message">
            <div className="feed-2026__message-panel-header">
              <span>Message à {messagePanel.associationName}</span>
              <button type="button" className="feed-2026__message-panel-close" onClick={closeMessagePanel} aria-label="Fermer">×</button>
            </div>
            <div className="feed-2026__message-panel-body">
              <input
                type="text"
                placeholder="Écrire un message..."
                value={messageQuickText}
                onChange={(e) => setMessageQuickText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendQuickMessage()}
                disabled={sendingMessage}
                autoFocus
              />
              <button type="button" className="btn-primary" onClick={sendQuickMessage} disabled={sendingMessage || !messageQuickText.trim()}>
                {sendingMessage ? 'Envoi…' : 'Envoyer'}
              </button>
            </div>
          </div>
        )}

        <QuickNavGrid onGoToPage={onGoToPage} />
      </div>
    </div>
  );
}
