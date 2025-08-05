import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useTheme } from '../context/ThemeContext';

const Dashboard3D = ({ groups, events, resources, user, onCardClick }) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const cardsRef = useRef([]);
  const { isDark } = useTheme();
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(isDark ? 0x404040 : 0x606060, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(isDark ? 0x00ffe7 : 0x3182ce, 0.8);
    directionalLight.position.set(10, 10, 5);
    scene.add(directionalLight);

    // Create 3D cards
    const cardData = [
      { title: 'My Groups', value: groups?.length || 0, color: 0x00ffe7, position: [-4, 2, 0], type: 'groups' },
      { title: 'Events', value: events?.length || 0, color: 0xff6b6b, position: [-1.5, 2, 0], type: 'events' },
      { title: 'Resources', value: resources?.length || 0, color: 0x4ecdc4, position: [1, 2, 0], type: 'resources' },
      { title: 'Skills', value: user?.skills?.length || 0, color: 0xffe66d, position: [3.5, 2, 0], type: 'skills' }
    ];

    const cards = [];
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    cardData.forEach((data, index) => {
      // Card geometry
      const geometry = new THREE.BoxGeometry(2, 2.5, 0.2);
      const material = new THREE.MeshPhongMaterial({ 
        color: data.color,
        transparent: true,
        opacity: 0.8
      });
      
      const card = new THREE.Mesh(geometry, material);
      card.position.set(...data.position);
      card.userData = data;
      
      // Add glow effect
      const glowGeometry = new THREE.BoxGeometry(2.1, 2.6, 0.3);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: data.color,
        transparent: true,
        opacity: 0.2
      });
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      glow.position.copy(card.position);
      scene.add(glow);
      
      scene.add(card);
      cards.push(card);
      
      // Floating animation
      const animate = () => {
        card.position.y = data.position[1] + Math.sin(Date.now() * 0.001 + index) * 0.1;
        card.rotation.y = Math.sin(Date.now() * 0.0005 + index) * 0.1;
        glow.position.copy(card.position);
        glow.rotation.copy(card.rotation);
      };
      card.animate = animate;
    });

    cardsRef.current = cards;

    // Mouse interaction
    const onMouseMove = (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(cards);
      
      if (intersects.length > 0) {
        const intersected = intersects[0].object;
        setHoveredCard(intersected.userData.type);
        intersected.scale.set(1.1, 1.1, 1.1);
        document.body.style.cursor = 'pointer';
      } else {
        setHoveredCard(null);
        cards.forEach(card => card.scale.set(1, 1, 1));
        document.body.style.cursor = 'default';
      }
    };

    const onClick = (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(cards);
      
      if (intersects.length > 0) {
        const clicked = intersects[0].object;
        onCardClick?.(clicked.userData.type);
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('click', onClick);

    // Camera position
    camera.position.set(0, 0, 8);
    camera.lookAt(0, 0, 0);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      cards.forEach(card => card.animate());
      
      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Store refs
    sceneRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('click', onClick);
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [groups, events, resources, user, isDark, onCardClick]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <div ref={mountRef} style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }} />
      
      {/* 3D UI Overlay */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        right: '20px',
        zIndex: 2,
        pointerEvents: 'none'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(10px)',
          padding: '1rem 2rem',
          borderRadius: '15px',
          color: 'white'
        }}>
          <h1 style={{ margin: 0, fontSize: '2rem' }}>3D Dashboard</h1>
          <div style={{ fontSize: '1.2rem' }}>Welcome, {user?.username}</div>
        </div>
      </div>

      {/* Card Info Overlay */}
      {hoveredCard && (
        <div style={{
          position: 'absolute',
          bottom: '50px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 2,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(10px)',
          padding: '1rem 2rem',
          borderRadius: '10px',
          color: 'white',
          textAlign: 'center',
          pointerEvents: 'none'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0' }}>
            {hoveredCard === 'groups' && `${groups?.length || 0} Groups`}
            {hoveredCard === 'events' && `${events?.length || 0} Events`}
            {hoveredCard === 'resources' && `${resources?.length || 0} Resources`}
            {hoveredCard === 'skills' && `${user?.skills?.length || 0} Skills`}
          </h3>
          <p style={{ margin: 0, opacity: 0.8 }}>Click to explore</p>
        </div>
      )}

      {/* Navigation */}
      <div style={{
        position: 'absolute',
        top: '50%',
        right: '20px',
        transform: 'translateY(-50%)',
        zIndex: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        {['groups', 'events', 'resources', 'profile'].map((tab) => (
          <button
            key={tab}
            onClick={() => onCardClick?.(tab)}
            style={{
              background: 'rgba(0, 255, 231, 0.2)',
              border: '1px solid rgba(0, 255, 231, 0.5)',
              color: 'white',
              padding: '10px 15px',
              borderRadius: '8px',
              cursor: 'pointer',
              backdropFilter: 'blur(10px)',
              textTransform: 'capitalize',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(0, 255, 231, 0.4)';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(0, 255, 231, 0.2)';
              e.target.style.transform = 'scale(1)';
            }}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Dashboard3D;