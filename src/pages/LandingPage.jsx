import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/UI/Footer';
import { useTranslation } from '../i18n/translations';
import { api } from '../services/api';
import { useStore } from '../stores/useStore';

// Row 1: Marketplace, Pintura, Batallas
// [Featured marketplace products]
// Row 2: Ejércitos, Videos, Noticias
// Row 3: Army Builder, Lore
const NAV_ROW1 = [
  {
    to: '/marketplace',
    titleKey: 'marketplaceTitle',
    subtitleKey: 'marketplaceSubtitle',
    color: '#10b981',
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 0 1-8 0"/>
      </svg>
    ),
  },
  {
    to: '/guides',
    titleKey: 'paintingTitle',
    subtitleKey: 'paintingSubtitle',
    color: 'var(--color-secondary)',
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 19l7-7 3 3-7 7-3-3z" />
        <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
        <circle cx="11" cy="11" r="2" />
      </svg>
    ),
  },
  {
    to: '/battle-reports',
    titleKey: 'battlesTitle',
    subtitleKey: 'battlesSubtitle',
    color: '#ff6464',
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" />
        <line x1="13" y1="19" x2="19" y2="13" />
        <line x1="16" y1="16" x2="20" y2="20" />
        <line x1="19" y1="21" x2="21" y2="19" />
        <polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5" />
      </svg>
    ),
  },
];

const NAV_ROW2 = [
  {
    to: '/armies',
    titleKey: 'armiesTitle',
    subtitleKey: 'armiesSubtitle',
    color: 'var(--color-primary)',
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    to: '/videos',
    titleKey: 'videosTitle',
    subtitleKey: 'videosSubtitle',
    color: '#ff4444',
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
      </svg>
    ),
  },
  {
    to: '/news',
    titleKey: 'newsTitle',
    subtitleKey: 'newsSubtitle',
    color: '#f59e0b',
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a4 4 0 0 1-4 4z"/>
        <path d="M8 6h12"/><path d="M8 10h12"/><path d="M8 14h8"/>
      </svg>
    ),
  },
];

const NAV_ROW3 = [
  {
    to: '/army-builder',
    titleKey: 'builderTitle',
    subtitleKey: 'builderSubtitle',
    color: '#6366f1',
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2"/>
        <path d="M8 21h8M12 17v4"/>
        <path d="M7 8h3m4 0h3M7 12h10"/>
      </svg>
    ),
  },
  {
    to: '/lore',
    titleKey: 'loreTitle',
    subtitleKey: 'loreSubtitle',
    color: 'var(--color-accent)',
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        <path d="M8 7h8" /><path d="M8 11h8" /><path d="M8 15h6" />
      </svg>
    ),
  },
];

// Keep a flat list for any legacy use
const NAV_ITEMS = [...NAV_ROW1, ...NAV_ROW2, ...NAV_ROW3];

const quickBtnStyle = (color) => ({
  padding: '0.6rem 1.4rem',
  borderRadius: '50px',
  background: `${color}11`,
  border: `1px solid ${color}44`,
  color: color,
  textDecoration: 'none',
  fontSize: '0.9rem',
  fontFamily: 'var(--font-body)',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  transition: 'all 0.2s',
  backdropFilter: 'blur(4px)',
});

