/**
 * USER AUTH — Login / Register full-page experience
 * Split layout: left=animated atmospheric panel, right=form
 */
import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { useStore } from '../stores/useStore';

// ── constants ─────────────────────────────────────────────────────────────────
const FACTIONS = [
  { id: 'space_marines',  label: 'Space Marines',   color: '#4488cc' },
  { id: 'chaos',          label: 'Caos',             color: '#aa3333' },
  { id: 'necrons',        label: 'Necrones',         color: '#33aa77' },
  { id: 'tau',            label: 'Tau',              color: '#44bbcc' },
  { id: 'tyranids',       label: 'Tiránidos',        color: '#9944cc' },
  { id: 'eldar',          label: 'Aeldari',          color: '#ccaa33' },
  { id: 'orks',           label: 'Orkos',            color: '#558833' },
  { id: 'imperial_guard', label: 'Guardia Imperial', color: '#886644' },
];

const PLAYER_TYPES = [
  { id: 'painter',     label: '🎨 Pintor',        desc: 'Me encanta pintar miniaturas' },
  { id: 'gamer',       label: '⚔️ Jugador',        desc: 'Juego partidas competitivas' },
  { id: 'collector',   label: '📦 Coleccionista',  desc: 'Colecciono miniaturas' },
  { id: 'lore',        label: '📖 Lore Fan',       desc: 'Me apasiona el universo 40K' },
];

const QUOTES = [
  'En el 41.º Milenio, no hay paz, solo guerra.',
  'Un marine espacial no conoce el miedo, solo la victoria.',
  'El Emperador protege... a quienes luchan por él.',
  'Sangre para el Dios de la Sangre. Cráneos para el Trono de Cráneos.',
  'Solo en la muerte termina el deber.',
];

// Password strength
function getStrength(pw) {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8)  score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score; // 0-5
}

const STRENGTH_LABELS = ['', 'Muy débil', 'Débil', 'Regular', 'Fuerte', 'Muy fuerte'];
const STRENGTH_COLORS = ['', '#ff4444', '#ff8844', '#ffcc44', '#88cc44', '#44cc88'];

