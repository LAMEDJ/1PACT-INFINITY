/**
 * Carte publication style Instagram 2026 – header, média, actions, description, commentaires.
 * Double-tap like animé, lazy loading, micro-interactions.
 */
import { useState, useCallback, useRef, memo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UPLOAD_BASE } from '../../api';
import './FeedPostCard2026.css';

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const diff = (Date.now() - d) / 60000;
  if (diff < 60) return "À l'instant";
  if (diff < 1440) return `Il y a ${Math.floor(diff / 60)} h`;
  if (diff < 43200) return `Il y a ${Math.floor(diff / 1440)} j`;
  return d.toLocaleDateString('fr-FR');
}

function FeedPostCard2026({
  post,
  isLiked,
  likeCount,
  onLike,
  comments = [],
  onOpenComments,
  onCommentSubmit,
  commentInput = '',
  onCommentInputChange,
  sendingComment,
  onMessage,
  onParticipate,
  currentUser,
  engagementTrack,
  isCommentsOpen = false,
}) {
  const [showLikeBurst, setShowLikeBurst] = useState(false);
  const [expandedDesc, setExpandedDesc] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const imageRef = useRef(null);

  const imageUrl = post?.image_url
    ? (post.image_url.startsWith('http') ? post.image_url : UPLOAD_BASE + post.image_url)
    : null;
  const videoUrl = post?.video_url
    ? (post.video_url.startsWith('http') ? post.video_url : UPLOAD_BASE + post.video_url)
    : null;
  const text = post?.text || '';
  const truncate = 120;
  const needTruncate = text.length > truncate && !expandedDesc;
  const displayText = needTruncate ? text.slice(0, truncate) + '…' : text;

  const handleDoubleTap = useCallback(() => {
    if (!onLike) return;
    setShowLikeBurst(true);
    onLike(post.id);
    setTimeout(() => setShowLikeBurst(false), 600);
  }, [post?.id, onLike]);

  const handleLikeClick = useCallback(() => {
    onLike?.(post.id);
  }, [post?.id, onLike]);

  const commentCount = comments?.length ?? post?.comments ?? 0;
  const displayComments = (comments || []).slice(0, 2);

  return (
    <motion.article
      className="feed-card-2026"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      onViewportEnter={engagementTrack ? () => engagementTrack(post.id, 'view') : undefined}
      viewport={{ once: false, amount: 0.3 }}
    >
      {/* Header */}
      <header className="feed-card-2026__header">
        <Link to={`/association/${post.association_id}`} className="feed-card-2026__avatar-wrap">
          <div className="feed-card-2026__avatar">
            {(post.association_name || 'A').charAt(0)}
          </div>
        </Link>
        <div className="feed-card-2026__meta">
          <Link to={`/association/${post.association_id}`} className="feed-card-2026__name">
            {post.association_name || 'Association'}
            <span className="feed-card-2026__badge" aria-hidden="true">✓</span>
          </Link>
          <span className="feed-card-2026__location">1PACT</span>
        </div>
        <button
          type="button"
          className="feed-card-2026__options"
          aria-label="Options"
          onClick={() => setShowOptions(!showOptions)}
        >
          ⋯
        </button>
      </header>

      {/* Contenu média */}
      <div
        className="feed-card-2026__media-wrap"
        onDoubleClick={handleDoubleTap}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleDoubleTap()}
        aria-label="Double-clic pour aimer"
      >
        {showLikeBurst && (
          <motion.span
            className="feed-card-2026__like-burst"
            initial={{ scale: 0.5, opacity: 1 }}
            animate={{ scale: 1.2, opacity: 0 }}
            transition={{ duration: 0.6 }}
            aria-hidden
          >
            <svg className="feed-card-2026__burst-svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
          </motion.span>
        )}
        {imageUrl ? (
          <img
            ref={imageRef}
            src={imageUrl}
            alt=""
            className="feed-card-2026__media"
            loading="lazy"
            decoding="async"
          />
        ) : videoUrl ? (
          <video src={videoUrl} className="feed-card-2026__media" controls playsInline />
        ) : (
          <div className="feed-card-2026__media feed-card-2026__media--placeholder">
            <span className="feed-card-2026__placeholder-text">{(post.association_name || 'A').charAt(0)}</span>
          </div>
        )}
      </div>

      {/* Description (au-dessus des actions) */}
      <div className="feed-card-2026__desc">
        <p className="feed-card-2026__caption">
          <Link to={`/association/${post.association_id}`} className="feed-card-2026__caption-name">
            {post.association_name || 'Association'}
          </Link>
          {' '}
          {displayText}
          {needTruncate && (
            <button
              type="button"
              className="feed-card-2026__more"
              onClick={() => setExpandedDesc(true)}
            >
              plus
            </button>
          )}
        </p>
        {post.impact_points > 0 && (
          <p className="feed-card-2026__meta feed-card-2026__meta--top">
            <span className="feed-card-2026__hashtag">{post.impact_points} pts</span>
            {' · '}
            <span className="feed-card-2026__time">{formatDate(post.created_at)}</span>
          </p>
        )}
      </div>

      {/* Actions : Like, Commentaire, Participer, Contacter (sous la description) */}
      <div className="feed-card-2026__actions">
        <button
          type="button"
          className={`feed-card-2026__action ${isLiked ? 'feed-card-2026__action--liked' : ''}`}
          onClick={handleLikeClick}
          aria-label={isLiked ? 'Ne plus aimer' : 'J\'aime'}
        >
          <span className="feed-card-2026__action-icon">
            {isLiked ? (
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
            )}
          </span>
          {likeCount > 0 && <span className="feed-card-2026__action-count">{likeCount}</span>}
        </button>
        <button
          type="button"
          className="feed-card-2026__action"
          onClick={() => onOpenComments?.(post.id)}
          aria-label="Commenter"
        >
          <span className="feed-card-2026__action-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
          </span>
          {commentCount > 0 && <span className="feed-card-2026__action-count">{commentCount}</span>}
        </button>
        {onParticipate && (
          <button
            type="button"
            className="feed-card-2026__action"
            onClick={() => onParticipate?.(post)}
            aria-label="Participer"
          >
            <span className="feed-card-2026__action-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><circle cx="12" cy="12" r="10" /><path d="M12 8v8M8 12h8" /></svg>
            </span>
            <span className="feed-card-2026__action-label">Participer</span>
          </button>
        )}
        {onMessage && (
          <button
            type="button"
            className="feed-card-2026__action"
            onClick={() => onMessage?.(post)}
            aria-label="Contacter"
          >
            <span className="feed-card-2026__action-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><path d="m22 6-10 7L2 6" /></svg>
            </span>
            <span className="feed-card-2026__action-label">Contacter</span>
          </button>
        )}
      </div>

      {/* Commentaires (2 visibles + voir tous) */}
      {displayComments.length > 0 && (
        <div className="feed-card-2026__comments-preview">
          <button
            type="button"
            className="feed-card-2026__comments-toggle"
            onClick={() => onOpenComments?.(post.id)}
          >
            Voir les {commentCount} commentaire{commentCount !== 1 ? 's' : ''}
          </button>
          <ul className="feed-card-2026__comments-list">
            {displayComments.map((c) => (
              <li key={c.id}>
                <Link to={`/association/${post.association_id}`} className="feed-card-2026__comment-author">
                  {c.user_name || c.association_name || 'Anonyme'}
                </Link>
                {' '}
                <span className="feed-card-2026__comment-text">{c.text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Input commentaire (sticky quand ouvert) */}
      {isCommentsOpen && onCommentSubmit && (
        <div className="feed-card-2026__comment-form-wrap">
          <form
            className="feed-card-2026__comment-form"
            onSubmit={(e) => {
              e.preventDefault();
              onCommentSubmit?.(post.id);
            }}
          >
            <input
              type="text"
              placeholder="Ajouter un commentaire..."
              value={commentInput}
              onChange={(e) => onCommentInputChange?.(e.target.value)}
              className="feed-card-2026__comment-input"
              disabled={!currentUser || sendingComment}
              maxLength={2000}
              aria-label="Commentaire"
            />
            <button
              type="submit"
              className="feed-card-2026__comment-submit"
              disabled={sendingComment || !(commentInput || '').trim()}
            >
              Publier
            </button>
          </form>
        </div>
      )}
    </motion.article>
  );
}

export default memo(FeedPostCard2026);
