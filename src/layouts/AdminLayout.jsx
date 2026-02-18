import React from 'react';
import { Navigate, Outlet, Link, useNavigate } from 'react-router-dom';
import { useStore } from '../stores/useStore';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '2rem', color: 'red' }}>
                    <h2>Something went wrong.</h2>
                    <details style={{ whiteSpace: 'pre-wrap' }}>
                        {this.state.error && this.state.error.toString()}
                    </details>
                </div>
            );
        }

        return this.props.children;
    }
}

const AdminLayout = () => {
    const token = useStore((state) => state.token);
    const logout = useStore((state) => state.logout);
    const navigate = useNavigate();

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="admin-layout" style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-darker)', color: 'var(--color-light)' }}>
            <aside style={{
                width: '250px',
                background: 'var(--glass-bg)',
                backdropFilter: 'var(--glass-blur)',
                borderRight: '1px solid var(--glass-border)',
                padding: '2rem 1rem'
            }}>
                <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{
                        fontFamily: 'var(--font-display)',
                        color: 'var(--color-primary)',
                        marginBottom: '1rem',
                        textAlign: 'center',
                        letterSpacing: '2px',
                        fontSize: '1.5rem'
                    }}>
                        Admin Panel
                    </h3>
                    <Link to="/" style={{
                        display: 'block',
                        padding: '0.5rem',
                        color: 'rgba(255,255,255,0.7)',
                        textDecoration: 'none',
                        fontSize: '0.9rem',
                        textAlign: 'center',
                        marginBottom: '1rem'
                    }}>
                        ← Volver al sitio
                    </Link>
                    <button
                        onClick={handleLogout}
                        style={{
                            width: '100%',
                            padding: '0.8rem',
                            background: 'rgba(255,0,0,0.2)',
                            border: '1px solid rgba(255,0,0,0.5)',
                            borderRadius: '8px',
                            color: '#ff6464',
                            cursor: 'pointer',
                            fontFamily: 'var(--font-display)',
                            fontSize: '0.9rem',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => {
                            e.target.style.background = 'rgba(255,0,0,0.3)';
                        }}
                        onMouseLeave={e => {
                            e.target.style.background = 'rgba(255,0,0,0.2)';
                        }}
                    >
                        🚪 Cerrar Sesión
                    </button>
                </div>
                <nav>
                    <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <li>
                            <Link to="/admin" style={{
                                display: 'block',
                                padding: '10px 15px',
                                color: 'var(--color-light)',
                                textDecoration: 'none',
                                borderRadius: '8px',
                                transition: 'all 0.3s ease',
                                background: 'transparent'
                            }}
                                onMouseEnter={(e) => e.target.style.background = 'var(--glass-bg-hover)'}
                                onMouseLeave={(e) => e.target.style.background = 'transparent'}
                            >
                                Dashboard
                            </Link>
                        </li>
                        <li>
                            <Link to="/admin/armies" style={{
                                display: 'block',
                                padding: '10px 15px',
                                color: 'var(--color-light)',
                                textDecoration: 'none',
                                borderRadius: '8px',
                                transition: 'all 0.3s ease',
                                background: 'transparent'
                            }}
                                onMouseEnter={(e) => e.target.style.background = 'var(--glass-bg-hover)'}
                                onMouseLeave={(e) => e.target.style.background = 'transparent'}
                            >
                                Armies
                            </Link>
                        </li>
                        <li>
                            <Link to="/admin/guides" style={{
                                display: 'block',
                                padding: '10px 15px',
                                color: 'var(--color-light)',
                                textDecoration: 'none',
                                borderRadius: '8px',
                                transition: 'all 0.3s ease',
                                background: 'transparent'
                            }}
                                onMouseEnter={(e) => e.target.style.background = 'var(--glass-bg-hover)'}
                                onMouseLeave={(e) => e.target.style.background = 'transparent'}
                            >
                                Guides
                            </Link>
                        </li>
                        <li>
                            <Link to="/admin/reports" style={{
                                display: 'block',
                                padding: '10px 15px',
                                color: 'var(--color-light)',
                                textDecoration: 'none',
                                borderRadius: '8px',
                                transition: 'all 0.3s ease',
                                background: 'transparent'
                            }}
                                onMouseEnter={(e) => e.target.style.background = 'var(--glass-bg-hover)'}
                                onMouseLeave={(e) => e.target.style.background = 'transparent'}
                            >
                                Reports
                            </Link>
                        </li>
                        <li>
                            <Link to="/admin/lore" style={{
                                display: 'block',
                                padding: '10px 15px',
                                color: 'var(--color-light)',
                                textDecoration: 'none',
                                borderRadius: '8px',
                                transition: 'all 0.3s ease',
                                background: 'transparent'
                            }}
                                onMouseEnter={(e) => e.target.style.background = 'var(--glass-bg-hover)'}
                                onMouseLeave={(e) => e.target.style.background = 'transparent'}
                            >
                                📖 Lore
                            </Link>
                        </li>
                    </ul>
                </nav>
            </aside>
            <main style={{ flex: 1, padding: '3rem', overflowY: 'auto' }}>
                <ErrorBoundary>
                    <Outlet />
                </ErrorBoundary>
            </main>
        </div>
    );
};

export default AdminLayout;