// ── Input component ───────────────────────────────────────────────────────────
function Field({ label, type = 'text', value, onChange, placeholder, icon, autoComplete, hint }) {
  const [focused, setFocused] = useState(false);
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
        <label style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-display)' }}>
          {label}
        </label>
        {hint && <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)' }}>{hint}</span>}
      </div>
      <div style={{ position: 'relative' }}>
        {icon && (
          <span style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: focused ? 'var(--color-primary)' : 'rgba(255,255,255,0.2)', display: 'flex', transition: 'color 0.2s', pointerEvents: 'none' }}>
            {icon}
          </span>
        )}
        <input
          type={isPassword && show ? 'text' : type}
          value={value} onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%', boxSizing: 'border-box',
            padding: `0.8rem ${isPassword ? '3rem' : '1rem'} 0.8rem ${icon ? '2.75rem' : '1rem'}`,
            background: focused ? 'rgba(0,212,255,0.04)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${focused ? 'rgba(0,212,255,0.5)' : 'rgba(255,255,255,0.1)'}`,
            borderRadius: '10px', color: '#fff', fontSize: '0.9rem',
            fontFamily: 'var(--font-body)', outline: 'none',
            boxShadow: focused ? '0 0 0 3px rgba(0,212,255,0.07)' : 'none',
            transition: 'all 0.2s',
          }}
        />
        {isPassword && (
          <button type="button" onClick={() => setShow(v => !v)} style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.25)', display: 'flex', padding: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {show ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></> : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>}
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function UserAuthPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setToken, setUser, token } = useStore();
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  const [mode, setMode] = useState(searchParams.get('mode') === 'register' ? 'register' : 'login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [quoteIdx] = useState(() => Math.floor(Math.random() * QUOTES.length));

  // Login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register fields
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPw, setRegPw] = useState('');
  const [regPwConfirm, setRegPwConfirm] = useState('');
  const [faction, setFaction] = useState('');
  const [playerTypes, setPlayerTypes] = useState([]);
  const [wantsPremium, setWantsPremium] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const googleBtnRef = useRef(null);
  const strength = getStrength(regPw);
  const pwMatch = regPwConfirm === '' || regPw === regPwConfirm;

  // If already logged in, redirect
  useEffect(() => {
    if (token) navigate('/');
  }, []);

  useEffect(() => {
    document.title = mode === 'login' ? 'Iniciar sesión | The Immaterium' : 'Crear cuenta | The Immaterium';
    setError('');
  }, [mode]);

  // Google button
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    const t = setTimeout(() => {
      if (!window.google || !googleBtnRef.current) return;
      try {
        window.google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: handleGoogle });
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'filled_black', size: 'large', shape: 'rectangular',
          width: googleBtnRef.current.offsetWidth || 400,
          text: mode === 'login' ? 'signin_with' : 'signup_with', locale: 'es',
        });
      } catch (e) { console.warn('Google init failed', e); }
    }, 200);
    return () => clearTimeout(t);
  }, [mode, GOOGLE_CLIENT_ID]);

  const handleSuccess = (data) => {
    setToken(data.token, data.user?.email);
    setUser(data.user, data.purchases || []);
    setSuccess(true);
    setTimeout(() => navigate('/'), 1200);
  };

  const handleGoogle = async ({ credential }) => {
    setLoading(true); setError('');
    try { handleSuccess(await api.googleAuth(credential)); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Rellena todos los campos'); return; }
    setLoading(true); setError('');
    try { handleSuccess(await api.loginWithEmail(email, password)); }
    catch (e) { setError(e.message || 'Credenciales incorrectas'); }
    finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !regEmail || !regPw || !regPwConfirm) { setError('Rellena todos los campos obligatorios'); return; }
    if (regPw !== regPwConfirm) { setError('Las contraseñas no coinciden'); return; }
    if (regPw.length < 8) { setError('La contraseña debe tener al menos 8 caracteres'); return; }
    if (!acceptTerms) { setError('Debes aceptar los términos y condiciones'); return; }
    setLoading(true); setError('');
    try {
      handleSuccess(await api.register(name, regEmail, regPw, { username, faction, playerTypes, wantsPremium }));
    } catch (e) { setError(e.message || 'Error al crear la cuenta'); }
    finally { setLoading(false); }
  };

  const togglePlayerType = (id) => setPlayerTypes(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const icons = {
    user: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    at: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"/></svg>,
    mail: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
    lock: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', overflow: 'hidden', background: '#050510' }}>

      {/* ══ LEFT PANEL — atmospheric ══════════════════════════════════════════ */}
      <div style={{
        flex: '0 0 46%', position: 'relative', overflow: 'hidden',
        display: 'none',
      }} className="auth-left">
        <style>{`@media(min-width:900px){.auth-left{display:flex!important;flex-direction:column;justify-content:center;padding:3rem;}}`}</style>

        {/* Animated background gradient */}
        <motion.div
          animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg, #050510 0%, #0a0520 30%, #050518 60%, #08030f 100%)',
            backgroundSize: '200% 200%',
          }}
        />

        {/* Floating orbs */}
        {[
          { x: '20%', y: '25%', size: 300, color: 'rgba(0,212,255,0.04)' },
          { x: '70%', y: '65%', size: 200, color: 'rgba(135,80,220,0.05)' },
          { x: '50%', y: '80%', size: 150, color: 'rgba(0,180,220,0.03)' },
        ].map((orb, i) => (
          <motion.div key={i}
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 6 + i * 2, repeat: Infinity, delay: i * 1.5 }}
            style={{
              position: 'absolute', left: orb.x, top: orb.y,
              width: orb.size, height: orb.size,
              borderRadius: '50%', background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
              transform: 'translate(-50%, -50%)', pointerEvents: 'none',
            }} />
        ))}

        {/* Star field */}
        {Array.from({ length: 40 }, (_, i) => (
          <motion.div key={`star-${i}`}
            animate={{ opacity: [0.1, 0.6, 0.1] }}
            transition={{ duration: 2 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 4 }}
            style={{
              position: 'absolute',
              left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
              width: Math.random() > 0.8 ? '2px' : '1px', height: Math.random() > 0.8 ? '2px' : '1px',
              borderRadius: '50%', background: '#fff', pointerEvents: 'none',
            }} />
        ))}

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          {/* Logo */}
          <div style={{ marginBottom: '3rem' }}>
            <div style={{ fontSize: '0.6rem', letterSpacing: '5px', color: 'rgba(0,212,255,0.5)', fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>
              COMUNIDAD
            </div>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3vw, 2.4rem)',
              letterSpacing: '4px', fontWeight: 900,
              background: 'linear-gradient(135deg, #fff 0%, rgba(0,212,255,0.9) 60%, rgba(135,80,220,0.9) 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              THE IMMATERIUM
            </div>
          </div>

          {/* Quote */}
          <motion.div
            key={quoteIdx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{
              borderLeft: '3px solid rgba(0,212,255,0.4)',
              paddingLeft: '1.25rem', marginBottom: '3rem',
            }}
          >
            <p style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem', lineHeight: 1.7, margin: 0 }}>
              "{QUOTES[quoteIdx]}"
            </p>
          </motion.div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '3rem' }}>
            {[
              { label: 'Ejércitos', value: '50+' },
              { label: 'Guías', value: '200+' },
              { label: 'Batallas', value: '1.000+' },
              { label: 'Comunidad', value: 'Activa' },
            ].map(stat => (
              <div key={stat.label} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '12px', padding: '1rem',
              }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--color-primary)', fontWeight: 900, marginBottom: '0.2rem' }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '1px' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Faction row */}
          <div>
            <div style={{ fontSize: '0.65rem', letterSpacing: '2px', color: 'rgba(255,255,255,0.25)', marginBottom: '0.75rem', fontFamily: 'var(--font-display)' }}>
              FACCIONES DISPONIBLES
            </div>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {FACTIONS.map(f => (
                <span key={f.id} style={{
                  padding: '3px 10px', borderRadius: '20px',
                  background: `${f.color}18`, border: `1px solid ${f.color}44`,
                  color: f.color, fontSize: '0.68rem', letterSpacing: '0.3px',
                }}>
                  {f.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══ RIGHT PANEL — form ═══════════════════════════════════════════════ */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 'clamp(1.5rem, 4vw, 3rem)',
        overflowY: 'auto',
        background: 'rgba(0,0,0,0.3)',
        borderLeft: '1px solid rgba(255,255,255,0.04)',
      }}>
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          style={{ width: '100%', maxWidth: '480px' }}
        >
          {/* Mobile logo */}
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }} className="auth-mobile-logo">
            <style>{`.auth-mobile-logo{display:block;}@media(min-width:900px){.auth-mobile-logo{display:none;}}`}</style>
            <Link to="/" style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', letterSpacing: '3px', background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textDecoration: 'none' }}>
              THE IMMATERIUM
            </Link>
          </div>

          {/* Tab switcher */}
          <div style={{
            display: 'flex', background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '14px', padding: '4px', marginBottom: '2rem',
          }}>
            {[{ id: 'login', label: 'Iniciar sesión' }, { id: 'register', label: 'Crear cuenta' }].map(tab => (
              <button key={tab.id} onClick={() => setMode(tab.id)} style={{
                flex: 1, padding: '0.7rem', border: 'none', borderRadius: '10px', cursor: 'pointer',
                background: mode === tab.id ? 'rgba(0,212,255,0.12)' : 'transparent',
                boxShadow: mode === tab.id ? '0 0 0 1px rgba(0,212,255,0.3)' : 'none',
                color: mode === tab.id ? 'var(--color-primary)' : 'rgba(255,255,255,0.35)',
                fontFamily: 'var(--font-display)', fontSize: '0.75rem', letterSpacing: '1px',
                textTransform: 'uppercase', fontWeight: mode === tab.id ? 700 : 400,
                transition: 'all 0.2s',
              }}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Success */}
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div key="ok" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
                style={{ textAlign: 'center', padding: '3rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <motion.div initial={{ scale: 0, rotate: -120 }} animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                  style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(80,200,120,0.12)', border: '2px solid rgba(80,200,120,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#50c878" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                </motion.div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: '#50c878', letterSpacing: '3px' }}>¡BIENVENIDO!</div>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.9rem' }}>Redirigiendo...</p>
              </motion.div>

            ) : mode === 'login' ? (
              /* ── LOGIN FORM ── */
              <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.3rem, 4vw, 1.7rem)', color: '#fff', letterSpacing: '2px', marginBottom: '0.4rem' }}>
                    Bienvenido de nuevo
                  </h2>
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.85rem' }}>
                    Accede a tu cuenta para ver guías, ejércitos y más
                  </p>
                </div>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <Field label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="tu@email.com" icon={icons.mail} autoComplete="email" />
                  <Field label="Contraseña" type="password" value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••" icon={icons.lock} autoComplete="current-password" />

                  <AnimatePresence>
                    {error && (
                      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        style={{ padding: '0.75rem 1rem', background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.3)', borderRadius: '10px', color: '#ff8080', fontSize: '0.83rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.button type="submit" disabled={loading}
                    whileHover={!loading ? { y: -2, boxShadow: '0 8px 24px rgba(0,212,255,0.25)' } : {}}
                    whileTap={!loading ? { scale: 0.97 } : {}}
                    style={{
                      padding: '0.95rem', marginTop: '0.25rem',
                      background: loading ? 'rgba(0,212,255,0.12)' : 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                      border: 'none', borderRadius: '12px',
                      color: loading ? 'rgba(255,255,255,0.4)' : '#000',
                      fontFamily: 'var(--font-display)', fontSize: '0.85rem', fontWeight: 800,
                      letterSpacing: '2px', textTransform: 'uppercase',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                      transition: 'all 0.25s',
                    }}>
                    {loading ? (<><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }} style={{ width: '15px', height: '15px', border: '2px solid rgba(0,0,0,0.2)', borderTop: '2px solid rgba(0,0,0,0.7)', borderRadius: '50%' }} />Verificando...</>) : 'Entrar'}
                  </motion.button>
                </form>

                {/* Divider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.25rem 0' }}>
                  <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
                  <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.72rem', fontFamily: 'var(--font-display)' }}>O</span>
                  <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
                </div>

                {GOOGLE_CLIENT_ID ? (
                  <div ref={googleBtnRef} style={{ width: '100%', borderRadius: '12px', overflow: 'hidden', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
                ) : (
                  <div style={{ padding: '0.8rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', color: 'rgba(255,255,255,0.18)', fontSize: '0.78rem', textAlign: 'center' }}>
                    Google Sign-In no configurado
                  </div>
                )}

                <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.78rem', color: 'rgba(255,255,255,0.3)' }}>
                  ¿No tienes cuenta?{' '}
                  <button onClick={() => setMode('register')} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontSize: 'inherit', padding: 0, textDecoration: 'underline' }}>
                    Regístrate gratis
                  </button>
                </p>
              </motion.div>

            ) : (
              /* ── REGISTER FORM ── */
              <motion.div key="register" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.2rem, 4vw, 1.6rem)', color: '#fff', letterSpacing: '2px', marginBottom: '0.4rem' }}>
                    Únete a la comunidad
                  </h2>
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.83rem' }}>
                    Del 41.º Milenio. Registro gratuito.
                  </p>
                </div>

                <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                  {/* Name + Username row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <Field label="Nombre *" type="text" value={name} onChange={e => setName(e.target.value)}
                      placeholder="Tu nombre" icon={icons.user} autoComplete="name" />
                    <Field label="Usuario" type="text" value={username} onChange={e => setUsername(e.target.value)}
                      placeholder="nombre_user" icon={icons.at} autoComplete="username" hint="opcional" />
                  </div>

                  <Field label="Email *" type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)}
                    placeholder="tu@email.com" icon={icons.mail} autoComplete="email" />

                  {/* Password */}
                  <div>
                    <Field label="Contraseña *" type="password" value={regPw} onChange={e => setRegPw(e.target.value)}
                      placeholder="Mínimo 8 caracteres" icon={icons.lock} autoComplete="new-password" />
                    {/* Strength bar */}
                    {regPw && (
                      <div style={{ marginTop: '0.4rem' }}>
                        <div style={{ display: 'flex', gap: '3px' }}>
                          {[1,2,3,4,5].map(i => (
                            <div key={i} style={{ flex: 1, height: '3px', borderRadius: '2px', background: i <= strength ? STRENGTH_COLORS[strength] : 'rgba(255,255,255,0.08)', transition: 'all 0.3s' }} />
                          ))}
                        </div>
                        <span style={{ fontSize: '0.65rem', color: STRENGTH_COLORS[strength] || 'rgba(255,255,255,0.25)', marginTop: '0.2rem', display: 'block' }}>
                          {STRENGTH_LABELS[strength]}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Confirm password */}
                  <div>
                    <Field label="Confirmar contraseña *" type="password" value={regPwConfirm} onChange={e => setRegPwConfirm(e.target.value)}
                      placeholder="Repite la contraseña" icon={icons.lock} autoComplete="new-password" />
                    {regPwConfirm && !pwMatch && (
                      <span style={{ fontSize: '0.68rem', color: '#ff8080', marginTop: '0.2rem', display: 'block' }}>
                        ✗ Las contraseñas no coinciden
                      </span>
                    )}
                    {regPwConfirm && pwMatch && regPw && (
                      <span style={{ fontSize: '0.68rem', color: '#50c878', marginTop: '0.2rem', display: 'block' }}>
                        ✓ Las contraseñas coinciden
                      </span>
                    )}
                  </div>

                  {/* Faction selector */}
                  <div>
                    <label style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-display)', display: 'block', marginBottom: '0.5rem' }}>
                      Ejército favorito <span style={{ color: 'rgba(255,255,255,0.2)', fontWeight: 400 }}>· opcional</span>
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {FACTIONS.map(f => (
                        <button key={f.id} type="button" onClick={() => setFaction(faction === f.id ? '' : f.id)} style={{
                          padding: '4px 11px', borderRadius: '20px', cursor: 'pointer',
                          background: faction === f.id ? `${f.color}22` : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${faction === f.id ? f.color : 'rgba(255,255,255,0.1)'}`,
                          color: faction === f.id ? f.color : 'rgba(255,255,255,0.35)',
                          fontSize: '0.72rem', letterSpacing: '0.3px', transition: 'all 0.15s',
                        }}>
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Player types */}
                  <div>
                    <label style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-display)', display: 'block', marginBottom: '0.5rem' }}>
                      ¿Cómo participas? <span style={{ color: 'rgba(255,255,255,0.2)', fontWeight: 400 }}>· opcional</span>
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                      {PLAYER_TYPES.map(pt => {
                        const active = playerTypes.includes(pt.id);
                        return (
                          <button key={pt.id} type="button" onClick={() => togglePlayerType(pt.id)} style={{
                            padding: '0.6rem 0.75rem', borderRadius: '10px', cursor: 'pointer', textAlign: 'left',
                            background: active ? 'rgba(0,212,255,0.08)' : 'rgba(255,255,255,0.03)',
                            border: `1px solid ${active ? 'rgba(0,212,255,0.3)' : 'rgba(255,255,255,0.08)'}`,
                            color: active ? 'var(--color-primary)' : 'rgba(255,255,255,0.35)',
                            fontSize: '0.75rem', transition: 'all 0.15s',
                          }}>
                            <div style={{ fontWeight: 600 }}>{pt.label}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Premium upgrade option */}
                  <div style={{
                    background: wantsPremium ? 'rgba(255,215,0,0.06)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${wantsPremium ? 'rgba(255,215,0,0.35)' : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: '12px', padding: '1rem', cursor: 'pointer', transition: 'all 0.25s',
                  }} onClick={() => setWantsPremium(v => !v)}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                          <span style={{ fontSize: '1rem' }}>★</span>
                          <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.78rem', color: wantsPremium ? '#FFD700' : 'rgba(255,255,255,0.5)', letterSpacing: '1px' }}>
                            CUENTA PREMIUM
                          </span>
                        </div>
                        <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', margin: 0 }}>
                          Accede a guías exclusivas, contenido avanzado y más
                        </p>
                      </div>
                      <div style={{
                        width: '42px', height: '24px', borderRadius: '12px', flexShrink: 0,
                        background: wantsPremium ? '#FFD700' : 'rgba(255,255,255,0.1)',
                        position: 'relative', transition: 'background 0.25s',
                      }}>
                        <div style={{
                          position: 'absolute', top: '3px',
                          left: wantsPremium ? '21px' : '3px',
                          width: '18px', height: '18px', borderRadius: '50%',
                          background: wantsPremium ? '#000' : 'rgba(255,255,255,0.5)',
                          transition: 'left 0.25s',
                        }} />
                      </div>
                    </div>
                    {wantsPremium && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,215,0,0.15)' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                          {['Guías premium', 'Sin anuncios', 'Badge exclusivo', 'Acceso anticipado'].map(b => (
                            <span key={b} style={{ padding: '2px 9px', borderRadius: '20px', background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.25)', color: '#FFD700', fontSize: '0.68rem' }}>✓ {b}</span>
                          ))}
                        </div>
                        <p style={{ fontSize: '0.7rem', color: 'rgba(255,215,0,0.5)', marginTop: '0.5rem', marginBottom: 0 }}>
                          Recibirás un email para configurar tu cuenta premium tras registrarte.
                        </p>
                      </motion.div>
                    )}
                  </div>

                  {/* Error */}
                  <AnimatePresence>
                    {error && (
                      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        style={{ padding: '0.75rem 1rem', background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.3)', borderRadius: '10px', color: '#ff8080', fontSize: '0.83rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Terms */}
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={acceptTerms} onChange={e => setAcceptTerms(e.target.checked)}
                      style={{ marginTop: '2px', accentColor: 'var(--color-primary)', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>
                      Acepto los <Link to="/terms" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>Términos de servicio</Link> y la <Link to="/privacy" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>Política de privacidad</Link>
                    </span>
                  </label>

                  <motion.button type="submit" disabled={loading || !pwMatch}
                    whileHover={!loading && pwMatch ? { y: -2, boxShadow: '0 8px 24px rgba(0,212,255,0.25)' } : {}}
                    whileTap={!loading && pwMatch ? { scale: 0.97 } : {}}
                    style={{
                      padding: '0.95rem', marginTop: '0.25rem',
                      background: (loading || !pwMatch) ? 'rgba(0,212,255,0.1)' : 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                      border: 'none', borderRadius: '12px',
                      color: (loading || !pwMatch) ? 'rgba(255,255,255,0.3)' : '#000',
                      fontFamily: 'var(--font-display)', fontSize: '0.85rem', fontWeight: 800,
                      letterSpacing: '2px', textTransform: 'uppercase',
                      cursor: (loading || !pwMatch) ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                      transition: 'all 0.25s',
                    }}>
                    {loading ? (<><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }} style={{ width: '15px', height: '15px', border: '2px solid rgba(0,0,0,0.2)', borderTop: '2px solid rgba(0,0,0,0.7)', borderRadius: '50%' }} />Creando cuenta...</>) : wantsPremium ? '★ Crear cuenta premium' : 'Crear cuenta gratuita'}
                  </motion.button>

                  {/* Google */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
                    <span style={{ color: 'rgba(255,255,255,0.18)', fontSize: '0.7rem' }}>O regístrate con</span>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
                  </div>

                  {GOOGLE_CLIENT_ID ? (
                    <div ref={googleBtnRef} style={{ width: '100%', borderRadius: '12px', overflow: 'hidden', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
                  ) : (
                    <div style={{ padding: '0.8rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', color: 'rgba(255,255,255,0.15)', fontSize: '0.75rem', textAlign: 'center' }}>
                      Google Sign-In no configurado
                    </div>
                  )}

                  <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', margin: 0 }}>
                    ¿Ya tienes cuenta?{' '}
                    <button onClick={() => setMode('login')} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontSize: 'inherit', padding: 0, textDecoration: 'underline' }}>
                      Iniciar sesión
                    </button>
                  </p>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
