/**
 * BarNav – structure exacte :
 * GAUCHE : Nom utilisateur (masqué sur page Profil) → en dessous Widget Stat Niveau Impact.
 * CENTRE : Bouton Cockpit → en dessous Bouton Points / Impact (panneau latéral).
 * DROITE : Bouton Quêtes / Notifications → en dessous Bouton Réglages (tiroir paramètres).
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { useScrollBehavior } from '../../hooks/useScrollBehavior';
import { useNavbarController } from '../../hooks/useNavbarController';
import { useNotifications } from '../../hooks/useNotifications';
import { useNearbyQuests } from '../../hooks/useNearbyQuests';
import DashboardButton from './DashboardButton';
import NotifQuestIcon from './NotifQuestIcon';
import NotifQuestDropdown from './NotifQuestDropdown';
import ImpactWidget from '../ImpactWidget';
import ImpactNavPanel from './ImpactNavPanel';
import ImpactDropdown from './ImpactDropdown';
import './SmartNavbar.css';
import './FloatingNavbar.css';

export default function FloatingNavbar({ currentPageIndex }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { openSettings, open: settingsOpen } = useSettings();

  const { isCompact } = useScrollBehavior(null, { threshold: 20 });
  const { activeDropdown, toggle, closeAll, isOpen } = useNavbarController();
  const [retracted, setRetracted] = useState(false);
  const effectiveCompact = activeDropdown ? false : (isCompact || retracted);

  const {
    items: notifItems,
    loading: notifLoading,
    unreadCount,
    markAllRead,
  } = useNotifications(user, { enabled: !!user });

  const {
    quests: nearbyQuests,
    loading: nearbyLoading,
    refresh: nearbyRefresh,
    loadIfNeeded: nearbyLoadIfNeeded,
  } = useNearbyQuests({ enabled: !!user });

  const impactPoints = user?.points ?? user?.impact_points ?? 0;
  const isOnUserProfilePage = user?.type === 'user' && currentPageIndex === 4;
  const isCockpitPage = location.pathname === '/cockpit';

  const closeAllAndRetract = useCallback(() => {
    closeAll();
    setRetracted(true);
  }, [closeAll]);

  useEffect(() => {
    const onScroll = () => setRetracted(false);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!retracted) return;
    const t = setTimeout(() => setRetracted(false), 2500);
    return () => clearTimeout(t);
  }, [retracted]);

  useEffect(() => {
    if (!activeDropdown) return;
    const onEscape = (e) => {
      if (e.key === 'Escape') closeAllAndRetract();
    };
    document.addEventListener('keydown', onEscape);
    return () => document.removeEventListener('keydown', onEscape);
  }, [activeDropdown, closeAllAndRetract]);

  const handleIconClick = useCallback(
    (id) => {
      if (id === 'notifquest') nearbyLoadIfNeeded();
      toggle(id);
    },
    [toggle, nearbyLoadIfNeeded],
  );

  const goToMap = useCallback(() => {
    closeAllAndRetract();
    navigate('/', { state: { openPage: 1 } });
  }, [closeAllAndRetract, navigate]);

  const exploreAllQuests = useCallback(() => {
    closeAllAndRetract();
    navigate('/', { state: { openPage: 1 } });
  }, [closeAllAndRetract, navigate]);

  const goToProfileImpact = useCallback(() => {
    closeAllAndRetract();
    navigate('/', { state: { openPage: 4, profileTab: 'impact' } });
  }, [closeAllAndRetract, navigate]);

  const openReglages = useCallback(() => {
    closeAllAndRetract();
    openSettings('list');
  }, [closeAllAndRetract, openSettings]);

  const touchStartRef = useRef({ x: 0, y: 0 });
  const handleBackdropTouchStart = useCallback((e) => {
    const t = e.touches?.[0];
    if (t) touchStartRef.current = { x: t.clientX, y: t.clientY };
  }, []);
  const handleBackdropTouchEnd = useCallback((e) => {
    const t = e.changedTouches?.[0];
    if (!t) return;
    const dx = t.clientX - touchStartRef.current.x;
    const dy = t.clientY - touchStartRef.current.y;
    const threshold = 50;
    if (Math.abs(dy) > threshold && dy > 0) closeAllAndRetract();
    else if (Math.abs(dx) > threshold && dx < 0) closeAllAndRetract();
  }, [closeAllAndRetract]);

  return (
    <>
      <div className="floating-nav-wrap">
        <nav
          className={`barnav floating-nav ${effectiveCompact ? 'floating-nav--compact' : ''} ${activeDropdown ? 'barnav--dropdown-open' : ''}`}
          aria-label="Navigation principale"
        >
          {/* GAUCHE : nom en haut à gauche, panneau Stat Niveau Impact entièrement en dessous */}
          <div className="barnav__col barnav__col--left">
            {user && (
              <>
                <div className="barnav__row barnav__row--name">
                  {!isOnUserProfilePage && (
                    <div className="barnav__user-main">
                      <span className="barnav__user-name">{user.name}</span>
                      {user.type === 'user' && impactPoints > 0 && (
                        <span className="barnav__impact-chip" aria-label={`${impactPoints} Points Impact`}>
                          {impactPoints} pts
                        </span>
                      )}
                    </div>
                  )}
                </div>
                {user.type === 'user' && !effectiveCompact && (
                  <div className="barnav__row barnav__row--widget">
                    <div className="barnav__impact-panel">
                      <ImpactWidget userPoints={user.points ?? user.impact_points ?? 0} />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* CENTRE : Cockpit → en dessous Points / Impact */}
          <div className="barnav__col barnav__col--center">
            <div className="barnav__row barnav__row--primary">
              <DashboardButton onNavigate={closeAllAndRetract} isActive={isCockpitPage} />
            </div>
            {user?.type === 'user' && (
              <div className="barnav__row barnav__row--secondary">
                <div className="barnav__impact-btn-wrap">
                  <ImpactNavPanel
                    onClick={() => handleIconClick('impact')}
                    isOpen={isOpen('impact')}
                    hasNewPoints={false}
                  />
                  <div className="barnav__impact-dropdown-anchor">
                    <ImpactDropdown
                      open={isOpen('impact')}
                      onClose={closeAllAndRetract}
                      onOpenFullDetail={goToProfileImpact}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* DROITE : Quêtes / Notifications → en dessous Réglages */}
          <div className="barnav__col barnav__col--right">
            {user && (
              <>
                <div className="barnav__row barnav__row--primary">
                  <div className="smart-nav__icon-wrap">
                    <NotifQuestIcon
                      notifCount={unreadCount}
                      hasQuests={nearbyQuests.length > 0}
                      onClick={() => handleIconClick('notifquest')}
                      isOpen={isOpen('notifquest')}
                    />
                    <NotifQuestDropdown
                      open={isOpen('notifquest')}
                      onClose={closeAllAndRetract}
                      notifItems={notifItems}
                      notifLoading={notifLoading}
                      onMarkAllRead={markAllRead}
                      onSeeAllNotif={closeAllAndRetract}
                      quests={nearbyQuests}
                      questLoading={nearbyLoading}
                      onRefreshQuests={nearbyRefresh}
                      onExploreAllQuests={exploreAllQuests}
                      onGoToMap={goToMap}
                    />
                  </div>
                </div>
                <div className="barnav__row barnav__row--secondary">
                  <button
                    type="button"
                    className={`barnav__btn barnav__btn--settings ${settingsOpen ? 'barnav__btn--active' : ''}`}
                    onClick={openReglages}
                    aria-label="Réglages"
                    aria-expanded={settingsOpen}
                  >
                    <span className="barnav__btn-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1 .6 1.65 1.65 0 0 0-.33 1.82l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 8.6 15a1.65 1.65 0 0 0-1.82-.33l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 15 8.6a1.65 1.65 0 0 0 .33-1.82l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 15z" />
                      </svg>
                    </span>
                    <span className="barnav__btn-label">Réglages</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </nav>
      </div>

      {activeDropdown && (
        <div
          className="floating-nav-backdrop is-visible"
          onClick={closeAllAndRetract}
          onKeyDown={(e) => e.key === 'Escape' && closeAllAndRetract()}
          onTouchStart={handleBackdropTouchStart}
          onTouchEnd={handleBackdropTouchEnd}
          role="button"
          tabIndex={0}
          aria-label="Fermer le menu (glisser vers le bas pour fermer)"
        />
      )}
    </>
  );
}
