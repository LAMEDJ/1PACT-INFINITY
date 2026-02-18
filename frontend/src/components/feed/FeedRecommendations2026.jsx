/**
 * Module recommandations – cartes premium scroll horizontal, inséré tous les 5–6 posts.
 * Comptes à découvrir basés sur les associations du fil (sans modifier le backend).
 */
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import './FeedRecommendations2026.css';

export default function FeedRecommendations2026({ posts = [], onClose }) {
  const suggestions = useMemo(() => {
    const seen = new Set();
    return (posts || [])
      .filter((p) => p.association_id && !seen.has(p.association_id))
      .slice(0, 5)
      .map((p) => {
        seen.add(p.association_id);
        return { id: p.association_id, name: p.association_name || 'Association' };
      });
  }, [posts]);

  if (suggestions.length === 0) return null;

  return (
    <section className="feed-rec-2026" aria-label="Suggestions">
      <div className="feed-rec-2026__head">
        <h3 className="feed-rec-2026__title">À découvrir</h3>
        {onClose && (
          <button type="button" className="feed-rec-2026__hide" onClick={onClose} aria-label="Masquer">
            Masquer
          </button>
        )}
      </div>
      <div className="feed-rec-2026__scroll">
        {suggestions.map((item) => (
          <Link
            key={item.id}
            to={`/association/${item.id}`}
            className="feed-rec-2026__card"
          >
            <div className="feed-rec-2026__avatar">
              {(item.name || 'A').charAt(0)}
            </div>
            <span className="feed-rec-2026__name">{item.name}</span>
            <span className="feed-rec-2026__cta">Voir</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
