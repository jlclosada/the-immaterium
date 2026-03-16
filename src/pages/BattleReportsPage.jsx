import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import Header from '../components/UI/Header';
import Footer from '../components/UI/Footer';

const BattleReportsPage = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await api.getBattleReports();
        setReports(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch reports:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const filteredReports = reports.filter(r => {
    const term = searchTerm.toLowerCase();
    return (
      (r.title || '').toLowerCase().includes(term) ||
      (r.mission || '').toLowerCase().includes(term) ||
      (r.armies?.player1?.name || '').toLowerCase().includes(term) ||
      (r.armies?.player2?.name || '').toLowerCase().includes(term)
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
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', letterSpacing: '1px' }}>
            {reports.length > 0 ? `${reports.length} batallas registradas` : ''}
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

        {loading ? (
          <div className="loading-spinner" style={{ margin: '5rem auto' }} />
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
  const p1 = report.armies?.player1;
  const p2 = report.armies?.player2;
  const s1 = report.finalScore?.player1;
  const s2 = report.finalScore?.player2;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4 }}
      onClick={onClick}
      whileHover={{ y: -6 }}
      style={{
        background: 'rgba(255,255,255,0.025)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 'var(--radius-xl)',
        padding: 'clamp(1.25rem, 3vw, 1.75rem)',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        position: 'relative',
        overflow: 'hidden',
        transition: 'box-shadow 0.3s, border-color 0.3s',
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Top accent */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
        background: 'linear-gradient(90deg, #ff6464, #f9cb28)',
        opacity: 0.5,
      }} />

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
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)' }}>
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
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.55)', fontWeight: 600 }}>
              {p1?.faction || p1?.name || 'Jugador 1'}
            </div>
            {s1 !== undefined && (
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-display)' }}>
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
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.55)', fontWeight: 600 }}>
              {p2?.faction || p2?.name || 'Jugador 2'}
            </div>
            {s2 !== undefined && (
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-display)' }}>
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
        fontSize: '0.78rem',
        color: '#f9cb28',
        letterSpacing: '1px',
        fontFamily: 'var(--font-display)',
        opacity: 0.7,
        marginTop: 'auto',
      }}>
        Ver informe →
      </div>
    </motion.div>
  );
};

export default BattleReportsPage;
