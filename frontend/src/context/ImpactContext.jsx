/**
 * Contexte des stats Impact (Points, niveau, actions, etc.).
 * Rempli par la page Profil / Dashboard ; consommé par le Layout (étoile + widget).
 */
import { createContext, useContext, useState, useCallback } from 'react';

const ImpactContext = createContext(null);

const DEFAULT_STATS = {
  totalPoints: 0,
  level: 1,
  levelLabel: 'Explorateur',
  actionsCount: 0,
  missionsCount: 0,
  besoinsCombles: 0,
  propositionsSent: 0,
  propositionsAccepted: 0,
};

export function ImpactProvider({ children }) {
  const [stats, setStats] = useState(DEFAULT_STATS);

  const setImpactStats = useCallback((data) => {
    if (!data) {
      setStats(DEFAULT_STATS);
      return;
    }
    setStats({
      totalPoints: data.totalPoints ?? 0,
      level: data.level ?? 1,
      levelLabel: data.levelLabel ?? 'Explorateur',
      actionsCount: data.actionsCount ?? 0,
      missionsCount: data.missionsCount ?? 0,
      besoinsCombles: data.besoinsCombles ?? 0,
      propositionsSent: data.propositionsSent ?? 0,
      propositionsAccepted: data.propositionsAccepted ?? 0,
    });
  }, []);

  const value = {
    ...stats,
    setImpactStats,
  };

  return (
    <ImpactContext.Provider value={value}>
      {children}
    </ImpactContext.Provider>
  );
}

export function useImpact() {
  const ctx = useContext(ImpactContext);
  return ctx ?? { ...DEFAULT_STATS, setImpactStats: () => {} };
}
