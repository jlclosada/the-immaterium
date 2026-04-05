import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useBattleReports } from '../hooks/queries';
import Navbar from '../components/UI/Navbar';
import Footer from '../components/UI/Footer';
import { useTheme } from '../hooks/useTheme';

const BattleReportsPage = () => {
  const { isLight } = useTheme();
  const navigate = useNavigate();
  const { data: rawReports, isLoading, isError, error } = useBattleReports();
  const reports = Array.isArray(rawReports) ? rawReports : (rawReports?.results || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredReports = reports.filter(r => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = !term || (
      (r.title || '').toLowerCase().includes(term) ||
      (r.mission || '').toLowerCase().includes(term) ||
      (r.armies?.player1?.name || '').toLowerCase().includes(term) ||
      (r.armies?.player2?.name || '').toLowerCase().includes(term) ||
      (r.tags || []).some(t => t.toLowerCase().includes(term))
    );
    const matchesFilter =
      activeFilter === 'all' ? true :
      String(r.points) === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-darker)', display: 'flex', flexDirection: 'column' }}>
      <Helmet>
        <title>Battle Reports | The Immaterium</title>
        <meta name="description" content="Crónicas de combate Warhammer: revive las batallas más épicas de la comunidad." />
        <meta property="og:title" content="Battle Reports | The Immaterium" />
        <meta property="og:description" content="Informes de batalla detallados con resultados, estrategias y galería de fotos." />
        <meta property="og:type" content="website" />
      </Helmet>
      <Navbar />

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
            color: '#ff6464',
            textTransform: 'uppercase',
            opacity: 0.7,
            marginBottom: '0.75rem',
          }}>
            Crónicas de combate
          </p>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2rem, 6vw, 3.5rem)',
            textTransform: 'uppercase',
            background: 'linear-gradient(135deg, #ff6464, #f9cb28)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '3px',
            marginBottom: '1rem',
          }}>
            Battle Reports
          </h1>
          <p style={{ color: isLight ? 'var(--text-dim)' : 'rgba(255,255,255,0.4)', fontSize: '0.9rem', letterSpacing: '1px' }}>
            {reports.length > 0 ? `${filteredReports.length} de ${reports.length} batallas` : ''}
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
              placeholder="Buscar batalla o misión..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="search-bar"
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
        </motion.div>

        {/* Filter row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', marginTop: '-1rem', marginBottom: 'clamp(1.5rem, 4vw, 2.5rem)' }}
        >
          {[
            { id: 'all', label: 'Todos' },
            { id: '500', label: '500 pts' },
            { id: '1000', label: '1.000 pts' },
            { id: '1500', label: '1.500 pts' },
            { id: '2000', label: '2.000 pts' },
          ].map(f => (
            <button key={f.id} onClick={() => setActiveFilter(f.id)} style={{
              padding: '0.38rem 1rem', borderRadius: '20px', cursor: 'pointer',
              fontFamily: 'var(--font-display)', fontSize: '0.7rem', letterSpacing: '1px',
              border: `1px solid ${activeFilter === f.id ? 'rgba(255,100,100,0.6)' : (isLight ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.12)')}`,
              background: activeFilter === f.id ? 'rgba(255,100,100,0.12)' : (isLight ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.04)'),
              color: activeFilter === f.id ? '#ff6464' : (isLight ? 'var(--text-dim)' : 'rgba(255,255,255,0.45)'),
              transition: 'all 0.2s',
            }}>
              {f.label}
            </button>
          ))}
        </motion.div>

        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: '1.5rem' }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ borderRadius: '16px', overflow: 'hidden', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ height: '200px', background: 'rgba(255,255,255,0.05)', animation: 'skeleton-pulse 1.6s ease-in-out infinite' }} />
                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ height: '20px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', width: '70%', animation: 'skeleton-pulse 1.6s ease-in-out infinite' }} />
                  <div style={{ height: '14px', borderRadius: '4px', background: 'rgba(255,255,255,0.04)', width: '100%', animation: 'skeleton-pulse 1.6s ease-in-out infinite' }} />
                  <div style={{ height: '14px', borderRadius: '4px', background: 'rgba(255,255,255,0.04)', width: '85%', animation: 'skeleton-pulse 1.6s ease-in-out infinite' }} />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div style={{ textAlign: 'center', padding: '5rem 2rem', color: 'rgba(255,255,255,0.4)' }}>
            <div style={{ marginBottom: '1rem', opacity: 0.3 }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <p style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>No se pudieron cargar los informes</p>
            <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>{error?.message || 'Error al cargar los informes'}</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 2rem', color: 'rgba(255,255,255,0.3)' }}>
            <div style={{ marginBottom: '1rem', opacity: 0.25 }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" y1="19" x2="19" y2="13"/><line x1="16" y1="16" x2="20" y2="20"/><line x1="19" y1="21" x2="21" y2="19"/></svg>
          </div>
            <p>{searchTerm ? `Sin resultados para "${searchTerm}"` : 'No hay informes de batalla aún. La galaxia está en paz... por ahora.'}</p>
          </div>
        ) : (
          <div className="cards-grid">
            {filteredReports.map((report, index) => (
              <ReportCard key={report.id} report={report} index={index} onClick={() => navigate(`/battle-reports/${report.id}`)} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

const ReportCard = ({ report, index, onClick }) => {
  const { isLight } = useTheme();
  const p1 = report.armies?.player1;
  const p2 = report.armies?.player2;
  const s1 = report.finalScore?.player1;
  const s2 = report.finalScore?.player2;
  const [hovered, setHovered] = React.useState(false);
  const coverImage = report.images?.[0] || null;

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
        border: `1px solid ${hovered ? 'rgba(255,100,100,0.35)' : (isLight ? 'rgba(0,120,200,0.15)' : 'rgba(255,255,255,0.07)')}`,
        borderRadius: 'var(--radius-xl)',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        transition: 'box-shadow 0.3s, border-color 0.3s',
        backdropFilter: 'blur(8px)',
        boxShadow: hovered ? '0 12px 40px rgba(255,100,100,0.12), 0 2px 8px rgba(0,0,0,0.2)' : 'none',
      }}
    >
      {/* Cover image / fallback banner */}
      <div style={{ height: '140px', overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
        {coverImage ? (
          <img
            src={coverImage}
            alt={report.title}
            loading="lazy"
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              transition: 'transform 0.5s ease',
              transform: hovered ? 'scale(1.06)' : 'scale(1)',
            }}
            onError={e => { e.target.style.display = 'none'; }}
          />
        ) : (
          /* Fallback: decorative battle grid pattern */
          <div style={{
            width: '100%', height: '100%',
            background: `linear-gradient(135deg, rgba(20,0,0,0.9) 0%, rgba(10,5,30,0.95) 50%, rgba(20,0,0,0.9) 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none" opacity="0.12">
              <path d="M40 8 L55 20 L68 38 L55 56 L40 68 L25 56 L12 38 L25 20 Z" stroke="#ff6464" strokeWidth="1.5"/>
              <path d="M40 18 L51 27 L59 38 L51 50 L40 58 L29 50 L21 38 L29 27 Z" stroke="#f9cb28" strokeWidth="1"/>
              <line x1="40" y1="8" x2="40" y2="68" stroke="#ff6464" strokeWidth="0.5" opacity="0.5"/>
              <line x1="12" y1="38" x2="68" y2="38" stroke="#ff6464" strokeWidth="0.5" opacity="0.5"/>
              <circle cx="40" cy="38" r="4" fill="#ff6464"/>
            </svg>
          </div>
        )}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%',
          background: 'linear-gradient(to top, rgba(5,5,16,0.95), transparent)',
        }} />
        {/* Top accent */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
          background: 'linear-gradient(90deg, #ff6464, #f9cb28)',
        }} />
      </div>

      <div style={{ padding: 'clamp(1.25rem, 3vw, 1.75rem)', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>

      {/* Title + date */}
      <div>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(1.05rem, 2.5vw, 1.3rem)',
          color: '#f9cb28',
          lineHeight: 1.25,
          letterSpacing: '0.5px',
          marginBottom: '0.4rem',
        }}>
          {report.title}
        </h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.78rem', color: isLight ? 'var(--text-dim)' : 'rgba(255,255,255,0.35)' }}>
          {report.date && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>{new Date(report.date).toLocaleDateString('es-ES')}</span>}
          {report.mission && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>{report.mission}</span>}
          {report.points && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" y1="19" x2="19" y2="13"/><line x1="16" y1="16" x2="20" y2="20"/><line x1="19" y1="21" x2="21" y2="19"/></svg>{report.points} pts</span>}
        </div>
      </div>

      {/* VS section */}
      {(p1 || p2) && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          background: 'rgba(0,0,0,0.25)',
          borderRadius: 'var(--radius-lg)',
          padding: '0.75rem',
        }}>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', color: isLight ? 'var(--text-secondary)' : 'rgba(255,255,255,0.55)', fontWeight: 600 }}>
              {p1?.faction || p1?.name || 'Jugador 1'}
            </div>
            {s1 !== undefined && (
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: isLight ? 'var(--text-primary)' : '#fff', fontFamily: 'var(--font-display)' }}>
                {s1}
              </div>
            )}
          </div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.9rem',
            fontWeight: 700,
            color: '#ff6464',
            letterSpacing: '1px',
            flexShrink: 0,
          }}>
            VS
          </div>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', color: isLight ? 'var(--text-secondary)' : 'rgba(255,255,255,0.55)', fontWeight: 600 }}>
              {p2?.faction || p2?.name || 'Jugador 2'}
            </div>
            {s2 !== undefined && (
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: isLight ? 'var(--text-primary)' : '#fff', fontFamily: 'var(--font-display)' }}>
                {s2}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tags */}
      {report.tags?.length > 0 && (
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
          {report.tags.slice(0, 3).map(tag => (
            <span key={tag} style={{
              padding: '2px 8px',
              background: 'rgba(255,100,100,0.1)',
              border: '1px solid rgba(255,100,100,0.2)',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.7rem',
              color: '#ff8080',
            }}>
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '0.75rem',
        borderTop: `1px solid ${isLight ? 'rgba(0,120,200,0.08)' : 'rgba(255,255,255,0.05)'}`,
        marginTop: 'auto',
        gap: '0.5rem',
      }}>
        {/* Engagement counters */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {report.views > 0 && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)' }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              {report.views}
            </span>
          )}
          {report.likes > 0 && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', color: 'rgba(255,100,100,0.5)' }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              {report.likes}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{
            fontSize: '0.72rem',
            color: '#f9cb28',
            letterSpacing: '1px',
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            textTransform: 'uppercase',
          }}>
            Ver informe
          </span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f9cb28" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            style={{ transition: 'transform 0.2s', transform: hovered ? 'translateX(3px)' : 'translateX(0)' }}>
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
        </div>
      </div>
      </div>
    </motion.div>
  );
};

export default BattleReportsPage;
