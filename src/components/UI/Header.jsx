import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../../stores/useStore';
import { useTranslation } from '../../i18n/translations';
import LanguageToggle from './LanguageToggle';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const language = useStore(state => state.language);
  const t = useTranslation(language);

  // Handle scroll for header background
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const menuItems = [
    { path: '/armies', label: t('armies'), icon: '⚔️' },
    { path: '/guides', label: t('guides'), icon: '🎨' },
    { path: '/battle-reports', label: t('battles'), icon: '📜' },
    { path: '/lore', label: t('lore'), icon: '📖' },
  ];

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 120 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: 'clamp(0.75rem, 2vw, 1.5rem) clamp(1rem, 4vw, 3rem)',
          background: scrolled
            ? 'rgba(10, 10, 26, 0.95)'
            : 'linear-gradient(180deg, rgba(10, 10, 26, 0.8) 0%, transparent 100%)',
          backdropFilter: scrolled ? 'blur(20px)' : 'blur(10px)',
          borderBottom: scrolled ? '1px solid rgba(0, 212, 255, 0.1)' : 'none',
          transition: 'all 0.3s ease',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        {/* Logo - Clickeable para volver al inicio */}
        <Link to="/" style={{ textDecoration: 'none' }}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              cursor: 'pointer',
              fontFamily: 'Orbitron',
              fontWeight: 'bold',
              fontSize: 'clamp(1rem, 3vw, 1.4rem)',
              letterSpacing: 'clamp(1px, 0.5vw, 3px)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <span style={{ color: '#fff' }}>THE</span>
            <span style={{
              color: 'var(--color-primary)',
              textShadow: '0 0 20px rgba(0, 212, 255, 0.5)',
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              IMMATERIUM
            </span>
          </motion.div>
        </Link>

        {/* Desktop Navigation */}
        <nav style={{
          display: 'flex',
          gap: 'clamp(0.5rem, 1.5vw, 1rem)',
          alignItems: 'center'
        }}>
          {/* Desktop Menu Items */}
          <div className="desktop-only" style={{ gap: 'clamp(0.5rem, 1.5vw, 1rem)' }}>
            {menuItems.map((item) => (
              <motion.button
                key={item.path}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(item.path)}
                style={{
                  background: location.pathname.includes(item.path)
                    ? 'rgba(0, 212, 255, 0.15)'
                    : 'rgba(255, 255, 255, 0.05)',
                  border: `1px solid ${location.pathname.includes(item.path) ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.1)'}`,
                  borderRadius: '12px',
                  padding: 'clamp(0.5rem, 1.5vw, 0.75rem) clamp(0.75rem, 2vw, 1.25rem)',
                  color: location.pathname.includes(item.path) ? 'var(--color-primary)' : '#fff',
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(0.7rem, 1.5vw, 0.85rem)',
                  letterSpacing: '1px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontWeight: location.pathname.includes(item.path) ? 'bold' : 'normal',
                  boxShadow: location.pathname.includes(item.path)
                    ? '0 0 15px rgba(0, 212, 255, 0.3)'
                    : 'none',
                  textTransform: 'uppercase'
                }}
              >
                {item.label}
              </motion.button>
            ))}
          </div>

          {/* Language Toggle */}
          <LanguageToggle />

          {/* Mobile Hamburger */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-only"
            style={{
              flexDirection: 'column',
              gap: '5px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '10px',
              padding: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            <motion.div
              animate={{ rotate: mobileMenuOpen ? 45 : 0, y: mobileMenuOpen ? 8 : 0 }}
              style={{ width: '24px', height: '2px', background: 'var(--color-primary)', borderRadius: '2px' }}
            />
            <motion.div
              animate={{ opacity: mobileMenuOpen ? 0 : 1 }}
              style={{ width: '24px', height: '2px', background: '#fff', borderRadius: '2px' }}
            />
            <motion.div
              animate={{ rotate: mobileMenuOpen ? -45 : 0, y: mobileMenuOpen ? -8 : 0 }}
              style={{ width: '24px', height: '2px', background: 'var(--color-primary)', borderRadius: '2px' }}
            />
          </motion.button>
        </nav>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.7)',
                backdropFilter: 'blur(5px)',
                zIndex: 150
              }}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              style={{
                position: 'fixed',
                top: 0,
                right: 0,
                bottom: 0,
                width: 'min(85vw, 350px)',
                background: 'linear-gradient(135deg, rgba(10, 10, 26, 0.98) 0%, rgba(20, 5, 30, 0.98) 100%)',
                backdropFilter: 'blur(20px)',
                borderLeft: '1px solid rgba(0, 212, 255, 0.2)',
                boxShadow: '-10px 0 50px rgba(0, 0, 0, 0.5)',
                zIndex: 200,
                display: 'flex',
                flexDirection: 'column',
                padding: '2rem',
                overflowY: 'auto'
              }}
            >
              {/* Menu Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2.5rem',
                paddingBottom: '1.5rem',
                borderBottom: '1px solid rgba(0, 212, 255, 0.2)'
              }}>
                <h2 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.3rem',
                  color: 'var(--color-primary)',
                  letterSpacing: '2px',
                  margin: 0
                }}>
                  {t('navigation').toUpperCase()}
                </h2>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: 'none',
                    color: '#fff',
                    fontSize: '1.5rem',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ✕
                </motion.button>
              </div>

              {/* Menu Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                {/* Home */}
                <motion.button
                  whileHover={{ x: 10 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/')}
                  style={{
                    background: location.pathname === '/'
                      ? 'rgba(0, 212, 255, 0.15)'
                      : 'rgba(255, 255, 255, 0.05)',
                    border: `1px solid ${location.pathname === '/' ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.1)'}`,
                    borderRadius: '12px',
                    padding: '1rem 1.25rem',
                    color: '#fff',
                    fontSize: '1.1rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    fontFamily: 'var(--font-display)',
                    letterSpacing: '1px'
                  }}
                >
                  <span style={{ fontSize: '1.3rem' }}>🏠</span>
                  <span>{t('home').toUpperCase()}</span>
                </motion.button>

                {menuItems.map((item) => (
                  <motion.button
                    key={item.path}
                    whileHover={{ x: 10 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(item.path)}
                    style={{
                      background: location.pathname.includes(item.path)
                        ? 'rgba(0, 212, 255, 0.15)'
                        : 'rgba(255, 255, 255, 0.05)',
                      border: `1px solid ${location.pathname.includes(item.path) ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.1)'}`,
                      borderRadius: '12px',
                      padding: '1rem 1.25rem',
                      color: location.pathname.includes(item.path) ? 'var(--color-primary)' : '#fff',
                      fontSize: '1.1rem',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      fontFamily: 'var(--font-display)',
                      letterSpacing: '1px',
                      fontWeight: location.pathname.includes(item.path) ? 'bold' : 'normal'
                    }}
                  >
                    <span style={{ fontSize: '1.3rem' }}>{item.icon}</span>
                    <span>{item.label.toUpperCase()}</span>
                  </motion.button>
                ))}
              </div>

              {/* Footer del menú */}
              <div style={{
                marginTop: 'auto',
                paddingTop: '2rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                fontSize: '0.8rem',
                color: '#888',
                textAlign: 'center'
              }}>
                <p style={{ margin: '0.5rem 0' }}>The Immaterium</p>
                <p style={{ margin: '0.5rem 0', fontSize: '0.7rem' }}>
                  © 2026 Fan Project
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
