/* eslint-disable react-hooks/purity */
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function GalaxyStars({ count = 10000 }) {
  const pointsRef = useRef();
  const materialRef = useRef();

  const { positions, colors, scales } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const scales = new Float32Array(count);

    const colorInside = new THREE.Color('#ffaa00');
    const colorOutside = new THREE.Color('#0044ff');

    const branches = 5;
    const spin = 1;
    const randomness = 0.5;
    const randomnessPower = 3;
    const radius = 80;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Position
      const r = Math.random() * radius;
      const branchAngle = (i % branches) / branches * Math.PI * 2;
      const spinAngle = r * spin;

      const randomX = Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * randomness * r;
      const randomY = Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * randomness * r * 0.3;
      const randomZ = Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * randomness * r;

      positions[i3] = Math.cos(branchAngle + spinAngle) * r + randomX;
      positions[i3 + 1] = randomY;
      positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * r + randomZ;

      // Color
      const mixedColor = colorInside.clone();
      mixedColor.lerp(colorOutside, r / radius);

      colors[i3] = mixedColor.r;
      colors[i3 + 1] = mixedColor.g;
      colors[i3 + 2] = mixedColor.b;

      // Scale
      scales[i] = Math.random();
    }

    return { positions, colors, scales };
  }, [count]);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      transparent: true,
      uniforms: {
        uTime: { value: 0 },
        uSize: { value: 150 }
      },
      vertexShader: `
        uniform float uTime;
        uniform float uSize;
        
        attribute float aScale;
        
        varying vec3 vColor;
        varying float vDistance;
        
        void main() {
          vec4 modelPosition = modelMatrix * vec4(position, 1.0);
          
          // Spiral rotation animation
          float angle = atan(modelPosition.x, modelPosition.z);
          float distanceToCenter = length(modelPosition.xz);
          float angleOffset = (1.0 / max(distanceToCenter, 0.1)) * uTime * 0.1;
          angle += angleOffset;
          
          modelPosition.x = cos(angle) * distanceToCenter;
          modelPosition.z = sin(angle) * distanceToCenter;
          
          // Vertical wave -- REMOVED for stability
          // modelPosition.y += sin(distanceToCenter * 0.1 + uTime * 0.5) * 2.0;
          
          vec4 viewPosition = viewMatrix * modelPosition;
          vec4 projectedPosition = projectionMatrix * viewPosition;
          
          gl_Position = projectedPosition;
          gl_PointSize = uSize * aScale;
          gl_PointSize *= (1.0 / -viewPosition.z);
          
          vColor = color;
          vDistance = distanceToCenter;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        
        varying vec3 vColor;
        varying float vDistance;
        
        void main() {
          // Circular point with glow
          float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
          float strength = 0.05 / distanceToCenter - 0.1;
          
          // Pulsating effect - REDUCED
          float pulse = sin(uTime * 0.5 + vDistance * 0.05) * 0.1 + 0.9; // Much gentle pulse
          strength *= pulse;
          
          // Color with brightness
          vec3 finalColor = vColor * (1.0 + strength * 0.5);
          
          gl_FragColor = vec4(finalColor, strength);
        }
      `
    });
  }, []);

  return (
    <points ref={pointsRef} raycast={null}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aScale"
          count={count}
          array={scales}
          itemSize={1}
        />
      </bufferGeometry>
      <primitive object={shaderMaterial} ref={materialRef} attach="material" />
    </points>
  );
}