const LandingPage = () => {
  const { fetchInitialData, language } = useStore();
  const t = useTranslation(language);
  const [featuredNews,     setFeaturedNews]     = useState(null);
  const [featuredGuide,    setFeaturedGuide]    = useState(null);
  const [featuredReport,   setFeaturedReport]   = useState(null);
  const [featuredListings, setFeaturedListings] = useState([]);

  useEffect(() => {
    fetchInitialData();
    loadFeaturedContent();
  }, []);

  const loadFeaturedContent = async () => {
    const [newsRes, guidesRes, reportsRes, listingsRes] = await Promise.allSettled([
      api.getNewsArticles(),
      api.getPaintingGuides(),
      api.getBattleReports(),
      api.getListings({ status: 'available' }),
    ]);
    const safe = (res) => (res.status === 'fulfilled' ? (Array.isArray(res.value) ? res.value : []) : []);
    const news     = safe(newsRes);
    const guides   = safe(guidesRes);
    const reports  = safe(reportsRes);
    const listings = safe(listingsRes);
    if (news.length    > 0) setFeaturedNews(news[0]);
    if (guides.length  > 0) setFeaturedGuide(guides[0]);
    if (reports.length > 0) setFeaturedReport(reports[0]);
    // Show up to 3 available listings as featured
    setFeaturedListings(listings.slice(0, 3));
  };

  return (
    <div style={{
      color: 'white',
      background: 'radial-gradient(ellipse at 50% 0%, #1a1a2e 0%, #050510 60%)',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      overflowX: 'hidden',
      position: 'relative',
    }}>
      <div className="scanline-overlay" />

      {/* ── HERO ── */}
      <section style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'clamp(1.5rem, 3vw, 2.5rem)',
        padding: 'clamp(5rem, 12vw, 10rem) clamp(1.5rem, 5vw, 3rem) clamp(4rem, 8vw, 6rem)',
        textAlign: 'center',
        position: 'relative',
        minHeight: '100vh',
      }}>
        {/* Decorative grid pattern */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          pointerEvents: 'none',
        }} />
        {/* Center glow */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -60%)',
          width: 'min(700px, 100vw)', height: 'min(700px, 100vw)',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)',
          pointerEvents: 'none', zIndex: 0,
        }} />

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          style={{ zIndex: 1, marginBottom: '2rem' }}
        >
          <p style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(0.6rem, 1.5vw, 0.75rem)',
            letterSpacing: '6px',
            color: 'var(--color-primary)',
            textTransform: 'uppercase',
            marginBottom: '1rem',
            opacity: 0.8,
          }}>
            Wargame portal
          </p>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.2rem, 9vw, 6.5rem)',
            letterSpacing: 'clamp(0.1rem, 2vw, 0.6rem)',
            background: 'linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.6) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            lineHeight: 1.1,
            marginBottom: '1.5rem',
            textShadow: 'none',
          }}>
            THE<br />IMMATERIUM
          </h1>
          {/* Divider */}
          <div style={{
            width: 'clamp(80px, 15vw, 180px)',
            height: '2px',
            background: 'linear-gradient(90deg, transparent, var(--color-primary), transparent)',
            margin: '0 auto',
          }} />
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.9 }}
          style={{
            fontSize: 'clamp(0.95rem, 2vw, 1.15rem)',
            maxWidth: '640px',
            marginBottom: 'clamp(2rem, 5vw, 3rem)',
            color: 'rgba(255,255,255,0.5)',
            zIndex: 1,
            lineHeight: 1.8,
            letterSpacing: '0.3px',
          }}
        >
          {t('description')}
        </motion.p>

        {/* ── Row 1: Marketplace · Pintura · Batallas ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.6 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 'clamp(1rem, 2.5vw, 1.5rem)',
            width: '100%',
            maxWidth: '1100px',
            zIndex: 1,
          }}
          className="nav-grid"
        >
          {NAV_ROW1.map((item) => (
            <SectionCard key={item.to} item={item} t={t} />
          ))}
        </motion.div>

        {/* ── Featured marketplace listings (inline, below row 1) ── */}
        {featuredListings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            style={{ width: '100%', maxWidth: '1100px', zIndex: 1 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.65rem', letterSpacing: '4px', color: '#10b981', textTransform: 'uppercase', opacity: 0.8, margin: 0 }}>
                🛒 En venta ahora
              </p>
              <Link to="/marketplace" style={{ fontFamily: 'var(--font-display)', fontSize: '0.68rem', letterSpacing: '2px', color: 'rgba(255,255,255,0.35)', textDecoration: 'none', textTransform: 'uppercase', transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#10b981'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
              >Ver todo →</Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 'clamp(0.75rem, 2vw, 1.25rem)', maxWidth: `${featuredListings.length * 280}px` }} className="mp-featured-grid">
              {featuredListings.map(listing => (
                <MarketplaceListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Row 2: Ejércitos · Videos · Noticias ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.6 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 'clamp(1rem, 2.5vw, 1.5rem)',
            width: '100%',
            maxWidth: '1100px',
            zIndex: 1,
          }}
          className="nav-grid"
        >
          {NAV_ROW2.map((item) => (
            <SectionCard key={item.to} item={item} t={t} />
          ))}
        </motion.div>

        {/* ── Row 3: Army Builder · Lore ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 'clamp(1rem, 2.5vw, 1.5rem)',
            width: '100%',
            maxWidth: '1100px',
            zIndex: 1,
          }}
          className="nav-grid two-col"
        >
          {NAV_ROW3.map((item) => (
            <SectionCard key={item.to} item={item} t={t} />
          ))}
        </motion.div>
      </section>

      {/* ── FEATURED CONTENT ── */}
      {(featuredNews || featuredGuide || featuredReport) && (
        <section style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: 'clamp(2rem, 5vw, 4rem) clamp(1.5rem, 4vw, 2rem)',
          width: '100%',
        }}>
          {/* Section header */}
          <div style={{ textAlign: 'center', marginBottom: 'clamp(2rem, 5vw, 3rem)' }}>
            <p style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.7rem',
              letterSpacing: '4px',
              color: 'var(--color-primary)',
              textTransform: 'uppercase',
              opacity: 0.7,
              marginBottom: '0.5rem',
            }}>
              Últimas publicaciones
            </p>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.4rem, 4vw, 2rem)',
              color: 'rgba(255,255,255,0.9)',
              letterSpacing: '3px',
              textTransform: 'uppercase',
            }}>
              {t('featuredIntel')}
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 'clamp(1rem, 2.5vw, 1.5rem)',
          }}>
            {featuredReport && (
              <FeaturedCard
                to={`/battle-reports/${featuredReport.id}`}
                badge={language === 'es' ? 'Último Informe de Batalla' : 'Latest Battle Report'}
                badgeColor="#ff6464"
                title={featuredReport.title}
                excerpt={(featuredReport.summary || featuredReport.description)?.substring(0, 110)}
                linkLabel={t('viewReport')}
                linkColor="#ff6464"
                accentColor="rgba(255,100,100,0.08)"
                borderColor="rgba(255,100,100,0.18)"
              />
            )}
            {featuredGuide && (
              <FeaturedCard
                to={`/guides/${featuredGuide.id}`}
                badge={language === 'es' ? 'Última Guía de Pintura' : 'Latest Painting Guide'}
                badgeColor="var(--color-secondary)"
                title={featuredGuide.title}
                excerpt={featuredGuide.description?.substring(0, 110)}
                linkLabel={t('viewGuide')}
                linkColor="var(--color-secondary)"
                accentColor="rgba(135,206,250,0.08)"
                borderColor="rgba(135,206,250,0.18)"
              />
            )}
            {featuredNews && (
              <FeaturedCard
                to={`/news/${featuredNews.id}`}
                badge={language === 'es' ? 'Última Noticia' : 'Latest News'}
                badgeColor="#f59e0b"
                title={featuredNews.title}
                excerpt={(featuredNews.excerpt || featuredNews.content)?.substring(0, 110)}
                linkLabel={language === 'es' ? 'Leer noticia' : 'Read news'}
                linkColor="#f59e0b"
                accentColor="rgba(245,158,11,0.08)"
                borderColor="rgba(245,158,11,0.18)"
              />
            )}
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

