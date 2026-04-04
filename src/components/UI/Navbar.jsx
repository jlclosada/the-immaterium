/**
 * NAVBAR — Apple-style floating navigation bar
 * - Transparent at top, glass blur on scroll
 * - Desktop: logo | nav links (center) | auth (right)
 * - Mobile: logo | quick auth + hamburger
 * - Dropdown menus with AnimatePresence
 * - Auth-aware (login/register vs user avatar)
 */
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../stores/useStore';
import { useTheme } from '../../hooks/useTheme';

const PRIMARY_LINKS = [
  { label: 'Ejércitos', to: '/armies' },
  { label: 'Pintura', to: '/guides' },
  { label: 'Batallas', to: '/battle-reports' },
  { label: 'Marketplace', to: '/marketplace' },
];

const MORE_LINKS = [
  { label: 'Army Builder', to: '/army-builder', color: '#6366f1' },
  { label: 'Lore',         to: '/lore',         color: 'var(--color-accent)' },
  { label: 'Noticias',     to: '/news',         color: '#f59e0b' },
  { label: 'Videos',       to: '/videos',       color: '#ff4444' },
];

/* ── Sub-components ───────────────────────────────────────────────────────── */

function NavLink({ to, children, isLight }) {
  const navigate = useNavigate();
  const location = useLocation();
  const active = location.pathname === to || location.pathname.startsWith(to + '/');
  const [hovered, setHovered] = useState(false);
  return (
    <motion.button
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={() => navigate(to)}
      style={{
        position: 'relative', padding: '0.45rem 0.85rem',
        background: 'transparent', border: 'none',
        color: active
          ? 'var(--color-primary)'
          : isLight ? 'rgba(13,19,51,0.72)' : 'rgba(255,255,255,0.72)',
        fontFamily: 'var(--font-body)', fontSize: '0.9rem',
        fontWeight: active ? 600 : 400,
        cursor: 'pointer', borderRadius: '8px',
        transition: 'color 0.2s',
      }}
    >
      {children}
      <motion.span
        animate={{ scaleX: hovered || active ? 1 : 0, opacity: hovered || active ? 1 : 0 }}
        style={{
          position: 'absolute', bottom: '2px',
          left: '0.85rem', right: '0.85rem',
          height: '1.5px',
          background: 'linear-gradient(90deg, var(--color-primary), #0066cc)',
          borderRadius: '1px',
          display: 'block',
          transformOrigin: 'center',
        }}
        transition={{ duration: 0.2 }}
      />
    </motion.button>
  );
}

function DropdownItem({ label, color, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <motion.button
      whileHover={{ x: 4 }}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.65rem',
        width: '100%', padding: '0.6rem 0.85rem',
        background: hov ? `${color}12` : 'transparent',
        border: 'none', borderRadius: '10px',
        cursor: 'pointer',
        color: hov ? color : 'rgba(255,255,255,0.75)',
        fontFamily: 'var(--font-body)', fontSize: '0.88rem',
        textAlign: 'left', transition: 'all 0.15s',
      }}
    >
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: color, flexShrink: 0, boxShadow: `0 0 6px ${color}60` }} />
      {label}
    </motion.button>
  );
}

/* ── Main component ─────────────────────────────────────────────────────── */

