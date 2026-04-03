import { Component } from 'react';
import { Link } from 'react-router-dom';

/**
 * Catches unhandled render errors and shows a friendly fallback
 * instead of a blank white screen.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--color-darker)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center',
        color: '#fff',
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.4 }}>⚠</div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(1.2rem, 4vw, 1.8rem)',
          letterSpacing: '2px',
          marginBottom: '0.75rem',
          color: '#ff6464',
        }}>
          Algo salió mal
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.9rem', marginBottom: '2rem', maxWidth: '420px', lineHeight: 1.6 }}>
          Se produjo un error inesperado. Prueba a recargar la página.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
            style={{
              padding: '0.7rem 1.5rem',
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
              border: 'none',
              borderRadius: '10px',
              color: '#000',
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: '0.8rem',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            Recargar
          </button>
          <Link
            to="/"
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              padding: '0.7rem 1.5rem',
              background: 'transparent',
              border: '1px solid rgba(0,212,255,0.3)',
              borderRadius: '10px',
              color: 'var(--color-primary)',
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '0.8rem',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              cursor: 'pointer',
              textDecoration: 'none',
            }}
          >
            Ir al inicio
          </Link>
        </div>
      </div>
    );
  }
}