const SectionCard = ({ item, t }) => (
  <Link to={item.to} style={{ textDecoration: 'none' }}>
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      style={{
        padding: 'clamp(1.75rem, 4vw, 2.5rem) clamp(1.25rem, 3vw, 2rem)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 'var(--radius-xl)',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        backdropFilter: 'blur(10px)',
        transition: 'border-color 0.3s, box-shadow 0.3s',
      }}
      onHoverStart={e => {}}
      style2={{
        '--card-color': item.color,
      }}
    >
      {/* Glow on hover */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 'var(--radius-xl)',
        background: `radial-gradient(circle at 50% 0%, ${item.color}18 0%, transparent 60%)`,
        opacity: 0,
        transition: 'opacity 0.3s',
        pointerEvents: 'none',
      }} className="card-glow" />

      <div style={{
        color: item.color,
        marginBottom: '1.25rem',
        filter: `drop-shadow(0 0 12px ${item.color}55)`,
        transition: 'transform 0.3s',
      }}>
        {item.icon}
      </div>

      <h2 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(1rem, 2.5vw, 1.3rem)',
        color: '#fff',
        letterSpacing: '2px',
        marginBottom: '0.5rem',
        textTransform: 'uppercase',
      }}>
        {t(item.titleKey)}
      </h2>

      <span style={{
        color: 'rgba(255,255,255,0.35)',
        fontSize: 'clamp(0.75rem, 1.5vw, 0.82rem)',
        textTransform: 'uppercase',
        letterSpacing: '1.5px',
        fontFamily: 'var(--font-display)',
      }}>
        {t(item.subtitleKey)}
      </span>

      {/* Bottom accent line */}
      <div style={{
        position: 'absolute',
        bottom: 0, left: '20%', right: '20%',
        height: '2px',
        background: `linear-gradient(90deg, transparent, ${item.color}, transparent)`,
        opacity: 0.5,
      }} />
    </motion.div>
  </Link>
);

