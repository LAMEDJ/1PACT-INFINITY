/**
 * Application principale 1PACT
 * 5 panneaux en défilement horizontal ; état synchronisé avec l’URL (?page=0..4).
 */
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import AccueilPage from './pages/AccueilPage';
import MapPage from './pages/MapPage';
import FeedPage from './pages/FeedPage';
import MessengerPage from './pages/MessengerPage';
import ProfilePage from './pages/ProfilePage';
import './App.css';

const DEFAULT_PAGE = 2; // Fil d'actualité

function getPageIndexFromSearch(searchParams) {
  const p = searchParams.get('page');
  const n = parseInt(p, 10);
  return Number.isFinite(n) && n >= 0 && n <= 4 ? n : DEFAULT_PAGE;
}

export default function App() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const openConv = location.state?.openConv;
  const openPage = location.state?.openPage;

  const [currentPageIndex, setCurrentPageIndexState] = useState(() =>
    getPageIndexFromSearch(searchParams)
  );

  const setCurrentPageIndex = useCallback(
    (index) => {
      setCurrentPageIndexState(index);
      setSearchParams(
        index === DEFAULT_PAGE ? {} : { page: String(index) },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  useEffect(() => {
    if (openConv != null) {
      navigate('.', { replace: true, state: {} });
      queueMicrotask(() => setCurrentPageIndex(3));
    }
  }, [openConv, navigate, setCurrentPageIndex]);

  useEffect(() => {
    if (openPage != null && openPage >= 0 && openPage <= 4) {
      // Préserver unifiedActionMode (FeedPage) et profileTab (Profil) si présents
      const preservedState = {
        ...(location.state?.unifiedActionMode && { unifiedActionMode: location.state.unifiedActionMode }),
        ...(openPage === 4 && location.state?.profileTab && { profileTab: location.state.profileTab }),
      };
      navigate('.', { replace: true, state: preservedState });
      queueMicrotask(() => setCurrentPageIndex(openPage));
    }
  }, [openPage, navigate, setCurrentPageIndex, location.state?.unifiedActionMode, location.state?.profileTab]);

  useEffect(() => {
    const index = getPageIndexFromSearch(searchParams);
    setCurrentPageIndexState(index);
  }, [searchParams]);

  return (
    <Layout
      currentPageIndex={currentPageIndex}
      onPageChange={setCurrentPageIndex}
    >
      <AccueilPage onGoToPage={setCurrentPageIndex} />
      <MapPage />
      <FeedPage onGoToPage={setCurrentPageIndex} />
      <MessengerPage openConv={openConv} />
      <ProfilePage onGoToPage={setCurrentPageIndex} />
    </Layout>
  );
}
