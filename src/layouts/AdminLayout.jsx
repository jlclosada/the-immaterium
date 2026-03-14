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
  { to: '/admin', label: 'Dashboard', icon: '📊', end: true },
  { to: '/admin/armies', label: 'Ejércitos', icon: '🛡️' },
  { to: '/admin/guides', label: 'Guías', icon: '🎨' },
  { to: '/admin/reports', label: 'Informes', icon: '⚔️' },
  { to: '/admin/lore', label: 'Lore', icon: '📖' },
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
                    <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{item.icon}</span>
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
              🚪 Cerrar sesión
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
