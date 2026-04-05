import React, { useState, useEffect } from 'react'
import { Navigate, Outlet, NavLink, Link, useNavigate, useLocation } from 'react-router-dom'
import { useStore } from '../stores/useStore'
import { ToastProvider } from '../components/Admin/Toast'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error', error, errorInfo)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', color: '#ff4466' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: '1rem' }}>Algo ha ido mal</h2>
          <details style={{ whiteSpace: 'pre-wrap', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>
            {this.state.error && this.state.error.toString()}
          </details>
        </div>
      )
    }
    return this.props.children
  }
}

const buildNavItems = (pendingMarketplace, isLeader) => [
  { to: '/admin', label: 'Dashboard', end: true, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> },
  { to: '/admin/armies', label: 'Ejércitos', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
  { to: '/admin/guides', label: 'Guías', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18.37 2.63 14 7l-1.59-1.59a2 2 0 0 0-2.82 0L8 7l9 9 1.59-1.59a2 2 0 0 0 0-2.82L17 10l4.37-4.37a2.12 2.12 0 1 0-3-3z"/><path d="M9 8c-2 3-4 3.5-7 4l8 10c2-1 6-5 6-7"/></svg> },
  { to: '/admin/reports', label: 'Informes', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" y1="19" x2="19" y2="13"/><line x1="16" y1="16" x2="20" y2="20"/><line x1="19" y1="21" x2="21" y2="19"/></svg> },
  { to: '/admin/lore', label: 'Lore', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg> },
  { to: '/admin/news', label: 'Noticias', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a4 4 0 0 1-4 4z"/><path d="M8 6h12"/><path d="M8 10h12"/><path d="M8 14h8"/></svg> },
  { to: '/admin/paints', label: 'Pinturas', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18.37 2.63 14 7l-1.59-1.59a2 2 0 0 0-2.82 0L8 7l9 9 1.59-1.59a2 2 0 0 0 0-2.82L17 10l4.37-4.37a2.12 2.12 0 1 0-3-3z"/><path d="M9 8c-2 3-4 3.5-7 4l8 10c2-1 6-5 6-7"/></svg> },
  { to: '/admin/marketplace', label: 'Marketplace', badge: pendingMarketplace, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg> },
  ...(!isLeader ? [
    { to: '/admin/users', label: 'Usuarios', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
    { to: '/admin/new-recruit', label: 'New Recruit', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg> },
  ] : []),
]

// Hamburger icon
const HamburgerIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6"/>
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
)

// Close icon
const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

const AdminLayout = () => {
  const token = useStore(state => state.token)
  const user = useStore(state => state.user)
  const logout = useStore(state => state.logout)
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [pendingMarketplace, setPendingMarketplace] = useState(0)

  useEffect(() => {
    if (!token) return
    fetch(`${import.meta.env.VITE_API_URL || ''}/api/purchase-requests/pending-count/`, {
      headers: { Authorization: `Token ${token}` }
    }).then(r => r.json()).then(d => setPendingMarketplace(d.count || 0)).catch(() => {})
  }, [token])

  const navItems = buildNavItems(pendingMarketplace, user?.isLeader && !user?.isAdmin)

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  // Prevent body scroll when sidebar open on mobile
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isMobile, sidebarOpen])

  if (!token) return <Navigate to="/login" replace />

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const sidebarVisible = !isMobile || sidebarOpen

  return (
    <ToastProvider>
      <style>{`
        .admin-layout { display: flex; min-height: 100vh; background: var(--color-darker); color: var(--color-light); }
        .admin-sidebar {
          width: 240px; min-height: 100vh;
          background: rgba(5,5,20,0.97);
          border-right: 1px solid rgba(0,212,255,0.15);
          display: flex; flex-direction: column;
          padding: 1.5rem 1rem; gap: 0;
          flex-shrink: 0; position: sticky; top: 0; height: 100vh; overflow-y: auto;
          transition: transform 0.28s cubic-bezier(0.4,0,0.2,1);
          z-index: 200;
        }
        .admin-main {
          flex: 1; padding: 2.5rem 3rem; overflow-y: auto; min-height: 100vh;
        }
        .admin-topbar { display: none; }

        @media (max-width: 767px) {
          .admin-sidebar {
            position: fixed; top: 0; left: 0; bottom: 0;
            width: min(280px, 82vw);
            transform: translateX(-100%);
            box-shadow: 4px 0 32px rgba(0,0,0,0.6);
          }
          .admin-sidebar.open { transform: translateX(0); }
          .admin-overlay {
            display: block; position: fixed; inset: 0;
            background: rgba(0,0,0,0.6); z-index: 190;
            backdrop-filter: blur(2px);
          }
          .admin-main {
            padding: 1rem; padding-top: calc(56px + 1rem);
          }
          .admin-topbar {
            display: flex; align-items: center; gap: 1rem;
            position: fixed; top: 0; left: 0; right: 0; height: 56px;
            background: rgba(5,5,20,0.97);
            border-bottom: 1px solid rgba(0,212,255,0.12);
            padding: 0 1rem; z-index: 180;
          }
          .admin-topbar-title {
            flex: 1; font-family: var(--font-display);
            font-size: 0.85rem; letter-spacing: 2px;
            background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
            -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          }
        }
        @media (min-width: 768px) and (max-width: 1100px) {
          .admin-main { padding: 2rem 1.5rem; }
        }
      `}</style>

      <div className="admin-layout">
        {/* Mobile top bar */}
        <div className="admin-topbar">
          <button
            onClick={() => setSidebarOpen(o => !o)}
            style={{
              background: 'transparent', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '8px', padding: '6px 8px', color: 'rgba(255,255,255,0.8)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              minWidth: 40, minHeight: 40,
            }}
            aria-label="Abrir menú"
          >
            <HamburgerIcon />
          </button>
          <span className="admin-topbar-title">ADMIN PANEL</span>
        </div>

        {/* Overlay (mobile only) */}
        {isMobile && sidebarOpen && (
          <div className="admin-overlay" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Sidebar */}
        <aside className={`admin-sidebar${sidebarOpen ? ' open' : ''}`}>
          {/* Logo + close button on mobile */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <div>
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: '0.7rem',
                letterSpacing: '3px', color: 'rgba(255,255,255,0.4)',
                marginBottom: '0.3rem', textTransform: 'uppercase',
              }}>
                The Immaterium
              </div>
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: '1rem',
                letterSpacing: '2px',
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>
                ADMIN PANEL
              </div>
            </div>
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px', padding: '6px', color: 'rgba(255,255,255,0.6)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
                aria-label="Cerrar menú"
              >
                <CloseIcon />
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav style={{ flex: 1 }}>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {navItems.map(item => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    style={({ isActive }) => ({
                      display: 'flex', alignItems: 'center', gap: '0.75rem',
                      padding: '0.75rem 1rem', borderRadius: '10px',
                      textDecoration: 'none', fontSize: '0.9rem',
                      fontFamily: 'var(--font-body)',
                      fontWeight: isActive ? '600' : '400',
                      color: isActive ? 'var(--color-primary)' : 'rgba(255,255,255,0.7)',
                      background: isActive ? 'rgba(0,212,255,0.1)' : 'transparent',
                      border: isActive ? '1px solid rgba(0,212,255,0.25)' : '1px solid transparent',
                      transition: 'all 0.2s ease',
                      minHeight: '44px',
                    })}
                  >
                    <span style={{ display: 'flex', flexShrink: 0, opacity: 0.8 }}>{item.icon}</span>
                    {item.label}
                    {item.badge > 0 && (
                      <span style={{ background: '#f97316', color: '#fff', borderRadius: '10px', padding: '1px 7px', fontSize: '0.7rem', fontWeight: 'bold', marginLeft: 'auto' }}>
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Bottom actions */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Link
              to="/"
              style={{
                display: 'flex', alignItems: 'center', gap: '0.6rem',
                padding: '0.75rem 1rem', borderRadius: '8px',
                color: 'rgba(255,255,255,0.5)', textDecoration: 'none',
                fontSize: '0.85rem', transition: 'color 0.2s', minHeight: '44px',
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.85)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              Volver al sitio
            </Link>
            <button
              onClick={handleLogout}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.6rem',
                padding: '0.75rem 1rem', background: 'transparent',
                border: '1px solid rgba(255,68,102,0.3)', borderRadius: '8px',
                color: '#ff6464', cursor: 'pointer', fontSize: '0.85rem',
                fontFamily: 'var(--font-body)', transition: 'all 0.2s',
                textAlign: 'left', minHeight: '44px',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255,68,102,0.12)'
                e.currentTarget.style.borderColor = 'rgba(255,68,102,0.6)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.borderColor = 'rgba(255,68,102,0.3)'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Cerrar sesión
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="admin-main">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </ToastProvider>
  )
}

export default AdminLayout
