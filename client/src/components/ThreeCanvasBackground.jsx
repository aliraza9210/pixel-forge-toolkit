import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import useThemeStore from '../store/themeStore';

export default function ThreeCanvasBackground({ className = '' }) {
  const containerRef = useRef(null);
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 600;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.z = 25;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);
    } catch {
      return;
    }

    // Color definitions based on active theme
    const isLight = theme === 'light';
    const primaryColor = isLight ? new THREE.Color('#32143D') : new THREE.Color('#00A6D6');
    const secondaryColor = isLight ? new THREE.Color('#492052') : new THREE.Color('#007BA7');
    const accentColor = isLight ? new THREE.Color('#F4B942') : new THREE.Color('#FF2D75');

    // 1. Particle Cloud (Starfield)
    const particleCount = 420;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 50;
      positions[i3 + 1] = (Math.random() - 0.5) * 35;
      positions[i3 + 2] = (Math.random() - 0.5) * 35;

      const mixRatio = Math.random();
      const col = mixRatio > 0.6 ? primaryColor : (mixRatio > 0.25 ? secondaryColor : accentColor);
      colors[i3] = col.r;
      colors[i3 + 1] = col.g;
      colors[i3 + 2] = col.b;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: isLight ? 0.18 : 0.14,
      vertexColors: true,
      transparent: true,
      opacity: isLight ? 0.6 : 0.75,
      blending: isLight ? THREE.NormalBlending : THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // 2. Floating 3D Geometric Mesh (Wireframe Icosahedron)
    const icoGeometry = new THREE.IcosahedronGeometry(4.5, 1);
    const icoMaterial = new THREE.MeshBasicMaterial({
      color: primaryColor,
      wireframe: true,
      transparent: true,
      opacity: isLight ? 0.22 : 0.2,
    });
    const icosahedron = new THREE.Mesh(icoGeometry, icoMaterial);
    icosahedron.position.set(-14, 2, -6);
    scene.add(icosahedron);

    // 3. Floating 3D Torus Ring (Wireframe)
    const torusGeometry = new THREE.TorusGeometry(3.5, 0.9, 12, 36);
    const torusMaterial = new THREE.MeshBasicMaterial({
      color: accentColor,
      wireframe: true,
      transparent: true,
      opacity: isLight ? 0.28 : 0.22,
    });
    const torus = new THREE.Mesh(torusGeometry, torusMaterial);
    torus.position.set(15, -3, -8);
    scene.add(torus);

    // 4. Subtle Floating Octahedron
    const octaGeometry = new THREE.OctahedronGeometry(2.5, 0);
    const octaMaterial = new THREE.MeshBasicMaterial({
      color: secondaryColor,
      wireframe: true,
      transparent: true,
      opacity: isLight ? 0.24 : 0.2,
    });
    const octahedron = new THREE.Mesh(octaGeometry, octaMaterial);
    octahedron.position.set(10, 8, -10);
    scene.add(octahedron);

    // Mouse movement interaction
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;

    const handleMouseMove = (event) => {
      targetMouseX = (event.clientX / window.innerWidth - 0.5) * 2;
      targetMouseY = -(event.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const handleResize = () => {
      if (!container || !renderer) return;
      const newWidth = container.clientWidth || window.innerWidth;
      const newHeight = container.clientHeight || 600;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    let isVisible = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isVisible) return;

      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse lerp
      currentMouseX += (targetMouseX - currentMouseX) * 0.05;
      currentMouseY += (targetMouseY - currentMouseY) * 0.05;

      // Rotate 3D objects with organic floating motion
      icosahedron.rotation.x = elapsedTime * 0.18;
      icosahedron.rotation.y = elapsedTime * 0.25;
      icosahedron.position.y = 2 + Math.sin(elapsedTime * 0.8) * 0.8;

      torus.rotation.x = elapsedTime * 0.22;
      torus.rotation.y = elapsedTime * 0.14;
      torus.position.y = -3 + Math.cos(elapsedTime * 0.7) * 0.9;

      octahedron.rotation.y = elapsedTime * 0.35;
      octahedron.rotation.z = elapsedTime * 0.18;
      octahedron.position.y = 8 + Math.sin(elapsedTime + 1) * 0.6;

      // Particle slow drift & mouse parallax
      particles.rotation.y = elapsedTime * 0.025 + currentMouseX * 0.1;
      particles.rotation.x = currentMouseY * 0.07;

      camera.position.x = currentMouseX * 2.5;
      camera.position.y = currentMouseY * 2;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      observer.disconnect();

      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      icoGeometry.dispose();
      icoMaterial.dispose();
      torusGeometry.dispose();
      torusMaterial.dispose();
      octaGeometry.dispose();
      octaMaterial.dispose();
    };
  }, [theme]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}
