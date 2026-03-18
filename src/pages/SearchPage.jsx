import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import Header from '../components/UI/Header';
import Footer from '../components/UI/Footer';

const TYPE_LABELS = {
  all: 'Todo',
  armies: 'Ejércitos',
  guides: 'Guías',
  reports: 'Batallas',
  lore: 'Trasfondo',
  news: 'Noticias',
};

const TYPE_COLORS = {
  army: '#00d4ff',
  guide: '#a855f7',
  report: '#f97316',
  lore: '#22c55e',
  news: '#eab308',
};

const TYPE_ICONS = {
  army: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  guide: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18.37 2.63 14 7l-1.59-1.59a2 2 0 0 0-2.82 0L8 7l9 9 1.59-1.59a2 2 0 0 0 0-2.82L17 10l4.37-4.37a2.12 2.12 0 1 0-3-3z" />
      <path d="M9 8c-2 3-4 3.5-7 4l8 10c2-1 6-5 6-7" />
    </svg>
  ),
  report: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" />
      <line x1="13" y1="19" x2="19" y2="13" />
      <line x1="16" y1="16" x2="20" y2="20" />
      <line x1="19" y1="21" x2="21" y2="19" />
    </svg>
  ),
  lore: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
  news: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a4 4 0 0 1-4 4z" />
      <path d="M8 6h12" /><path d="M8 10h12" /><path d="M8 14h8" />
    </svg>
  ),
};

