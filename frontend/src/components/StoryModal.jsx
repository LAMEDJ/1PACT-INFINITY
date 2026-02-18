/**
 * Modal plein écran type story – ouverture au tap sur une card du feed.
 * Fermeture au tap ou Escape. Animation CSS uniquement.
 */
import { useEffect, useCallback } from 'react';

const DURATION = 180;

export default function StoryModal({ item, onClose }) {
  const handleKey = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!item) return;
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [item, handleKey]);

  if (!item) return null;

  const isVideo = item.isVideo || (item.url && /\.(mp4|webm|ogg)$/i.test(item.url));

  return (
    <div
      className="story-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Vue immersive"
      onClick={onClose}
    >
      <div className="story-modal__inner" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="story-modal__close"
          onClick={onClose}
          aria-label="Fermer la story"
        >
          ×
        </button>
        {isVideo ? (
          <video
            src={item.src}
            controls
            autoPlay
            playsInline
            className="story-modal__media"
          />
        ) : (
          <img src={item.src} alt="" className="story-modal__media" />
        )}
        {item.badge && <span className="story-modal__badge">{item.badge}</span>}
        {item.impact != null && (
          <span className="story-modal__impact">+{item.impact} aidés</span>
        )}
      </div>
    </div>
  );
}
