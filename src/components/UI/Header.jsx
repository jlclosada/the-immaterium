import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../../stores/useStore';
import { useTranslation } from '../../i18n/translations';

// ─── CSS injected once so media queries work ────────────────────────────────
const HEADER_CSS = `
  .hdr-desktop { display: flex; }
  .hdr-tablet  { display: none; }
  .hdr-mobile  { display: none !important; }
  @media (max-width: 900px) {
    .hdr-desktop { display: none !important; }
    .hdr-tablet  { display: flex; }
  }
  @media (max-width: 580px) {
    .hdr-tablet  { display: none !important; }
    .hdr-mobile  { display: flex !important; }
  }
`;

export default function Header() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled,       setScrolled]       = useState(false);
  const [searchOpen,     setSearchOpen]     = useState(false);
  const [searchQuery,    setSearchQuery]    = useState('');
  const [moreOpen,       setMoreOpen]       = useState(false);
  const searchInputRef   = useRef(null);
  const moreDropdownRef  = useRef(null);
  const language = useStore(state => state.language);
  const t = useTranslation(language);

  // Inject CSS once
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
    setMoreOpen(false);
  }, [location]);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    if (!moreOpen) return;
    const handler = (e) => {
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(e.target))
        setMoreOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [moreOpen]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim().length >= 2)
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  // ─── Nav items ──────────────────────────────────────────────────────────────
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

  // Tablet shows only first 3 main items, rest go into "Más"
  const tabletPrimary = allItems.slice(0, 3);
  const tabletMore    = [...allItems.slice(3), ...moreItems];

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  const isActive = (path) => location.pathname.startsWith(path);

  const navBtnStyle = (active) => ({
    background: active ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.05)',
    border: `1px solid ${active ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)'}`,
    borderRadius: '12px',
    padding: '0.5rem 0.85rem',
    color: active ? 'var(--color-primary)' : '#fff',
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

  const MoreBtn = ({ items }) => {
    const anyActive = items.some(i => isActive(i.path));
    return (
      <div ref={moreDropdownRef} style={{ position: 'relative' }}>
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setMoreOpen(v => !v)}
          style={{ ...navBtnStyle(anyActive), gap: '0.25rem' }}
        >
          Más
          <motion.span
            animate={{ rotate: moreOpen ? 180 : 0 }}
            transition={{ duration: 0.18 }}
            style={{ display: 'inline-block', fontSize: '0.55rem', lineHeight: 1 }}
          >▾</motion.span>
        </motion.button>

        <AnimatePresence>
          {moreOpen && (
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
                background: 'rgba(8,8,22,0.98)',
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
                const active = isActive(item.path);
                return (
                  <motion.button
                    key={item.path}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => { navigate(item.path); setMoreOpen(false); }}
                    style={{
                      background: active ? 'rgba(0,212,255,0.12)' : 'transparent',
                      border: `1px solid ${active ? 'rgba(0,212,255,0.3)' : 'transparent'}`,
                      borderRadius: '10px',
                      padding: '0.6rem 0.9rem',
                      color: active ? 'var(--color-primary)' : '#ccc',
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
  };

  const SearchBtn = () => (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => setSearchOpen(v => !v)}
      title="Buscar"
      style={{
        background: searchOpen ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.07)',
        border: `1px solid ${searchOpen ? 'var(--color-primary)' : 'rgba(255,255,255,0.15)'}`,
        borderRadius: '10px',
        padding: '0.5rem',
        cursor: 'pointer',
        color: searchOpen ? 'var(--color-primary)' : '#ccc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s',
        flexShrink: 0,
      }}
    >
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    </motion.button>
  );

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 120 }}
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0,
          zIndex: 100,
          padding: 'clamp(0.65rem, 1.5vw, 1.2rem) clamp(1rem, 4vw, 3rem)',
          background: scrolled
            ? 'rgba(10,10,26,0.97)'
            : 'linear-gradient(180deg, rgba(10,10,26,0.8) 0%, transparent 100%)',
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
            <span style={{ color: '#fff' }}>THE</span>
            <span style={{
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              textShadow: 'none',
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
              style={navBtnStyle(isActive(item.path))}
            >
              {item.label}
            </motion.button>
          ))}
          <MoreBtn items={moreItems} />
        </nav>

        {/* ── Tablet nav (600–900px) ── */}
        <nav className="hdr-tablet" style={{ gap: '0.35rem', alignItems: 'center', flex: 1, justifyContent: 'center' }}>
          {tabletPrimary.map(item => (
            <motion.button
              key={item.path}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(item.path)}
              style={navBtnStyle(isActive(item.path))}
            >
              {item.label}
            </motion.button>
          ))}
          <MoreBtn items={tabletMore} />
        </nav>

        {/* ── Right controls ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          <SearchBtn />

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
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            style={{
              position: 'fixed', top: '68px', left: '50%', transform: 'translateX(-50%)',
              width: 'min(560px, 92vw)', zIndex: 120,
            }}
          >
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
              <div style={{ position: 'relative', flex: 1 }}>
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
                    width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem',
                    background: 'rgba(10,10,26,0.97)', border: '1px solid rgba(0,212,255,0.4)',
                    borderRadius: '12px', color: '#fff', fontSize: '0.95rem', outline: 'none',
                    fontFamily: 'var(--font-body)', boxSizing: 'border-box',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)', backdropFilter: 'blur(20px)',
                  }}
                />
              </div>
              <motion.button type="submit" whileTap={{ scale: 0.95 }} style={{
                background: 'var(--color-primary)', border: 'none', borderRadius: '12px',
                padding: '0.75rem 1.25rem', color: '#000', fontFamily: 'var(--font-display)',
                fontSize: '0.8rem', letterSpacing: '1px', cursor: 'pointer', fontWeight: 'bold',
                whiteSpace: 'nowrap', boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              }}>BUSCAR</motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Mobile menu overlay ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)', zIndex: 150 }}
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              style={{
                position: 'fixed', top: 0, right: 0, bottom: 0,
                width: 'min(85vw, 320px)',
                background: 'linear-gradient(135deg, rgba(10,10,26,0.99) 0%, rgba(20,5,30,0.99) 100%)',
                backdropFilter: 'blur(20px)',
                borderLeft: '1px solid rgba(0,212,255,0.2)',
                boxShadow: '-10px 0 50px rgba(0,0,0,0.5)',
                zIndex: 200, display: 'flex', flexDirection: 'column',
                padding: '1.5rem', overflowY: 'auto',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', paddingBottom: '1.25rem', borderBottom: '1px solid rgba(0,212,255,0.15)' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--color-primary)', letterSpacing: '3px', textTransform: 'uppercase' }}>Menú</span>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => setMobileMenuOpen(false)} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>✕</motion.button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', flex: 1 }}>
                {[{ path: '/', label: t('home'), icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> }, ...allItems, ...moreItems].map(item => {
                  const active = item.path === '/' ? location.pathname === '/' : isActive(item.path);
                  return (
                    <motion.button
                      key={item.path}
                      whileHover={{ x: 8 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate(item.path)}
                      style={{
                        background: active ? 'rgba(0,212,255,0.12)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${active ? 'var(--color-primary)' : 'rgba(255,255,255,0.08)'}`,
                        borderRadius: '12px', padding: '0.85rem 1rem',
                        color: active ? 'var(--color-primary)' : '#e0e0e8',
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

              <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: '0.75rem', color: '#555', textAlign: 'center' }}>
                © 2026 The Immaterium
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
