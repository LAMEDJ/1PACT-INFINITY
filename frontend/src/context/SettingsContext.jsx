/**
 * Contexte Réglages : ouverture du tiroir paramètres depuis la BarNav ou la page Profil.
 */
import { createContext, useContext, useState, useCallback } from 'react';

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [initialPanel, setInitialPanel] = useState('list');
  const [backFromEditCloses, setBackFromEditCloses] = useState(false);

  const openSettings = useCallback((panel = 'list', opts = {}) => {
    setInitialPanel(panel);
    setBackFromEditCloses(!!opts.backFromEditCloses);
    setOpen(true);
  }, []);

  const closeSettings = useCallback(() => {
    setOpen(false);
    setInitialPanel('list');
    setBackFromEditCloses(false);
  }, []);

  return (
    <SettingsContext.Provider value={{ open, openSettings, closeSettings, initialPanel, backFromEditCloses }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  return ctx ?? { open: false, openSettings: () => {}, closeSettings: () => {}, initialPanel: 'list', backFromEditCloses: false };
}
