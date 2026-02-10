import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../../stores/useStore';
import PlanetRings from './PlanetRings';
import PlanetGlow from './PlanetGlow';

export default function Planet({ army }) {
  const meshRef = useRef();
  const materialRef = useRef();
  const [hovered, setHovered] = useState(false);
  const { selectPlanet, currentView } = useStore();

  const planetType = army.planetType || 'standard';

  const shaderMaterial = useMemo(() => {
    // Defines for shader variants
    let noiseFunction = '';
    let fragmentLogic = '';
    let distortionMultiplier = '0.0';

    // COMMON NOISE FUNCTION
    const simplexNoise = `
      // Simplex noise
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
      vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
      
      float snoise(vec3 v) {
        const vec2 C = vec2(1.0/6.0, 1.0/3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
        
        vec3 i  = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);
        
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);
        
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;
        
        i = mod289(i);
        vec4 p = permute(permute(permute(
          i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));
        
        float n_ = 0.142857142857;
        vec3 ns = n_ * D.wyz - D.xzx;
        
        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
        
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_);
        
        vec4 x = x_ *ns.x + ns.yyyy;
        vec4 y = y_ *ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);
        
        vec4 b0 = vec4(x.xy, y.xy);
        vec4 b1 = vec4(x.zw, y.zw);
        
        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
        
        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
        
        vec3 p0 = vec3(a0.xy, h.x);
        vec3 p1 = vec3(a0.zw, h.y);
        vec3 p2 = vec3(a1.xy, h.z);
        vec3 p3 = vec3(a1.zw, h.w);
        
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;
        
        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
      }
    `;

    // TYPE SPECIFIC LOGIC
    if (planetType === 'snow') {
      distortionMultiplier = '0.05'; // Slight roughness
    } else if (planetType === 'lightning') {
      distortionMultiplier = '0.1';
    } else if (planetType === 'deformed') {
      distortionMultiplier = '0.4'; // High distortion for Chaos
    } else if (planetType === 'tentacles') {
      distortionMultiplier = '0.35'; // Very high for tentacles
    } else if (planetType === 'craters') {
      distortionMultiplier = '-0.15'; // Negative for holes
    } else {
      distortionMultiplier = '0.15'; // Standard/Terra
    }

    // Map type to float for use within shader
    let typeId = 0.0;
    if (planetType === 'lightning') typeId = 1.0;
    if (planetType === 'snow') typeId = 2.0;
    if (planetType === 'deformed') typeId = 3.0; // Chaos
    if (planetType === 'tentacles') typeId = 4.0; // Emperors Children
    if (planetType === 'craters') typeId = 5.0; // Tyranids
    if (planetType === 'terra') typeId = 6.0;

    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(army.color) },
        uEmissive: { value: new THREE.Color(army.emissive) },
        uDistortion: { value: parseFloat(distortionMultiplier) },
        uFresnelPower: { value: 2.0 },
        uHovered: { value: 0 },
        uType: { value: typeId }
      },
      vertexShader: `
        uniform float uTime;
        uniform float uDistortion;
        uniform float uHovered;
        uniform float uType;
        
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying float vDisplacement;
        
        ${simplexNoise}
        
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          
          float noise = snoise(position * 2.0 + uTime * 0.1);
          
          // --- TYPE SPECIFIC DISPLACEMENT --- //
          
          // Lightning / Gas
          if (uType == 1.0) {
             noise += snoise(position * 4.0 - uTime * 0.15) * 0.5;
          }
          
          // Snow (Rough, crystalline)
          if (uType == 2.0) {
             noise = abs(noise) * 0.5; // Sharper peaks
             noise += snoise(position * 10.0) * 0.1; // Fine grain
          }
          
          // Deformed (Chaos) - Slow heavy breathing
          if (uType == 3.0) {
             float slowTime = uTime * 0.5;
             noise = snoise(position * 1.5 + slowTime);
             noise += snoise(position * 0.5 - slowTime * 0.5) * 1.5; // Big wobbles
          }
          
          // Tentacles (Emperor's Children) - Moving ripples
          if (uType == 4.0) {
             float wave = sin(position.y * 10.0 + uTime * 2.0);
             noise = wave * 0.5 + snoise(position * 3.0 + uTime) * 0.5;
          }
          
          // Craters (Tyranids)
          if (uType == 5.0) {
             // Inverted cellular-like noise (simplified)
             noise = -abs(noise); // Pits
          }
          
          // Terra (Space Marines)
          if (uType == 6.0) {
             noise = smoothstep(0.2, 0.8, noise); // Continents
          }
          
          vDisplacement = noise;
          
          float distortionAmount = uDistortion * (1.0 + uHovered * 0.5);
          vec3 newPosition = position + normal * noise * distortionAmount;
          vPosition = (modelMatrix * vec4(newPosition, 1.0)).xyz;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uColor;
        uniform vec3 uEmissive;
        uniform float uFresnelPower;
        uniform float uHovered;
        uniform float uType; 
        
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying float vDisplacement;
        
        void main() {
          vec3 viewDirection = normalize(cameraPosition - vPosition);
          float fresnel = pow(1.0 - max(dot(viewDirection, vNormal), 0.0), uFresnelPower);
          
          vec3 baseColor = uColor;
          
          // ---- TEXTURING ---- //
          
          // Standard / Noise Mix
          baseColor = mix(uColor * 0.5, uColor, vDisplacement * 0.5 + 0.5);
          
          // Lightning
          if (uType == 1.0) {
             float lightning = sin(vDisplacement * 20.0 + uTime * 5.0);
             lightning = smoothstep(0.8, 1.0, lightning);
             vec3 lightningColor = vec3(1.0); // Pure White lightning requested
             baseColor += lightningColor * lightning * 2.0;
          }
          
          // Snow
          if (uType == 2.0) {
             baseColor = mix(uColor, vec3(1.0), vDisplacement * 0.8); // White peaks
          }
          
          // Chaos (Deformed) - Red Pulse
          if (uType == 3.0) {
             float pulse = sin(uTime * 2.0) * 0.5 + 0.5;
             baseColor = mix(uColor, uEmissive, pulse * 0.5); // Throb
          }
          
          // Terra
          if (uType == 6.0) {
             // Water vs Land (Simple)
             if (vDisplacement < 0.2) baseColor = vec3(0.0, 0.2, 0.8); // Water
             else baseColor = mix(vec3(0.0, 0.5, 0.0), vec3(1.0), vDisplacement * 0.1); // Green land
          }
          
          vec3 lightDir = normalize(vec3(1.0, 0.5, 1.0));
          float diffuse = max(dot(vNormal, lightDir), 0.15);
          
          vec3 litColor = baseColor * (diffuse + 0.3);
          
          // Aura / Glow Logic
          vec3 glowColor = uEmissive * fresnel * 0.8; 
          
          // Special Aura for Chaos (Red)
          if (uType == 3.0) {
            glowColor = vec3(1.0, 0.0, 0.0) * fresnel * 1.5;
          }
          
          vec3 finalColor = litColor + glowColor;
          
          // Hover
          finalColor *= 1.0 + uHovered * 0.2;
          
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `
    });
  }, [army.color, army.emissive, planetType]);

  // Persistent vector for animations
  const targetScaleVec = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, delta) => {
    if (!meshRef.current || !materialRef.current) return;

    // Rotate planet (Different speeds for types)
    let rotationSpeed = 0.2;
    if (planetType === 'deformed') rotationSpeed = 0.4;
    if (planetType === 'tentacles') rotationSpeed = 0.3;

    meshRef.current.rotation.y += delta * rotationSpeed;

    // Update shader uniforms
    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;

    // Smooth hover transition
    const targetHover = hovered ? 1 : 0;
    materialRef.current.uniforms.uHovered.value = THREE.MathUtils.lerp(
      materialRef.current.uniforms.uHovered.value,
      targetHover,
      delta * 5
    );

    // Floating animation
    // Chaos planets float more erratically
    const floatSpeed = planetType === 'deformed' ? 1.5 : 0.5;
    meshRef.current.position.y = Math.sin(state.clock.elapsedTime * floatSpeed + army.position[0]) * 0.3;

    // Scale animation on hover
    const targetScale = hovered ? army.size * 1.15 : army.size;

    // Smooth scale animation (Zero GC)
    targetScaleVec.set(targetScale, targetScale, targetScale);
    meshRef.current.scale.lerp(targetScaleVec, delta * 5);
  });

  const handleClick = (e) => {
    e.stopPropagation();
    if (currentView === 'galaxy') {
      selectPlanet(army.id);
    }
  };

  return (
    <group position={army.position}>
      {/* Main planet */}
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerEnter={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerLeave={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
        scale={army.size}
      >
        <sphereGeometry args={[1, 128, 128]} />
        <primitive object={shaderMaterial} ref={materialRef} attach="material" />
      </mesh>

      {/* Orbital rings - Only for standard or gas (Terra/Snow/Standard) */}
      {(planetType === 'standard' || planetType === 'terra' || planetType === 'snow') && (
        <PlanetRings color={army.emissive} size={army.size} />
      )}

      {/* Outer glow - Only on hover for minimalist mode */}
      {hovered && (
        <PlanetGlow color={army.emissive} size={army.size} intensity={1} />
      )}

      {/* Planet Label (Name only, no Icon) */}
      {currentView === 'galaxy' && (
        <Html
          position={[0, army.size + 1.2, 0]}
          center
          style={{
            pointerEvents: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            opacity: 1,
            transition: 'all 0.3s'
          }}
        >
          {/* Icon removed as per request */}

          <div className={`tooltip ${hovered ? 'visible' : ''}`} style={{
            opacity: hovered ? 1 : 0,
            transform: hovered ? 'translateY(0)' : 'translateY(10px)',
            transition: 'all 0.3s'
          }}>
            {army.name}
          </div>
        </Html>
      )}
    </group>
  );
}
