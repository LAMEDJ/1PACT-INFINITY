/**
 * Interrupteur thème clair / sombre.
 * Utilise useTheme(), transition fluide, préférence sauvegardée dans ThemeContext (localStorage).
 */
import { useTheme } from '../../context/ThemeContext';

export default function ThemeToggleSwitch() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
      onClick={toggleTheme}
      className="theme-toggle"
    >
      <span className="theme-toggle__track">
        <span className="theme-toggle__thumb" data-dark={isDark} />
      </span>
      <span className="theme-toggle__label">{isDark ? 'Sombre' : 'Clair'}</span>
    </button>
  );
}
