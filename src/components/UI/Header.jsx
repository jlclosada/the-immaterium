import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../../stores/useStore';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentView, setCurrentView } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  const handleNavigation = (view, path) => {
    setCurrentView(view);
    navigate(path);
    setMobileMenuOpen(false);
  };

  const returnToGalaxy = () => {
    setCurrentView('galaxy');
    navigate('/galaxy');
  };

  return (
    <motion.header
      className="header"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5, type: 'spring', stiffness: 100 }}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.5rem 2rem',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 50
      }}
    >
      <motion.div
        className="logo"
        whileHover={{ scale: 1.05 }}
        style={{ cursor: 'pointer', fontFamily: 'Orbitron', fontWeight: 'bold', fontSize: '1.2rem', letterSpacing: '2px' }}
        onClick={returnToGalaxy}
      >
        THE <span style={{ color: '#00ced1', textShadow: '0 0 10px rgba(0,206,209,0.5)' }}>INMATERIUM</span>
      </motion.div>

      {/* Desktop Navigation */}
      {!isMobile && (
        <nav className="nav-menu glass-panel" style={{ display: 'flex', gap: '1rem' }}>
          <motion.button
            className="nav-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleNavigation('galaxy', '/galaxy')}
            style={{
              opacity: location.pathname === '/galaxy' ? 1 : 0.7,
              borderColor: location.pathname === '/galaxy' ? 'var(--color-primary)' : 'var(--glass-border)'
            }}
          >
            GALAXIA
          </motion.button>

          <motion.button
            className="nav-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleNavigation('armyList', '/armies')}
            style={{
              opacity: location.pathname.includes('/armies') ? 1 : 0.7,
              borderColor: location.pathname.includes('/armies') ? 'var(--color-primary)' : 'var(--glass-border)'
            }}
          >
            EJÉRCITOS
          </motion.button>

          <motion.button
            className="nav-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleNavigation('guides', '/guides')}
            style={{
              opacity: location.pathname.includes('/guides') ? 1 : 0.7,
              borderColor: location.pathname.includes('/guides') ? 'var(--color-primary)' : 'var(--glass-border)'
            }}
          >
            GUÍAS
          </motion.button>

          <motion.button
            className="nav-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleNavigation('battleReports', '/battle-reports')}
            style={{
              opacity: location.pathname.includes('/battle-reports') ? 1 : 0.7,
              borderColor: location.pathname.includes('/battle-reports') ? 'var(--color-primary)' : 'var(--glass-border)'
            }}
          >
            BATALLAS
          </motion.button>

          <motion.button
            className="nav-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => useStore.getState().setCurrentView('community')}
            style={{
              opacity: currentView === 'community' ? 1 : 0.7,
              borderColor: currentView === 'community' ? 'var(--color-primary)' : 'var(--glass-border)'
            }}
          >
            COMUNIDAD
          </motion.button>

          <motion.button
            className="nav-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => useStore.getState().setCurrentView('lore')}
            style={{
              opacity: currentView === 'lore' ? 1 : 0.7,
              borderColor: currentView === 'lore' ? 'var(--color-primary)' : 'var(--glass-border)'
            }}
          >
            LORE
          </motion.button>

          <motion.button
            className="nav-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => useStore.getState().setCurrentView('about')}
          >
            ACERCA DE
          </motion.button>
        </nav>
      )}

      {/* Mobile Hamburger Button */}
      {isMobile && (
        <button
          onClick={toggleMenu}
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            padding: '10px 15px',
            borderRadius: '8px',
            cursor: 'pointer',
            zIndex: 300
          }}
        >
          <div style={{ width: '25px', height: '2px', background: 'white', marginBottom: '6px' }} />
          <div style={{ width: '25px', height: '2px', background: 'white', marginBottom: '6px' }} />
          <div style={{ width: '25px', height: '2px', background: 'white' }} />
        </button>
      )}

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobile && mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 20 }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              width: '70%',
              height: '100vh',
              background: 'rgba(10, 10, 20, 0.95)',
              backdropFilter: 'blur(20px)',
              zIndex: 250,
              display: 'flex',
              flexDirection: 'column',
              padding: '5rem 2rem',
              gap: '2rem',
              boxShadow: '-10px 0 30px rgba(0,0,0,0.5)',
              borderLeft: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <h2 style={{ color: '#fff', borderBottom: '1px solid #333', paddingBottom: '1rem' }}>MENÚ</h2>

            <button
              onClick={() => handleNavigation('galaxy', '/galaxy')}
              style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.2rem', textAlign: 'left', cursor: 'pointer' }}
            >
              🌌 GALAXIA
            </button>
            <button
              onClick={() => handleNavigation('armyList', '/armies')}
              style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.2rem', textAlign: 'left', cursor: 'pointer' }}
            >
              ⚔️ EJÉRCITOS
            </button>
            <button
              onClick={() => handleNavigation('guides', '/guides')}
              style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.2rem', textAlign: 'left', cursor: 'pointer' }}
            >
              🎨 GUÍAS DE PINTURA
            </button>
            <button
              onClick={() => handleNavigation('battleReports', '/battle-reports')}
              style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.2rem', textAlign: 'left', cursor: 'pointer' }}
            >
              ⚔️ INFORMES DE BATALLA
            </button>
            <button
              onClick={() => handleNavigation('community', '/community')}
              style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.2rem', textAlign: 'left', cursor: 'pointer' }}
            >
              🌐 COMUNIDAD
            </button>
            <button
              onClick={() => handleNavigation('lore', '/lore')}
              style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.2rem', textAlign: 'left', cursor: 'pointer' }}
            >
              📚 LORE
            </button>
            <button
              onClick={() => handleNavigation('about', '/about')}
              style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.2rem', textAlign: 'left', cursor: 'pointer' }}
            >
              ℹ️ ACERCA DE
            </button>

            <button
              onClick={() => setMobileMenuOpen(false)}
              style={{
                marginTop: 'auto',
                padding: '1rem',
                border: '1px solid #555',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.05)',
                color: '#aaa'
              }}
            >
              CERRAR
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
