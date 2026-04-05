import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useStore } from './stores/useStore';
import { api } from './services/api';

function AdminGuard({ children }) {
  const user = useStore(s => s.user);
  const token = useStore(s => s.token);
  if (!token) return <Navigate to="/signin" replace />;
  if (user && !user.isAdmin && !user.is_staff && !user.isLeader) return <Navigate to="/" replace />;
  return children;
}
import { AnimatePresence, motion } from 'framer-motion';

import ScrollToTop from './components/UI/ScrollToTop';
import BackToTop from './components/UI/BackToTop';

// ── Eagerly loaded (critical path) ──────────────────────────────────────────
import LandingPage from './pages/LandingPage';
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
import UserAuthPage from './pages/UserAuthPage';
import NotFoundPage from './pages/NotFoundPage';

// ── Lazily loaded (not on critical path) ────────────────────────────────────
const LoginPage         = lazy(() => import('./pages/LoginPage'));
const SearchPage        = lazy(() => import('./pages/SearchPage'));
const ArmyBuilderPage   = lazy(() => import('./pages/ArmyBuilderPage'));
const VideosPage        = lazy(() => import('./pages/VideosPage'));
const MarketplacePage   = lazy(() => import('./pages/MarketplacePage'));
const ProfilePage       = lazy(() => import('./pages/ProfilePage'));
const PaymentSuccessPage = lazy(() => import('./pages/PaymentSuccessPage'));
const PaymentCancelPage  = lazy(() => import('./pages/PaymentCancelPage'));

// ── Admin (lazily loaded, rarely visited) ────────────────────────────────────
const AdminLayout       = lazy(() => import('./layouts/AdminLayout'));
const AdminDashboard    = lazy(() => import('./pages/admin/AdminDashboard'));
const ArmyManager       = lazy(() => import('./components/Admin/ArmyManager'));
const GuideManager      = lazy(() => import('./components/Admin/GuideManager'));
const ReportManager     = lazy(() => import('./components/Admin/ReportManager'));
const LoreManager       = lazy(() => import('./components/Admin/LoreManager'));
const UserManager       = lazy(() => import('./components/Admin/UserManager'));
const NewRecruitManager = lazy(() => import('./components/Admin/NewRecruitManager'));
const PaintManager      = lazy(() => import('./components/Admin/PaintManager'));
const MarketplaceManager = lazy(() => import('./components/Admin/MarketplaceManager'));
const NewsManager       = lazy(() => import('./components/Admin/NewsManager'));

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
      <Suspense fallback={
        <div style={{ minHeight: '100vh', background: 'var(--color-darker)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="loading-spinner" />
        </div>
      }>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<AnimatedPage><LandingPage /></AnimatedPage>} />
          <Route path="/login" element={<Navigate to="/signin" replace />} />

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
          <Route path="/admin" element={<AdminGuard><AdminLayout /></AdminGuard>}>
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
          <Route path="*" element={<AnimatedPage><NotFoundPage /></AnimatedPage>} />
        </Routes>
      </AnimatePresence>
      </Suspense>
    </>
  );
}

export default App;
