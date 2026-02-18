/**
 * Détection du scroll vertical pour navbar compacte / étendue.
 * Throttle pour performance. Scroll down → compact, scroll up → étendu.
 * Si containerRef non fourni, utilise le scroll de la fenêtre.
 */
import { useState, useEffect, useRef, useCallback } from 'react';

const THROTTLE_MS = 150;
const SCROLL_THRESHOLD = 24;

export function useScrollBehavior(containerRef, options = {}) {
  const { threshold = SCROLL_THRESHOLD, useWindow = true } = options;
  const [isCompact, setIsCompact] = useState(false);
  const lastY = useRef(0);
  const ticking = useRef(false);

  const update = useCallback(() => {
    const y = containerRef?.current ? containerRef.current.scrollTop : (typeof window !== 'undefined' ? window.scrollY ?? document.documentElement.scrollTop : 0);
    if (y > lastY.current && y > threshold) {
      setIsCompact(true);
    } else if (y < lastY.current || y <= threshold) {
      setIsCompact(false);
    }
    lastY.current = y;
    ticking.current = false;
  }, [containerRef, threshold]);

  useEffect(() => {
    const el = containerRef?.current;
    const target = el || (typeof window !== 'undefined' ? window : null);
    if (!target) return;

    let throttleTimer = null;
    const handleScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      throttleTimer = setTimeout(update, THROTTLE_MS);
    };

    target.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      target.removeEventListener('scroll', handleScroll);
      if (throttleTimer) clearTimeout(throttleTimer);
    };
  }, [containerRef, update, useWindow]);

  return { isCompact };
}
