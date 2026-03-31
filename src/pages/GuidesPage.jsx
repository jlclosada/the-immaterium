import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import Header from '../components/UI/Header';
import Footer from '../components/UI/Footer';
import { useTheme } from '../hooks/useTheme';

const DIFFICULTY_COLORS = {
  beginner: { bg: 'rgba(80,200,120,0.15)', border: 'rgba(80,200,120,0.35)', color: '#50c878', label: 'Principiante' },
  intermediate: { bg: 'rgba(255,180,50,0.15)', border: 'rgba(255,180,50,0.35)', color: '#ffb432', label: 'Intermedio' },
  advanced: { bg: 'rgba(255,80,80,0.15)', border: 'rgba(255,80,80,0.35)', color: '#ff6464', label: 'Avanzado' },
};

const getDifficultyStyle = (difficulty) => {
  const key = (difficulty || '').toLowerCase();
  return DIFFICULTY_COLORS[key] || { bg: 'rgba(255,255,255,0.08)', border: 'rgba(255,255,255,0.15)', color: '#aaa', label: difficulty };
};

const GuidesPage = () => {
  const { isLight } = useTheme();
  const navigate = useNavigate();
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    document.title = 'Guías de Pintura | The Immaterium';
  }, []);

  useEffect(() => {
    const fetchGuides = async () => {
      try {
        const data = await api.getPaintingGuides();
        setGuides(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch guides:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchGuides();
  }, []);

  const filteredGuides = guides.filter(g => {
    const term = searchTerm.toLowerCase();
    return (
      g.title.toLowerCase().includes(term) ||
      (g.faction?.name || '').toLowerCase().includes(term) ||
      (g.difficulty || '').toLowerCase().includes(term)
    );
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-darker)', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <div style={{
        flex: 1,
        maxWidth: '1200px',
        margin: '0 auto',
        padding: 'clamp(5rem, 10vw, 6.5rem) clamp(1rem, 4vw, 2rem) clamp(2rem, 4vw, 3rem)',
        width: '100%',
      }}>
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: 'clamp(2rem, 5vw, 3.5rem)' }}
        >
          <p style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.65rem',
            letterSpacing: '4px',
            color: 'var(--color-secondary)',
            textTransform: 'uppercase',
            opacity: 0.7,
            marginBottom: '0.75rem',
          }}>
            Pintura de miniaturas
          </p>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2rem, 6vw, 3.5rem)',
            textTransform: 'uppercase',
            background: 'linear-gradient(135deg, var(--color-secondary), var(--color-primary))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '3px',
            marginBottom: '1rem',
          }}>
            Painting Guides
          </h1>
          <p style={{ color: isLight ? 'var(--text-dim)' : 'rgba(255,255,255,0.4)', fontSize: '0.9rem', letterSpacing: '1px' }}>
            {guides.length > 0 ? `${guides.length} guías disponibles` : ''}
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          style={{ maxWidth: '500px', margin: '0 auto clamp(2rem, 5vw, 3rem)' }}
        >
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)',
              color: 'rgba(255,255,255,0.3)', pointerEvents: 'none', display: 'flex',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </span>
            <input
              type="text"
              placeholder="Buscar guía o facción..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="search-bar"
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
        </motion.div>

        {loading ? (
          <div className="loading-spinner" style={{ margin: '5rem auto' }} />
        ) : filteredGuides.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 2rem', color: 'rgba(255,255,255,0.3)' }}>
            <div style={{ marginBottom: '1rem', opacity: 0.25 }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M18.37 2.63 14 7l-1.59-1.59a2 2 0 0 0-2.82 0L8 7l9 9 1.59-1.59a2 2 0 0 0 0-2.82L17 10l4.37-4.37a2.12 2.12 0 1 0-3-3z"/><path d="M9 8c-2 3-4 3.5-7 4l8 10c2-1 6-5 6-7"/><path d="M14.5 17.5 4.5 15"/></svg>
          </div>
            <p>{searchTerm ? `Sin resultados para "${searchTerm}"` : 'No hay guías disponibles'}</p>
          </div>
        ) : (
          <div className="cards-grid">
            {filteredGuides.map((guide, index) => (
              <GuideCard key={guide.id} guide={guide} index={index} onClick={() => navigate(`/guides/${guide.id}`)} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

const GuideCard = ({ guide, index, onClick }) => {
  const { isLight } = useTheme();
  const diffStyle = getDifficultyStyle(guide.difficulty);
  const [hovered, setHovered] = React.useState(false);
  const isPremium = guide.isPremium || guide.is_premium;
  const priceEuros = guide.price ? (guide.price / 100).toFixed(2) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4 }}
      onClick={onClick}
      whileHover={{ y: -6 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: isLight ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.025)',
        border: isPremium
          ? `1px solid ${hovered ? 'rgba(255,215,0,0.6)' : 'rgba(255,215,0,0.3)'}`
          : `1px solid ${isLight ? 'rgba(0,120,200,0.15)' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        transition: 'box-shadow 0.3s, border-color 0.3s',
        backdropFilter: 'blur(8px)',
        boxShadow: hovered
          ? isPremium
            ? '0 12px 40px rgba(255,215,0,0.18), 0 2px 8px rgba(0,0,0,0.3)'
            : `0 12px 40px rgba(${isLight ? '0,120,200' : '255,180,50'},0.12), 0 2px 8px rgba(0,0,0,0.2)`
          : isPremium ? '0 0 0 1px rgba(255,215,0,0.08)' : 'none',
      }}
    >
      {/* Cover image */}
      <div style={{
        height: '200px',
        position: 'relative',
        overflow: 'hidden',
        background: isLight ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0.4)',
        flexShrink: 0,
      }}>
        {guide.coverImage ? (
          <img
            src={guide.coverImage}
            alt={guide.title}
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              transition: 'transform 0.5s ease',
              transform: hovered ? 'scale(1.06)' : 'scale(1)',
            }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: 0.15,
          }}>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M18.37 2.63 14 7l-1.59-1.59a2 2 0 0 0-2.82 0L8 7l9 9 1.59-1.59a2 2 0 0 0 0-2.82L17 10l4.37-4.37a2.12 2.12 0 1 0-3-3z"/><path d="M9 8c-2 3-4 3.5-7 4l8 10c2-1 6-5 6-7"/><path d="M14.5 17.5 4.5 15"/></svg>
          </div>
        )}
        {/* Gradient overlay */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: '60%',
          background: isLight ? 'linear-gradient(to top, rgba(255,255,255,0.0) 0%, transparent 100%)' : 'linear-gradient(to top, rgba(10,10,20,0.9) 0%, transparent 100%)',
          transition: 'opacity 0.3s',
        }} />
        {/* Faction badge */}
        {guide.faction && (
          <div style={{
            position: 'absolute', bottom: '0.75rem', left: '0.75rem',
            display: 'flex', alignItems: 'center', gap: '0.35rem',
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(6px)',
            borderRadius: '20px',
            padding: '3px 8px 3px 5px',
          }}>
            {guide.faction.iconUrl && (
              <img src={guide.faction.iconUrl} alt={guide.faction.name}
                style={{ width: '16px', height: '16px', objectFit: 'contain', filter: 'brightness(1.3)' }} />
            )}
            <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.9)', fontWeight: 600, letterSpacing: '0.3px' }}>
              {guide.faction.name}
            </span>
          </div>
        )}
        {/* Difficulty badge top-right */}
        <div style={{
          position: 'absolute', top: '0.65rem', right: '0.65rem',
          padding: '3px 9px',
          borderRadius: 'var(--radius-full)',
          background: diffStyle.bg,
          border: `1px solid ${diffStyle.border}`,
          backdropFilter: 'blur(6px)',
          color: diffStyle.color,
          fontSize: '0.65rem',
          fontWeight: 700,
          letterSpacing: '0.5px',
          fontFamily: 'var(--font-display)',
        }}>
          {diffStyle.label}
        </div>
        {/* Premium badge top-left — shows lock + price */}
        {(guide.isPremium || guide.is_premium) && (
          <div style={{
            position: 'absolute', top: '0.65rem', left: '0.65rem',
            display: 'flex', alignItems: 'center', gap: '5px',
            padding: '5px 10px',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(10,8,0,0.72)',
            border: '1px solid rgba(255,215,0,0.65)',
            backdropFilter: 'blur(8px)',
            color: '#FFD700',
            fontFamily: 'var(--font-display)',
            boxShadow: '0 2px 12px rgba(255,215,0,0.25)',
          }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.5px' }}>PREMIUM</span>
            {guide.price && (
              <>
                <span style={{ width: '1px', height: '10px', background: 'rgba(255,215,0,0.35)', margin: '0 1px' }} />
                <span style={{ fontSize: '0.75rem', fontWeight: 900, letterSpacing: '0px' }}>
                  {(guide.price / 100).toFixed(2)}€
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{
        padding: 'clamp(1rem, 3vw, 1.5rem)',
        flex: 1, display: 'flex', flexDirection: 'column', gap: '0.6rem',
      }}>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
          color: isLight ? 'var(--text-primary)' : '#fff',
          lineHeight: 1.25,
          letterSpacing: '0.5px',
        }}>
          {guide.title}
        </h2>

        {/* Metadata row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          {guide.estimatedTime && (
            <span style={{ fontSize: '0.75rem', color: isLight ? 'var(--text-dim)' : 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              {guide.estimatedTime}
            </span>
          )}
        </div>

        {/* Tags */}
        {guide.tags?.length > 0 && (
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: 'auto' }}>
            {guide.tags.slice(0, 3).map(tag => (
              <span key={tag} style={{
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                background: isLight ? 'rgba(0,120,200,0.06)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${isLight ? 'rgba(0,120,200,0.12)' : 'rgba(255,255,255,0.08)'}`,
                fontSize: '0.68rem',
                color: isLight ? 'var(--text-dim)' : 'rgba(255,255,255,0.35)',
                letterSpacing: '0.3px',
              }}>
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Premium price strip / normal CTA */}
        {isPremium ? (
          <div style={{
            marginTop: 'auto',
            paddingTop: '0.75rem',
            borderTop: '1px solid rgba(255,215,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              {priceEuros ? (
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1rem', color: '#FFD700', letterSpacing: '0' }}>
                  {priceEuros}€
                </span>
              ) : (
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.72rem', color: '#FFD700', letterSpacing: '1px' }}>
                  PREMIUM
                </span>
              )}
              <span style={{ fontSize: '0.65rem', color: 'rgba(255,215,0,0.45)', letterSpacing: '0.5px' }}>pago único</span>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #FFD700, #FFA500)',
              borderRadius: '8px',
              padding: '5px 12px',
              fontSize: '0.65rem',
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              color: '#000',
              letterSpacing: '1px',
              whiteSpace: 'nowrap',
            }}>
              DESBLOQUEAR
            </div>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '0.75rem',
            borderTop: `1px solid ${isLight ? 'rgba(0,120,200,0.08)' : 'rgba(255,255,255,0.05)'}`,
            marginTop: 'auto',
          }}>
            <span style={{
              fontSize: '0.72rem',
              color: 'var(--color-secondary)',
              letterSpacing: '1px',
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              textTransform: 'uppercase',
            }}>
              Ver guía
            </span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-secondary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              style={{ transition: 'transform 0.2s', transform: hovered ? 'translateX(3px)' : 'translateX(0)' }}>
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default GuidesPage;
