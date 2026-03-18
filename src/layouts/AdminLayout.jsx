import React from 'react'
import { Navigate, Outlet, NavLink, Link, useNavigate } from 'react-router-dom'
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

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>, end: true },
  { to: '/admin/armies', label: 'Ejércitos', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
  { to: '/admin/guides', label: 'Guías', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18.37 2.63 14 7l-1.59-1.59a2 2 0 0 0-2.82 0L8 7l9 9 1.59-1.59a2 2 0 0 0 0-2.82L17 10l4.37-4.37a2.12 2.12 0 1 0-3-3z"/><path d="M9 8c-2 3-4 3.5-7 4l8 10c2-1 6-5 6-7"/></svg> },
  { to: '/admin/reports', label: 'Informes', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" y1="19" x2="19" y2="13"/><line x1="16" y1="16" x2="20" y2="20"/><line x1="19" y1="21" x2="21" y2="19"/></svg> },
  { to: '/admin/lore', label: 'Lore', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg> },
  { to: '/admin/news', label: 'Noticias', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a4 4 0 0 1-4 4z"/><path d="M8 6h12"/><path d="M8 10h12"/><path d="M8 14h8"/></svg> },
  { to: '/admin/users', label: 'Usuarios', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  { to: '/admin/new-recruit', label: 'New Recruit', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg> },
]

const AdminLayout = () => {
  const token = useStore(state => state.token)
  const logout = useStore(state => state.logout)
  const navigate = useNavigate()

  if (!token) return <Navigate to="/login" replace />

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <ToastProvider>
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-darker)', color: 'var(--color-light)' }}>
        {/* Sidebar */}
        <aside style={{
          width: '240px',
          minHeight: '100vh',
          background: 'rgba(5,5,20,0.95)',
          borderRight: '1px solid rgba(0,212,255,0.15)',
          display: 'flex',
          flexDirection: 'column',
          padding: '1.5rem 1rem',
          gap: '0',
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflowY: 'auto',
        }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.75rem',
              letterSpacing: '3px',
              color: 'rgba(255,255,255,0.4)',
              marginBottom: '0.4rem',
              textTransform: 'uppercase',
            }}>
              The Immaterium
            </div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.1rem',
              letterSpacing: '2px',
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              ADMIN PANEL
            </div>
          </div>

          {/* Navigation */}
          <nav style={{ flex: 1 }}>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {navItems.map(item => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.7rem 1rem',
                      borderRadius: '10px',
                      textDecoration: 'none',
                      fontSize: '0.9rem',
                      fontFamily: 'var(--font-body)',
                      fontWeight: isActive ? '600' : '400',
                      color: isActive ? 'var(--color-primary)' : 'rgba(255,255,255,0.7)',
                      background: isActive
                        ? 'rgba(0,212,255,0.1)'
                        : 'transparent',
                      border: isActive
                        ? '1px solid rgba(0,212,255,0.25)'
                        : '1px solid transparent',
                      transition: 'all 0.2s ease',
                    })}
                  >
                    <span style={{ display: 'flex', flexShrink: 0, opacity: 0.8 }}>{item.icon}</span>
                    {item.label}
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
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.6rem 1rem',
                borderRadius: '8px',
                color: 'rgba(255,255,255,0.5)',
                textDecoration: 'none',
                fontSize: '0.85rem',
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.85)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
            >
              ← Volver al sitio
            </Link>
            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.6rem 1rem',
                background: 'transparent',
                border: '1px solid rgba(255,68,102,0.3)',
                borderRadius: '8px',
                color: '#ff6464',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontFamily: 'var(--font-body)',
                transition: 'all 0.2s',
                textAlign: 'left',
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
              Cerrar sesión
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, padding: '2.5rem 3rem', overflowY: 'auto', minHeight: '100vh' }}>
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </ToastProvider>
  )
}

export default AdminLayout
