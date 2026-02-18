/**
 * Navbar intelligente : icônes Quêtes + Notifications à droite du header.
 * Lazy load dropdown (charger quêtes seulement au clic). Performance-first.
 */
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';
import { useNearbyQuests } from '../../hooks/useNearbyQuests';
import NotificationIcon from './NotificationIcon';
import NotificationDropdown from './NotificationDropdown';
import NearbyIcon from './NearbyIcon';
import NearbyDropdown from './NearbyDropdown';
import './SmartNavbar.css';

export default function SmartNavbar({ onGoToPage }) {
  const { user } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);
  const [questOpen, setQuestOpen] = useState(false);
  const [userPosition, setUserPosition] = useState(null);

  const {
    items: notifItems,
    loading: notifLoading,
    unreadCount,
    markAllRead,
    refetch: refetchNotif,
  } = useNotifications(user, { enabled: !!user });

  const {
    quests,
    loading: questLoading,
    loaded: questLoaded,
    loadIfNeeded,
    refresh,
  } = useNearbyQuests({
    enabled: true,
    userPosition,
  });

  useEffect(() => {
    if (!questOpen) return;
    loadIfNeeded();
  }, [questOpen, loadIfNeeded]);

  const handleNotifToggle = useCallback(() => {
    setNotifOpen((o) => !o);
    if (!notifOpen) setQuestOpen(false);
  }, [notifOpen]);

  const handleQuestToggle = useCallback(() => {
    setQuestOpen((o) => !o);
    if (!questOpen) setNotifOpen(false);
  }, [questOpen]);

  useEffect(() => {
    if (!user || !questOpen || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (p) => setUserPosition({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => {},
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 120000 }
    );
  }, [user?.id, questOpen]);

  const goToMap = useCallback(() => {
    setQuestOpen(false);
    onGoToPage?.(1);
  }, [onGoToPage]);

  if (!user) return null;

  return (
    <div className="smart-nav">
      <div className="smart-nav__icons">
        <div className="smart-nav__icon-wrap">
          <NearbyIcon hasNew={quests.length > 0} onClick={handleQuestToggle} isOpen={questOpen} />
          <NearbyDropdown
            open={questOpen}
            onClose={() => setQuestOpen(false)}
            quests={quests}
            loading={questLoading && !questLoaded}
            onRefresh={refresh}
            onExploreAll={goToMap}
            onGoToMap={goToMap}
          />
        </div>
        <div className="smart-nav__icon-wrap">
          <NotificationIcon count={unreadCount} onClick={handleNotifToggle} isOpen={notifOpen} />
          <NotificationDropdown
            open={notifOpen}
            onClose={() => setNotifOpen(false)}
            items={notifItems}
            loading={notifLoading}
            onMarkAllRead={markAllRead}
            onSeeAll={() => { setNotifOpen(false); }}
          />
        </div>
      </div>
    </div>
  );
}
