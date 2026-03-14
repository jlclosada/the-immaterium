import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import Header from '../components/UI/Header';
import Footer from '../components/UI/Footer';

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
  const navigate = useNavigate();
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', letterSpacing: '1px' }}>
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
              color: 'rgba(255,255,255,0.3)', pointerEvents: 'none',
            }}>🔍</span>
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
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎨</div>
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
  const diffStyle = getDifficultyStyle(guide.difficulty);

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
        overflow: 'hidden',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        transition: 'box-shadow 0.3s, border-color 0.3s',
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Cover image */}
      <div style={{
        height: '200px',
        position: 'relative',
        overflow: 'hidden',
        background: 'rgba(0,0,0,0.4)',
        flexShrink: 0,
      }}>
        {guide.coverImage ? (
          <img
            src={guide.coverImage}
            alt={guide.title}
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              transition: 'transform 0.4s ease',
            }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '3.5rem', opacity: 0.2,
          }}>🎨</div>
        )}
        {/* Gradient overlay */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: '60%',
          background: 'linear-gradient(to top, rgba(10,10,20,0.9) 0%, transparent 100%)',
        }} />
        {/* Faction badge */}
        {guide.faction && (
          <div style={{
            position: 'absolute', bottom: '0.75rem', left: '0.75rem',
            display: 'flex', alignItems: 'center', gap: '0.35rem',
          }}>
            {guide.faction.iconUrl && (
              <img src={guide.faction.iconUrl} alt={guide.faction.name}
                style={{ width: '18px', height: '18px', objectFit: 'contain', filter: 'brightness(1.3)' }} />
            )}
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>
              {guide.faction.name}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{
        padding: 'clamp(1rem, 3vw, 1.5rem)',
        flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem',
      }}>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
          color: '#fff',
          lineHeight: 1.25,
          letterSpacing: '0.5px',
        }}>
          {guide.title}
        </h2>

        {/* Metadata row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <span style={{
            padding: '3px 10px',
            borderRadius: 'var(--radius-full)',
            background: diffStyle.bg,
            border: `1px solid ${diffStyle.border}`,
            color: diffStyle.color,
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '0.5px',
          }}>
            {diffStyle.label}
          </span>
          {guide.estimatedTime && (
            <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              ⏱️ {guide.estimatedTime}
            </span>
          )}
        </div>

        {/* Tags */}
        {guide.tags?.length > 0 && (
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: 'auto' }}>
            {guide.tags.slice(0, 3).map(tag => (
              <span key={tag} style={{
                fontSize: '0.72rem',
                color: 'rgba(255,255,255,0.3)',
                fontStyle: 'italic',
              }}>
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div style={{
          fontSize: '0.78rem',
          color: 'var(--color-secondary)',
          letterSpacing: '1px',
          fontFamily: 'var(--font-display)',
          opacity: 0.8,
          paddingTop: '0.25rem',
        }}>
          Ver guía →
        </div>
      </div>
    </motion.div>
  );
};

export default GuidesPage;
