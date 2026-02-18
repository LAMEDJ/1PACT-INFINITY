/**
 * Onglets style Instagram : Publications, Activité, Projets, Impact.
 * Indicateur animé (underline glissant), transition fade + slide du contenu.
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TABS = [
  { id: 'publications', label: 'Publications' },
  { id: 'activite', label: 'Activité' },
  { id: 'projets', label: 'Projets' },
  { id: 'impact', label: 'Impact' },
];

export default function ProfileTabs({ activeTab, onTabChange, children }) {
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const m = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(m.matches);
    const fn = () => setReducedMotion(m.matches);
    m.addEventListener('change', fn);
    return () => m.removeEventListener('change', fn);
  }, []);

  const panelTransition = reducedMotion
    ? { duration: 0 }
    : { duration: 0.2, ease: [0.4, 0, 0.2, 1] };
  const panelInitial = reducedMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: 8 };
  const panelAnimate = { opacity: 1, x: 0 };
  const panelExit = reducedMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -8 };

  return (
    <div className="profile-tabs-new">
      <div className="profile-tabs-new__nav" role="tablist" aria-label="Sections du profil">
        <div className="profile-tabs-new__tab-track">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={activeTab === tab.id}
              aria-controls={`panel-${tab.id}`}
              className={`profile-tabs-new__tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => onTabChange(tab.id)}
            >
              {tab.label}
            </button>
          ))}
          <motion.span
            className="profile-tabs-new__indicator"
            layoutId="profile-tabs-indicator"
            transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 400, damping: 35 }}
            style={{
              width: `${100 / TABS.length}%`,
              left: `${(TABS.findIndex((t) => t.id === activeTab) / TABS.length) * 100}%`,
            }}
            aria-hidden="true"
          />
        </div>
      </div>

      <div className="profile-tabs-new__content">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeTab}
            id={`panel-${activeTab}`}
            role="tabpanel"
            aria-labelledby={`tab-${activeTab}`}
            initial={panelInitial}
            animate={panelAnimate}
            exit={panelExit}
            transition={panelTransition}
            className="profile-tabs-new__panel"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