function ResultCard({ result, index }) {
  const navigate = useNavigate();
  const color = TYPE_COLORS[result.type] || '#fff';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      onClick={() => navigate(result.url)}
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: `1px solid rgba(255, 255, 255, 0.08)`,
        borderLeft: `3px solid ${color}`,
        borderRadius: '12px',
        padding: '1.25rem 1.5rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        gap: '1rem',
        alignItems: 'flex-start',
      }}
      whileHover={{
        background: 'rgba(255, 255, 255, 0.06)',
        borderColor: color,
        x: 4,
      }}
    >
      {/* Type badge */}
      <div style={{
        flexShrink: 0,
        width: '36px',
        height: '36px',
        borderRadius: '8px',
        background: `${color}20`,
        border: `1px solid ${color}40`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color,
      }}>
        {TYPE_ICONS[result.type]}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <span style={{
            fontSize: '0.65rem',
            fontFamily: 'var(--font-display)',
            letterSpacing: '1px',
            color,
            textTransform: 'uppercase',
            opacity: 0.8,
          }}>
            {TYPE_LABELS[result.type + 's'] || result.type}
          </span>
          {result.subtitle && (
            <>
              <span style={{ color: '#444', fontSize: '0.7rem' }}>·</span>
              <span style={{ fontSize: '0.75rem', color: '#888' }}>{result.subtitle}</span>
            </>
          )}
        </div>
        <h3 style={{
          margin: 0,
          fontSize: '1rem',
          fontFamily: 'var(--font-display)',
          color: '#fff',
          letterSpacing: '0.5px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {result.title}
        </h3>
        {result.description && (
          <p style={{
            margin: '0.35rem 0 0',
            fontSize: '0.82rem',
            color: '#999',
            lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {result.description}
          </p>
        )}
      </div>

      {/* Arrow */}
      <div style={{ flexShrink: 0, color: '#444', alignSelf: 'center' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>
    </motion.div>
  );
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [activeType, setActiveType] = useState('all');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Run search when URL param changes
  useEffect(() => {
    const q = searchParams.get('q') || '';
    setQuery(q);
    if (q.length >= 2) runSearch(q, activeType);
  }, [searchParams]);

  const runSearch = async (q, type) => {
    if (!q || q.length < 2) {
      setResults([]);
      setHasSearched(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.search(q, type);
      setResults(data.results || []);
      setHasSearched(true);
    } catch (e) {
      setError('Error al buscar. Intenta de nuevo.');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchParams(val ? { q: val } : {});
      runSearch(val, activeType);
    }, 350);
  };

  const handleTypeChange = (type) => {
    setActiveType(type);
    if (query.length >= 2) runSearch(query, type);
  };

  const filteredResults = activeType === 'all'
    ? results
    : results.filter(r => r.type === activeType.replace(/s$/, ''));

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', color: '#fff' }}>
      <Header />

      <main style={{ paddingTop: '100px', paddingBottom: '4rem', maxWidth: '800px', margin: '0 auto', padding: '100px 1.5rem 4rem' }}>

        {/* Page title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: '2rem', textAlign: 'center' }}
        >
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
            background: 'linear-gradient(135deg, #fff 0%, var(--color-primary) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: '0 0 0.5rem',
            letterSpacing: '2px',
          }}>
            BÚSQUEDA GLOBAL
          </h1>
          <p style={{ color: '#888', fontSize: '0.9rem', margin: 0 }}>
            Busca en ejércitos, guías, batallas, trasfondo y noticias
          </p>
        </motion.div>

        {/* Search input */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          style={{
            position: 'relative',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{
            position: 'absolute',
            left: '1.25rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#666',
            pointerEvents: 'none',
            display: 'flex',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Buscar... (ej: Space Marines, pintura, batalla...)"
            style={{
              width: '100%',
              padding: '1rem 3rem 1rem 3.25rem',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(0, 212, 255, 0.3)',
              borderRadius: '14px',
              color: '#fff',
              fontSize: '1rem',
              fontFamily: 'var(--font-body)',
              outline: 'none',
              transition: 'border-color 0.2s',
              boxSizing: 'border-box',
              boxShadow: '0 0 0 0 transparent',
            }}
            onFocus={e => { e.target.style.borderColor = 'var(--color-primary)'; e.target.style.boxShadow = '0 0 20px rgba(0, 212, 255, 0.15)'; }}
            onBlur={e => { e.target.style.borderColor = 'rgba(0, 212, 255, 0.3)'; e.target.style.boxShadow = 'none'; }}
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setResults([]); setHasSearched(false); setSearchParams({}); inputRef.current?.focus(); }}
              style={{
                position: 'absolute',
                right: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#666',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                borderRadius: '50%',
                transition: 'color 0.2s',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </motion.div>

        {/* Type filter tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          style={{
            display: 'flex',
            gap: '0.5rem',
            flexWrap: 'wrap',
            marginBottom: '2rem',
          }}
        >
          {Object.entries(TYPE_LABELS).map(([type, label]) => (
            <button
              key={type}
              onClick={() => handleTypeChange(type)}
              style={{
                padding: '0.4rem 1rem',
                borderRadius: '20px',
                border: `1px solid ${activeType === type ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)'}`,
                background: activeType === type ? 'rgba(0, 212, 255, 0.15)' : 'rgba(255,255,255,0.04)',
                color: activeType === type ? 'var(--color-primary)' : '#aaa',
                fontSize: '0.8rem',
                fontFamily: 'var(--font-display)',
                letterSpacing: '0.5px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {label.toUpperCase()}
            </button>
          ))}
        </motion.div>

        {/* Results area */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ textAlign: 'center', padding: '4rem 0', color: '#666' }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                style={{ display: 'inline-block', marginBottom: '1rem' }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              </motion.div>
              <p style={{ margin: 0 }}>Buscando en el Inmaterium...</p>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                textAlign: 'center',
                padding: '3rem',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '12px',
                color: '#ef4444',
              }}
            >
              {error}
            </motion.div>
          ) : hasSearched && filteredResults.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ textAlign: 'center', padding: '4rem 0' }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.4 }}>🔍</div>
              <p style={{ color: '#666', fontSize: '1rem' }}>
                Sin resultados para <strong style={{ color: '#aaa' }}>"{query}"</strong>
              </p>
              <p style={{ color: '#555', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                Prueba con otros términos o cambia el filtro de tipo
              </p>
            </motion.div>
          ) : !hasSearched ? (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ textAlign: 'center', padding: '4rem 0' }}
            >
              <div style={{
                display: 'inline-flex',
                gap: '1.5rem',
                flexWrap: 'wrap',
                justifyContent: 'center',
                opacity: 0.5,
              }}>
                {['Ejércitos', 'Guías de pintura', 'Informes de batalla', 'Trasfondo', 'Noticias'].map(t => (
                  <span key={t} style={{ fontSize: '0.85rem', color: '#888', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-primary)', display: 'inline-block' }} />
                    {t}
                  </span>
                ))}
              </div>
              <p style={{ color: '#555', marginTop: '1.5rem', fontSize: '0.85rem' }}>
                Escribe al menos 2 caracteres para buscar
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {/* Result count */}
              <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: '1rem' }}>
                <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>{filteredResults.length}</span>
                {' '}resultado{filteredResults.length !== 1 ? 's' : ''} para{' '}
                <strong style={{ color: '#ccc' }}>"{query}"</strong>
              </p>

              {/* Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {filteredResults.map((result, i) => (
                  <ResultCard key={`${result.type}-${result.id}`} result={result} index={i} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