const STATE_LABEL = { sin_montar: 'Sin montar', montada: 'Montada', imprimada: 'Imprimada', pintada_parcial: 'Pintada parcial', pintada: 'Pintada', conversion: 'Conversión' };
const STATE_COLOR = { sin_montar: '#b0b0b8', montada: '#6ab0f5', imprimada: '#f0924a', pintada_parcial: '#e8d040', pintada: '#40c878', conversion: '#c078f0' };

const MarketplaceListingCard = ({ listing }) => {
  const img = listing.images?.[0];
  const stateColor = STATE_COLOR[listing.state] || '#aaa';
  return (
    <Link to="/marketplace" style={{ textDecoration: 'none' }}>
      <motion.div
        whileHover={{ y: -4, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.18 }}
        style={{
          background: 'rgba(16,185,129,0.04)',
          border: '1px solid rgba(16,185,129,0.15)',
          borderRadius: '14px',
          overflow: 'hidden',
          cursor: 'pointer',
          position: 'relative',
        }}
      >
        {/* Image — compact 16/9 */}
        <div style={{ width: '100%', aspectRatio: '16/9', background: 'rgba(0,0,0,0.3)', overflow: 'hidden', position: 'relative' }}>
          {img
            ? <img src={img} alt={listing.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }} />
            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.15 }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              </div>
          }
          {/* Price badge */}
          <div style={{ position: 'absolute', top: '0.4rem', right: '0.4rem', background: 'rgba(10,185,100,0.92)', color: '#fff', padding: '2px 8px', borderRadius: '20px', fontFamily: 'var(--font-display)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.5px', backdropFilter: 'blur(4px)' }}>
            {listing.price ? `${listing.price} €` : 'Consultar'}
          </div>
        </div>
        {/* Info — compact */}
        <div style={{ padding: '0.6rem 0.75rem 0.7rem' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.82rem', color: 'rgba(255,255,255,0.9)', margin: '0 0 0.3rem', letterSpacing: '0.3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {listing.title}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            {listing.faction && <span style={{ fontSize: '0.67rem', color: 'rgba(255,255,255,0.38)', fontFamily: 'var(--font-display)', letterSpacing: '0.3px' }}>{listing.faction}</span>}
            <span style={{ fontSize: '0.65rem', color: stateColor, background: `${stateColor}15`, border: `1px solid ${stateColor}35`, borderRadius: '5px', padding: '1px 6px', fontFamily: 'var(--font-display)', letterSpacing: '0.3px' }}>
              {STATE_LABEL[listing.state] || listing.state}
            </span>
          </div>
        </div>
        {/* Bottom accent */}
        <div style={{ position: 'absolute', bottom: 0, left: '20%', right: '20%', height: '1.5px', background: 'linear-gradient(90deg, transparent, #10b981, transparent)', opacity: 0.5 }} />
      </motion.div>
    </Link>
  );
};

const FeaturedCard = ({ to, badge, badgeColor, title, excerpt, linkLabel, linkColor, accentColor, borderColor }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    whileHover={{ y: -4 }}
    style={{
      background: accentColor,
      border: `1px solid ${borderColor}`,
      borderRadius: 'var(--radius-xl)',
      padding: 'clamp(1.5rem, 3vw, 2rem)',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      backdropFilter: 'blur(12px)',
      transition: 'box-shadow 0.3s',
    }}
  >
    <span style={{
      display: 'inline-block',
      background: badgeColor,
      color: badgeColor === 'var(--color-primary)' ? '#000' : '#fff',
      padding: '3px 10px',
      fontSize: '0.68rem',
      fontWeight: 700,
      borderRadius: 'var(--radius-full)',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      alignSelf: 'flex-start',
    }}>
      {badge}
    </span>
    <h3 style={{
      fontFamily: 'var(--font-display)',
      fontSize: 'clamp(1.1rem, 3vw, 1.4rem)',
      color: '#fff',
      lineHeight: 1.3,
      margin: 0,
    }}>
      {title}
    </h3>
    {excerpt && (
      <p style={{
        color: 'rgba(255,255,255,0.6)',
        fontSize: '0.9rem',
        lineHeight: 1.7,
        margin: 0,
        flex: 1,
      }}>
        {excerpt}…
      </p>
    )}
    <Link to={to} style={{
      color: linkColor,
      textDecoration: 'none',
      fontSize: '0.85rem',
      fontWeight: 600,
      letterSpacing: '0.5px',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.3rem',
      transition: 'gap 0.2s',
      alignSelf: 'flex-start',
    }}
      onMouseEnter={e => e.currentTarget.style.gap = '0.6rem'}
      onMouseLeave={e => e.currentTarget.style.gap = '0.3rem'}
    >
      {linkLabel} →
    </Link>
  </motion.div>
);

export default LandingPage;
