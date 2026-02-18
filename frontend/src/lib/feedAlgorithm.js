/**
 * Algorithme de tri du fil – 100 % côté client.
 * Pour toi = score combiné (récence, likes, commentaires, engagement).
 * Récent = date desc. Populaire = likes desc. Proche = idem récent (pas de géo user).
 */

export function scorePost(post, { likeCount = 0, commentCount = 0, viewDuration = 0 }) {
  const age = post.created_at ? (Date.now() - new Date(post.created_at)) / 3600000 : 24;
  const recency = Math.max(0, 1 - age / 168); // 1 semaine = 0
  const likes = Math.log1p(likeCount);
  const comments = Math.log1p(commentCount);
  const engagement = (likes * 2 + comments) / 3;
  const timeScore = Math.min(1, viewDuration / 5); // 5s = max
  return recency * 0.4 + engagement * 0.35 + timeScore * 0.25;
}

export function sortPosts(posts, mode, likeCounts = {}, engagementMap = {}) {
  const list = [...(posts || [])];
  const getLikes = (p) => likeCounts[p.id] ?? p.likes ?? 0;
  const getComments = (p) => p.comments ?? 0;
  const getEngagement = (p) => engagementMap[p.id] ?? { viewDuration: 0 };

  if (mode === 'recent') {
    list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return list;
  }
  if (mode === 'popular') {
    list.sort((a, b) => getLikes(b) - getLikes(a));
    return list;
  }
  if (mode === 'near' || mode === 'for_you') {
    // near: on n'a pas la position user, on trie par récence
    if (mode === 'near') {
      list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      return list;
    }
    // for_you: score combiné
    list.sort((a, b) => {
      const scoreA = scorePost(a, {
        likeCount: getLikes(a),
        commentCount: getComments(a),
        viewDuration: getEngagement(a).viewDuration || 0,
      });
      const scoreB = scorePost(b, {
        likeCount: getLikes(b),
        commentCount: getComments(b),
        viewDuration: getEngagement(b).viewDuration || 0,
      });
      return scoreB - scoreA;
    });
    return list;
  }
  return list;
}
