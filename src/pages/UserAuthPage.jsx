/**
 * USER AUTH — Login / Register full-page experience
 * Split layout: left=atmospheric panel, right=form
 * Register flow: Step 1 (basic data) → Step 2 (plan selector) → success
 */
import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { useStore } from '../stores/useStore';

// ── constants ─────────────────────────────────────────────────────────────────
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
          <button type="button" onClick={() => setShow(v => !v)}
            style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.25)', display: 'flex', padding: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {show
                ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
                : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
              }
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

// ── Plan card component ───────────────────────────────────────────────────────
function PlanCard({ plan, selected, onClick, loading }) {
  const isPremium = plan.id === 'premium';
  return (
    <motion.div
      whileHover={!loading ? { y: -4, scale: 1.02 } : {}}
      whileTap={!loading ? { scale: 0.98 } : {}}
      onClick={!loading ? onClick : undefined}
      style={{
        position: 'relative',
        background: isPremium
          ? 'linear-gradient(160deg, rgba(40,30,0,0.95) 0%, rgba(20,15,0,0.98) 100%)'
          : 'rgba(255,255,255,0.03)',
        border: `2px solid ${isPremium
          ? (selected ? '#FFD700' : 'rgba(255,215,0,0.4)')
          : (selected ? 'var(--color-primary)' : 'rgba(255,255,255,0.12)')}`,
        borderRadius: '18px',
        padding: '1.6rem 1.4rem',
        cursor: loading ? 'not-allowed' : 'pointer',
        transition: 'all 0.25s',
        boxShadow: isPremium && selected ? '0 8px 32px rgba(255,215,0,0.18)' : 'none',
        overflow: 'hidden',
        flex: 1,
        minWidth: 0,
      }}
    >
      {isPremium && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
          background: 'linear-gradient(90deg, transparent, #FFD700, #FFA500, transparent)',
        }} />
      )}

      {/* Badge */}
      {isPremium && (
        <div style={{
          position: 'absolute', top: '1rem', right: '1rem',
          background: 'rgba(255,215,0,0.15)',
          border: '1px solid rgba(255,215,0,0.4)',
          borderRadius: '20px', padding: '2px 9px',
          fontSize: '0.62rem', letterSpacing: '1.5px', color: '#FFD700',
          fontFamily: 'var(--font-display)',
        }}>
          RECOMENDADO
        </div>
      )}

      {/* Icon */}
      <div style={{
        width: '48px', height: '48px', borderRadius: '14px', marginBottom: '1rem',
        background: isPremium ? 'rgba(255,215,0,0.12)' : 'rgba(0,212,255,0.08)',
        border: `1px solid ${isPremium ? 'rgba(255,215,0,0.3)' : 'rgba(0,212,255,0.2)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {isPremium
          ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="2" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        }
      </div>

      {/* Title & price */}
      <div style={{ marginBottom: '1.1rem' }}>
        <div style={{
          fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 900,
          letterSpacing: '2px', textTransform: 'uppercase',
          color: isPremium ? '#FFD700' : '#fff',
          marginBottom: '0.3rem',
        }}>
          {plan.name}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: isPremium ? '2rem' : '1.4rem', fontWeight: 900, color: isPremium ? '#FFD700' : 'rgba(255,255,255,0.7)', lineHeight: 1 }}>
            {plan.price}
          </span>
          {plan.period && (
            <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '1px' }}>
              {plan.period}
            </span>
          )}
        </div>
        <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', marginTop: '0.4rem', lineHeight: 1.5 }}>
          {plan.desc}
        </p>
      </div>

      {/* Features */}
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {plan.features.map((f, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)' }}>
            <span style={{ color: isPremium ? '#FFD700' : '#50c878', flexShrink: 0, marginTop: '1px' }}>✓</span>
            {f}
          </li>
        ))}
        {plan.notIncluded?.map((f, i) => (
          <li key={`x-${i}`} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.78rem', color: 'rgba(255,255,255,0.22)' }}>
            <span style={{ flexShrink: 0, marginTop: '1px' }}>✗</span>
            {f}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <div style={{
        marginTop: '1.4rem', padding: '0.75rem', borderRadius: '12px', textAlign: 'center',
        background: isPremium
          ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
          : 'rgba(0,212,255,0.1)',
        border: isPremium ? 'none' : '1px solid rgba(0,212,255,0.25)',
        color: isPremium ? '#000' : 'var(--color-primary)',
        fontFamily: 'var(--font-display)', fontSize: '0.78rem', fontWeight: 800,
        letterSpacing: '1.5px', textTransform: 'uppercase',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
      }}>
        {loading && selected ? (
          <>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
              style={{ width: '13px', height: '13px', border: '2px solid rgba(0,0,0,0.15)', borderTop: '2px solid rgba(0,0,0,0.7)', borderRadius: '50%' }} />
            Creando cuenta...
          </>
        ) : plan.cta}
      </div>
    </motion.div>
  );
}

const PLANS = [
  {
    id: 'free',
    name: 'Estándar',
    price: 'Gratis',
    period: '',
    desc: 'Acceso completo a la comunidad y todo el contenido público.',
    cta: 'Empezar gratis →',
    features: [
      'Ejércitos, lore y noticias',
      'Informes de batalla',
      'Army Builder completo',
      'Marketplace de miniaturas',
      'Perfil personalizable',
    ],
    notIncluded: [
      'Guías de pintura premium',
      'Vídeos exclusivos del canal',
      '10% dto. en Marketplace',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '4,99€',
    period: '/ guía',
    desc: 'Pago único por guía. Sin suscripciones. Acceso permanente.',
    cta: 'Activar Premium →',
    features: [
      'Todo lo del plan Estándar',
      'Acceso a todas las guías de pintura premium',
      'Vídeos exclusivos de técnicas avanzadas',
      '10% de descuento en tu primera compra en Marketplace',
      'Badge Premium en tu perfil',
      'Acceso anticipado a nuevo contenido',
    ],
  },
];

// ── Main component ────────────────────────────────────────────────────────────
export default function UserAuthPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setToken, setUser, token } = useStore();
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  const [mode, setMode] = useState(searchParams.get('mode') === 'register' ? 'register' : 'login');
  const [regStep, setRegStep] = useState(1); // 1 = form, 2 = plan selector
  const [loading, setLoading] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [quoteIdx] = useState(() => Math.floor(Math.random() * QUOTES.length));

  // Login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register fields
  const [name, setName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPw, setRegPw] = useState('');
  const [regPwConfirm, setRegPwConfirm] = useState('');
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
    setRegStep(1);
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

  // Step 1: validate and advance to plan selector
  const handleRegisterStep1 = (e) => {
    e.preventDefault();
    if (!name || !regEmail || !regPw || !regPwConfirm) { setError('Rellena todos los campos obligatorios'); return; }
    if (regPw !== regPwConfirm) { setError('Las contraseñas no coinciden'); return; }
    if (regPw.length < 8) { setError('La contraseña debe tener al menos 8 caracteres'); return; }
    if (!acceptTerms) { setError('Debes aceptar los términos y condiciones'); return; }
    setError('');
    setRegStep(2);
  };

  // Step 2: create account with chosen plan
  const handleSelectPlan = async (planId) => {
    setLoadingPlan(planId); setError('');
    try {
      const data = await api.register(name, regEmail, regPw, { wants_premium: planId === 'premium' });
      handleSuccess(data);
    } catch (e) {
      setError(e.message || 'Error al crear la cuenta');
      setRegStep(1); // back to form on error
    } finally {
      setLoadingPlan('');
    }
  };

  const icons = {
    user: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    mail: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
    lock: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', overflow: 'hidden', background: '#050510' }}>

      {/* ══ LEFT PANEL — atmospheric ══════════════════════════════════════════ */}
      <div style={{ flex: '0 0 46%', position: 'relative', overflow: 'hidden', display: 'none' }} className="auth-left">
        <style>{`@media(min-width:900px){.auth-left{display:flex!important;flex-direction:column;justify-content:center;padding:3rem;}}`}</style>

        {/* Animated background */}
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
          <motion.div key={quoteIdx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            style={{ borderLeft: '3px solid rgba(0,212,255,0.4)', paddingLeft: '1.25rem', marginBottom: '3rem' }}>
            <p style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem', lineHeight: 1.7, margin: 0 }}>
              "{QUOTES[quoteIdx]}"
            </p>
          </motion.div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
            {[
              { label: 'Ejércitos', value: '50+' },
              { label: 'Guías', value: '200+' },
              { label: 'Batallas', value: '1.000+' },
              { label: 'Comunidad', value: 'Activa' },
            ].map(stat => (
              <div key={stat.label} style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
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

          {/* What you get */}
          <div style={{
            background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.12)',
            borderRadius: '14px', padding: '1.1rem 1.25rem',
          }}>
            <div style={{ fontSize: '0.62rem', letterSpacing: '2px', color: 'rgba(0,212,255,0.5)', marginBottom: '0.75rem', fontFamily: 'var(--font-display)' }}>
              AL UNIRTE OBTENDRÁS
            </div>
            {[
              'Perfil personalizable con tus ejércitos favoritos',
              'Contenido adaptado a tus gustos de juego',
              'Acceso al marketplace de miniaturas',
              'Army Builder avanzado',
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: i < 3 ? '0.5rem' : 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)' }}>
                <span style={{ color: 'var(--color-primary)', flexShrink: 0 }}>→</span>
                {item}
              </div>
            ))}
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
          style={{ width: '100%', maxWidth: regStep === 2 ? '680px' : '480px', transition: 'max-width 0.35s ease' }}
        >
          {/* Mobile logo */}
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }} className="auth-mobile-logo">
            <style>{`.auth-mobile-logo{display:block;}@media(min-width:900px){.auth-mobile-logo{display:none;}}`}</style>
            <Link to="/" style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', letterSpacing: '3px', background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textDecoration: 'none' }}>
              THE IMMATERIUM
            </Link>
          </div>

          {/* Tab switcher — hidden in step 2 */}
          {regStep === 1 && (
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
          )}

          {/* ── Content ── */}
          <AnimatePresence mode="wait">

            {/* Success */}
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
                    {loading ? (
                      <><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }} style={{ width: '15px', height: '15px', border: '2px solid rgba(0,0,0,0.2)', borderTop: '2px solid rgba(0,0,0,0.7)', borderRadius: '50%' }} />Verificando...</>
                    ) : 'Entrar'}
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

            ) : regStep === 1 ? (
              /* ── REGISTER FORM — STEP 1 ── */
              <motion.div key="register-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.2rem, 4vw, 1.6rem)', color: '#fff', letterSpacing: '2px', marginBottom: '0.4rem' }}>
                    Únete a la comunidad
                  </h2>
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.83rem' }}>
                    Del 41.º Milenio. Registro gratuito en segundos.
                  </p>
                </div>

                <form onSubmit={handleRegisterStep1} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                  <Field label="Nombre completo *" type="text" value={name} onChange={e => setName(e.target.value)}
                    placeholder="Tu nombre" icon={icons.user} autoComplete="name" />

                  <Field label="Email *" type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)}
                    placeholder="tu@email.com" icon={icons.mail} autoComplete="email" />

                  {/* Password */}
                  <div>
                    <Field label="Contraseña *" type="password" value={regPw} onChange={e => setRegPw(e.target.value)}
                      placeholder="Mínimo 8 caracteres" icon={icons.lock} autoComplete="new-password" />
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
                      <span style={{ fontSize: '0.68rem', color: '#ff8080', marginTop: '0.2rem', display: 'block' }}>✗ Las contraseñas no coinciden</span>
                    )}
                    {regPwConfirm && pwMatch && regPw && (
                      <span style={{ fontSize: '0.68rem', color: '#50c878', marginTop: '0.2rem', display: 'block' }}>✓ Las contraseñas coinciden</span>
                    )}
                  </div>

                  {/* Terms */}
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', cursor: 'pointer', padding: '0.1rem 0' }}>
                    <div onClick={() => setAcceptTerms(v => !v)} style={{
                      width: '16px', height: '16px', borderRadius: '4px', flexShrink: 0, marginTop: '2px',
                      background: acceptTerms ? 'var(--color-primary)' : 'transparent',
                      border: `1.5px solid ${acceptTerms ? 'var(--color-primary)' : 'rgba(255,255,255,0.2)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s', cursor: 'pointer',
                    }}>
                      {acceptTerms && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                    </div>
                    <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>
                      Acepto los <Link to="/terms" style={{ color: 'var(--color-primary)' }}>términos y condiciones</Link> y la <Link to="/privacy" style={{ color: 'var(--color-primary)' }}>política de privacidad</Link>
                    </span>
                  </label>

                  <AnimatePresence>
                    {error && (
                      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        style={{ padding: '0.75rem 1rem', background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.3)', borderRadius: '10px', color: '#ff8080', fontSize: '0.83rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.button type="submit"
                    whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,212,255,0.25)' }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      padding: '0.95rem', marginTop: '0.25rem',
                      background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                      border: 'none', borderRadius: '12px', color: '#000',
                      fontFamily: 'var(--font-display)', fontSize: '0.85rem', fontWeight: 800,
                      letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    }}>
                    Continuar
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                  </motion.button>
                </form>

                {/* Divider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.25rem 0' }}>
                  <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
                  <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.72rem', fontFamily: 'var(--font-display)' }}>O regístrate con</span>
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
                  ¿Ya tienes cuenta?{' '}
                  <button onClick={() => setMode('login')} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontSize: 'inherit', padding: 0, textDecoration: 'underline' }}>
                    Inicia sesión
                  </button>
                </p>
              </motion.div>

            ) : (
              /* ── REGISTER — STEP 2: PLAN SELECTOR ── */
              <motion.div key="register-2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <button onClick={() => setRegStep(1)} style={{
                    background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer',
                    fontSize: '0.75rem', letterSpacing: '1px', fontFamily: 'var(--font-display)',
                    display: 'flex', alignItems: 'center', gap: '0.4rem', margin: '0 auto 1.25rem',
                    padding: '0.3rem 0',
                  }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
                    Volver
                  </button>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <div style={{ width: '20px', height: '3px', borderRadius: '2px', background: 'var(--color-primary)' }} />
                    <div style={{ width: '20px', height: '3px', borderRadius: '2px', background: 'var(--color-primary)' }} />
                  </div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.2rem, 3.5vw, 1.6rem)', color: '#fff', letterSpacing: '2px', marginBottom: '0.4rem' }}>
                    Elige tu plan
                  </h2>
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.85rem' }}>
                    Puedes cambiar tu plan en cualquier momento desde tu perfil.
                  </p>
                </div>

                {/* Plan cards */}
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  {PLANS.map(plan => (
                    <PlanCard
                      key={plan.id}
                      plan={plan}
                      selected={loadingPlan === plan.id}
                      loading={!!loadingPlan}
                      onClick={() => handleSelectPlan(plan.id)}
                    />
                  ))}
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.3)', borderRadius: '10px', color: '#ff8080', fontSize: '0.83rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.72rem', color: 'rgba(255,255,255,0.2)', lineHeight: 1.6 }}>
                  El plan Premium permite comprar guías individuales de pintura.<br />
                  No hay suscripción mensual. Pagas solo por el contenido que elijas.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
