import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../../stores/useStore';

export default function WarpEffect() {
  const pointsRef = useRef();
  const { isTransitioning } = useStore();

  const count = 300;

  const { positions, randoms } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const randoms = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const r = 20 + Math.random() * 30; // Tunnel radius
      const theta = Math.random() * Math.PI * 2;

      positions[i * 3] = r * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(theta);
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100;

      randoms[i] = Math.random();
    }

    return { positions, randoms };
  }, []);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;

    const speed = isTransitioning ? 60 : 2;

    const positionAttribute = pointsRef.current.geometry.attributes.position;
    const array = positionAttribute.array;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Move towards camera
      array[i3 + 2] += delta * speed;

      // Reset when past camera
      if (array[i3 + 2] > 20) {
        array[i3 + 2] = -80;
      }
    }

    positionAttribute.needsUpdate = true;

    // Stretch effect when transitioning
    pointsRef.current.material.size = isTransitioning ? 0.5 : 0.1;
    pointsRef.current.material.opacity = isTransitioning ? 0.8 : 0.1;
  });

  return (
    <points ref={pointsRef} raycast={null}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#ffffff"
        size={0.1}
        transparent
        opacity={0.1}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
