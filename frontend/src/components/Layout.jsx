/**
 * Layout principal 1PACT
 * Header + zone scrollable (5 pages) + BottomNav.
 * Scroll programmatique en useLayoutEffect ; scroll utilisateur met à jour l’index via onPageChange.
 */
import { useRef, useLayoutEffect, useCallback, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useImpact } from '../context/ImpactContext';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../context/ToastContext';
import { getLevelFromPoints } from '../lib/levelMapping';
import BottomNav from './BottomNav';
import Sidebar from './Sidebar';
import ImpactToast from './ImpactToast';
import Toast from './Toast';
import LevelUpModal from './LevelUpModal';
import SettingsDrawer from './profile/SettingsDrawer';
import TopTickerBanner from './navbar/TopTickerBanner';
import FloatingNavbar from './navbar/FloatingNavbar';
import './Layout.css';

const SCROLL_DURATION_MS = 400;

export default function Layout({ children, currentPageIndex, onPageChange }) {
  const containerRef = useRef(null);
  const isProgrammaticScrollRef = useRef(false);
  const { user, impactFeedback, clearImpactFeedback, clearPointsGain, logout, refreshUser } = useAuth();
  const { setImpactStats } = useImpact();
  const { open: settingsOpen, closeSettings, initialPanel: settingsInitialPanel, backFromEditCloses: settingsBackFromEditCloses } = useSettings();
  const { addToast } = useToast();

  // Auto-effacement du feedback Impact après 5 s pour éviter qu’il reste affiché
  useEffect(() => {
    if (impactFeedback.pointsGain <= 0 && !impactFeedback.levelUp) return;
    const t = setTimeout(clearImpactFeedback, 5000);
    return () => clearTimeout(t);
  }, [impactFeedback.pointsGain, impactFeedback.levelUp, clearImpactFeedback]);

  useEffect(() => {
    if (user?.type === 'user' && user.impact_points != null) {
      const { level, label } = getLevelFromPoints(user.impact_points);
      setImpactStats({
        totalPoints: user.impact_points ?? 0,
        level,
        levelLabel: label,
        actionsCount: user.total_valid_actions ?? 0,
        missionsCount: 0,
        besoinsCombles: 0,
        propositionsSent: 0,
        propositionsAccepted: 0,
      });
    }
  }, [user?.id, user?.impact_points, user?.total_valid_actions, user?.type, setImpactStats]);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const pageWidth = el.clientWidth || window.innerWidth;
    const targetLeft = currentPageIndex * pageWidth;
    if (el.scrollLeft === targetLeft) return;
    isProgrammaticScrollRef.current = true;
    el.scrollTo({ left: targetLeft, behavior: 'smooth' });
    const t = setTimeout(() => {
      isProgrammaticScrollRef.current = false;
    }, SCROLL_DURATION_MS);
    return () => clearTimeout(t);
  }, [currentPageIndex]);

  const handleScroll = useCallback(() => {
    if (isProgrammaticScrollRef.current) return;
    const el = containerRef.current;
    if (!el) return;
    const pageWidth = el.clientWidth || window.innerWidth;
    const index = Math.round(el.scrollLeft / pageWidth);
    if (index < 0 || index > 4 || index === currentPageIndex) return;
    onPageChange(index);
  }, [onPageChange, currentPageIndex]);

  return (
    <div className="layout">
      {/* Conteneur : une colonne sur mobile, 3 colonnes centrées sur desktop (lg:) */}
      <div className="layout-inner">
        <Sidebar currentIndex={currentPageIndex} onSelect={onPageChange} />
        <div className="layout-center layout-center--with-floating-nav">
          <TopTickerBanner />
          <FloatingNavbar currentPageIndex={currentPageIndex} />
          <ImpactToast pointsGain={impactFeedback.pointsGain} onDismiss={clearPointsGain} />
          <Toast />
          <LevelUpModal open={impactFeedback.levelUp} onClose={clearImpactFeedback} />

          {user && (
            <SettingsDrawer
              open={settingsOpen}
              onClose={closeSettings}
              onLogout={logout}
              user={user}
              initialPanel={settingsInitialPanel}
              backFromEditCloses={settingsBackFromEditCloses}
              refreshUser={refreshUser}
              onProfileSaved={() => addToast('Profil enregistré', 'success')}
            />
          )}

          <main
            ref={containerRef}
            className="layout-pages"
            onScroll={handleScroll}
            role="main"
          >
            {children}
          </main>

          <BottomNav currentIndex={currentPageIndex} onSelect={onPageChange} />
        </div>
        <div className="layout-right" aria-hidden="true" />
      </div>
    </div>
  );
}
