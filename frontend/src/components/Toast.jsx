/**
 * Affichage des toasts globaux (succès, erreur, info).
 * Rendu dans le Layout pour être visible sur toutes les pages.
 */
import { useToast } from '../context/ToastContext';
import './Toast.css';

export default function Toast() {
  const { toasts, removeToast } = useToast();
  if (toasts.length === 0) return null;
  return (
    <div className="toast-container" role="region" aria-label="Notifications">
      {toasts.map(({ id, message, type }) => (
        <div
          key={id}
          className={`toast toast--${type}`}
          role="status"
        >
          <span className="toast__message">{message}</span>
          <button
            type="button"
            className="toast__close"
            onClick={() => removeToast(id)}
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
