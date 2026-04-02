import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import Navbar from '../components/UI/Navbar';
import Footer from '../components/UI/Footer';
import { renderMarkdown } from '../utils/renderMarkdown';
import { estimateReadTime } from '../utils/readTime';

const NewsDetailPage = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await api.getNewsArticle(id);
        setArticle(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetch();
  }, [id]);

  useEffect(() => {
    if (article?.title) {
      document.title = `${article.title} | The Immaterium`;
    }
  }, [article]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-darker)', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="loading-spinner" />
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-darker)', padding: '6rem 2rem', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
        <Navbar />
        <h1 style={{ marginTop: '4rem' }}>Artículo no encontrado</h1>
        <Link to="/news" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>← Volver a Noticias</Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-darker)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <div style={{
        flex: 1,
        maxWidth: '800px',
        margin: '0 auto',
        padding: 'clamp(5rem, 10vw, 6.5rem) clamp(1rem, 4vw, 2rem) clamp(2rem, 4vw, 3rem)',
        width: '100%',
      }}>
        <Link to="/news" style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
          color: 'rgba(255,255,255,0.4)', textDecoration: 'none',
          fontSize: '0.85rem', letterSpacing: '1px', marginBottom: '2rem',
          transition: 'color 0.2s',
        }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--color-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
        >
          ← Volver a Noticias
        </Link>

        {/* Header: title + tags first */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '2rem' }}>
          {/* Date + author + read time */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: '0.4rem 0.75rem',
            fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)',
            letterSpacing: '0.5px', textTransform: 'uppercase',
            fontFamily: 'var(--font-display)', marginBottom: '1rem',
          }}>
            {article.publishedAt && (
              <span>{new Date(article.publishedAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            )}
            {article.author && <><span style={{ opacity: 0.3 }}>·</span><span>Por {article.author}</span></>}
            {article.content && (() => {
              const rt = estimateReadTime(article.content);
              return rt ? <><span style={{ opacity: 0.3 }}>·</span><span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                {rt} lectura
              </span></> : null;
            })()}
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.6rem, 5vw, 2.75rem)',
            color: '#fff',
            lineHeight: 1.15,
            letterSpacing: '0.5px',
            marginBottom: '1.25rem',
          }}>
            {article.title}
          </h1>

          {/* Tags */}
          {article.tags?.length > 0 && (
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
              {article.tags.map(tag => (
                <span key={tag} style={{
                  padding: '3px 10px',
                  borderRadius: '999px',
                  background: 'rgba(0,212,255,0.08)',
                  border: '1px solid rgba(0,212,255,0.2)',
                  color: 'var(--color-primary)',
                  fontSize: '0.68rem',
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

          <div style={{ width: '48px', height: '2px', background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))' }} />
        </motion.div>

        {/* Cover image — after title + tags */}
        {article.coverImage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            style={{
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              marginBottom: '2.5rem',
              aspectRatio: '16/7',
              background: 'rgba(255,255,255,0.03)',
              boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
            }}
          >
            <img
              src={article.coverImage}
              alt={article.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </motion.div>
        )}

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="md-content"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(article.content) }}
        />

        {/* Extra images */}
        {article.images?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{ marginTop: '2.5rem' }}
          >
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.7rem',
              letterSpacing: '3px',
              color: 'var(--color-primary)',
              textTransform: 'uppercase',
              marginBottom: '1rem',
            }}>
              Imágenes
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(140px, 25vw, 220px), 1fr))',
              gap: '0.75rem',
            }}>
              {article.images.map((url, i) => (
                <div key={i} style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', aspectRatio: '4/3' }}>
                  <img
                    src={url}
                    alt={`Imagen ${i + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.3s' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default NewsDetailPage;
