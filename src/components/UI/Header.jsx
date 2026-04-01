import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../../stores/useStore';
import { useTranslation } from '../../i18n/translations';
import { useTheme } from '../../hooks/useTheme';
import { api } from '../../services/api';

// ─── Theme toggle pill ────────────────────────────────────────────────────────
// Renders as a sliding pill: moon (dark) → sun (light)
function ThemeTogglePill({ isLight, onToggle }) {
  return (
    <motion.button
      onClick={onToggle}
      title={isLight ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
      className="theme-toggle-pill"
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      style={{ border: 'none', padding: 0 }}
    >
      <div className="theme-toggle-thumb">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={isLight ? 'sun' : 'moon'}
            initial={{ rotate: -120, scale: 0, opacity: 0 }}
            animate={{ rotate: 0,    scale: 1, opacity: 1 }}
            exit={{    rotate:  120, scale: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: 'backOut' }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 0 }}
          >
            {isLight ? (
              /* Sun rays */
              <svg className="toggle-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(120,60,0,0.9)" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="12" cy="12" r="4"/>
                <line x1="12" y1="2"  x2="12" y2="5"/>
                <line x1="12" y1="19" x2="12" y2="22"/>
                <line x1="4.22" y1="4.22" x2="6.34" y2="6.34"/>
                <line x1="17.66" y1="17.66" x2="19.78" y2="19.78"/>
                <line x1="2"  y1="12" x2="5"  y2="12"/>
                <line x1="19" y1="12" x2="22" y2="12"/>
                <line x1="4.22" y1="19.78" x2="6.34" y2="17.66"/>
                <line x1="17.66" y1="6.34" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              /* Crescent moon */
              <svg className="toggle-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(200,220,255,0.9)" strokeWidth="2.5" strokeLinecap="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.button>
  );
}

// ─── CSS responsive (inyectado una sola vez) ─────────────────────────────────
const HEADER_CSS = `
  .hdr-desktop { display: flex; }
  .hdr-tablet  { display: none; }
  .hdr-mobile  { display: none !important; }
  @media (max-width: 900px) {
    .hdr-desktop { display: none !important; }
    .hdr-tablet  { display: flex; }
  }
  @media (max-width: 580px) {
    .hdr-hide-mobile { display: none !important; }
    .hdr-tablet  { display: none !important; }
    .hdr-mobile  { display: flex !important; }

    /* En móvil: convertir el pill en un botón circular simple */
    .theme-toggle-pill {
      width: 36px !important;
      height: 36px !important;
      border-radius: 50% !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      overflow: hidden !important;
    }
    .theme-toggle-pill::before {
      display: none !important;
    }
    .theme-toggle-thumb {
      position: static !important;
      width: 22px !important;
      height: 22px !important;
      border-radius: 50% !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      flex-shrink: 0 !important;
      transition: none !important;
    }
  }
`;

// ─── navBtnStyle — module-level, no closure over component state ─────────────
const navBtnStyle = (active) => ({
  background: active ? 'rgba(0,212,255,0.15)' : 'var(--glass-bg)',
  border: `1px solid ${active ? 'var(--color-primary)' : 'var(--glass-border)'}`,
  borderRadius: '12px',
  padding: '0.5rem 0.85rem',
  color: active ? 'var(--color-primary)' : 'var(--text-primary)',
  fontFamily: 'var(--font-display)',
  fontSize: '0.72rem',
  letterSpacing: '1px',
  cursor: 'pointer',
  transition: 'all 0.2s',
  fontWeight: active ? 'bold' : 'normal',
  boxShadow: active ? '0 0 12px rgba(0,212,255,0.25)' : 'none',
  textTransform: 'uppercase',
  whiteSpace: 'nowrap',
  display: 'flex',
  alignItems: 'center',
  gap: '0.35rem',
});

// ─── MoreBtn — module-level so React never remounts it on parent re-render ───
function MoreBtn({ items, currentPath, navigate }) {
  const [open, setOpen]   = useState(false);
  const wrapRef           = useRef(null);
  const anyActive         = items.some(i => currentPath.startsWith(i.path));

  // Close on outside mousedown
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on route change
  useEffect(() => { setOpen(false); }, [currentPath]);

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <motion.button
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(v => !v)}
        style={{ ...navBtnStyle(anyActive), gap: '0.25rem' }}
      >
        Más
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.18 }}
          style={{ display: 'inline-block', fontSize: '0.55rem', lineHeight: 1 }}
        >▾</motion.span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 0.5rem)',
              right: 0,
              minWidth: '185px',
              background: 'var(--surface-header)',
              border: '1px solid rgba(0,212,255,0.2)',
              borderRadius: '14px',
              padding: '0.5rem',
              boxShadow: '0 16px 48px rgba(0,0,0,0.7)',
              backdropFilter: 'blur(24px)',
              zIndex: 300,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.2rem',
            }}
          >
            {items.map((item) => {
              const active = currentPath.startsWith(item.path);
              return (
                <motion.button
                  key={item.path}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { navigate(item.path); setOpen(false); }}
                  style={{
                    background: active ? 'rgba(0,212,255,0.12)' : 'transparent',
                    border: `1px solid ${active ? 'rgba(0,212,255,0.3)' : 'transparent'}`,
                    borderRadius: '10px',
                    padding: '0.6rem 0.9rem',
                    color: active ? 'var(--color-primary)' : 'var(--text-secondary)',
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.75rem',
                    letterSpacing: '1px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    textTransform: 'uppercase',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    transition: 'all 0.15s',
                  }}
                >
                  <span style={{ opacity: 0.7, flexShrink: 0, display: 'flex' }}>{item.icon}</span>
                  {item.label}
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── UserMenu ─────────────────────────────────────────────────────────────────
function UserMenu({ user, token, onLogout, openAuthModal }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  if (!token) {
    return (
      <div style={{ display: 'flex', gap: '0.4rem' }}>
        <Link to="/signin"
          style={{
            background: 'linear-gradient(135deg, rgba(0,212,255,0.18), rgba(135,206,250,0.1))',
            border: '1px solid rgba(0,212,255,0.4)',
            borderRadius: '12px',
            padding: '0.48rem 1rem',
            color: 'var(--color-primary)',
            fontFamily: 'var(--font-display)',
            fontSize: '0.7rem',
            letterSpacing: '1.5px',
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
            boxShadow: '0 0 12px rgba(0,212,255,0.15)',
            textDecoration: 'none',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 20px rgba(0,212,255,0.3)'}
          onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 12px rgba(0,212,255,0.15)'}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
            <polyline points="10 17 15 12 10 7"/>
            <line x1="15" y1="12" x2="3" y2="12"/>
          </svg>
          Entrar
        </Link>
        <Link to="/signin?mode=register"
          style={{
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
            border: 'none',
            borderRadius: '12px',
            padding: '0.48rem 1rem',
            color: '#000',
            fontFamily: 'var(--font-display)',
            fontSize: '0.7rem',
            letterSpacing: '1.5px',
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
            textDecoration: 'none',
            fontWeight: 700,
          }}
          className="hdr-hide-mobile"
        >
          Registro
        </Link>
      </div>
    );
  }

  const initials = (user?.name || user?.username || 'U').slice(0, 2).toUpperCase();
  const avatar = user?.avatarUrl;

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(v => !v)}
        style={{
          background: 'rgba(0,212,255,0.1)',
          border: '1px solid rgba(0,212,255,0.3)',
          borderRadius: '30px',
          padding: '0.28rem 0.75rem 0.28rem 0.28rem',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          transition: 'all 0.2s',
        }}
      >
        {avatar ? (
          <img src={avatar} alt="" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
        ) : (
          <div style={{
            width: '28px', height: '28px', borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.65rem', fontWeight: 700, color: '#000',
            flexShrink: 0,
          }}>
            {initials}
          </div>
        )}
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.68rem', color: 'var(--text-primary)', letterSpacing: '1px', maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user?.name || user?.username || 'Usuario'}
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.18 }} style={{ fontSize: '0.5rem', color: 'var(--text-dim)' }}>▾</motion.span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute', top: 'calc(100% + 0.5rem)', right: 0,
              minWidth: '200px',
              background: 'var(--surface-header)',
              border: '1px solid rgba(0,212,255,0.2)',
              borderRadius: '16px',
              padding: '0.5rem',
              boxShadow: '0 16px 48px rgba(0,0,0,0.7)',
              backdropFilter: 'blur(24px)',
              zIndex: 300,
            }}
          >
            {/* User info */}
            <div style={{ padding: '0.65rem 0.9rem 0.85rem', borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: '0.3rem' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', color: 'var(--text-primary)', letterSpacing: '1px', marginBottom: '0.2rem' }}>
                {user?.name || user?.username}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.email}
              </div>
            </div>

            {/* Profile link */}
            <Link to="/profile" onClick={() => setOpen(false)} style={{
              display: 'flex', alignItems: 'center', gap: '0.65rem',
              padding: '0.6rem 0.9rem', borderRadius: '10px',
              color: 'rgba(255,255,255,0.6)', textDecoration: 'none',
              fontFamily: 'var(--font-display)', fontSize: '0.72rem',
              letterSpacing: '1px', textTransform: 'uppercase',
              transition: 'all 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              Mi perfil
            </Link>

            {/* Logout */}
            <motion.button
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { setOpen(false); onLogout(); }}
              style={{
                width: '100%',
                background: 'transparent',
                border: '1px solid transparent',
                borderRadius: '10px',
                padding: '0.6rem 0.9rem',
                color: 'rgba(255,100,100,0.8)',
                fontFamily: 'var(--font-display)',
                fontSize: '0.72rem',
                letterSpacing: '1px',
                cursor: 'pointer',
                textAlign: 'left',
                textTransform: 'uppercase',
                display: 'flex', alignItems: 'center', gap: '0.65rem',
                transition: 'all 0.15s',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Cerrar sesión
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Header ──────────────────────────────────────────────────────────────────
export default function Header() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled,       setScrolled]       = useState(false);
  const [searchOpen,     setSearchOpen]     = useState(false);
  const [searchQuery,    setSearchQuery]    = useState('');
  const searchInputRef = useRef(null);
  const language = useStore(state => state.language);
  const t = useTranslation(language);
  const currentPath = location.pathname;
  const { theme, toggleTheme, isLight } = useTheme();
  const token = useStore(s => s.token);
  const user = useStore(s => s.user);
  const logout = useStore(s => s.logout);
  const openAuthModal = useStore(s => s.openAuthModal);

  const handleLogout = async () => {
    try { if (token) await api.logoutUser(token); } catch (_) {}
    logout();
  };

  // Inject responsive CSS once
  useEffect(() => {
    if (document.getElementById('header-responsive-css')) return;
    const el = document.createElement('style');
    el.id = 'header-responsive-css';
    el.textContent = HEADER_CSS;
    document.head.appendChild(el);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
    setSearchQuery('');
  }, [currentPath]);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim().length >= 2)
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  // ─── Nav items ───────────────────────────────────────────────────────────────
  const allItems = [
    {
      path: '/marketplace',
      label: 'Marketplace',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
    },
    {
      path: '/guides',
      label: t('guides'),
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18.37 2.63 14 7l-1.59-1.59a2 2 0 0 0-2.82 0L8 7l9 9 1.59-1.59a2 2 0 0 0 0-2.82L17 10l4.37-4.37a2.12 2.12 0 1 0-3-3z"/><path d="M9 8c-2 3-4 3.5-7 4l8 10c2-1 6-5 6-7"/><path d="M14.5 17.5 4.5 15"/></svg>,
    },
    {
      path: '/battle-reports',
      label: t('battles'),
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" y1="19" x2="19" y2="13"/><line x1="16" y1="16" x2="20" y2="20"/><line x1="19" y1="21" x2="21" y2="19"/></svg>,
    },
    {
      path: '/armies',
      label: t('armies'),
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    },
    {
      path: '/army-builder',
      label: 'Army Builder',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/><path d="M7 8h3m4 0h3M7 12h10"/></svg>,
    },
  ];

  const moreItems = [
    {
      path: '/lore',
      label: t('lore'),
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
    },
    {
      path: '/news',
      label: 'Noticias',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a4 4 0 0 1-4 4z"/><path d="M8 6h12"/><path d="M8 10h12"/><path d="M8 14h8"/></svg>,
    },
    {
      path: '/videos',
      label: t('videos'),
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>,
    },
  ];

  // Tablet: first 3 primary + expanded "Más"
  const tabletPrimary = allItems.slice(0, 3);
  const tabletMore    = [...allItems.slice(3), ...moreItems];

  // Mobile items: home + all
  const mobileAll = [
    { path: '/', label: t('home'), icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
    ...allItems,
    ...moreItems,
  ];

  return (
    <>
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0,
          zIndex: 100,
          padding: 'clamp(0.65rem, 1.5vw, 1.2rem) clamp(1rem, 4vw, 3rem)',
          background: scrolled
            ? 'var(--surface-header)'
            : `linear-gradient(180deg, var(--surface-header-gradient) 0%, transparent 100%)`,
          backdropFilter: scrolled ? 'blur(20px)' : 'blur(10px)',
          borderBottom: scrolled ? '1px solid rgba(0,212,255,0.08)' : 'none',
          transition: 'all 0.3s ease',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
          <motion.div
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            style={{
              fontFamily: 'Orbitron', fontWeight: 'bold',
              fontSize: 'clamp(0.9rem, 2.5vw, 1.3rem)',
              letterSpacing: 'clamp(1px, 0.4vw, 3px)',
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              cursor: 'pointer',
            }}
          >
            <span style={{ color: 'var(--text-primary)' }}>THE</span>
            <span style={{
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>IMMATERIUM</span>
          </motion.div>
        </Link>

        {/* ── Desktop nav (>900px) ── */}
        <nav className="hdr-desktop" style={{ gap: '0.4rem', alignItems: 'center', flex: 1, justifyContent: 'center' }}>
          {allItems.map(item => (
            <motion.button
              key={item.path}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(item.path)}
              style={navBtnStyle(currentPath.startsWith(item.path))}
            >
              {item.label}
            </motion.button>
          ))}
          <MoreBtn items={moreItems} currentPath={currentPath} navigate={navigate} />
        </nav>

        {/* ── Tablet nav (600–900px) ── */}
        <nav className="hdr-tablet" style={{ gap: '0.35rem', alignItems: 'center', flex: 1, justifyContent: 'center' }}>
          {tabletPrimary.map(item => (
            <motion.button
              key={item.path}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(item.path)}
              style={navBtnStyle(currentPath.startsWith(item.path))}
            >
              {item.label}
            </motion.button>
          ))}
          <MoreBtn items={tabletMore} currentPath={currentPath} navigate={navigate} />
        </nav>

        {/* ── Right controls ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          {/* Search button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setSearchOpen(v => !v)}
            title="Buscar"
            style={{
              background: searchOpen ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.07)',
              border: `1px solid ${searchOpen ? 'var(--color-primary)' : 'rgba(255,255,255,0.15)'}`,
              borderRadius: '10px', padding: '0.5rem', cursor: 'pointer',
              color: searchOpen ? 'var(--color-primary)' : 'var(--text-dim)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s', flexShrink: 0,
            }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </motion.button>

          {/* Theme toggle pill — desktop/tablet only */}
          <div className="hdr-hide-mobile">
            <ThemeTogglePill isLight={isLight} onToggle={toggleTheme} />
          </div>

          {/* User auth button */}
          <div className="hdr-hide-mobile">
            <UserMenu user={user} token={token} onLogout={handleLogout} openAuthModal={openAuthModal} />
          </div>

          {/* Mobile hamburger (<580px) */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setMobileMenuOpen(v => !v)}
            className="hdr-mobile"
            style={{
              flexDirection: 'column', gap: '5px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '10px', padding: '10px',
              cursor: 'pointer', transition: 'all 0.3s',
            }}
          >
            <motion.div animate={{ rotate: mobileMenuOpen ? 45 : 0, y: mobileMenuOpen ? 7 : 0 }}
              style={{ width: '22px', height: '2px', background: 'var(--color-primary)', borderRadius: '2px' }} />
            <motion.div animate={{ opacity: mobileMenuOpen ? 0 : 1 }}
              style={{ width: '22px', height: '2px', background: '#fff', borderRadius: '2px' }} />
            <motion.div animate={{ rotate: mobileMenuOpen ? -45 : 0, y: mobileMenuOpen ? -7 : 0 }}
              style={{ width: '22px', height: '2px', background: 'var(--color-primary)', borderRadius: '2px' }} />
          </motion.button>
        </div>
      </motion.header>

      {/* ── Search dropdown ── */}
      <AnimatePresence>
        {searchOpen && (
          <>
            {/* backdrop tap-to-close */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSearchOpen(false)}
              style={{ position: 'fixed', inset: 0, zIndex: 119 }}
            />
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              style={{
                position: 'fixed',
                top: 'calc(var(--header-height, 64px) + 8px)',
                left: '1rem',
                right: '1rem',
                maxWidth: '580px',
                margin: '0 auto',
                zIndex: 120,
              }}
            >
              <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
                  <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#666', pointerEvents: 'none', display: 'flex' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </div>
                  <input
                    ref={searchInputRef} type="text" value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Buscar en The Immaterium..."
                    style={{
                      width: '100%', padding: '0.8rem 1rem 0.8rem 2.75rem',
                      background: 'var(--surface-header)', border: '1px solid rgba(0,212,255,0.4)',
                      borderRadius: '12px', color: 'var(--text-primary)', fontSize: '1rem', outline: 'none',
                      fontFamily: 'var(--font-body)', boxSizing: 'border-box',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.6)', backdropFilter: 'blur(24px)',
                    }}
                  />
                </div>
                <motion.button type="submit" whileTap={{ scale: 0.95 }} style={{
                  background: 'var(--color-primary)', border: 'none', borderRadius: '12px',
                  padding: '0.8rem 1.1rem', color: '#000', cursor: 'pointer', fontWeight: 'bold',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.5)', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </motion.button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Mobile menu overlay ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              style={{ position: 'fixed', inset: 0, background: 'var(--surface-overlay)', backdropFilter: 'blur(5px)', zIndex: 150 }}
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              style={{
                position: 'fixed', top: 0, right: 0, bottom: 0,
                width: 'min(85vw, 320px)',
                background: 'var(--surface-sidebar)',
                backdropFilter: 'blur(20px)',
                borderLeft: '1px solid rgba(0,212,255,0.2)',
                boxShadow: '-10px 0 50px rgba(0,0,0,0.5)',
                zIndex: 200, display: 'flex', flexDirection: 'column',
                padding: '1.5rem', overflowY: 'auto',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', paddingBottom: '1.25rem', borderBottom: '1px solid rgba(0,212,255,0.15)' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--color-primary)', letterSpacing: '3px', textTransform: 'uppercase' }}>Menú</span>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => setMobileMenuOpen(false)} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: 'var(--text-primary)', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>✕</motion.button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', flex: 1 }}>
                {mobileAll.map(item => {
                  const active = item.path === '/' ? currentPath === '/' : currentPath.startsWith(item.path);
                  return (
                    <motion.button
                      key={item.path}
                      whileHover={{ x: 8 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate(item.path)}
                      style={{
                        background: active ? 'rgba(0,212,255,0.12)' : 'var(--glass-bg)',
                        border: `1px solid ${active ? 'var(--color-primary)' : 'var(--glass-border)'}`,
                        borderRadius: '12px', padding: '0.85rem 1rem',
                        color: active ? 'var(--color-primary)' : 'var(--text-primary)',
                        fontSize: '0.95rem', textAlign: 'left', cursor: 'pointer',
                        transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.85rem',
                        fontFamily: 'var(--font-display)', letterSpacing: '1px',
                        fontWeight: active ? 'bold' : 'normal',
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', opacity: 0.7, flexShrink: 0 }}>{item.icon}</span>
                      <span style={{ textTransform: 'uppercase' }}>{item.label}</span>
                    </motion.button>
                  );
                })}
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.12)', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {/* Theme toggle row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', letterSpacing: '2px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                    {isLight ? 'Modo claro' : 'Modo oscuro'}
                  </span>
                  <ThemeTogglePill isLight={isLight} onToggle={toggleTheme} />
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', textAlign: 'center', fontFamily: 'var(--font-display)', letterSpacing: '1px' }}>
                  © 2026 The Immaterium
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
