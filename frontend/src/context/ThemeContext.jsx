/**
 * Thème clair / sombre – préférence sauvegardée en localStorage.
 * Applique data-theme sur <html> pour les variables CSS.
 */
import { createContext, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = '1pact_theme';

const ThemeContext = createContext({
  theme: 'light',
  setTheme: () => {},
  toggleTheme: () => {},
});

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    return localStorage.getItem(STORAGE_KEY) || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const setTheme = (value) => setThemeState(value === 'dark' ? 'dark' : 'light');
  const toggleTheme = () => setThemeState((t) => (t === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) return { theme: 'light', setTheme: () => {}, toggleTheme: () => {} };
  return ctx;
}
