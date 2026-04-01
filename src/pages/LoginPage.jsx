/**
 * ADMIN LOGIN — Panel de Control (acceso restringido)
 * Diseño militarista, rojo/negro, totalmente distinto al login de usuario.
 */
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { useStore } from '../stores/useStore';

const SCAN_CSS = `
@keyframes scan {
  0%   { top: 0; opacity: 0.7; }
  100% { top: 100%; opacity: 0; }
}
@keyframes blink-border {
  0%, 100% { border-color: rgba(200,30,30,0.4); }
  50%       { border-color: rgba(200,30,30,0.9); }
}
@keyframes flicker {
  0%, 96%, 100% { opacity: 1; }
  97%           { opacity: 0.4; }
  98%           { opacity: 1; }
  99%           { opacity: 0.6; }
}
`;

function injectCSS(id, css) {
  if (typeof document !== 'undefined' && !document.getElementById(id)) {
    const el = document.createElement('style');
    el.id = id;
    el.textContent = css;
    document.head.appendChild(el);
  }
}

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const navigate = useNavigate();
  const setToken = useStore(s => s.setToken);

  useEffect(() => {
    injectCSS('admin-login-css', SCAN_CSS);
    document.title = 'Acceso Restringido | The Immaterium';
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.login(username, password);
      setToken(data.token, username);
      navigate('/admin');
    } catch {
      setAttempts(a => a + 1);
      setError('Credenciales incorrectas. Acceso denegado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#04010a',
      display: 'flex',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* ── Animated scan line ── */}
      <div style={{
        position: 'absolute', left: 0, right: 0, height: '2px',
        background: 'linear-gradient(90deg, transparent, rgba(180,20,20,0.7), transparent)',
        animation: 'scan 4s linear infinite',
        zIndex: 1, pointerEvents: 'none',
      }} />

      {/* ── Grid overlay ── */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          linear-gradient(rgba(180,20,20,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(180,20,20,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '48px 48px',
        pointerEvents: 'none',
      }} />

      {/* ── Corner decorations ── */}
      {['topLeft','topRight','bottomLeft','bottomRight'].map(corner => (
        <div key={corner} style={{
          position: 'absolute',
          width: '60px', height: '60px',
          top: corner.startsWith('top') ? '1.5rem' : 'auto',
          bottom: corner.startsWith('bottom') ? '1.5rem' : 'auto',
          left: corner.endsWith('Left') ? '1.5rem' : 'auto',
          right: corner.endsWith('Right') ? '1.5rem' : 'auto',
          borderTop: corner.startsWith('top') ? '2px solid rgba(180,20,20,0.5)' : 'none',
          borderBottom: corner.startsWith('bottom') ? '2px solid rgba(180,20,20,0.5)' : 'none',
          borderLeft: corner.endsWith('Left') ? '2px solid rgba(180,20,20,0.5)' : 'none',
          borderRight: corner.endsWith('Right') ? '2px solid rgba(180,20,20,0.5)' : 'none',
          pointerEvents: 'none',
        }} />
      ))}

      {/* ── Red radial glow ── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(160,10,10,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* ── Left panel ── */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '3rem',
        borderRight: '1px solid rgba(180,20,20,0.15)',
      }} className="admin-left-panel">
        <style>{`.admin-left-panel { display: none; } @media(min-width:900px){.admin-left-panel{display:flex;}}`}</style>

        {/* Imperial Eagle SVG */}
        <motion.div
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 4, repeat: Infinity }}
          style={{ marginBottom: '3rem' }}
        >
          <svg width="120" height="120" viewBox="0 0 100 100" fill="none">
            <path d="M50 10 L20 35 L10 30 L25 55 L15 50 L35 75 L45 65 L50 80 L55 65 L65 75 L85 50 L75 55 L90 30 L80 35 Z"
              fill="rgba(180,20,20,0.15)" stroke="rgba(180,20,20,0.5)" strokeWidth="1"/>
            <circle cx="50" cy="48" r="10" fill="none" stroke="rgba(180,20,20,0.5)" strokeWidth="1.5"/>
            <circle cx="50" cy="48" r="4" fill="rgba(180,20,20,0.4)"/>
          </svg>
        </motion.div>

        <div style={{ fontFamily: 'var(--font-display)', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', letterSpacing: '5px', color: 'rgba(180,20,20,0.6)', marginBottom: '0.75rem' }}>
            IMPERIUM OF MAN
          </div>
          <div style={{ fontSize: '1.4rem', letterSpacing: '4px', color: 'rgba(220,220,220,0.8)', marginBottom: '0.5rem', animation: 'flicker 8s infinite' }}>
            THE IMMATERIUM
          </div>
          <div style={{ fontSize: '0.65rem', letterSpacing: '3px', color: 'rgba(180,20,20,0.5)', marginBottom: '3rem' }}>
            SISTEMA DE CONTROL
          </div>

          {[
            { label: 'NIVEL DE ACCESO', value: 'OMEGA-7' },
            { label: 'PROTOCOLO', value: 'ULTRA-SEGURO' },
            { label: 'ESTADO', value: 'ACTIVO' },
          ].map(item => (
            <div key={item.label} style={{
              display: 'flex', justifyContent: 'space-between', gap: '2rem',
              marginBottom: '0.75rem',
              padding: '0.5rem 0',
              borderBottom: '1px solid rgba(180,20,20,0.1)',
              fontSize: '0.7rem', letterSpacing: '1.5px',
            }}>
              <span style={{ color: 'rgba(255,255,255,0.3)' }}>{item.label}</span>
              <span style={{ color: item.value === 'ACTIVO' ? '#50c878' : 'rgba(180,20,20,0.8)' }}>{item.value}</span>
            </div>
          ))}

          <div style={{ marginTop: '3rem', fontSize: '0.65rem', color: 'rgba(255,255,255,0.12)', lineHeight: 1.6, fontStyle: 'italic', maxWidth: '280px' }}>
            "Por el Emperador, el conocimiento es poder.<br/>Guardarlo bien."
          </div>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 'clamp(1.5rem, 5vw, 3rem)',
        maxWidth: '520px',
        margin: '0 auto',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ width: '100%' }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <motion.div
              animate={{ opacity: [1, 0.6, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                background: 'rgba(180,20,20,0.1)',
                border: '1px solid rgba(180,20,20,0.4)',
                borderRadius: '4px',
                padding: '0.3rem 1rem',
                marginBottom: '1.5rem',
              }}
            >
              <svg width="10" height="10" viewBox="0 0 10 10">
                <circle cx="5" cy="5" r="4" fill="rgba(180,20,20,0.8)"/>
              </svg>
              <span style={{ fontSize: '0.6rem', letterSpacing: '3px', color: 'rgba(180,20,20,0.9)', fontFamily: 'var(--font-display)' }}>
                ACCESO RESTRINGIDO
              </span>
            </motion.div>

            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.4rem, 4vw, 1.9rem)',
              letterSpacing: '4px',
              color: '#fff',
              marginBottom: '0.5rem',
            }}>
              PANEL DE CONTROL
            </h1>
            <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.25)', letterSpacing: '1.5px' }}>
              Solo personal autorizado
            </p>
          </div>

          {/* Form card */}
          <div style={{
            background: 'rgba(20,5,5,0.9)',
            border: '1px solid rgba(180,20,20,0.3)',
            borderRadius: '4px',
            padding: 'clamp(1.5rem, 5vw, 2.5rem)',
            boxShadow: '0 0 60px rgba(180,20,20,0.08), inset 0 1px 0 rgba(255,255,255,0.03)',
            animation: error ? 'blink-border 0.4s ease' : 'none',
          }}>
            {/* Top accent */}
            <div style={{ height: '2px', background: 'linear-gradient(90deg, transparent, rgba(180,20,20,0.8), transparent)', marginBottom: '1.75rem', marginTop: '-2.5rem', marginLeft: '-2.5rem', marginRight: '-2.5rem' }} />

            {/* Attempts warning */}
            <AnimatePresence>
              {attempts > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.6rem',
                    padding: '0.6rem 0.9rem', marginBottom: '1.25rem',
                    background: 'rgba(180,20,20,0.08)',
                    border: '1px solid rgba(180,20,20,0.3)',
                    borderRadius: '3px',
                    fontSize: '0.75rem', color: 'rgba(220,80,80,0.9)',
                    fontFamily: 'var(--font-display)', letterSpacing: '1px',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  INTENTO {attempts} — {error || 'ACCESO DENEGADO'}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Username */}
              <div>
                <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '2.5px', color: 'rgba(180,20,20,0.7)', fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>
                  IDENTIFICADOR DE USUARIO
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(180,20,20,0.4)', display: 'flex' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </span>
                  <input
                    type="text" value={username} onChange={e => setUsername(e.target.value)}
                    placeholder="nombre_de_usuario" required autoComplete="username"
                    style={{
                      width: '100%', padding: '0.85rem 1rem 0.85rem 2.75rem',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(180,20,20,0.2)',
                      borderRadius: '3px', color: '#fff', fontSize: '0.95rem',
                      fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={e => e.target.style.borderColor = 'rgba(180,20,20,0.7)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(180,20,20,0.2)'}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '2.5px', color: 'rgba(180,20,20,0.7)', fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>
                  CÓDIGO DE ACCESO
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(180,20,20,0.4)', display: 'flex' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </span>
                  <input
                    type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••••••" required autoComplete="current-password"
                    style={{
                      width: '100%', padding: '0.85rem 3rem 0.85rem 2.75rem',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(180,20,20,0.2)',
                      borderRadius: '3px', color: '#fff', fontSize: '0.95rem',
                      fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={e => e.target.style.borderColor = 'rgba(180,20,20,0.7)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(180,20,20,0.2)'}
                  />
                  <button type="button" onClick={() => setShowPw(v => !v)} style={{ position: 'absolute', right: '0.9rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(180,20,20,0.4)', display: 'flex', padding: 0 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      {showPw ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></> : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>}
                    </svg>
                  </button>
                </div>
              </div>

              {/* Submit */}
              <motion.button
                type="submit" disabled={loading}
                whileHover={!loading ? { boxShadow: '0 0 24px rgba(180,20,20,0.5)' } : {}}
                whileTap={!loading ? { scale: 0.98 } : {}}
                style={{
                  marginTop: '0.5rem',
                  padding: '0.95rem',
                  background: loading ? 'rgba(180,20,20,0.2)' : 'linear-gradient(135deg, rgba(180,20,20,0.9), rgba(120,10,10,0.95))',
                  border: '1px solid rgba(180,20,20,0.5)',
                  borderRadius: '3px',
                  color: loading ? 'rgba(255,255,255,0.4)' : '#fff',
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.8rem', fontWeight: 700,
                  letterSpacing: '4px', textTransform: 'uppercase',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.25s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                }}
              >
                {loading ? (
                  <>
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                      style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.2)', borderTop: '2px solid rgba(255,255,255,0.7)', borderRadius: '50%' }} />
                    VERIFICANDO...
                  </>
                ) : 'ACCEDER AL SISTEMA'}
              </motion.button>
            </form>
          </div>

          <div style={{ textAlign: 'center', marginTop: '1.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Link to="/" style={{ color: 'rgba(255,255,255,0.2)', textDecoration: 'none', fontSize: '0.75rem', letterSpacing: '1px', transition: 'color 0.2s' }}
              onMouseEnter={e => e.target.style.color = 'rgba(255,255,255,0.5)'}
              onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.2)'}>
              ← Volver al sitio
            </Link>
            <Link to="/signin" style={{ color: 'rgba(180,20,20,0.4)', textDecoration: 'none', fontSize: '0.7rem', letterSpacing: '1px' }}
              onMouseEnter={e => e.target.style.color = 'rgba(180,20,20,0.7)'}
              onMouseLeave={e => e.target.style.color = 'rgba(180,20,20,0.4)'}>
              ¿Usuario normal? → Ir al login de usuarios
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
