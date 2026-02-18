/**
 * Contexte global pour les notifications toast (succès, erreur, info).
 * Remplace les alert() pour une UX professionnelle.
 */
import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

const AUTO_DISMISS_MS = 5000;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, AUTO_DISMISS_MS);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value = { toasts, addToast, removeToast };
  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      toasts: [],
      addToast: (msg, type) => { typeof window !== 'undefined' && alert(msg); },
      removeToast: () => {},
    };
  }
  return ctx;
}