export default function Navbar() {
  const [scrolled, setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen]   = useState(false);
  const [userOpen, setUserOpen]   = useState(false);
  const moreRef = useRef(null);
  const userRef = useRef(null);

  const { token, user, logout } = useStore();
  const { isLight, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  /* Close menus on route change */
  useEffect(() => {
    setMobileOpen(false);
    setMoreOpen(false);
    setUserOpen(false);
  }, [location.pathname]);

  /* Scroll detection */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Close dropdowns on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false);
      if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => { logout(); setUserOpen(false); setMobileOpen(false); };
  const initials = (user?.username || user?.name || 'U')[0].toUpperCase();

  /* ── Styles ── */
  const navBg = scrolled
    ? (isLight ? 'rgba(238,242,251,0.88)' : 'rgba(4,4,14,0.88)')
    : 'transparent';
  const navBorder = scrolled
    ? (isLight ? '1px solid rgba(0,153,204,0.12)' : '1px solid rgba(255,255,255,0.07)')
    : '1px solid transparent';

  const dropdownStyle = {
    position: 'absolute', top: 'calc(100% + 10px)',
    background: isLight ? 'rgba(248,250,255,0.98)' : 'rgba(8,8,22,0.98)',
    border: isLight ? '1px solid rgba(0,153,204,0.15)' : '1px solid rgba(255,255,255,0.1)',
    borderRadius: '18px',
    padding: '0.5rem',
    backdropFilter: 'blur(24px) saturate(180%)',
    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
    boxShadow: '0 12px 48px rgba(0,0,0,0.25)',
    zIndex: 200,
  };

  return (
    <>
      {/* ── Navbar bar ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 150,
        height: '62px',
        display: 'flex', alignItems: 'center',
        padding: '0 clamp(1rem, 4vw, 2.5rem)',
        background: navBg, borderBottom: navBorder,
        backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
        boxShadow: scrolled ? '0 1px 40px rgba(0,0,0,0.18)' : 'none',
        transition: 'background 0.35s, border-color 0.35s, backdrop-filter 0.35s, box-shadow 0.35s',
      }}>
        {/* Logo */}
        <style>{`
          .logo-desktop { display: block; }
          .logo-mobile  { display: none;  }
          @media (max-width: 820px) {
            .logo-desktop { display: none  !important; }
            .logo-mobile  { display: block !important; }
          }
        `}</style>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <img src="/logo-full.svg" alt="The Immaterium" className="logo-desktop"
            style={{ height: '38px', width: 'auto', objectFit: 'contain' }} />
          <img src="/logo-icon.svg" alt="The Immaterium" className="logo-mobile"
            style={{ height: '34px', width: '34px', objectFit: 'contain' }} />
        </Link>

        {/* ── Desktop center nav ── */}
        <div className="nb-center" style={{ display: 'flex', alignItems: 'center', gap: '0', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
          {PRIMARY_LINKS.map(l => (
            <NavLink key={l.to} to={l.to} isLight={isLight}>{l.label}</NavLink>
          ))}

          {/* "Más" dropdown */}
          <div ref={moreRef} style={{ position: 'relative' }}>
            <motion.button
              onClick={() => setMoreOpen(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.3rem',
                padding: '0.45rem 0.85rem', background: 'transparent', border: 'none',
                color: isLight ? 'rgba(13,19,51,0.72)' : 'rgba(255,255,255,0.72)',
                fontFamily: 'var(--font-body)', fontSize: '0.9rem',
                cursor: 'pointer', borderRadius: '8px',
              }}
            >
              Más
              <motion.svg
                animate={{ rotate: moreOpen ? 180 : 0 }} transition={{ duration: 0.2 }}
                width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5"
              >
                <polyline points="6 9 12 15 18 9"/>
              </motion.svg>
            </motion.button>

            <AnimatePresence>
              {moreOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  style={{ ...dropdownStyle, left: '50%', transform: 'translateX(-50%)', minWidth: '190px' }}
                >
                  {MORE_LINKS.map(l => (
                    <DropdownItem key={l.to} label={l.label} color={l.color}
                      onClick={() => { navigate(l.to); setMoreOpen(false); }} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Desktop right side ── */}
        <div className="nb-right" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>
          {/* Search button */}
          <motion.button
            onClick={() => navigate('/search')} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            title="Búsqueda global"
            style={{
              width: '34px', height: '34px', borderRadius: '50%', border: 'none',
              background: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.07)',
              cursor: 'pointer', color: isLight ? '#555' : 'rgba(200,220,255,0.8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.2s',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </motion.button>

          {/* Theme toggle */}
          <motion.button
            onClick={toggleTheme} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            title={isLight ? 'Modo oscuro' : 'Modo claro'}
            style={{
              width: '34px', height: '34px', borderRadius: '50%', border: 'none',
              background: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.07)',
              cursor: 'pointer', color: isLight ? '#555' : 'rgba(200,220,255,0.8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.2s',
            }}
          >
            {isLight
              ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="4.22" y1="4.22" x2="6.34" y2="6.34"/><line x1="17.66" y1="17.66" x2="19.78" y2="19.78"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/><line x1="4.22" y1="19.78" x2="6.34" y2="17.66"/><line x1="17.66" y1="6.34" x2="19.78" y2="4.22"/></svg>
              : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            }
          </motion.button>

          {!token ? (
            <>
              <Link to="/signin" style={{
                padding: '0.42rem 0.95rem', borderRadius: '8px',
                color: isLight ? 'rgba(13,19,51,0.8)' : 'rgba(255,255,255,0.8)',
                fontFamily: 'var(--font-body)', fontSize: '0.88rem',
                textDecoration: 'none', transition: 'background 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.07)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                Entrar
              </Link>
              <Link to="/signin?mode=register" style={{
                padding: '0.45rem 1.1rem', borderRadius: '20px',
                background: 'linear-gradient(135deg, var(--color-primary) 0%, #0055cc 100%)',
                color: '#fff', fontFamily: 'var(--font-body)', fontSize: '0.88rem',
                fontWeight: 600, textDecoration: 'none',
                boxShadow: '0 2px 12px rgba(0,212,255,0.25)',
                transition: 'box-shadow 0.2s, transform 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,212,255,0.4)'; e.currentTarget.style.transform = 'scale(1.03)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,212,255,0.25)'; e.currentTarget.style.transform = 'scale(1)'; }}
              >
                Crear cuenta
              </Link>
            </>
          ) : (
            /* User dropdown */
            <div ref={userRef} style={{ position: 'relative' }}>
              <motion.button
                onClick={() => setUserOpen(v => !v)}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                style={{
                  width: '36px', height: '36px', borderRadius: '50%', border: '2px solid rgba(0,212,255,0.35)',
                  background: 'linear-gradient(135deg, var(--color-primary), #0055cc)',
                  cursor: 'pointer', color: '#fff',
                  fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.9rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 12px rgba(0,212,255,0.2)',
                }}
              >
                {initials}
              </motion.button>

              <AnimatePresence>
                {userOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    style={{ ...dropdownStyle, right: 0, minWidth: '210px' }}
                  >
                    {/* User header */}
                    <div style={{
                      padding: '0.75rem 0.9rem 0.85rem',
                      borderBottom: `1px solid ${isLight ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.07)'}`,
                      marginBottom: '0.4rem',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-primary), #0055cc)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.9rem', color: '#fff', flexShrink: 0 }}>{initials}</div>
                        <div>
                          <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', color: isLight ? 'var(--text-primary)' : '#fff', margin: 0, letterSpacing: '0.5px' }}>
                            {user?.username || user?.name}
                          </p>
                          <div style={{ display: 'flex', gap: '0.35rem', marginTop: '2px', flexWrap: 'wrap' }}>
                            {user?.isPremium && <span style={{ fontSize: '0.58rem', color: '#FFD700', letterSpacing: '1px' }}>★ PREMIUM</span>}
                            {user?.isAdmin && <span style={{ fontSize: '0.58rem', color: '#ff8080', letterSpacing: '1px' }}>ADMIN</span>}
                            {user?.isLeader && <span style={{ fontSize: '0.58rem', color: '#50c878', letterSpacing: '1px' }}>LÍDER</span>}
                          </div>
                        </div>
                      </div>
                    </div>

                    {[
                      { label: 'Mi perfil', to: '/profile', color: 'var(--color-primary)' },
                      ...(user?.isAdmin ? [{ label: 'Panel de control', to: '/admin', color: '#ff8080' }] : []),
                    ].map(item => (
                      <DropdownItem key={item.to} label={item.label} color={item.color}
                        onClick={() => { navigate(item.to); setUserOpen(false); }} />
                    ))}

                    <div style={{ borderTop: `1px solid ${isLight ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.07)'}`, marginTop: '0.4rem', paddingTop: '0.4rem' }}>
                      <DropdownItem label="Cerrar sesión" color="#ff6464" onClick={handleLogout} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* ── Mobile: quick auth + hamburger ── */}
        <div className="nb-mobile" style={{ display: 'none', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>
          {/* Mobile search icon */}
          <button
            onClick={() => navigate('/search')}
            style={{
              width: '32px', height: '32px', borderRadius: '50%', border: 'none',
              background: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.07)',
              cursor: 'pointer', color: isLight ? '#555' : 'rgba(200,220,255,0.8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>
          {!token ? (
            <Link to="/signin" style={{
              padding: '0.38rem 0.9rem', borderRadius: '16px',
              background: 'linear-gradient(135deg, var(--color-primary), #0055cc)',
              color: '#fff', fontFamily: 'var(--font-body)', fontSize: '0.82rem',
              fontWeight: 600, textDecoration: 'none',
            }}>Entrar</Link>
          ) : (
            <div onClick={() => navigate('/profile')} style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--color-primary), #0055cc)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.85rem', color: '#fff',
              cursor: 'pointer', border: '2px solid rgba(0,212,255,0.3)',
            }}>{initials}</div>
          )}
          <button
            onClick={() => setMobileOpen(v => !v)}
            style={{ width: '36px', height: '36px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '5px', padding: 0 }}
          >
            <motion.span animate={{ rotate: mobileOpen ? 45 : 0, y: mobileOpen ? 7 : 0 }}
              style={{ display: 'block', width: '18px', height: '1.8px', background: isLight ? '#0d1333' : '#fff', borderRadius: '2px', transformOrigin: 'center' }} />
            <motion.span animate={{ opacity: mobileOpen ? 0 : 1 }}
              style={{ display: 'block', width: '18px', height: '1.8px', background: isLight ? '#0d1333' : '#fff', borderRadius: '2px' }} />
            <motion.span animate={{ rotate: mobileOpen ? -45 : 0, y: mobileOpen ? -7 : 0 }}
              style={{ display: 'block', width: '18px', height: '1.8px', background: isLight ? '#0d1333' : '#fff', borderRadius: '2px', transformOrigin: 'center' }} />
          </button>
        </div>
      </nav>

      {/* ── Mobile slide menu ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 140, backdropFilter: 'blur(6px)' }}
            />
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 26, stiffness: 240 }}
              style={{
                position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 145,
                width: 'min(82vw, 320px)',
                background: isLight ? 'rgba(245,248,255,0.98)' : 'rgba(5,5,16,0.98)',
                backdropFilter: 'blur(28px)',
                borderLeft: `1px solid ${isLight ? 'rgba(0,153,204,0.12)' : 'rgba(255,255,255,0.08)'}`,
                boxShadow: '-12px 0 60px rgba(0,0,0,0.35)',
                display: 'flex', flexDirection: 'column',
                padding: '5rem 1.25rem 2rem',
                overflowY: 'auto',
              }}
            >
              {/* Nav links */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', flex: 1 }}>
                {[...PRIMARY_LINKS, ...MORE_LINKS].map((l, i) => (
                  <motion.button
                    key={l.to}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    whileHover={{ x: 6 }}
                    onClick={() => { navigate(l.to); setMobileOpen(false); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.65rem',
                      padding: '0.8rem 1rem', background: 'transparent', border: 'none',
                      borderRadius: '12px', cursor: 'pointer',
                      color: isLight ? 'var(--text-primary)' : 'rgba(255,255,255,0.85)',
                      fontFamily: 'var(--font-body)', fontSize: '1rem',
                      textAlign: 'left', transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = isLight ? 'rgba(0,153,204,0.08)' : 'rgba(255,255,255,0.06)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {l.color && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: l.color, flexShrink: 0 }} />}
                    {l.label}
                  </motion.button>
                ))}
              </div>

              {/* Auth section */}
              <div style={{ paddingTop: '1.25rem', borderTop: `1px solid ${isLight ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.08)'}` }}>
                {!token ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <button onClick={() => { navigate('/signin'); setMobileOpen(false); }} style={{ padding: '0.85rem', background: 'linear-gradient(135deg, var(--color-primary), #0055cc)', border: 'none', borderRadius: '14px', color: '#fff', fontFamily: 'var(--font-body)', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer' }}>
                      Iniciar sesión
                    </button>
                    <button onClick={() => { navigate('/signin?mode=register'); setMobileOpen(false); }} style={{ padding: '0.85rem', background: 'transparent', border: '1px solid rgba(0,212,255,0.3)', borderRadius: '14px', color: 'var(--color-primary)', fontFamily: 'var(--font-body)', fontSize: '0.95rem', cursor: 'pointer' }}>
                      Crear cuenta gratis
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem', background: 'rgba(0,212,255,0.06)', borderRadius: '14px', border: '1px solid rgba(0,212,255,0.12)', marginBottom: '0.25rem' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-primary), #0055cc)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem', color: '#fff', flexShrink: 0 }}>{initials}</div>
                      <div>
                        <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', color: isLight ? 'var(--text-primary)' : '#fff', margin: 0 }}>{user?.username || user?.name}</p>
                        {user?.isPremium && <span style={{ fontSize: '0.62rem', color: '#FFD700' }}>★ Premium</span>}
                      </div>
                    </div>
                    <button onClick={() => { navigate('/profile'); setMobileOpen(false); }} style={{ padding: '0.75rem 1rem', background: 'transparent', border: `1px solid ${isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '12px', color: isLight ? 'var(--text-primary)' : 'rgba(255,255,255,0.8)', fontFamily: 'var(--font-body)', fontSize: '0.9rem', cursor: 'pointer', textAlign: 'left' }}>
                      Mi perfil
                    </button>
                    {user?.isAdmin && (
                      <button onClick={() => { navigate('/admin'); setMobileOpen(false); }} style={{ padding: '0.75rem 1rem', background: 'rgba(180,20,20,0.07)', border: '1px solid rgba(180,20,20,0.2)', borderRadius: '12px', color: '#ff8080', fontFamily: 'var(--font-body)', fontSize: '0.9rem', cursor: 'pointer', textAlign: 'left' }}>
                        Panel de control
                      </button>
                    )}
                    <button onClick={handleLogout} style={{ padding: '0.75rem 1rem', background: 'rgba(255,80,80,0.07)', border: '1px solid rgba(255,80,80,0.2)', borderRadius: '12px', color: '#ff8080', fontFamily: 'var(--font-body)', fontSize: '0.9rem', cursor: 'pointer', textAlign: 'left' }}>
                      Cerrar sesión
                    </button>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1.25rem' }}>
                  <span style={{ fontSize: '0.7rem', color: isLight ? 'var(--text-dim)' : 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-display)', letterSpacing: '1px' }}>TEMA</span>
                  <button onClick={toggleTheme} style={{ padding: '0.38rem 0.85rem', background: isLight ? 'rgba(0,153,204,0.1)' : 'rgba(255,255,255,0.07)', border: '1px solid rgba(0,212,255,0.25)', borderRadius: '20px', color: 'var(--color-primary)', fontFamily: 'var(--font-display)', fontSize: '0.65rem', letterSpacing: '1px', cursor: 'pointer' }}>
                    {isLight ? '☀ CLARO' : '☽ OSCURO'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Responsive CSS */}
      <style>{`
        .nb-center, .nb-right { display: flex; }
        .nb-mobile { display: none !important; }
        @media(max-width:820px) {
          .nb-center { display: none !important; }
          .nb-right   { display: none !important; }
          .nb-mobile  { display: flex !important; }
        }
      `}</style>
    </>
  );
}
