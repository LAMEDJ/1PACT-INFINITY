/**
 * Fond d'écran principal immersif – image exacte fournie.
 * Aucun gradient, aucune couleur de remplacement, aucun filtre.
 * Parallaxe subtil (desktop uniquement), overlay léger pour lisibilité.
 */
import { useRef, useEffect } from 'react';
import './BackgroundImage.css';

const PARALLAX_FACTOR = 0.15;
const MOBILE_BREAKPOINT = 768;

export default function BackgroundImage() {
  const layerRef = useRef(null);
  const rafRef = useRef(null);
  const tickingRef = useRef(false);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;

    const isMobile = () => window.innerWidth < MOBILE_BREAKPOINT;
    const prefersReducedMotion = () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const updateParallax = () => {
      if (isMobile() || prefersReducedMotion()) {
        layer.style.transform = '';
        tickingRef.current = false;
        return;
      }
      const y = window.scrollY * PARALLAX_FACTOR;
      layer.style.transform = `translate3d(0, ${y * 0.5}px, 0)`;
      tickingRef.current = false;
    };

    const onScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;
      rafRef.current = requestAnimationFrame(updateParallax);
    };

    const onResize = () => {
      updateParallax();
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    updateParallax();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      className="background-image"
      aria-hidden="true"
      role="presentation"
    >
      <div ref={layerRef} className="background-image__layer" />
      <div className="background-image__overlay" />
    </div>
  );
}
