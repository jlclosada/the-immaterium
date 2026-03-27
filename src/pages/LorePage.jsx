import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import Header from '../components/UI/Header';
import Footer from '../components/UI/Footer';
import { useTheme } from '../hooks/useTheme';

const CATEGORIES = [
  { value: 'all', label: 'Todas', color: 'var(--color-primary)' },
  { value: 'historia', label: 'Historia', color: '#a78bfa' },
  { value: 'faccion', label: 'Facción', color: 'var(--color-primary)' },
  { value: 'evento', label: 'Evento', color: '#ff6464' },
  { value: 'personaje', label: 'Personaje', color: '#ffb432' },
  { value: 'lugar', label: 'Lugar', color: '#50c878' },
  { value: 'tecnologia', label: 'Tecnología', color: 'var(--color-secondary)' },
  { value: 'otro', label: 'Otro', color: 'rgba(255,255,255,0.5)' },
];

const getCategoryColor = (value) => {
  const cat = CATEGORIES.find(c => c.value === value);
  return cat?.color || 'var(--color-primary)';
};

const LorePage = () => {
  const { isLight } = useTheme();
  const [loreEntries, setLoreEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchLore = async () => {
      try {
        const data = await api.getLoreEntries();
        setLoreEntries(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch lore:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLore();
  }, []);

  const filteredEntries = loreEntries.filter(entry => {
    const matchesCategory = selectedCategory === 'all' || entry.category === selectedCategory;
    const matchesSearch =
      entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (entry.excerpt || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-darker)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-darker)', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <div style={{
        flex: 1,
        maxWidth: '1000px',
        margin: '0 auto',
        padding: 'clamp(5rem, 10vw, 6.5rem) clamp(1rem, 4vw, 2rem) clamp(2rem, 4vw, 3rem)',
        width: '100%',
      }}>
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: 'clamp(2rem, 5vw, 3rem)' }}
        >
          <p style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.65rem',
            letterSpacing: '4px',
            color: 'var(--color-accent)',
            textTransform: 'uppercase',
            opacity: 0.7,
            marginBottom: '0.75rem',
          }}>
            Fragmentos del 41º milenio
          </p>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2rem, 6vw, 3.5rem)',
            textTransform: 'uppercase',
            background: 'linear-gradient(135deg, var(--color-accent), var(--color-primary))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '3px',
            marginBottom: '1rem',
          }}>
            Biblioteca de Lore
          </h1>
          <p style={{ color: isLight ? 'var(--text-dim)' : 'rgba(255,255,255,0.4)', fontSize: '0.9rem', lineHeight: 1.6 }}>
            {loreEntries.length > 0 ? `${loreEntries.length} entradas en los archivos` : 'Los archivos aguardan...'}
          </p>
        </motion.div>

        {/* Search + Filters */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          style={{
            background: isLight ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.025)',
            border: `1px solid ${isLight ? 'rgba(0,120,200,0.15)' : 'rgba(255,255,255,0.07)'}`,
            borderRadius: 'var(--radius-xl)',
            padding: 'clamp(1rem, 3vw, 1.5rem)',
            marginBottom: '2rem',
          }}
        >
          {/* Search */}
          <div style={{ position: 'relative', marginBottom: '1rem' }}>
            <span style={{
              position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)',
              color: 'rgba(255,255,255,0.3)', pointerEvents: 'none', display: 'flex',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </span>
            <input
              type="text"
              placeholder="Buscar en el lore..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="search-bar"
              style={{ paddingLeft: '2.5rem', marginBottom: 0 }}
            />
          </div>

          {/* Category filters */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {CATEGORIES.map(cat => {
              const active = selectedCategory === cat.value;
              return (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  style={{
                    padding: '0.4rem 0.9rem',
                    borderRadius: 'var(--radius-full)',
                    border: active ? `1px solid ${cat.color}` : `1px solid ${isLight ? 'rgba(0,120,200,0.15)' : 'rgba(255,255,255,0.1)'}`,
                    background: active ? `${cat.color}22` : (isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)'),
                    color: active ? cat.color : (isLight ? 'var(--text-secondary)' : 'rgba(255,255,255,0.45)'),
                    fontSize: '0.78rem',
                    fontWeight: active ? 700 : 400,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    letterSpacing: '0.5px',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Results count */}
        {searchTerm || selectedCategory !== 'all' ? (
          <p style={{ color: isLight ? 'var(--text-dim)' : 'rgba(255,255,255,0.3)', fontSize: '0.82rem', marginBottom: '1.25rem', letterSpacing: '0.5px' }}>
            {filteredEntries.length} {filteredEntries.length === 1 ? 'resultado' : 'resultados'}
            {selectedCategory !== 'all' && ` en "${CATEGORIES.find(c => c.value === selectedCategory)?.label}"`}
          </p>
        ) : null}

        {/* Entries */}
        {filteredEntries.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredEntries.map((entry, index) => (
              <LoreCard key={entry.id} entry={entry} index={index} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              textAlign: 'center', padding: '5rem 2rem',
              color: 'rgba(255,255,255,0.25)',
            }}
          >
            <div style={{ marginBottom: '1rem', opacity: 0.25 }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            </div>
            <p>{searchTerm || selectedCategory !== 'all' ? 'Sin resultados' : 'Los archivos están vacíos'}</p>
          </motion.div>
        )}
      </div>

      <Footer />
    </div>
  );
};

const LoreCard = ({ entry, index }) => {
  const { isLight } = useTheme();
  const categoryColor = getCategoryColor(entry.category);

  return (
    <Link to={`/lore/${entry.id}`} style={{ textDecoration: 'none' }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.06, duration: 0.35 }}
        whileHover={{ y: -3, boxShadow: '0 8px 30px rgba(0,212,255,0.15)' }}
        style={{
          background: isLight ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.025)',
          border: `1px solid ${isLight ? 'rgba(0,120,200,0.15)' : 'rgba(255,255,255,0.07)'}`,
          borderRadius: 'var(--radius-xl)',
          padding: 'clamp(1.25rem, 3vw, 1.75rem)',
          position: 'relative',
          overflow: 'hidden',
          transition: 'border-color 0.3s, box-shadow 0.3s',
          borderLeft: entry.isFeatured ? `3px solid var(--color-accent)` : `1px solid ${isLight ? 'rgba(0,120,200,0.15)' : 'rgba(255,255,255,0.07)'}`,
        }}
      >
        {/* Featured badge */}
        {entry.isFeatured && (
          <div style={{
            position: 'absolute', top: '1rem', right: '1rem',
            background: 'var(--color-accent)',
            color: '#000',
            padding: '2px 10px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.7rem',
            fontWeight: 700,
            letterSpacing: '0.5px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            Destacado
          </div>
        )}

        {/* Badges row */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
          <span style={{
            padding: '2px 9px',
            borderRadius: 'var(--radius-full)',
            background: `${categoryColor}18`,
            border: `1px solid ${categoryColor}35`,
            color: categoryColor,
            fontSize: '0.7rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            {entry.category}
          </span>
          {entry.relatedFaction && (
            <span style={{
              padding: '2px 9px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(255,215,0,0.1)',
              border: '1px solid rgba(255,215,0,0.2)',
              color: 'var(--color-accent)',
              fontSize: '0.7rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}>
              {entry.relatedFaction.iconUrl && (
                <img src={entry.relatedFaction.iconUrl} alt="" style={{ width: '13px', height: '13px', objectFit: 'contain' }} />
              )}
              {entry.relatedFaction.name}
            </span>
          )}
        </div>

        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(1.1rem, 3vw, 1.5rem)',
          color: isLight ? 'var(--text-primary)' : '#fff',
          marginBottom: '0.75rem',
          lineHeight: 1.25,
          letterSpacing: '0.5px',
        }}>
          {entry.title}
        </h2>

        <p style={{
          color: 'rgba(255,255,255,0.6)',
          lineHeight: 1.75,
          fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
          marginBottom: '1rem',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {entry.excerpt}
        </p>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.78rem',
          color: 'rgba(255,255,255,0.3)',
        }}>
          <span>Por {entry.author}</span>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <span style={{ color: categoryColor, fontWeight: 600 }}>Leer →</span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default LorePage;
