import { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Preload } from '@react-three/drei';
import { AnimatePresence } from 'framer-motion';

import Galaxy from './components/Galaxy/Galaxy';
import PostProcessing from './components/Effects/PostProcessing';
import Header from './components/UI/Header';
import PlanetInfo from './components/UI/PlanetInfo';
import ArmyList from './components/UI/ArmyList';
import About from './components/UI/About';
import LoadingScreen from './components/UI/LoadingScreen';
import Gallery from './components/Gallery/Gallery';
import CursorGlow from './components/Effects/CursorGlow';

import { useStore } from './stores/useStore';

import './styles/index.css';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const { currentView, selectedPlanet } = useStore();

  useEffect(() => {
    // Simulate loading time for assets
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Loading Screen */}
      <AnimatePresence>
        {isLoading && <LoadingScreen />}
      </AnimatePresence>

      {/* 3D Canvas */}
      <div className="canvas-container">
        <Canvas
          camera={{
            position: [0, 5, 50],
            fov: 60,
            near: 0.1,
            far: 1000
          }}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
          }}
          dpr={[1, 1.5]} // Clamp to 1.5 to save GPU load while keeping quality
        >
          <Suspense fallback={null}>
            {/* Lighting */}
            <ambientLight intensity={0.6} />
            <pointLight position={[0, 0, 0]} intensity={3.0} color="#ff6600" />
            <pointLight position={[50, 50, 50]} intensity={1.0} color="#00d4ff" />
            <pointLight position={[-50, -50, -50]} intensity={1.0} color="#ff00ff" />

            {/* Galaxy Scene */}
            <Galaxy />

            {/* Post Processing Effects */}
            <PostProcessing />

            <Preload all />
          </Suspense>
        </Canvas>
      </div>

      {/* UI Overlay */}
      <Header />
      <PlanetInfo />
      <ArmyList />
      <About />

      {/* Gallery View */}
      <AnimatePresence>
        {currentView === 'planet' && selectedPlanet && (
          <Gallery />
        )}
      </AnimatePresence>

      {/* Cursor Glow Effect */}
      <CursorGlow />
    </>
  );
}

export default App;
