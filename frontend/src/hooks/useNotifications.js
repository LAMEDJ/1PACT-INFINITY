/**
 * Hook notifications – chargement uniquement si user connecté.
 * Mise à jour incrémentale, memoization, marquer comme lu à l'ouverture.
 */
import { useState, useCallback, useEffect, useRef } from 'react';
import { api } from '../api';

const POLL_INTERVAL_MS = 60000; // 1 min si pas de WebSocket

function mapNotification(n) {
  const created = n.created_at ? new Date(n.created_at) : null;
  const time = created ? created.toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';
  let title = 'Notification';
  let subtitle = '';
  let iconType = 'activity';
  switch (n.type) {
    case 'like':
      title = 'Nouveau like';
      subtitle = `${n.payload?.from_user_name || 'Un utilisateur'} a aimé une de vos publications.`;
      iconType = 'like';
      break;
    case 'comment':
      title = 'Nouveau commentaire';
      subtitle = `${n.payload?.from_name || 'Un utilisateur'} a commenté : "${(n.payload?.text || '').slice(0, 50)}…"`;
      iconType = 'comment';
      break;
    case 'impact_points':
      title = 'Points Impact gagnés';
      subtitle = `+${n.payload?.pointsAdded || 0} pts (total ${n.payload?.totalPoints || 0}).`;
      iconType = 'star';
      break;
    case 'impact_level_up':
      title = 'Niveau Impact augmenté';
      subtitle = `Bravo ! Niveau ${n.payload?.level}.`;
      iconType = 'star';
      break;
    case 'message':
      title = 'Nouveau message';
      subtitle = `${n.payload?.from_name || 'Message'} : "${(n.payload?.text || '').slice(0, 40)}…"`;
      iconType = 'message';
      break;
    default:
      title = 'Activité récente';
      subtitle = '';
  }
  return {
    id: n.id,
    type: n.type,
    title,
    subtitle,
    time,
    new: !n.is_read,
    iconType,
    createdAt: n.created_at,
  };
}

function formatRelative(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const diff = (Date.now() - d) / 60000;
  if (diff < 1) return "À l'instant";
  if (diff < 60) return `Il y a ${Math.floor(diff)} min`;
  if (diff < 1440) return `Il y a ${Math.floor(diff / 60)} h`;
  if (diff < 43200) return `Il y a ${Math.floor(diff / 1440)} j`;
  return d.toLocaleDateString('fr-FR');
}

export function useNotifications(user, options = {}) {
  const { enabled = true, onOpen } = options;
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const pollRef = useRef(null);

  const fetchNotifications = useCallback(() => {
    if (!user || !enabled) {
      setItems([]);
      return Promise.resolve();
    }
    setLoading(true);
    return api.notifications
      .list()
      .then((rows) => {
        const mapped = rows.map(mapNotification).map((n) => ({
          ...n,
          relativeTime: formatRelative(n.createdAt),
        }));
        setItems(mapped);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [user, enabled]);

  useEffect(() => {
    if (!user || !enabled) {
      setItems([]);
      return;
    }
    fetchNotifications();
    pollRef.current = setInterval(fetchNotifications, POLL_INTERVAL_MS);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [user?.id, enabled, fetchNotifications]);

  const markAllRead = useCallback(() => {
    if (!user) return Promise.resolve();
    return api.notifications.readAll().then(() => {
      setItems((prev) => prev.map((i) => ({ ...i, new: false })));
    }).catch(() => {});
  }, [user]);

  const unreadCount = items.filter((i) => i.new).length;

  return {
    items,
    loading,
    unreadCount,
    refetch: fetchNotifications,
    markAllRead,
    formatRelative,
  };
}
