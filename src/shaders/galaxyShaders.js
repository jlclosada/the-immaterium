// Vertex shader for galaxy stars
export const starsVertexShader = `
  uniform float uTime;
  uniform float uSize;
  
  attribute float aScale;
  attribute vec3 aRandomness;
  
  varying vec3 vColor;
  varying float vDistance;
  
  void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    
    // Spiral rotation
    float angle = atan(modelPosition.x, modelPosition.z);
    float distanceToCenter = length(modelPosition.xz);
    float angleOffset = (1.0 / distanceToCenter) * uTime * 0.2;
    angle += angleOffset;
    
    modelPosition.x = cos(angle) * distanceToCenter;
    modelPosition.z = sin(angle) * distanceToCenter;
    
    // Add randomness
    modelPosition.xyz += aRandomness;
    
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    
    gl_Position = projectedPosition;
    gl_PointSize = uSize * aScale;
    gl_PointSize *= (1.0 / -viewPosition.z);
    
    vColor = color;
    vDistance = distanceToCenter;
  }
`;

export const starsFragmentShader = `
  uniform float uTime;
  
  varying vec3 vColor;
  varying float vDistance;
  
  void main() {
    // Circular point
    float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
    float strength = 0.05 / distanceToCenter - 0.1;
    
    // Pulsating effect
    float pulse = sin(uTime * 2.0 + vDistance) * 0.5 + 0.5;
    strength *= 0.7 + pulse * 0.3;
    
    vec3 finalColor = mix(vColor, vec3(1.0), strength * 0.5);
    
    gl_FragColor = vec4(finalColor, strength);
  }
`;

// Planet surface shader
export const planetVertexShader = `
  uniform float uTime;
  uniform float uDistortion;
  
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vDisplacement;
  
  // Simplex noise function
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
  
  void main() {
    vUv = uv;
    vNormal = normal;
    
    // Create displacement
    float noise = snoise(position * 2.0 + uTime * 0.1);
    noise += snoise(position * 4.0 - uTime * 0.15) * 0.5;
    noise += snoise(position * 8.0 + uTime * 0.2) * 0.25;
    
    vDisplacement = noise;
    
    vec3 newPosition = position + normal * noise * uDistortion;
    vPosition = newPosition;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

export const planetFragmentShader = `
  uniform float uTime;
  uniform vec3 uColor;
  uniform vec3 uEmissive;
  uniform float uFresnelPower;
  
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vDisplacement;
  
  void main() {
    // Fresnel effect
    vec3 viewDirection = normalize(cameraPosition - vPosition);
    float fresnel = pow(1.0 - dot(viewDirection, vNormal), uFresnelPower);
    
    // Base color with displacement influence
    vec3 baseColor = mix(uColor, uEmissive, vDisplacement * 0.5 + 0.5);
    
    // Add glow
    vec3 glowColor = uEmissive * fresnel * 2.0;
    
    // Atmospheric scattering
    float atmosphere = fresnel * 0.5;
    vec3 atmosphereColor = uEmissive * atmosphere;
    
    // Final color
    vec3 finalColor = baseColor + glowColor + atmosphereColor;
    
    // Pulsating glow
    float pulse = sin(uTime * 2.0) * 0.1 + 0.9;
    finalColor *= pulse;
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

// Nebula shader
export const nebulaVertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  
  void main() {
    vUv = uv;
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const nebulaFragmentShader = `
  uniform float uTime;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;
  uniform float uOpacity;
  
  varying vec2 vUv;
  varying vec3 vPosition;
  
  // Simplex noise
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
  
  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m;
    m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }
  
  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    
    for(int i = 0; i < 6; i++) {
      value += amplitude * snoise(p * frequency);
      amplitude *= 0.5;
      frequency *= 2.0;
    }
    
    return value;
  }
  
  void main() {
    vec2 uv = vUv * 3.0;
    
    // Animated noise
    float noise1 = fbm(uv + uTime * 0.05);
    float noise2 = fbm(uv * 1.5 - uTime * 0.03);
    float noise3 = fbm(uv * 0.5 + uTime * 0.02);
    
    // Color mixing
    vec3 color = mix(uColor1, uColor2, noise1 * 0.5 + 0.5);
    color = mix(color, uColor3, noise2 * 0.3);
    
    // Add brightness variations
    float brightness = noise3 * 0.3 + 0.7;
    color *= brightness;
    
    // Edge fade
    float distanceFromCenter = length(vUv - 0.5) * 2.0;
    float alpha = smoothstep(1.0, 0.3, distanceFromCenter);
    alpha *= uOpacity * (noise1 * 0.5 + 0.5);
    
    gl_FragColor = vec4(color, alpha);
  }
`;

// Glow ring shader for planets
export const glowRingVertexShader = `
  varying vec2 vUv;
  
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const glowRingFragmentShader = `
  uniform float uTime;
  uniform vec3 uColor;
  uniform float uOpacity;
  
  varying vec2 vUv;
  
  void main() {
    vec2 center = vec2(0.5);
    float dist = distance(vUv, center);
    
    // Ring shape
    float ring = smoothstep(0.3, 0.35, dist) * smoothstep(0.5, 0.45, dist);
    
    // Pulsating
    float pulse = sin(uTime * 3.0) * 0.2 + 0.8;
    
    // Rotation effect
    float angle = atan(vUv.y - 0.5, vUv.x - 0.5);
    float rotatingGlow = sin(angle * 4.0 + uTime * 2.0) * 0.3 + 0.7;
    
    float alpha = ring * pulse * rotatingGlow * uOpacity;
    
    gl_FragColor = vec4(uColor, alpha);
  }
`;
