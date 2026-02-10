import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function PlanetGlow({ color, size, intensity = 1 }) {
  const glowRef = useRef();

  useFrame((state) => {
    if (glowRef.current) {
      // Pulsating MUY SUTIL
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 0.8) * 0.03; // REDUCIDO
      glowRef.current.scale.setScalar(size * 1.5 * pulse * intensity); // Reducido de 1.8

      // Opacidad MUY BAJA
      glowRef.current.material.opacity = 0.06 * intensity; // REDUCIDO de 0.15
    }
  });

  return (
    <sprite ref={glowRef} scale={[size * 1.5, size * 1.5, 1]} raycast={null}>
      <spriteMaterial
        color={color}
        transparent
        opacity={0.06} // REDUCIDO
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </sprite>
  );
}
