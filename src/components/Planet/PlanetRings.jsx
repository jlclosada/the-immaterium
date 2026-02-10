import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function PlanetRings({ color, size }) {
  const ringRef = useRef();
  const materialRef = useRef();

  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(color) },
        uOpacity: { value: 0.6 }
      },
      vertexShader: `
        varying vec2 vUv;
        
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uColor;
        uniform float uOpacity;
        
        varying vec2 vUv;
        
        void main() {
          vec2 center = vec2(0.5);
          float dist = distance(vUv, center);
          
          // Multiple ring layers
          float ring1 = smoothstep(0.35, 0.37, dist) * smoothstep(0.45, 0.43, dist);
          float ring2 = smoothstep(0.25, 0.27, dist) * smoothstep(0.33, 0.31, dist) * 0.5;
          float ring3 = smoothstep(0.47, 0.48, dist) * smoothstep(0.52, 0.51, dist) * 0.3;
          
          float rings = ring1 + ring2 + ring3;
          
          // Rotating glow segments
          float angle = atan(vUv.y - 0.5, vUv.x - 0.5);
          float segments = sin(angle * 8.0 + uTime * 2.0) * 0.3 + 0.7;
          
          // Pulsating
          float pulse = sin(uTime * 3.0) * 0.15 + 0.85;
          
          float alpha = rings * segments * pulse * uOpacity;
          
          // Color variation based on angle
          vec3 finalColor = uColor * (0.8 + sin(angle * 4.0 + uTime) * 0.2);
          
          gl_FragColor = vec4(finalColor, alpha);
        }
      `
    });
  }, [color]);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
    if (ringRef.current) {
      ringRef.current.rotation.x = Math.PI / 2 + Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
      ringRef.current.rotation.z = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]} raycast={null}>
      <planeGeometry args={[size * 4, size * 4]} />
      <primitive object={shaderMaterial} ref={materialRef} attach="material" />
    </mesh>
  );
}
