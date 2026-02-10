/* eslint-disable react-hooks/purity */
import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars as DreiStars, CameraControls } from '@react-three/drei';
import { useStore } from '../../stores/useStore';
import Planet from '../Planet/Planet';

export default function Galaxy() {
  const groupRef = useRef();
  const controlsRef = useRef();
  const {
    armies,
    selectedPlanet,
    isTransitioning,
    currentView,
    finishTransition
  } = useStore();

  // Handle transitions with CameraControls
  useEffect(() => {
    if (!controlsRef.current) return;

    if (selectedPlanet && isTransitioning) {
      // Zoom to planet
      const x = selectedPlanet.position[0];
      const y = selectedPlanet.position[1];
      const z = selectedPlanet.position[2];

      // Fit sphere to view or animate to specific offset
      controlsRef.current.setLookAt(
        x * 0.8, y * 0.8, z + 6, // Closer zoom (Preciso)
        x, y, z, // Target center
        true // Enable transition
      ).then(() => {
        finishTransition();
      });
    } else if (!selectedPlanet && currentView === 'galaxy' && isTransitioning) {
      // Return to galaxy view
      controlsRef.current.setLookAt(
        0, 5, 50, // Default galaxy position
        0, 0, 0, // Look at center
        true
      ).then(() => {
        finishTransition();
      });
    }
  }, [selectedPlanet, isTransitioning, currentView, finishTransition]);

  // Idle rotation
  useFrame((state, delta) => {
    if (!groupRef.current) return;
    // Slow rotation of the entire galaxy when not inspecting a planet
    if (!selectedPlanet) {
      groupRef.current.rotation.y += delta * 0.05; // Slightly faster rotation for smaller galaxy
    }
  });

  return (
    <group ref={groupRef}>
      <CameraControls
        ref={controlsRef}
        smoothTime={0.6} // Faster travel (Rapido)
        minDistance={5}
        maxDistance={100}
        enabled={true}
      />

      {/* Simple, clean background stars */}
      <DreiStars
        radius={150} // Reduced radius for tighter feel
        depth={50}
        count={2000}
        factor={4}
        saturation={0} // White stars for clean look
        fade
        speed={0.5}
      />

      {/* Planets representing armies */}
      {armies.map((army) => (
        <Planet
          key={army.id}
          army={army}
        />
      ))}
    </group>
  );
}
