/**
 * Stories en haut du fil – scroll horizontal, avatars avec gradient, viewer fullscreen.
 * Basé sur les publications existantes (une story par association = dernière publication).
 */
import { useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { UPLOAD_BASE } from '../../api';
import './FeedStories2026.css';

export default function FeedStories2026({ posts = [] }) {
  const [viewerStory, setViewerStory] = useState(null);
  const [viewerIndex, setViewerIndex] = useState(0);

  // Une "story" par association = la publication la plus récente
  const stories = useMemo(() => {
    const byAssoc = new Map();
    (posts || []).forEach((p) => {
      if (!byAssoc.has(p.association_id)) byAssoc.set(p.association_id, p);
    });
    return Array.from(byAssoc.values()).slice(0, 12);
  }, [posts]);

  const openViewer = useCallback((post, index) => {
    setViewerStory(post);
    setViewerIndex(index);
  }, []);

  const closeViewer = useCallback(() => setViewerStory(null), []);

  const goPrev = useCallback(() => {
    if (viewerIndex <= 0) return;
    setViewerIndex((i) => i - 1);
    setViewerStory(stories[viewerIndex - 1]);
  }, [viewerIndex, stories]);

  const goNext = useCallback(() => {
    if (viewerIndex >= stories.length - 1) {
      closeViewer();
      return;
    }
    setViewerIndex((i) => i + 1);
    setViewerStory(stories[viewerIndex + 1]);
  }, [viewerIndex, stories, closeViewer]);

  if (stories.length === 0) return null;

  return (
    <>
      <section className="feed-stories-2026" aria-label="Stories">
        <div className="feed-stories-2026__scroll">
          {stories.map((post, index) => {
            const img = post.image_url
              ? (post.image_url.startsWith('http') ? post.image_url : UPLOAD_BASE + post.image_url)
              : null;
            return (
              <button
                key={`${post.association_id}-${post.id}`}
                type="button"
                className="feed-stories-2026__item"
                onClick={() => openViewer(post, index)}
                aria-label={`Story ${post.association_name || 'Association'}`}
              >
                <div className="feed-stories-2026__ring">
                  <div
                    className="feed-stories-2026__avatar"
                    style={img ? { backgroundImage: `url(${img})`, backgroundSize: 'cover' } : undefined}
                  >
                    {!img && (post.association_name || 'A').charAt(0)}
                  </div>
                </div>
                <span className="feed-stories-2026__label">
                  {(post.association_name || 'Asso').slice(0, 8)}
                  {(post.association_name || '').length > 8 ? '…' : ''}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <AnimatePresence>
        {viewerStory && (
          <motion.div
            className="feed-stories-viewer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            aria-label="Story"
          >
            <div className="feed-stories-viewer__progress">
              {stories.map((_, i) => (
                <div key={i} className="feed-stories-viewer__progress-track">
                  <div
                    className="feed-stories-viewer__progress-fill"
                    style={{ width: i < viewerIndex ? '100%' : i === viewerIndex ? '50%' : '0%' }}
                  />
                </div>
              ))}
            </div>
            <button
              type="button"
              className="feed-stories-viewer__close"
              onClick={closeViewer}
              aria-label="Fermer"
            >
              ✕
            </button>
            <div
              className="feed-stories-viewer__zone feed-stories-viewer__zone--left"
              onClick={goPrev}
              aria-hidden
            />
            <div
              className="feed-stories-viewer__zone feed-stories-viewer__zone--right"
              onClick={goNext}
              aria-hidden
            />
            <div className="feed-stories-viewer__content">
              {viewerStory.image_url ? (
                <img
                  src={
                    viewerStory.image_url.startsWith('http')
                      ? viewerStory.image_url
                      : UPLOAD_BASE + viewerStory.image_url
                  }
                  alt=""
                  className="feed-stories-viewer__media"
                />
              ) : (
                <div className="feed-stories-viewer__placeholder">
                  <span className="feed-stories-viewer__placeholder-letter">
                    {(viewerStory.association_name || 'A').charAt(0)}
                  </span>
                  <p className="feed-stories-viewer__placeholder-text">{viewerStory.text?.slice(0, 80)}…</p>
                </div>
              )}
              <div className="feed-stories-viewer__footer">
                <Link
                  to={`/association/${viewerStory.association_id}`}
                  className="feed-stories-viewer__name"
                  onClick={closeViewer}
                >
                  {viewerStory.association_name || 'Association'}
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
