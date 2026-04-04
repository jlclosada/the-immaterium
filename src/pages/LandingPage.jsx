/**
 * LANDING PAGE — Full redesign
 * Apple-quality, content-first, immersive
 */
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../components/UI/Footer';
import Navbar from '../components/UI/Navbar';
import { useTheme } from '../hooks/useTheme';
import { useTranslation } from '../i18n/translations';
import { api } from '../services/api';
import { useStore } from '../stores/useStore';

/* ── animation variants ─────────────────────────────────────────────────── */
const fadeUp = {
  hidden:  { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] } },
};
const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

/* ── tiny helpers ────────────────────────────────────────────────────────── */
const STATE_LABEL = { new: 'Nuevo', used: 'Usado', excellent: 'Excelente', good: 'Bueno' };

function useCountUp(target, duration = 1600) {
  const [count, setCount] = useState(0);
  const startRef = useRef(null);
  const triggered = useRef(false);
  const start = () => {
    if (triggered.current) return;
    triggered.current = true;
    const startTime = performance.now();
    const step = (now) => {
      const pct = Math.min((now - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - pct, 3);
      setCount(Math.round(ease * target));
      if (pct < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  return [count, start, startRef];
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  SUB-COMPONENTS                                                            */
/* ────────────────────────────────────────────────────────────────────────── */

/* Gradient chip label */
function Chip({ color, children }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
      padding: '3px 10px', borderRadius: '20px',
      background: `${color}18`, border: `1px solid ${color}40`,
      color, fontSize: '0.65rem', fontFamily: 'var(--font-display)',
      letterSpacing: '1.5px', textTransform: 'uppercase',
    }}>
      {children}
    </span>
  );
}

/* Content card — used for guides, reports, news */
function ContentCard({ badge, badgeColor, title, subtitle, to, cover, meta, isLight }) {
  const navigate = useNavigate();
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.015 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(to)}
      style={{
        cursor: 'pointer', borderRadius: '20px', overflow: 'hidden',
        background: isLight ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${isLight ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.08)'}`,
        boxShadow: isLight ? '0 4px 24px rgba(0,0,0,0.07)' : '0 4px 24px rgba(0,0,0,0.3)',
        transition: 'box-shadow 0.3s',
        display: 'flex', flexDirection: 'column',
        minWidth: 0,
      }}
    >
      {/* Cover */}
      <div style={{ aspectRatio: '16/9', overflow: 'hidden', background: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.03)', position: 'relative', flexShrink: 0 }}>
        {cover ? (
          <img src={cover} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, ${badgeColor}22, ${badgeColor}08)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: `${badgeColor}22`, border: `1px solid ${badgeColor}40`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={badgeColor} strokeWidth="1.5" strokeLinecap="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
              </svg>
            </div>
          </div>
        )}
        <div style={{ position: 'absolute', top: '0.65rem', left: '0.65rem' }}>
          <Chip color={badgeColor}>{badge}</Chip>
        </div>
      </div>
      {/* Body */}
      <div style={{ padding: '1rem 1.1rem 1.2rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        <h3 style={{
          fontFamily: 'var(--font-display)', fontSize: '0.88rem',
          letterSpacing: '0.5px', lineHeight: 1.35,
          color: isLight ? 'var(--text-primary)' : 'rgba(255,255,255,0.9)',
          margin: 0,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>{title}</h3>
        {subtitle && (
          <p style={{ fontSize: '0.78rem', color: isLight ? 'var(--text-dim)' : 'rgba(255,255,255,0.38)', margin: 0, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {subtitle}
          </p>
        )}
        {meta && (
          <div style={{ marginTop: 'auto', paddingTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {meta}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* Bento feature card */
function FeatureCard({ to, title, subtitle, color, icon, size = 'normal', isLight }) {
  const navigate = useNavigate();
  const [hov, setHov] = useState(false);
  return (
    <motion.div
      whileHover={{ y: -5, scale: size === 'large' ? 1.01 : 1.02 }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setHov(true)}
      onHoverEnd={() => setHov(false)}
      onClick={() => navigate(to)}
      style={{
        cursor: 'pointer', borderRadius: '24px', overflow: 'hidden', position: 'relative',
        padding: size === 'large' ? '2rem' : '1.5rem',
        background: isLight ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${hov ? color + '50' : (isLight ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.08)')}`,
        boxShadow: hov
          ? `0 12px 48px ${color}20, 0 4px 16px rgba(0,0,0,0.2)`
          : (isLight ? '0 4px 20px rgba(0,0,0,0.06)' : '0 4px 20px rgba(0,0,0,0.25)'),
        transition: 'box-shadow 0.3s, border-color 0.3s',
        height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      }}
    >
      {/* Background gradient glow */}
      <div style={{
        position: 'absolute', inset: 0, opacity: hov ? 0.08 : 0.04,
        background: `radial-gradient(circle at 30% 40%, ${color}, transparent 70%)`,
        transition: 'opacity 0.3s', pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          width: size === 'large' ? '52px' : '44px',
          height: size === 'large' ? '52px' : '44px',
          borderRadius: '14px',
          background: `${color}18`,
          border: `1px solid ${color}35`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: size === 'large' ? '1.25rem' : '1rem',
          color,
          transition: 'background 0.2s',
        }}>
          {icon}
        </div>
        <h3 style={{
          fontFamily: 'var(--font-display)',
          fontSize: size === 'large' ? '1.05rem' : '0.88rem',
          letterSpacing: size === 'large' ? '2px' : '1.5px',
          color: isLight ? 'var(--text-primary)' : '#fff',
          margin: '0 0 0.4rem', textTransform: 'uppercase',
        }}>{title}</h3>
        <p style={{ fontSize: '0.8rem', color: isLight ? 'var(--text-dim)' : 'rgba(255,255,255,0.4)', margin: 0, lineHeight: 1.55 }}>
          {subtitle}
        </p>
      </div>

      <div style={{ position: 'relative', zIndex: 1, marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.35rem', color, fontSize: '0.75rem', fontFamily: 'var(--font-display)', letterSpacing: '1px' }}>
        Explorar
        <motion.svg
          animate={{ x: hov ? 4 : 0 }} transition={{ duration: 0.2 }}
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
        >
          <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
        </motion.svg>
      </div>
    </motion.div>
  );
}

/* Stat counter */
function StatCard({ value, suffix = '', label, color, isLight }) {
  const ref = useRef(null);
  const [count, setCount] = useState(0);
  const done = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !done.current) {
        done.current = true;
        const dur = 1400;
        const start = performance.now();
        const step = (now) => {
          const pct = Math.min((now - start) / dur, 1);
          const ease = 1 - Math.pow(1 - pct, 3);
          setCount(Math.round(ease * value));
          if (pct < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [value]);
  return (
    <div ref={ref} style={{ textAlign: 'center', padding: '1.5rem 2rem' }}>
      <div style={{
        fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 3rem)',
        fontWeight: 900, letterSpacing: '2px', lineHeight: 1,
        background: `linear-gradient(135deg, ${color}, ${color}88)`,
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        backgroundClip: 'text', marginBottom: '0.4rem',
      }}>
        {count}{suffix}
      </div>
      <div style={{ fontSize: '0.75rem', color: isLight ? 'var(--text-dim)' : 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-display)', letterSpacing: '2px', textTransform: 'uppercase' }}>
        {label}
      </div>
    </div>
  );
}

/* Section header */
function SectionHeader({ eyebrow, title, subtitle, accent = 'var(--color-primary)', isLight, align = 'left' }) {
  return (
    <motion.div
      variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}
      style={{ textAlign: align, marginBottom: 'clamp(2rem, 4vw, 3rem)' }}
    >
      {eyebrow && (
        <p style={{
          fontFamily: 'var(--font-display)', fontSize: '0.65rem', letterSpacing: '5px',
          color: accent, textTransform: 'uppercase', opacity: 0.85,
          marginBottom: '0.6rem',
        }}>{eyebrow}</p>
      )}
      <h2 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
        letterSpacing: 'clamp(1px, 0.4vw, 3px)',
        color: isLight ? 'var(--text-primary)' : '#fff',
        textTransform: 'uppercase', lineHeight: 1.15,
        marginBottom: subtitle ? '0.75rem' : 0,
      }}>{title}</h2>
      {subtitle && (
        <p style={{ fontSize: 'clamp(0.88rem, 1.5vw, 1rem)', color: isLight ? 'var(--text-dim)' : 'rgba(255,255,255,0.42)', lineHeight: 1.7, maxWidth: '560px', marginLeft: align === 'center' ? 'auto' : 0, marginRight: align === 'center' ? 'auto' : 0 }}>
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  MAIN PAGE                                                                  */
/* ────────────────────────────────────────────────────────────────────────── */

export default function LandingPage() {
  const { fetchInitialData, language, token, user, logout, armies: storeArmies } = useStore();
  const t = useTranslation(language);
  const { isLight } = useTheme();
  const navigate = useNavigate();

  /* Hero parallax */
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  /* Content */
  const [featuredNews,     setFeaturedNews]     = useState([]);
  const [featuredGuides,   setFeaturedGuides]   = useState([]);
  const [featuredReports,  setFeaturedReports]  = useState([]);
  const [featuredLore,     setFeaturedLore]     = useState([]);
  const [featuredListings, setFeaturedListings] = useState([]);
  const [selectedListing,  setSelectedListing]  = useState(null);
  const [loadingContent,   setLoadingContent]   = useState(true);
  const [allGuidesCount,   setAllGuidesCount]   = useState(0);
  const [allReportsCount,  setAllReportsCount]  = useState(0);

  useEffect(() => {
    document.title = 'The Immaterium | Comunidad Warhammer 40,000 en Español';
    fetchInitialData();
    loadContent();
  }, []);

  const loadContent = async () => {
    setLoadingContent(true);
    try {
      const [newsRes, guidesRes, reportsRes, loreRes, listingsRes] = await Promise.allSettled([
        api.getNewsArticles(),
        api.getPaintingGuides(),
        api.getBattleReports(),
        api.getLoreEntries(),
        api.getListings({ status: 'available' }),
      ]);
      const safe = r => r.status === 'fulfilled' && Array.isArray(r.value) ? r.value : [];
      const guides = safe(guidesRes);
      const reports = safe(reportsRes);
      setAllGuidesCount(guides.length);
      setAllReportsCount(reports.length);
      setFeaturedNews(safe(newsRes).slice(0, 4));
      setFeaturedGuides(guides.slice(0, 4));
      setFeaturedReports(reports.slice(0, 3));
      setFeaturedLore(safe(loreRes).slice(0, 4));
      setFeaturedListings(safe(listingsRes).slice(0, 4));
    } finally {
      setLoadingContent(false);
    }
  };

  /* Styles */
  const bg = isLight
    ? 'radial-gradient(ellipse 120% 60% at 50% -5%, #c4dcf5 0%, #ddeeff 25%, #eef2fb 55%, #f4f7ff 100%)'
    : 'radial-gradient(ellipse 120% 60% at 50% 0%, #0a0a2a 0%, #04040f 55%)';

  const sectionPad = 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 5vw, 3rem)';

  const BENTO_ITEMS = [
    { to: '/armies',        title: 'Ejércitos',         subtitle: 'Explora los ejércitos de Warhammer 40K con lore, estadísticas y galería de miniaturas.',       color: 'var(--color-primary)',    size: 'large',
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
    { to: '/guides',        title: 'Guías de Pintura',  subtitle: 'Técnicas paso a paso para todos los niveles. Accede a contenido premium exclusivo.',            color: 'var(--color-secondary)',  size: 'normal',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><circle cx="11" cy="11" r="2"/></svg> },
    { to: '/battle-reports',title: 'Informes de Batalla', subtitle: 'Crónicas de batallas épicas de la comunidad con análisis tácticos.',                         color: '#ff6464',                 size: 'normal',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" y1="19" x2="19" y2="13"/><line x1="16" y1="16" x2="20" y2="20"/></svg> },
    { to: '/marketplace',   title: 'Marketplace',        subtitle: 'Compra y vende miniaturas con la comunidad. Miles de artículos disponibles.',                  color: '#10b981',                 size: 'normal',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg> },
    { to: '/army-builder',  title: 'Army Builder',       subtitle: 'Construye y gestiona tus listas de ejército para cualquier formato.',                          color: '#6366f1',                 size: 'normal',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/><path d="M7 8h3m4 0h3M7 12h10"/></svg> },
    { to: '/lore',          title: 'Lore',               subtitle: 'Sumérgete en la rica historia del universo de Warhammer 40,000.',                              color: 'var(--color-accent)',     size: 'normal',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><path d="M8 7h8"/><path d="M8 11h8"/><path d="M8 15h6"/></svg> },
    { to: '/videos',        title: 'Videos',             subtitle: 'Canal de vídeos con batallas, tutoriales y torneos en español.',                               color: '#ff4444',                 size: 'normal',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg> },
    { to: '/news',          title: 'Noticias',           subtitle: 'Últimas novedades del hobby: lanzamientos, torneos y eventos de la comunidad.',                color: '#f59e0b',                 size: 'normal',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a4 4 0 0 1-4 4z"/><path d="M8 6h12"/><path d="M8 10h12"/><path d="M8 14h8"/></svg> },
  ];

  const PREMIUM_PERKS = [
    { icon: '🎨', title: 'Todas las guías', desc: 'Acceso completo a todas las guías de pintura premium sin restricciones.' },
    { icon: '🎬', title: 'Vídeos exclusivos', desc: 'Canal privado con técnicas avanzadas y content exclusivo.' },
    { icon: '🏷️', title: '10% en Marketplace', desc: 'Descuento en tu primera compra dentro de la comunidad.' },
    { icon: '⭐', title: 'Badge Premium', desc: 'Identificación exclusiva en tu perfil dentro de la comunidad.' },
  ];

  return (
    <div style={{ background: bg, minHeight: '100vh', color: isLight ? 'var(--text-primary)' : '#fff', overflowX: 'hidden' }}>

      {/* ── Ambient orbs ── */}
      {!isLight && (
        <div aria-hidden style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
          <div style={{ position: 'absolute', top: '-15%', left: '-10%', width: 'min(700px,90vw)', height: 'min(700px,90vw)', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)', filter: 'blur(80px)', animation: 'aurora-drift 14s ease-in-out infinite alternate' }} />
          <div style={{ position: 'absolute', top: '25%', right: '-12%', width: 'min(550px,70vw)', height: 'min(550px,70vw)', borderRadius: '50%', background: 'radial-gradient(circle, rgba(100,0,200,0.06) 0%, transparent 70%)', filter: 'blur(80px)', animation: 'aurora-drift 20s ease-in-out infinite alternate', animationDelay: '-8s' }} />
          <div style={{ position: 'absolute', bottom: '10%', left: '15%', width: 'min(400px,55vw)', height: 'min(400px,55vw)', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,80,220,0.04) 0%, transparent 70%)', filter: 'blur(80px)', animation: 'aurora-drift 26s ease-in-out infinite alternate', animationDelay: '-14s' }} />
        </div>
      )}

      {/* ────────────── NAVBAR ────────────── */}
      <Navbar />

      {/* ════════════════════════════════════
          HERO
          ════════════════════════════════════ */}
      <section ref={heroRef} style={{
        position: 'relative', minHeight: '100svh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        textAlign: 'center',
        padding: 'clamp(5rem, 15vw, 10rem) clamp(1.25rem, 5vw, 3rem) clamp(3rem, 8vw, 6rem)',
        overflow: 'hidden', zIndex: 1,
      }}>
        {/* Subtle grid */}
        <div aria-hidden style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: isLight
            ? 'linear-gradient(rgba(0,100,200,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(0,100,200,0.05) 1px,transparent 1px)'
            : 'linear-gradient(rgba(0,212,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,0.03) 1px,transparent 1px)',
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(ellipse 80% 70% at 50% 20%, black 0%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 20%, black 0%, transparent 100%)',
        }} />
        {/* Center glow */}
        <div aria-hidden style={{ position: 'absolute', top: '45%', left: '50%', transform: 'translate(-50%,-50%)', width: 'min(800px,100vw)', height: 'min(800px,100vw)', borderRadius: '50%', background: isLight ? 'radial-gradient(circle, rgba(0,100,220,0.06) 0%, transparent 65%)' : 'radial-gradient(circle, rgba(0,212,255,0.05) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <motion.div style={{ y: heroY, opacity: heroOpacity, zIndex: 1, width: '100%', maxWidth: '900px' }}>
          {/* Eyebrow */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '5px 16px', borderRadius: '20px',
              background: isLight ? 'rgba(0,153,204,0.1)' : 'rgba(0,212,255,0.08)',
              border: isLight ? '1px solid rgba(0,153,204,0.25)' : '1px solid rgba(0,212,255,0.2)',
              color: 'var(--color-primary)', fontSize: '0.7rem',
              fontFamily: 'var(--font-display)', letterSpacing: '4px', textTransform: 'uppercase',
              marginBottom: '1.5rem',
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-primary)', boxShadow: '0 0 8px var(--color-primary)', animation: 'pulse-dot 2s infinite' }} />
              Comunidad Warhammer 40,000 en Español
            </span>
          </motion.div>

          {/* Main title */}
          <motion.h1
            variants={fadeUp} initial="hidden" animate="visible"
            transition={{ delay: 0.1 }}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(3rem, 10vw, 7.5rem)',
              letterSpacing: 'clamp(0.15rem, 2vw, 0.8rem)',
              lineHeight: 1.05, margin: '0 0 1.5rem',
              background: isLight
                ? 'linear-gradient(180deg, #0a1232 0%, #1a3580 55%, #0077bb 100%)'
                : 'linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.5) 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            THE<br />IMMATERIUM
          </motion.h1>

          {/* Divider */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.18 }}
            style={{ width: 'clamp(60px, 12vw, 140px)', height: '2px', background: 'linear-gradient(90deg, transparent, var(--color-primary), transparent)', margin: '0 auto 1.75rem' }} />

          {/* Subtitle */}
          <motion.p
            variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.25 }}
            style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', maxWidth: '580px', margin: '0 auto 2.5rem', color: isLight ? 'var(--text-dim)' : 'rgba(255,255,255,0.45)', lineHeight: 1.8, letterSpacing: '0.3px' }}
          >
            Guías de pintura, ejércitos, informes de batalla, marketplace y comunidad.
            Todo lo que necesitas para el hobby en un solo lugar.
          </motion.p>

          {/* Auth CTA */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.32 }}>
            {!token ? (
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <Link to="/signin?mode=register" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.85rem 2.2rem', borderRadius: '50px',
                  background: 'linear-gradient(135deg, var(--color-primary) 0%, #0055cc 100%)',
                  color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 700,
                  fontSize: '0.85rem', letterSpacing: '2px', textTransform: 'uppercase',
                  textDecoration: 'none', boxShadow: '0 6px 28px rgba(0,190,255,0.35)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)'; e.currentTarget.style.boxShadow = '0 8px 36px rgba(0,190,255,0.5)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(0,190,255,0.35)'; }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  Unirte gratis
                </Link>
                <Link to="/signin" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.85rem 2.2rem', borderRadius: '50px',
                  background: 'transparent',
                  color: isLight ? 'var(--color-primary)' : 'rgba(255,255,255,0.85)',
                  fontFamily: 'var(--font-display)', fontWeight: 700,
                  fontSize: '0.85rem', letterSpacing: '2px', textTransform: 'uppercase',
                  textDecoration: 'none',
                  border: isLight ? '1.5px solid var(--color-primary)' : '1.5px solid rgba(255,255,255,0.22)',
                  transition: 'transform 0.2s, background 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)'; e.currentTarget.style.background = isLight ? 'rgba(0,120,200,0.07)' : 'rgba(255,255,255,0.06)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'transparent'; }}
                >
                  Iniciar sesión
                </Link>
              </div>
            ) : (
              /* Logged-in welcome card */
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '1rem',
                padding: '0.9rem 1.5rem', borderRadius: '20px',
                background: isLight ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.05)',
                border: isLight ? '1px solid rgba(0,153,204,0.2)' : '1px solid rgba(0,212,255,0.15)',
                backdropFilter: 'blur(12px)',
                boxShadow: isLight ? '0 4px 24px rgba(0,0,0,0.08)' : '0 4px 24px rgba(0,0,0,0.3)',
              }}>
                <div style={{ width: '46px', height: '46px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-primary), #0055cc)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.1rem', color: '#fff', flexShrink: 0, boxShadow: '0 0 16px rgba(0,190,255,0.3)' }}>
                  {(user?.username || 'U')[0].toUpperCase()}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: isLight ? 'var(--text-primary)' : '#fff', letterSpacing: '1px' }}>
                      {user?.username || user?.name}
                    </span>
                    {user?.isPremium && <span style={{ fontSize: '0.6rem', color: '#FFD700', fontFamily: 'var(--font-display)', letterSpacing: '2px', background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.3)', borderRadius: '6px', padding: '1px 6px' }}>★ PREMIUM</span>}
                  </div>
                  <p style={{ fontSize: '0.75rem', color: isLight ? 'var(--text-dim)' : 'rgba(255,255,255,0.35)', margin: '2px 0 0' }}>Bienvenido de vuelta</p>
                </div>
                <Link to="/profile" style={{ marginLeft: '0.5rem', padding: '0.45rem 1rem', borderRadius: '12px', background: isLight ? 'rgba(0,153,204,0.1)' : 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.25)', color: 'var(--color-primary)', fontFamily: 'var(--font-display)', fontSize: '0.68rem', letterSpacing: '1.5px', textTransform: 'uppercase', textDecoration: 'none', transition: 'background 0.2s', flexShrink: 0 }}
                  onMouseEnter={e => e.currentTarget.style.background = isLight ? 'rgba(0,153,204,0.18)' : 'rgba(0,212,255,0.18)'}
                  onMouseLeave={e => e.currentTarget.style.background = isLight ? 'rgba(0,153,204,0.1)' : 'rgba(0,212,255,0.1)'}
                >Mi perfil</Link>
              </div>
            )}
          </motion.div>
        </motion.div>
      </section>

      {/* ════════════════════════════════════
          STATS BAR
          ════════════════════════════════════ */}
      <section style={{
        position: 'relative', zIndex: 1,
        borderTop: isLight ? '1px solid rgba(0,0,0,0.07)' : '1px solid rgba(255,255,255,0.06)',
        borderBottom: isLight ? '1px solid rgba(0,0,0,0.07)' : '1px solid rgba(255,255,255,0.06)',
        background: isLight ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.025)',
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 0 }}>
          {[
            { value: storeArmies.length || 18,               suffix: '',  label: 'Facciones',    color: '#ff6464' },
            { value: allGuidesCount + allReportsCount || 50, suffix: '+', label: 'Contenidos',   color: '#10b981' },
            { value: 100,                                    suffix: '%', label: 'En Español',   color: '#f59e0b' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.6 }}
              style={{ flex: '1 1 150px', borderRight: i < 2 ? (isLight ? '1px solid rgba(0,0,0,0.07)' : '1px solid rgba(255,255,255,0.06)') : 'none' }}>
              <StatCard value={s.value} suffix={s.suffix} label={s.label} color={s.color} isLight={isLight} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════
          BENTO FEATURES GRID
          ════════════════════════════════════ */}
      <section style={{ position: 'relative', zIndex: 1, padding: sectionPad }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <SectionHeader
            eyebrow="Explora la plataforma"
            title="Todo lo que necesitas"
            subtitle="Una plataforma completa para el aficionado a Warhammer 40,000. Desde ejércitos hasta marketplace, todo en español."
            isLight={isLight}
            align="center"
          />

          {/* Bento grid */}
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(4, 1fr)', gridTemplateRows: 'auto', gridAutoRows: '220px' }} className="bento-grid">
            {/* Large card - armies */}
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}
              style={{ gridColumn: 'span 2', gridRow: 'span 2' }}>
              <FeatureCard {...BENTO_ITEMS[0]} isLight={isLight} />
            </motion.div>
            {/* Guides */}
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} transition={{ delay: 0.05 }}
              style={{ gridColumn: 'span 1' }}>
              <FeatureCard {...BENTO_ITEMS[1]} isLight={isLight} />
            </motion.div>
            {/* Batallas */}
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} transition={{ delay: 0.1 }}
              style={{ gridColumn: 'span 1' }}>
              <FeatureCard {...BENTO_ITEMS[2]} isLight={isLight} />
            </motion.div>
            {/* Marketplace */}
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} transition={{ delay: 0.08 }}
              style={{ gridColumn: 'span 1' }}>
              <FeatureCard {...BENTO_ITEMS[3]} isLight={isLight} />
            </motion.div>
            {/* Army Builder */}
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} transition={{ delay: 0.12 }}
              style={{ gridColumn: 'span 1' }}>
              <FeatureCard {...BENTO_ITEMS[4]} isLight={isLight} />
            </motion.div>
            {/* Lore */}
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} transition={{ delay: 0.14 }}
              style={{ gridColumn: 'span 1' }}>
              <FeatureCard {...BENTO_ITEMS[5]} isLight={isLight} />
            </motion.div>
            {/* Videos */}
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} transition={{ delay: 0.16 }}
              style={{ gridColumn: 'span 1' }}>
              <FeatureCard {...BENTO_ITEMS[6]} isLight={isLight} />
            </motion.div>
            {/* Noticias */}
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} transition={{ delay: 0.18 }}
              style={{ gridColumn: 'span 1' }}>
              <FeatureCard {...BENTO_ITEMS[7]} isLight={isLight} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          LATEST GUIDES
          ════════════════════════════════════ */}
      {(featuredGuides.length > 0 || loadingContent) && (
        <section style={{ position: 'relative', zIndex: 1, padding: sectionPad, background: isLight ? 'rgba(0,0,0,0.015)' : 'rgba(255,255,255,0.015)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: 'clamp(1.5rem, 3vw, 2.5rem)' }}>
              <SectionHeader
                eyebrow="Hobby & técnica"
                title="Guías de Pintura"
                isLight={isLight}
              />
              <Link to="/guides" style={{ flexShrink: 0, padding: '0.5rem 1.2rem', borderRadius: '20px', border: `1px solid ${isLight ? 'rgba(153,0,204,0.3)' : 'rgba(255,0,255,0.25)'}`, color: 'var(--color-secondary)', textDecoration: 'none', fontSize: '0.78rem', fontFamily: 'var(--font-display)', letterSpacing: '1.5px', transition: 'background 0.2s', marginBottom: 'clamp(1.5rem, 3vw, 2.5rem)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(153,0,204,0.07)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                Ver todas →
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
              {loadingContent
                ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} style={{ borderRadius: '20px', background: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.03)', aspectRatio: '3/4', animation: 'skeleton-pulse 1.6s ease-in-out infinite' }} />
                ))
                : featuredGuides.map((guide, i) => (
                  <motion.div key={guide.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}>
                    <ContentCard
                      badge={guide.isPremium || guide.is_premium ? '★ Premium' : 'Libre'}
                      badgeColor={guide.isPremium || guide.is_premium ? '#FFD700' : 'var(--color-secondary)'}
                      title={guide.title}
                      subtitle={guide.description}
                      to={`/guides/${guide.id}`}
                      cover={guide.coverImage || guide.cover_image}
                      isLight={isLight}
                      meta={
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                          {guide.difficulty && <span style={{ fontSize: '0.7rem', color: isLight ? 'var(--text-dim)' : 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-display)', letterSpacing: '1px' }}>{guide.difficulty}</span>}
                          {(guide.isPremium || guide.is_premium) && guide.price && (
                            <span style={{ fontSize: '0.75rem', color: '#FFD700', fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                              {(guide.price / 100).toFixed(2)} €
                            </span>
                          )}
                        </div>
                      }
                    />
                  </motion.div>
                ))
              }
            </div>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════
          BATTLE REPORTS
          ════════════════════════════════════ */}
      {(featuredReports.length > 0 || loadingContent) && (
        <section style={{ position: 'relative', zIndex: 1, padding: sectionPad }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: 'clamp(1.5rem, 3vw, 2.5rem)' }}>
              <SectionHeader eyebrow="Crónicas de guerra" title="Informes de Batalla" isLight={isLight} />
              <Link to="/battle-reports" style={{ flexShrink: 0, padding: '0.5rem 1.2rem', borderRadius: '20px', border: '1px solid rgba(255,100,100,0.3)', color: '#ff6464', textDecoration: 'none', fontSize: '0.78rem', fontFamily: 'var(--font-display)', letterSpacing: '1.5px', transition: 'background 0.2s', marginBottom: 'clamp(1.5rem, 3vw, 2.5rem)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,100,100,0.07)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >Ver todos →</Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
              {loadingContent
                ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} style={{ borderRadius: '20px', background: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.03)', height: '240px', animation: 'skeleton-pulse 1.6s ease-in-out infinite' }} />
                ))
                : featuredReports.map((report, i) => (
                  <motion.div key={report.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                    <ContentCard
                      badge="Batalla"
                      badgeColor="#ff6464"
                      title={report.title}
                      subtitle={report.summary || report.description}
                      to={`/battle-reports/${report.id}`}
                      cover={report.images?.[0]}
                      isLight={isLight}
                      meta={
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {report.player1_faction && <Chip color="#ff6464">{report.player1_faction}</Chip>}
                          {report.player2_faction && <Chip color="#6366f1">{report.player2_faction}</Chip>}
                        </div>
                      }
                    />
                  </motion.div>
                ))
              }
            </div>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════
          LORE & HISTORIA
          ════════════════════════════════════ */}
      {featuredLore.length > 0 && (
        <section style={{ position: 'relative', zIndex: 1, padding: sectionPad, background: isLight ? 'rgba(180,120,255,0.03)' : 'rgba(180,120,255,0.025)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: 'clamp(1.5rem, 3vw, 2.5rem)' }}>
              <SectionHeader eyebrow="Fragmentos del 41º milenio" title="Biblioteca de Lore" isLight={isLight} accent="var(--color-accent)" />
              <Link to="/lore" style={{ flexShrink: 0, padding: '0.5rem 1.2rem', borderRadius: '20px', border: '1px solid rgba(255,215,0,0.3)', color: 'var(--color-accent)', textDecoration: 'none', fontSize: '0.78rem', fontFamily: 'var(--font-display)', letterSpacing: '1.5px', transition: 'background 0.2s', marginBottom: 'clamp(1.5rem, 3vw, 2.5rem)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,215,0,0.07)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >Ver todo →</Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {featuredLore.map((entry, i) => {
                const CATEGORY_COLORS = { 'Historia': '#ffd700', 'Facciones': '#00d4ff', 'Personajes': '#ff6b35', 'Planetas': '#7bff7b', 'Tecnología': '#c084fc', 'Eventos': '#f97316' };
                const catColor = CATEGORY_COLORS[entry.category] || 'var(--color-accent)';
                return (
                  <motion.div key={entry.id} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}>
                    <Link to={`/lore/${entry.id}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', borderRadius: '14px', background: isLight ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.025)', border: `1px solid ${isLight ? 'rgba(180,120,255,0.1)' : 'rgba(255,255,255,0.06)'}`, transition: 'border-color 0.2s, background 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = `${catColor}50`; e.currentTarget.style.background = isLight ? 'rgba(255,255,255,0.9)' : `${catColor}08`; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = isLight ? 'rgba(180,120,255,0.1)' : 'rgba(255,255,255,0.06)'; e.currentTarget.style.background = isLight ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.025)'; }}
                    >
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: catColor, flexShrink: 0, boxShadow: `0 0 8px ${catColor}80` }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2px' }}>
                          <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.88rem', color: isLight ? '#111' : 'rgba(255,255,255,0.9)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.title}</span>
                          {entry.category && <span style={{ fontSize: '0.6rem', padding: '2px 8px', borderRadius: '20px', background: `${catColor}20`, color: catColor, border: `1px solid ${catColor}40`, flexShrink: 0, fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase' }}>{entry.category}</span>}
                        </div>
                        {entry.excerpt && <p style={{ margin: 0, fontSize: '0.78rem', color: isLight ? 'var(--text-dim)' : 'rgba(255,255,255,0.35)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.excerpt}</p>}
                      </div>
                      {entry.relatedFaction?.name && <span style={{ fontSize: '0.7rem', color: isLight ? 'var(--text-dim)' : 'var(--text-faint)', flexShrink: 0 }}>{entry.relatedFaction.name}</span>}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={catColor} strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, opacity: 0.6 }}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════
          MARKETPLACE PREVIEW
          ════════════════════════════════════ */}
      {featuredListings.length > 0 && (
        <section style={{ position: 'relative', zIndex: 1, padding: sectionPad, background: isLight ? 'rgba(16,185,129,0.03)' : 'rgba(16,185,129,0.025)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: 'clamp(1.5rem, 3vw, 2.5rem)' }}>
              <SectionHeader eyebrow="Compra & vende" title="Marketplace" isLight={isLight} accent="#10b981" />
              <Link to="/marketplace" style={{ flexShrink: 0, padding: '0.5rem 1.2rem', borderRadius: '20px', border: '1px solid rgba(16,185,129,0.35)', color: '#10b981', textDecoration: 'none', fontSize: '0.78rem', fontFamily: 'var(--font-display)', letterSpacing: '1.5px', transition: 'background 0.2s', marginBottom: 'clamp(1.5rem, 3vw, 2.5rem)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(16,185,129,0.08)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >Ver todo →</Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem' }}>
              {featuredListings.map((listing, i) => (
                <motion.div key={listing.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                  onClick={() => setSelectedListing(listing)}
                  whileHover={{ y: -6, scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  style={{
                    cursor: 'pointer', borderRadius: '20px', overflow: 'hidden',
                    background: isLight ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${isLight ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.12)'}`,
                    boxShadow: isLight ? '0 4px 20px rgba(0,0,0,0.06)' : '0 4px 20px rgba(0,0,0,0.25)',
                    transition: 'box-shadow 0.3s',
                  }}
                >
                  <div style={{ aspectRatio: '4/3', overflow: 'hidden', background: 'rgba(16,185,129,0.06)', position: 'relative' }}>
                    {listing.images?.[0] ? (
                      <img src={listing.images[0]} alt={listing.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(16,185,129,0.4)" strokeWidth="1.5"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                      </div>
                    )}
                    <div style={{ position: 'absolute', top: '0.65rem', right: '0.65rem', background: 'rgba(16,185,129,0.92)', color: '#fff', padding: '3px 10px', borderRadius: '20px', fontFamily: 'var(--font-display)', fontSize: '0.72rem', fontWeight: 700 }}>
                      {listing.price ? `${listing.price} €` : 'Consultar'}
                    </div>
                  </div>
                  <div style={{ padding: '0.85rem 1rem' }}>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.82rem', color: isLight ? 'var(--text-primary)' : '#fff', margin: '0 0 0.3rem', letterSpacing: '0.5px', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{listing.title}</p>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {listing.faction && <Chip color="#10b981">{listing.faction}</Chip>}
                      {listing.state && <span style={{ fontSize: '0.68rem', color: isLight ? 'var(--text-dim)' : 'rgba(255,255,255,0.35)' }}>{STATE_LABEL[listing.state] || listing.state}</span>}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════
          LATEST NEWS
          ════════════════════════════════════ */}
      {featuredNews.length > 0 && (
        <section style={{ position: 'relative', zIndex: 1, padding: sectionPad }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: 'clamp(1.5rem, 3vw, 2.5rem)' }}>
              <SectionHeader eyebrow="Actualidad" title="Últimas Noticias" isLight={isLight} accent="#f59e0b" />
              <Link to="/news" style={{ flexShrink: 0, padding: '0.5rem 1.2rem', borderRadius: '20px', border: '1px solid rgba(245,158,11,0.35)', color: '#f59e0b', textDecoration: 'none', fontSize: '0.78rem', fontFamily: 'var(--font-display)', letterSpacing: '1.5px', transition: 'background 0.2s', marginBottom: 'clamp(1.5rem, 3vw, 2.5rem)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(245,158,11,0.08)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >Ver todas →</Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {featuredNews.map((news, i) => (
                <motion.div key={news.id} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}>
                  <Link to={`/news/${news.id}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1rem 1.25rem', borderRadius: '16px', background: isLight ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.03)', border: `1px solid ${isLight ? 'rgba(245,158,11,0.12)' : 'rgba(255,255,255,0.06)'}`, transition: 'border-color 0.2s, background 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(245,158,11,0.35)'; e.currentTarget.style.background = isLight ? 'rgba(255,255,255,0.9)' : 'rgba(245,158,11,0.04)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = isLight ? 'rgba(245,158,11,0.12)' : 'rgba(255,255,255,0.06)'; e.currentTarget.style.background = isLight ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.03)'; }}
                  >
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b', flexShrink: 0, boxShadow: '0 0 8px rgba(245,158,11,0.6)' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.88rem', letterSpacing: '0.5px', color: isLight ? 'var(--text-primary)' : 'rgba(255,255,255,0.9)', margin: 0, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{news.title}</h3>
                      {(news.excerpt || news.content) && (
                        <p style={{ fontSize: '0.78rem', color: isLight ? 'var(--text-dim)' : 'rgba(255,255,255,0.35)', margin: '2px 0 0', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {(news.excerpt || news.content)?.replace(/<[^>]+>/g, '').substring(0, 120)}
                        </p>
                      )}
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, opacity: 0.7 }}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════
          PREMIUM SECTION
          ════════════════════════════════════ */}
      {!user?.isPremium && (
        <section style={{
          position: 'relative', zIndex: 1,
          padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 5vw, 3rem)',
          background: isLight
            ? 'linear-gradient(135deg, rgba(40,20,0,0.04), rgba(255,215,0,0.06))'
            : 'linear-gradient(135deg, rgba(30,15,0,0.8), rgba(15,10,0,0.95))',
          borderTop: isLight ? '1px solid rgba(255,215,0,0.15)' : '1px solid rgba(255,215,0,0.12)',
          borderBottom: isLight ? '1px solid rgba(255,215,0,0.15)' : '1px solid rgba(255,215,0,0.12)',
          overflow: 'hidden',
        }}>
          {/* Gold ambient glow */}
          <div aria-hidden style={{ position: 'absolute', top: '-30%', right: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,215,0,0.08) 0%, transparent 65%)', pointerEvents: 'none' }} />
          <div aria-hidden style={{ position: 'absolute', bottom: '-20%', left: '5%', width: '350px', height: '350px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,160,0,0.06) 0%, transparent 65%)', pointerEvents: 'none' }} />

          <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(2rem, 5vw, 5rem)', alignItems: 'center' }} className="premium-grid">
              {/* Left text */}
              <div>
                <motion.div variants={fadeUp}>
                  <span style={{ display: 'inline-block', padding: '4px 14px', borderRadius: '20px', background: 'rgba(255,215,0,0.12)', border: '1px solid rgba(255,215,0,0.3)', color: '#FFD700', fontSize: '0.65rem', fontFamily: 'var(--font-display)', letterSpacing: '4px', marginBottom: '1.25rem' }}>
                    ★ PREMIUM
                  </span>
                </motion.div>
                <motion.h2 variants={fadeUp} style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', letterSpacing: '2px', textTransform: 'uppercase', lineHeight: 1.15, marginBottom: '1rem', color: isLight ? 'var(--text-primary)' : '#fff' }}>
                  Desbloquea el<br /><span style={{ color: '#FFD700' }}>potencial completo</span>
                </motion.h2>
                <motion.p variants={fadeUp} style={{ fontSize: '0.95rem', color: isLight ? 'var(--text-dim)' : 'rgba(255,255,255,0.42)', lineHeight: 1.7, marginBottom: '2rem' }}>
                  Accede a todas las guías de pintura premium, vídeos exclusivos del canal y ventajas especiales en la comunidad.
                </motion.p>
                <motion.div variants={fadeUp}>
                  <Link to="/signin?mode=register" style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.85rem 2rem', borderRadius: '50px',
                    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                    color: '#000', fontFamily: 'var(--font-display)', fontWeight: 700,
                    fontSize: '0.82rem', letterSpacing: '2px', textTransform: 'uppercase',
                    textDecoration: 'none',
                    boxShadow: '0 6px 28px rgba(255,200,0,0.35)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)'; e.currentTarget.style.boxShadow = '0 8px 36px rgba(255,200,0,0.5)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(255,200,0,0.35)'; }}
                  >
                    ★ Empezar Premium
                  </Link>
                </motion.div>
              </div>
              {/* Right perks */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {PREMIUM_PERKS.map((perk, i) => (
                  <motion.div key={i} variants={fadeUp} transition={{ delay: i * 0.07 }}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: '1rem',
                      padding: '1rem 1.25rem', borderRadius: '16px',
                      background: isLight ? 'rgba(255,255,255,0.7)' : 'rgba(255,215,0,0.04)',
                      border: isLight ? '1px solid rgba(255,215,0,0.2)' : '1px solid rgba(255,215,0,0.1)',
                    }}
                  >
                    <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>{perk.icon}</span>
                    <div>
                      <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', letterSpacing: '1px', color: isLight ? 'var(--text-primary)' : '#FFD700', margin: '0 0 0.2rem', textTransform: 'uppercase' }}>{perk.title}</h4>
                      <p style={{ fontSize: '0.78rem', color: isLight ? 'var(--text-dim)' : 'rgba(255,255,255,0.38)', margin: 0, lineHeight: 1.5 }}>{perk.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════
          FINAL CTA (only guests)
          ════════════════════════════════════ */}
      {!token && (
        <section style={{ position: 'relative', zIndex: 1, padding: 'clamp(5rem, 10vw, 9rem) clamp(1.25rem, 5vw, 3rem)', textAlign: 'center' }}>
          <div aria-hidden style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 'min(600px,90vw)', height: 'min(600px,90vw)', borderRadius: '50%', background: isLight ? 'radial-gradient(circle, rgba(0,100,220,0.06) 0%, transparent 65%)' : 'radial-gradient(circle, rgba(0,212,255,0.05) 0%, transparent 65%)', pointerEvents: 'none' }} />
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} style={{ position: 'relative', zIndex: 1 }}>
            <motion.p variants={fadeUp} style={{ fontFamily: 'var(--font-display)', fontSize: '0.65rem', letterSpacing: '5px', color: 'var(--color-primary)', textTransform: 'uppercase', marginBottom: '1rem' }}>
              Únete a la comunidad
            </motion.p>
            <motion.h2 variants={fadeUp} style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 6vw, 4.5rem)', letterSpacing: 'clamp(1px, 1vw, 4px)', color: isLight ? 'var(--text-primary)' : '#fff', lineHeight: 1.1, marginBottom: '1.25rem', textTransform: 'uppercase' }}>
              El hobby te espera
            </motion.h2>
            <motion.p variants={fadeUp} style={{ fontSize: 'clamp(0.95rem, 2vw, 1.1rem)', color: isLight ? 'var(--text-dim)' : 'rgba(255,255,255,0.42)', lineHeight: 1.7, maxWidth: '520px', margin: '0 auto 2.5rem' }}>
              Regístrate gratis y accede a toda la comunidad Warhammer 40,000 en español. Guías, batallas, ejércitos y mucho más.
            </motion.p>
            <motion.div variants={fadeUp} style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/signin?mode=register" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.9rem 2.5rem', borderRadius: '50px',
                background: 'linear-gradient(135deg, var(--color-primary), #0055cc)',
                color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 700,
                fontSize: '0.85rem', letterSpacing: '2px', textTransform: 'uppercase',
                textDecoration: 'none', boxShadow: '0 6px 28px rgba(0,190,255,0.35)',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)'; e.currentTarget.style.boxShadow = '0 8px 36px rgba(0,190,255,0.5)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(0,190,255,0.35)'; }}
              >
                Crear cuenta gratis
              </Link>
              <Link to="/signin" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.9rem 2.5rem', borderRadius: '50px', background: 'transparent',
                color: isLight ? 'var(--color-primary)' : 'rgba(255,255,255,0.75)',
                fontFamily: 'var(--font-display)', fontWeight: 700,
                fontSize: '0.85rem', letterSpacing: '2px', textTransform: 'uppercase',
                textDecoration: 'none',
                border: isLight ? '1.5px solid var(--color-primary)' : '1.5px solid rgba(255,255,255,0.2)',
                transition: 'transform 0.2s, background 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)'; e.currentTarget.style.background = isLight ? 'rgba(0,120,200,0.07)' : 'rgba(255,255,255,0.06)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'transparent'; }}
              >
                Ya tengo cuenta
              </Link>
            </motion.div>
          </motion.div>
        </section>
      )}

      <Footer />

      {/* ── Listing Quick View Modal ── */}
      <AnimatePresence>
        {selectedListing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelectedListing(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div initial={{ opacity: 0, scale: 0.92, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 24 }} transition={{ duration: 0.22 }}
              onClick={e => e.stopPropagation()}
              style={{ background: isLight ? 'rgba(245,248,255,0.98)' : 'rgba(8,8,22,0.98)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: '24px', width: '100%', maxWidth: '540px', maxHeight: '90vh', overflowY: 'auto', position: 'relative', boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }}>
              <button onClick={() => setSelectedListing(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 10, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '50%', width: '34px', height: '34px', cursor: 'pointer', color: isLight ? 'var(--text-primary)' : '#fff', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
              {selectedListing.images?.[0] && (
                <div style={{ width: '100%', aspectRatio: '16/9', overflow: 'hidden', borderRadius: '24px 24px 0 0' }}>
                  <img src={selectedListing.images[0]} alt={selectedListing.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              <div style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.1rem, 3vw, 1.4rem)', color: isLight ? 'var(--text-primary)' : '#fff', margin: 0, lineHeight: 1.3 }}>{selectedListing.title}</h2>
                  <div style={{ background: 'rgba(16,185,129,0.9)', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontFamily: 'var(--font-display)', fontSize: '0.85rem', fontWeight: 700, flexShrink: 0 }}>
                    {selectedListing.price ? `${selectedListing.price} €` : 'Consultar'}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                  {selectedListing.faction && <Chip color="#10b981">{selectedListing.faction}</Chip>}
                  {selectedListing.state && <span style={{ fontSize: '0.75rem', color: isLight ? 'var(--text-dim)' : 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-display)' }}>{STATE_LABEL[selectedListing.state] || selectedListing.state}</span>}
                </div>
                {selectedListing.description && <p style={{ color: isLight ? 'var(--text-secondary)' : 'rgba(255,255,255,0.55)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>{selectedListing.description}</p>}
                <button onClick={() => { navigate('/marketplace'); setSelectedListing(null); }}
                  style={{ width: '100%', padding: '0.85rem', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', borderRadius: '14px', color: '#fff', fontFamily: 'var(--font-display)', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer' }}>
                  Ver en Marketplace →
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global CSS for this page */}
      <style>{`
        @keyframes pulse-dot {
          0%,100%{opacity:1;box-shadow:0 0 8px var(--color-primary)}
          50%{opacity:0.5;box-shadow:0 0 16px var(--color-primary)}
        }
        @keyframes skeleton-pulse {
          0%,100%{opacity:0.4}50%{opacity:0.7}
        }
        @media(max-width:900px){
          .bento-grid{
            grid-template-columns:repeat(2,1fr)!important;
            grid-auto-rows:180px!important;
          }
          .bento-grid>div:first-child{
            grid-column:span 2!important;
            grid-row:span 1!important;
          }
          .premium-grid{
            grid-template-columns:1fr!important;
          }
        }
        @media(max-width:540px){
          .bento-grid{
            grid-template-columns:1fr!important;
            grid-auto-rows:160px!important;
          }
          .bento-grid>div:first-child{
            grid-column:span 1!important;
          }
        }
      `}</style>
    </div>
  );
}
