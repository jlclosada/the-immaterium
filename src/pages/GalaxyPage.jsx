import { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Preload } from '@react-three/drei';
import { AnimatePresence } from 'framer-motion';

import Galaxy from '../components/Galaxy/Galaxy';
import PostProcessing from '../components/Effects/PostProcessing';
import Header from '../components/UI/Header';
import PlanetInfo from '../components/UI/PlanetInfo';
import ArmyList from '../components/UI/ArmyList';
import About from '../components/UI/About';
import LoadingScreen from '../components/UI/LoadingScreen';
import Gallery from '../components/Gallery/Gallery';
import CursorGlow from '../components/Effects/CursorGlow';
import PaintingGuides from '../components/Guides/PaintingGuides';
import GuideDetail from '../components/Guides/GuideDetail';
import BattleReports from '../components/BattleReports/BattleReports';
import BattleReportDetail from '../components/BattleReports/BattleReportDetail';
import CommunityFeed from '../components/Community/CommunityFeed';
import LoreLibrary from '../components/Lore/LoreLibrary';

import { useStore } from '../stores/useStore';

const GalaxyPage = () => {
    const { currentView, selectedPlanet, isLoading: dataLoading, error } = useStore();
    const [minLoading, setMinLoading] = useState(true);

    useEffect(() => {
        // We can rely on App.jsx or LandingPage to fetch data, but safe to check here
        const timer = setTimeout(() => setMinLoading(false), 2500);
        return () => clearTimeout(timer);
    }, []);

    const isLoading = minLoading;

    if (error) return <div style={{ color: 'red', textAlign: 'center', marginTop: '20%' }}>{error}</div>;

    return (
        <>
            <div style={{ position: 'fixed', width: '100%', height: '100%', top: 0, left: 0, background: 'black' }}>
                <AnimatePresence>
                    {isLoading && <LoadingScreen />}
                </AnimatePresence>

                <div className="canvas-container">
                    <Canvas
                        camera={{ position: [0, 5, 50], fov: 60, near: 0.1, far: 1000 }}
                        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
                        dpr={[1, 1.5]}
                    >
                        <Suspense fallback={null}>
                            <ambientLight intensity={0.6} />
                            <pointLight position={[0, 0, 0]} intensity={3.0} color="#ff6600" />
                            <pointLight position={[50, 50, 50]} intensity={1.0} color="#00d4ff" />
                            <pointLight position={[-50, -50, -50]} intensity={1.0} color="#ff00ff" />
                            <Galaxy />
                            <PostProcessing />
                            <Preload all />
                        </Suspense>
                    </Canvas>
                </div>

                <Header />
                <PlanetInfo />
                <ArmyList />
                <About />

                <AnimatePresence>{currentView === 'planet' && selectedPlanet && <Gallery />}</AnimatePresence>
                <AnimatePresence>{currentView === 'guides' && <PaintingGuides />}</AnimatePresence>
                <AnimatePresence>{currentView === 'guideDetail' && <GuideDetail />}</AnimatePresence>
                <AnimatePresence>{currentView === 'battleReports' && <BattleReports />}</AnimatePresence>
                <AnimatePresence>{currentView === 'battleReportDetail' && <BattleReportDetail />}</AnimatePresence>
                <AnimatePresence>{currentView === 'community' && <CommunityFeed />}</AnimatePresence>
                <AnimatePresence>{currentView === 'lore' && <LoreLibrary />}</AnimatePresence>
                <CursorGlow />
            </div>
        </>
    );
};

export default GalaxyPage;
