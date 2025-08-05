import React, { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useTheme } from '../context/ThemeContext';

const ThreeBackground = () => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const particlesRef = useRef(null);
  const animationIdRef = useRef(null);
  const { isDark } = useTheme();

  // Memoize particle count based on device performance
  const particleCount = useMemo(() => {
    const isMobile = window.innerWidth < 768;
    const isLowEnd = navigator.hardwareConcurrency < 4;
    return isMobile || isLowEnd ? 80 : 120;
  }, []);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup with optimized settings
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: false, // Disable for performance
      powerPreference: 'high-performance'
    });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // Optimized particles
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 15;
      positions[i + 1] = (Math.random() - 0.5) * 15;
      positions[i + 2] = (Math.random() - 0.5) * 15;
      
      velocities[i] = (Math.random() - 0.5) * 0.02;
      velocities[i + 1] = (Math.random() - 0.5) * 0.02;
      velocities[i + 2] = (Math.random() - 0.5) * 0.02;
      
      const color = new THREE.Color();
      color.setHSL(Math.random() * 0.2 + 0.5, 0.7, 0.6);
      colors[i] = color.r;
      colors[i + 1] = color.g;
      colors[i + 2] = color.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.04,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Reduced floating geometries for performance
    const geometries = [];
    const geometryCount = window.innerWidth < 768 ? 3 : 5;
    
    for (let i = 0; i < geometryCount; i++) {
      const geo = new THREE.OctahedronGeometry(0.2, 0); // Simpler geometry
      const mat = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(Math.random() * 0.3 + 0.4, 0.6, 0.5),
        transparent: true,
        opacity: 0.2,
        wireframe: true
      });
      const mesh = new THREE.Mesh(geo, mat);
      
      mesh.position.set(
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 12
      );
      
      mesh.userData = {
        rotationSpeed: Math.random() * 0.015 + 0.005,
        floatSpeed: Math.random() * 0.008 + 0.003
      };
      
      geometries.push(mesh);
      scene.add(mesh);
    }

    camera.position.z = 8;

    sceneRef.current = scene;
    rendererRef.current = renderer;
    particlesRef.current = particles;

    // Optimized animation loop with frame limiting
    let lastTime = 0;
    const targetFPS = 30; // Limit to 30fps for better performance
    const frameInterval = 1000 / targetFPS;

    const animate = (currentTime) => {
      animationIdRef.current = requestAnimationFrame(animate);

      if (currentTime - lastTime < frameInterval) return;
      lastTime = currentTime;

      // Animate particles with velocity
      const positions = particles.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += velocities[i];
        positions[i + 1] += velocities[i + 1];
        positions[i + 2] += velocities[i + 2];
        
        // Wrap around boundaries
        if (Math.abs(positions[i]) > 7.5) velocities[i] *= -1;
        if (Math.abs(positions[i + 1]) > 7.5) velocities[i + 1] *= -1;
        if (Math.abs(positions[i + 2]) > 7.5) velocities[i + 2] *= -1;
      }
      particles.geometry.attributes.position.needsUpdate = true;

      // Animate floating geometries
      geometries.forEach((mesh, index) => {
        mesh.rotation.x += mesh.userData.rotationSpeed;
        mesh.rotation.y += mesh.userData.rotationSpeed * 0.7;
        mesh.position.y += Math.sin(currentTime * mesh.userData.floatSpeed + index) * 0.005;
      });

      renderer.render(scene, camera);
    };

    animate(0);

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [particleCount]);

  // Update colors based on theme
  useEffect(() => {
    if (!particlesRef.current) return;

    const colors = particlesRef.current.geometry.attributes.color.array;
    for (let i = 0; i < colors.length; i += 3) {
      const color = new THREE.Color();
      if (isDark) {
        color.setHSL(Math.random() * 0.2 + 0.5, 0.7, 0.6);
      } else {
        color.setHSL(Math.random() * 0.3 + 0.15, 0.5, 0.4);
      }
      colors[i] = color.r;
      colors[i + 1] = color.g;
      colors[i + 2] = color.b;
    }
    particlesRef.current.geometry.attributes.color.needsUpdate = true;
  }, [isDark]);

  return <div ref={mountRef} style={{ position: 'fixed', top: 0, left: 0, zIndex: 0, pointerEvents: 'none' }} />;
};

export default ThreeBackground;