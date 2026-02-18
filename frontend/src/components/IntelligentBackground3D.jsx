/**
 * Fond 3D intelligent – octogone central type référence photo.
 * Structure réseau (wireframe) + noyau glow + particules, réactif souris/scroll.
 * Optimisé GPU, prefers-reduced-motion, nettoyage complet.
 */
import { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import './IntelligentBackground3D.css';

const MOUSE_LERP = 0.095;
const MOUSE_AMP = 0.55;
const PARTICLES_COUNT = 180;

export default function IntelligentBackground3D() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const rafIdRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const scrollRef = useRef(0);
  const timeRef = useRef(0);
  const clockRef = useRef(new THREE.Clock());
  const reducedMotionRef = useRef(
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  const disposablesRef = useRef([]);

  const initScene = useCallback(() => {
    if (!containerRef.current || !canvasRef.current) return;
    const width = containerRef.current.offsetWidth;
    const height = containerRef.current.offsetHeight;
    const disposables = disposablesRef.current;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05080b, 0.08);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(52, width / height, 0.1, 100);
    camera.position.set(0, 0, 4.2);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;

    // —— Groupe central (octogone + noyau + particules) ——
    const centerGroup = new THREE.Group();
    scene.add(centerGroup);

    // 1) Prisme octogonal solide (masse sombre, épaisseur)
    const prismGeom = new THREE.CylinderGeometry(0.88, 0.88, 0.38, 8);
    const prismMat = new THREE.MeshPhongMaterial({
      color: 0x060a0d,
      emissive: 0x0a1015,
      emissiveIntensity: 0.25,
      specular: 0x22d3ee,
      shininess: 100,
      transparent: true,
      opacity: 0.92,
    });
    const prism = new THREE.Mesh(prismGeom, prismMat);
    centerGroup.add(prism);
    disposables.push(prismGeom, prismMat);

    // 2) Arêtes octogone (réseau type photo – wireframe lumineux)
    const edgesGeom = new THREE.EdgesGeometry(prismGeom, 15);
    const edgesMat = new THREE.LineBasicMaterial({
      color: 0x22d3ee,
      transparent: true,
      opacity: 0.7,
      linewidth: 1,
    });
    const edges = new THREE.LineSegments(edgesGeom, edgesMat);
    centerGroup.add(edges);
    disposables.push(edgesGeom, edgesMat);

    // 3) Noyau lumineux multi-couche (glow identique aux refs)
    const coreGroup = new THREE.Group();
    centerGroup.add(coreGroup);

    const coreInnerGeom = new THREE.SphereGeometry(0.18, 24, 24);
    const coreInnerMat = new THREE.MeshBasicMaterial({
      color: 0x67e8f9,
      transparent: true,
      opacity: 0.95,
    });
    const coreInner = new THREE.Mesh(coreInnerGeom, coreInnerMat);
    coreGroup.add(coreInner);
    disposables.push(coreInnerGeom, coreInnerMat);

    const coreGlowGeom = new THREE.SphereGeometry(0.42, 32, 32);
    const coreGlowMat = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
    });
    const coreGlow = new THREE.Mesh(coreGlowGeom, coreGlowMat);
    coreGroup.add(coreGlow);
    disposables.push(coreGlowGeom, coreGlowMat);

    const coreOuterGeom = new THREE.SphereGeometry(0.7, 32, 32);
    const coreOuterMat = new THREE.MeshBasicMaterial({
      color: 0x0ea5e9,
      transparent: true,
      opacity: 0.12,
      depthWrite: false,
    });
    const coreOuter = new THREE.Mesh(coreOuterGeom, coreOuterMat);
    coreGroup.add(coreOuter);
    disposables.push(coreOuterGeom, coreOuterMat);

    sceneRef.current._centerGroup = centerGroup;
    sceneRef.current._coreGroup = coreGroup;

    // 4) Particules (volume, type embers / data points)
    const pos = new Float32Array(PARTICLES_COUNT * 3);
    const rand = () => Math.random() - 0.5;
    for (let i = 0; i < PARTICLES_COUNT; i++) {
      const r = 0.5 + Math.random() * 1.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1) * 0.6;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.7;
      pos[i * 3 + 2] = r * Math.cos(phi) * 0.4;
    }
    const partGeom = new THREE.BufferGeometry();
    partGeom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const partMat = new THREE.PointsMaterial({
      color: 0x22d3ee,
      size: 0.028,
      transparent: true,
      opacity: 0.75,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const particles = new THREE.Points(partGeom, partMat);
    centerGroup.add(particles);
    disposables.push(partGeom, partMat);
    sceneRef.current._particles = particles;

    // 5) Lumières
    const ambient = new THREE.AmbientLight(0x0f172a, 0.5);
    scene.add(ambient);
    const pl1 = new THREE.PointLight(0x22d3ee, 1.4, 10);
    pl1.position.set(0, 0, 2);
    scene.add(pl1);
    const pl2 = new THREE.PointLight(0x10b981, 0.7, 8);
    pl2.position.set(0.4, -0.2, 1.5);
    scene.add(pl2);
  }, []);

  const animate = useCallback(() => {
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const renderer = rendererRef.current;
    const group = sceneRef.current?._centerGroup;
    const coreGroup = sceneRef.current?._coreGroup;
    const particles = sceneRef.current?._particles;
    if (!scene || !camera || !renderer || !group) return;

    const delta = clockRef.current.getDelta();
    timeRef.current += delta;
    const t = timeRef.current;
    const reduced = reducedMotionRef.current;

    targetRef.current.y = mouseRef.current.x * MOUSE_AMP;
    targetRef.current.x = mouseRef.current.y * MOUSE_AMP;

    const lerp = reduced ? 0.02 : MOUSE_LERP;
    currentRef.current.x += (targetRef.current.x - currentRef.current.x) * lerp;
    currentRef.current.y += (targetRef.current.y - currentRef.current.y) * lerp;

    const baseX = reduced ? 0 : Math.sin(t * 0.35) * 0.06;
    const baseY = reduced ? t * 0.015 : t * 0.1;
    const baseZ = reduced ? 0 : Math.sin(t * 0.25) * 0.02;
    group.rotation.x = currentRef.current.x + baseX;
    group.rotation.y = currentRef.current.y + baseY;
    group.rotation.z = currentRef.current.z = baseZ;

    const pulse = reduced ? 1 : 1 + Math.sin(t * 0.7) * 0.035;
    group.scale.setScalar(pulse);
    const floatY = reduced ? 0 : Math.sin(t * 0.45) * 0.025;
    group.position.y = floatY;

    if (coreGroup) {
      const cp = reduced ? 1 : 1 + Math.sin(t * 1.1) * 0.1;
      coreGroup.scale.setScalar(cp);
    }
    if (particles) {
      particles.rotation.y = t * 0.04;
      particles.rotation.x = Math.sin(t * 0.2) * 0.05;
    }

    const scrollNorm = Math.min(scrollRef.current / 600, 1);
    const zoom = 4.2 - scrollNorm * 0.5;
    camera.position.set(0, 0, zoom);
    camera.lookAt(0, -scrollNorm * 0.25, 0);

    renderer.render(scene, camera);
    rafIdRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => { reducedMotionRef.current = mq.matches; };
    mq.addEventListener('change', onChange);

    initScene();
    rafIdRef.current = requestAnimationFrame(animate);

    const onResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      const w = containerRef.current.offsetWidth;
      const h = containerRef.current.offsetHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    const onMouseMove = (e) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    const onScroll = () => { scrollRef.current = window.scrollY; };
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      mq.removeEventListener('change', onChange);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('scroll', onScroll);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      disposablesRef.current.forEach((d) => d?.dispose?.());
      disposablesRef.current.length = 0;
      rendererRef.current?.dispose();
      sceneRef.current = null;
      cameraRef.current = null;
      rendererRef.current = null;
    };
  }, [initScene, animate]);

  return (
    <div
      ref={containerRef}
      className="intelligent-background-3d"
      aria-hidden="true"
      role="presentation"
    >
      <div className="intelligent-background-3d__base" />
      <canvas ref={canvasRef} className="intelligent-background-3d__canvas" />
    </div>
  );
}
