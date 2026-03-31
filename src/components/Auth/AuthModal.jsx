import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../stores/useStore';
import { api } from '../../services/api';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

// ── Input component ──────────────────────────────────────────────────────────
function AuthInput({ label, type = 'text', value, onChange, placeholder, icon, autoComplete }) {
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);
  const isPassword = type === 'password';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
      <label style={{
        fontSize: '0.72rem', fontWeight: 700, letterSpacing: '1px',
        textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)',
        fontFamily: 'var(--font-display)',
      }}>
        {label}
      </label>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <span style={{
          position: 'absolute', left: '0.9rem',
          color: focused ? 'var(--color-primary)' : 'rgba(255,255,255,0.25)',
          display: 'flex', transition: 'color 0.2s', pointerEvents: 'none',
        }}>
          {icon}
        </span>
        <input
          type={isPassword && show ? 'text' : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%',
            padding: `0.85rem 1rem 0.85rem ${isPassword ? '2.75rem' : '2.75rem'}`,
            background: focused ? 'rgba(0,212,255,0.04)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${focused ? 'rgba(0,212,255,0.5)' : 'rgba(255,255,255,0.1)'}`,
            borderRadius: '12px',
            color: '#fff',
            fontSize: '0.95rem',
            outline: 'none',
            transition: 'all 0.2s',
            fontFamily: 'var(--font-body)',
            boxSizing: 'border-box',
            paddingRight: isPassword ? '3rem' : '1rem',
            boxShadow: focused ? '0 0 0 3px rgba(0,212,255,0.08)' : 'none',
          }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(v => !v)}
            style={{
              position: 'absolute', right: '0.9rem',
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,0.3)', display: 'flex', padding: 0,
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
          >
            {show ? (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
            ) : (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main AuthModal ────────────────────────────────────────────────────────────
export default function AuthModal() {
  const { authModalOpen, closeAuthModal, setToken, setUser } = useStore();
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const googleBtnRef = useRef(null);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') closeAuthModal(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [closeAuthModal]);

  // Reset form on mode change
  useEffect(() => {
    setError('');
    setSuccess(false);
  }, [mode]);

  // Initialize Google button
  useEffect(() => {
    if (!authModalOpen || !GOOGLE_CLIENT_ID) return;
    const timer = setTimeout(() => {
      if (!window.google || !googleBtnRef.current) return;
      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCallback,
        });
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'outline',
          size: 'large',
          shape: 'rectangular',
          width: googleBtnRef.current.offsetWidth || 400,
          text: mode === 'login' ? 'signin_with' : 'signup_with',
          locale: 'es',
        });
      } catch (e) {
        console.warn('Google Sign-In init failed:', e);
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [authModalOpen, mode, googleBtnRef.current]);

  const handleGoogleCallback = async ({ credential }) => {
    setLoading(true);
    setError('');
    try {
      const data = await api.googleAuth(credential);
      handleAuthSuccess(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSuccess = (data) => {
    setToken(data.token, data.user.email);
    setUser(data.user, data.purchases || []);
    setSuccess(true);
    setTimeout(() => {
      closeAuthModal();
      setSuccess(false);
      setName(''); setEmail(''); setPassword('');
    }, 1400);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Por favor rellena todos los campos');
      return;
    }
    if (mode === 'register' && !name.trim()) {
      setError('El nombre es obligatorio');
      return;
    }
    setLoading(true);
    try {
      const data = mode === 'login'
        ? await api.loginWithEmail(email.trim(), password)
        : await api.register(name.trim(), email.trim(), password);
      handleAuthSuccess(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const emailIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
    </svg>
  );
  const lockIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );
  const userIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  );

  return (
    <AnimatePresence>
      {authModalOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeAuthModal}
            style={{
              position: 'fixed', inset: 0, zIndex: 999,
              background: 'rgba(0,0,0,0.75)',
              backdropFilter: 'blur(12px)',
            }}
          />

          {/* Modal panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 32 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 32 }}
            transition={{ type: 'spring', damping: 24, stiffness: 260 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 1000,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '1rem', pointerEvents: 'none',
            }}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{
                pointerEvents: 'all',
                width: 'min(460px, 100%)',
                background: 'linear-gradient(160deg, rgba(8,8,22,0.99) 0%, rgba(4,4,14,0.99) 100%)',
                border: '1px solid rgba(0,212,255,0.18)',
                borderRadius: '24px',
                padding: 'clamp(1.75rem, 5vw, 2.5rem)',
                boxShadow: '0 40px 100px rgba(0,0,0,0.85), 0 0 0 1px rgba(0,212,255,0.08), inset 0 1px 0 rgba(255,255,255,0.04)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Top gradient accent */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
                background: 'linear-gradient(90deg, transparent, var(--color-primary), var(--color-secondary), var(--color-primary), transparent)',
              }} />

              {/* Background glow */}
              <div style={{
                position: 'absolute', top: '-50px', left: '50%', transform: 'translateX(-50%)',
                width: '300px', height: '300px',
                background: 'radial-gradient(circle, rgba(0,212,255,0.04) 0%, transparent 70%)',
                pointerEvents: 'none',
              }} />

              {/* Close button */}
              <motion.button
                onClick={closeAuthModal}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                style={{
                  position: 'absolute', top: '1.25rem', right: '1.25rem',
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '50%', width: '32px', height: '32px',
                  cursor: 'pointer', color: 'rgba(255,255,255,0.5)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  zIndex: 2, transition: 'all 0.2s',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </motion.button>

              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: '2rem', position: 'relative', zIndex: 1 }}>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.1rem',
                  background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  letterSpacing: '3px', marginBottom: '0.5rem',
                }}>
                  THE IMMATERIUM
                </div>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.85rem', margin: 0 }}>
                  {mode === 'login' ? 'Bienvenido de nuevo, hermano' : 'Únete a la comunidad del 41º Milenio'}
                </p>
              </div>

              {/* Tab switcher */}
              <div style={{
                display: 'flex',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                padding: '3px',
                marginBottom: '1.75rem',
                position: 'relative', zIndex: 1,
              }}>
                {['login', 'register'].map(tab => (
                  <motion.button
                    key={tab}
                    onClick={() => setMode(tab)}
                    layout
                    style={{
                      flex: 1,
                      padding: '0.6rem',
                      border: 'none',
                      borderRadius: '9px',
                      background: mode === tab ? 'rgba(0,212,255,0.12)' : 'transparent',
                      boxShadow: mode === tab ? '0 0 0 1px rgba(0,212,255,0.3)' : 'none',
                      color: mode === tab ? 'var(--color-primary)' : 'rgba(255,255,255,0.4)',
                      fontFamily: 'var(--font-display)',
                      fontSize: '0.72rem',
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      fontWeight: mode === tab ? 700 : 400,
                    }}
                  >
                    {tab === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
                  </motion.button>
                ))}
              </div>

              {/* Success state */}
              <AnimatePresence mode="wait">
                {success ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                      textAlign: 'center', padding: '2.5rem 1rem',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem',
                    }}
                  >
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', damping: 12 }}
                      style={{
                        width: '72px', height: '72px', borderRadius: '50%',
                        background: 'rgba(80,200,120,0.15)',
                        border: '2px solid rgba(80,200,120,0.5)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#50c878" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </motion.div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: '#50c878', letterSpacing: '2px' }}>
                      ¡BIENVENIDO!
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', margin: 0 }}>
                      Sesión iniciada correctamente
                    </p>
                  </motion.div>
                ) : (
                  <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', zIndex: 1 }}>
                      <AnimatePresence>
                        {mode === 'register' && (
                          <motion.div
                            key="name-field"
                            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                          >
                            <AuthInput
                              label="Nombre"
                              type="text"
                              value={name}
                              onChange={e => setName(e.target.value)}
                              placeholder="Tu nombre"
                              icon={userIcon}
                              autoComplete="name"
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <AuthInput
                        label="Email"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="tu@email.com"
                        icon={emailIcon}
                        autoComplete="email"
                      />
                      <AuthInput
                        label="Contraseña"
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder={mode === 'register' ? 'Mínimo 6 caracteres' : '••••••••'}
                        icon={lockIcon}
                        autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                      />

                      {/* Error */}
                      <AnimatePresence>
                        {error && (
                          <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            style={{
                              padding: '0.75rem 1rem',
                              background: 'rgba(255,80,80,0.1)',
                              border: '1px solid rgba(255,80,80,0.3)',
                              borderRadius: '10px',
                              color: '#ff8080',
                              fontSize: '0.85rem',
                              display: 'flex', alignItems: 'center', gap: '0.5rem',
                            }}
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                            {error}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Submit */}
                      <motion.button
                        type="submit"
                        disabled={loading}
                        whileHover={!loading ? { y: -2, boxShadow: '0 8px 24px rgba(0,212,255,0.25)' } : {}}
                        whileTap={!loading ? { scale: 0.97 } : {}}
                        style={{
                          width: '100%',
                          padding: '0.95rem',
                          background: loading
                            ? 'rgba(0,212,255,0.15)'
                            : 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                          border: 'none', borderRadius: '12px',
                          color: loading ? 'rgba(255,255,255,0.5)' : '#000',
                          fontFamily: 'var(--font-display)',
                          fontSize: '0.85rem', fontWeight: 700,
                          letterSpacing: '2px', textTransform: 'uppercase',
                          cursor: loading ? 'not-allowed' : 'pointer',
                          transition: 'all 0.25s',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                          marginTop: '0.25rem',
                        }}
                      >
                        {loading ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                              style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid rgba(255,255,255,0.8)', borderRadius: '50%' }}
                            />
                            Procesando...
                          </>
                        ) : (
                          mode === 'login' ? 'Entrar' : 'Crear cuenta'
                        )}
                      </motion.button>
                    </form>

                    {/* Divider */}
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '0.75rem',
                      margin: '1.25rem 0', position: 'relative', zIndex: 1,
                    }}>
                      <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
                      <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem', fontFamily: 'var(--font-display)', letterSpacing: '1px' }}>O</span>
                      <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
                    </div>

                    {/* Google button */}
                    <div style={{ position: 'relative', zIndex: 1 }}>
                      {GOOGLE_CLIENT_ID ? (
                        <div
                          ref={googleBtnRef}
                          style={{
                            width: '100%',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            minHeight: '44px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        />
                      ) : (
                        <div style={{
                          padding: '0.75rem 1rem',
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '12px',
                          color: 'rgba(255,255,255,0.2)',
                          fontSize: '0.78rem',
                          textAlign: 'center',
                          fontFamily: 'var(--font-body)',
                        }}>
                          Google Sign-In no configurado
                        </div>
                      )}
                    </div>

                    {/* Footer note */}
                    <p style={{
                      textAlign: 'center', marginTop: '1.25rem',
                      fontSize: '0.73rem', color: 'rgba(255,255,255,0.18)',
                      lineHeight: 1.5, position: 'relative', zIndex: 1,
                    }}>
                      {mode === 'register'
                        ? 'Al crear una cuenta aceptas nuestros Términos de servicio'
                        : <>¿No tienes cuenta? <button onClick={() => setMode('register')} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontSize: 'inherit', padding: 0, textDecoration: 'underline' }}>Regístrate</button></>
                      }
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
