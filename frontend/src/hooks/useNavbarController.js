/**
 * État central navbar : un seul dropdown actif à la fois.
 * activeDropdown: "notifquest" | "impact" | "profile" | null
 */
import { useState, useCallback } from 'react';

export function useNavbarController() {
  const [activeDropdown, setActiveDropdown] = useState(null);

  const openDropdown = useCallback((id) => {
    setActiveDropdown((prev) => (prev === id ? null : id));
  }, []);

  const closeAll = useCallback(() => {
    setActiveDropdown(null);
  }, []);

  const toggle = useCallback((id) => {
    setActiveDropdown((prev) => (prev === id ? null : id));
  }, []);

  const isOpen = useCallback((id) => activeDropdown === id, [activeDropdown]);

  return {
    activeDropdown,
    setActiveDropdown,
    openDropdown,
    closeAll,
    toggle,
    isOpen,
  };
}
