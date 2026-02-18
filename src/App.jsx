import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useStore } from './stores/useStore';
import { AnimatePresence } from 'framer-motion';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import ArmyManager from './components/Admin/ArmyManager';
import GuideManager from './components/Admin/GuideManager';
import ReportManager from './components/Admin/ReportManager';
import LoreManager from './components/Admin/LoreManager';

import ArmiesPage from './pages/ArmiesPage';
import ArmyDetailPage from './pages/ArmyDetailPage';
import GuidesPage from './pages/GuidesPage';
import GuideDetailPage from './pages/GuideDetailPage';
import BattleReportsPage from './pages/BattleReportsPage';
import BattleReportDetailPage from './pages/BattleReportDetailPage';
import LorePage from './pages/LorePage';
import LoreDetailPage from './pages/LoreDetailPage';

import './styles/index.css';

function App() {
  const { fetchInitialData } = useStore();
  const location = useLocation();

  useEffect(() => {
    fetchInitialData();
    console.log("FORCE UPDATE: Frontend v2.2 - Feb 2026");
  }, []);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Public Content Routes */}
        <Route path="/armies" element={<ArmiesPage />} />
        <Route path="/armies/:id" element={<ArmyDetailPage />} />
        <Route path="/guides" element={<GuidesPage />} />
        <Route path="/guides/:id" element={<GuideDetailPage />} />
        <Route path="/lore" element={<LorePage />} />
        <Route path="/lore" element={<LorePage />} />
        <Route path="/lore/:id" element={<LoreDetailPage />} />
        <Route path="/battle-reports/:id" element={<BattleReportDetailPage />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="armies" element={<ArmyManager />} />
          <Route path="guides" element={<GuideManager />} />
          <Route path="lore" element={<LoreManager />} />
          <Route path="reports" element={<ReportManager />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </AnimatePresence>
  );
}

export default App;
