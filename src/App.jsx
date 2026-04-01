import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useStore } from './stores/useStore';
import { api } from './services/api';
import { AnimatePresence, motion } from 'framer-motion';

import ScrollToTop from './components/UI/ScrollToTop';
import BackToTop from './components/UI/BackToTop';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import ArmyManager from './components/Admin/ArmyManager';
import GuideManager from './components/Admin/GuideManager';
import ReportManager from './components/Admin/ReportManager';
import LoreManager from './components/Admin/LoreManager';
import UserManager from './components/Admin/UserManager';
import NewRecruitManager from './components/Admin/NewRecruitManager'
import PaintManager from './components/Admin/PaintManager';
import MarketplaceManager from './components/Admin/MarketplaceManager';

import ArmiesPage from './pages/ArmiesPage';
import ArmyDetailPage from './pages/ArmyDetailPage';
import GuidesPage from './pages/GuidesPage';
import GuideDetailPage from './pages/GuideDetailPage';
import BattleReportsPage from './pages/BattleReportsPage';
import BattleReportDetailPage from './pages/BattleReportDetailPage';
import LorePage from './pages/LorePage';
import LoreDetailPage from './pages/LoreDetailPage';
import NewsPage from './pages/NewsPage';
import NewsDetailPage from './pages/NewsDetailPage';
import NewsManager from './components/Admin/NewsManager';
import SearchPage from './pages/SearchPage';
import ArmyBuilderPage from './pages/ArmyBuilderPage';
import VideosPage from './pages/VideosPage';
import MarketplacePage from './pages/MarketplacePage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentCancelPage from './pages/PaymentCancelPage';
import UserAuthPage from './pages/UserAuthPage';
import ProfilePage from './pages/ProfilePage';

import './styles/index.css';
import './index.css';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.15 } }
};

const AnimatedPage = ({ children }) => (
  <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
    {children}
  </motion.div>
);

function App() {
  const { fetchInitialData, token, setUser } = useStore();
  const location = useLocation();

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Restore session on load
  useEffect(() => {
    if (!token) return;
    api.getMe(token)
      .then(data => setUser(data.user, data.purchases || []))
      .catch(() => {}); // token may be expired — that's fine
  }, []);

  return (
    <>
      <ScrollToTop />
      <BackToTop />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<AnimatedPage><LandingPage /></AnimatedPage>} />
          <Route path="/login" element={<AnimatedPage><LoginPage /></AnimatedPage>} />

          {/* Public Content Routes */}
          <Route path="/armies" element={<AnimatedPage><ArmiesPage /></AnimatedPage>} />
          <Route path="/armies/:id" element={<AnimatedPage><ArmyDetailPage /></AnimatedPage>} />
          <Route path="/guides" element={<AnimatedPage><GuidesPage /></AnimatedPage>} />
          <Route path="/guides/:id" element={<AnimatedPage><GuideDetailPage /></AnimatedPage>} />
          <Route path="/lore" element={<AnimatedPage><LorePage /></AnimatedPage>} />
          <Route path="/lore/:id" element={<AnimatedPage><LoreDetailPage /></AnimatedPage>} />
          <Route path="/battle-reports" element={<AnimatedPage><BattleReportsPage /></AnimatedPage>} />
          <Route path="/battle-reports/:id" element={<AnimatedPage><BattleReportDetailPage /></AnimatedPage>} />
          <Route path="/news" element={<AnimatedPage><NewsPage /></AnimatedPage>} />
          <Route path="/news/:id" element={<AnimatedPage><NewsDetailPage /></AnimatedPage>} />
          <Route path="/search" element={<AnimatedPage><SearchPage /></AnimatedPage>} />
          <Route path="/videos" element={<AnimatedPage><VideosPage /></AnimatedPage>} />
          <Route path="/army-builder" element={<AnimatedPage><ArmyBuilderPage /></AnimatedPage>} />
          <Route path="/army-builder/:listId" element={<AnimatedPage><ArmyBuilderPage /></AnimatedPage>} />
          <Route path="/marketplace" element={<AnimatedPage><MarketplacePage /></AnimatedPage>} />
          <Route path="/marketplace/:id" element={<AnimatedPage><MarketplacePage /></AnimatedPage>} />
          <Route path="/payment/success" element={<AnimatedPage><PaymentSuccessPage /></AnimatedPage>} />
          <Route path="/payment/cancel" element={<AnimatedPage><PaymentCancelPage /></AnimatedPage>} />
          <Route path="/signin" element={<UserAuthPage />} />
          <Route path="/register" element={<UserAuthPage />} />
          <Route path="/profile" element={<AnimatedPage><ProfilePage /></AnimatedPage>} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="armies" element={<ArmyManager />} />
            <Route path="guides" element={<GuideManager />} />
            <Route path="lore" element={<LoreManager />} />
            <Route path="reports" element={<ReportManager />} />
            <Route path="news" element={<NewsManager />} />
            <Route path="users" element={<UserManager />} />
            <Route path="new-recruit" element={<NewRecruitManager />} />
            <Route path="paints" element={<PaintManager />} />
            <Route path="marketplace" element={<MarketplaceManager />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<AnimatedPage><LandingPage /></AnimatedPage>} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

export default App;
