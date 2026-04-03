import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import Navbar from '../components/UI/Navbar';
import Footer from '../components/UI/Footer';
import { useTheme } from '../hooks/useTheme';

const NewsPage = () => {
  const { isLight } = useTheme();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    document.title = 'Noticias | The Immaterium';
  }, []);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await api.getNewsArticles();
        setArticles(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const filtered = articles.filter(a =>
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.excerpt || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-darker)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <div style={{
        flex: 1,
        maxWidth: '1100px',
        margin: '0 auto',
        padding: 'clamp(5rem, 10vw, 6.5rem) clamp(1rem, 4vw, 2rem) clamp(2rem, 4vw, 3rem)',
        width: '100%',
      }}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: 'clamp(2rem, 5vw, 3rem)' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.65rem', letterSpacing: '4px', color: 'var(--color-primary)', textTransform: 'uppercase', opacity: 0.7, marginBottom: '0.75rem' }}>
            The Immaterium
          </p>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2rem, 6vw, 3.5rem)',
            textTransform: 'uppercase',
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '3px',
            marginBottom: '1rem',
          }}>
            Noticias
          </h1>
          <p style={{ color: isLight ? 'var(--text-dim)' : 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>
            {articles.length > 0 ? `${articles.length} artículos publicados` : ''}
          </p>
        </motion.div>

        {/* Search */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ maxWidth: '500px', margin: '0 auto clamp(2rem, 5vw, 3rem)' }}>
          <div style={{ position: 'relative' }}>
            <svg style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Buscar artículo..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="search-bar"
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
        </motion.div>

        {loading ? (
          <div className="loading-spinner" style={{ margin: '5rem auto' }} />
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 2rem', color: 'rgba(255,255,255,0.3)' }}>
            <p>{searchTerm ? `Sin resultados para "${searchTerm}"` : 'No hay artículos publicados aún.'}</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 420px), 1fr))',
            gap: 'clamp(1rem, 3vw, 1.75rem)',
          }}>
            {filtered.map((article, index) => (
              <NewsCard key={article.id} article={article} index={index} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

const NewsCard = ({ article, index }) => (
  <Link to={`/news/${article.id}`} style={{ textDecoration: 'none' }}>
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4, ease: 'easeOut' }}
      whileHover={{ y: -3 }}
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '20px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'box-shadow 0.35s, border-color 0.35s',
        cursor: 'pointer',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,212,255,0.15)';
        e.currentTarget.style.borderColor = 'rgba(0,212,255,0.15)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
      }}
    >
      {/* ── Header: meta + title ── */}
      <div style={{ padding: 'clamp(1.25rem, 3vw, 1.75rem) clamp(1.25rem, 3vw, 1.75rem) clamp(0.9rem, 2vw, 1.25rem)' }}>

        {/* Date + read time row */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          marginBottom: '0.85rem',
          fontSize: '0.72rem',
          color: 'rgba(255,255,255,0.28)',
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
          fontFamily: 'var(--font-display)',
        }}>
          {article.publishedAt && (
            <span>{new Date(article.publishedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          )}
          {article.publishedAt && article.author && <span style={{ opacity: 0.4 }}>·</span>}
          {article.author && <span>Por {article.author}</span>}
        </div>

        {/* Title */}
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(1.15rem, 2.8vw, 1.55rem)',
          color: '#fff',
          lineHeight: 1.2,
          letterSpacing: '0.3px',
          margin: '0 0 1rem',
          fontWeight: 700,
        }}>
          {article.title}
        </h2>

        {/* Tags */}
        {article.tags?.length > 0 && (
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {article.tags.slice(0, 4).map(tag => (
              <span key={tag} style={{
                padding: '3px 10px',
                borderRadius: '999px',
                background: 'rgba(0,212,255,0.07)',
                border: '1px solid rgba(0,212,255,0.15)',
                color: 'var(--color-primary)',
                fontSize: '0.65rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
                fontFamily: 'var(--font-display)',
              }}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Cover image ── */}
      {article.coverImage && (
        <div style={{
          width: '100%',
          aspectRatio: '16/7',
          overflow: 'hidden',
          flexShrink: 0,
          background: 'rgba(0,0,0,0.3)',
          position: 'relative',
        }}>
          <img
            src={article.coverImage}
            alt={article.title}
            loading="lazy"
            decoding="async"
            style={{
              width: '100%', height: '100%',
              objectFit: 'cover', display: 'block',
              transition: 'transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94)',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          />
          {/* subtle gradient overlay at bottom of image */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            height: '40%',
            background: 'linear-gradient(to top, rgba(5,5,16,0.6), transparent)',
            pointerEvents: 'none',
          }} />
        </div>
      )}

      {/* ── Excerpt + CTA ── */}
      <div style={{
        padding: 'clamp(1rem, 2.5vw, 1.4rem) clamp(1.25rem, 3vw, 1.75rem) clamp(1.1rem, 2.5vw, 1.5rem)',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}>
        {article.excerpt && (
          <p style={{
            color: 'rgba(255,255,255,0.45)',
            lineHeight: 1.75,
            fontSize: 'clamp(0.83rem, 1.8vw, 0.93rem)',
            margin: 0,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {article.excerpt}
          </p>
        )}

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 'auto',
          gap: '0.5rem',
        }}>
          {/* Engagement counters */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {article.views > 0 && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)' }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                {article.views}
              </span>
            )}
            {article.likes > 0 && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', color: 'rgba(255,100,100,0.5)' }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                {article.likes}
              </span>
            )}
          </div>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--color-primary)',
            fontWeight: 700,
            fontFamily: 'var(--font-display)',
            fontSize: '0.72rem',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            transition: 'gap 0.2s',
          }}>
            Leer artículo
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </span>
        </div>
      </div>
    </motion.article>
  </Link>
);

export default NewsPage;
