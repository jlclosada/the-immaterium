import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import { useStore } from '../stores/useStore';
import Navbar from '../components/UI/Navbar';
import Footer from '../components/UI/Footer';
import { renderMarkdown } from '../utils/renderMarkdown';
import { estimateReadTime } from '../utils/readTime';
import ShareButton from '../components/UI/ShareButton';
import ReadingProgressBar from '../components/UI/ReadingProgressBar';

const NewsDetailPage = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const userLikes = useStore(state => state.userLikes);
  const toggleLike = useStore(state => state.toggleLike);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const [data, all] = await Promise.allSettled([
          api.getNewsArticle(id),
          api.getNewsArticles(),
        ]);
        const article = data.status === 'fulfilled' ? data.value : null;
        if (article) {
          setArticle(article);
          if (article.title) document.title = `${article.title} | The Immaterium`;
          api.incrementNewsViews(id);
          // Related: same tags first, then recency, exclude self, max 3
          if (all.status === 'fulfilled' && Array.isArray(all.value)) {
            const others = all.value.filter(a => String(a.id) !== String(id));
            const tags = new Set(article.tags || []);
            const scored = others.map(a => ({
              ...a,
              _score: (a.tags || []).filter(t => tags.has(t)).length,
            }));
            scored.sort((a, b) => b._score - a._score || new Date(b.publishedAt) - new Date(a.publishedAt));
            setRelated(scored.slice(0, 3));
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchArticle();
  }, [id]);

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

  const isLiked = userLikes.includes(article.id);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-darker)', display: 'flex', flexDirection: 'column' }}>
      <ReadingProgressBar />
      <Navbar />

      <div style={{
        flex: 1,
        maxWidth: '800px',
        margin: '0 auto',
        padding: 'clamp(5rem, 10vw, 6.5rem) clamp(1rem, 4vw, 2rem) clamp(2rem, 4vw, 3rem)',
        width: '100%',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <Link to="/news" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            color: 'rgba(255,255,255,0.4)', textDecoration: 'none',
            fontSize: '0.85rem', letterSpacing: '1px',
            transition: 'color 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--color-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
          >
            ← Volver a Noticias
          </Link>
          <ShareButton label="Compartir" />
        </div>

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

          {/* Tags + like button row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
            {article.tags?.length > 0 && (
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
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

            {/* Like button */}
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
              onClick={() => toggleLike(article.id, 'news')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
                padding: '0.35rem 0.9rem',
                background: isLiked ? 'rgba(255,80,80,0.12)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${isLiked ? 'rgba(255,80,80,0.3)' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: '20px',
                color: isLiked ? '#ff6464' : 'rgba(255,255,255,0.4)',
                fontSize: '0.78rem', cursor: 'pointer',
                transition: 'all 0.2s',
                flexShrink: 0,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              {(article.likes || 0) + (isLiked ? 1 : 0)}
            </motion.button>
          </div>

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
        {/* Related articles */}
        {related.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{ marginTop: '3.5rem', paddingTop: '2.5rem', borderTop: '1px solid rgba(255,255,255,0.07)' }}
          >
            <p style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.65rem',
              letterSpacing: '4px',
              color: 'var(--color-primary)',
              textTransform: 'uppercase',
              marginBottom: '1.5rem',
              opacity: 0.8,
            }}>
              También te puede interesar
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 220px), 1fr))',
              gap: '1rem',
            }}>
              {related.map((a, i) => (
                <Link key={a.id} to={`/news/${a.id}`} style={{ textDecoration: 'none' }}>
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 + i * 0.07 }}
                    whileHover={{ y: -3 }}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: '14px',
                      overflow: 'hidden',
                      transition: 'border-color 0.25s, box-shadow 0.25s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'rgba(0,212,255,0.2)';
                      e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.35)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {a.coverImage && (
                      <div style={{ width: '100%', aspectRatio: '16/7', overflow: 'hidden', background: 'rgba(0,0,0,0.3)' }}>
                        <img
                          src={a.coverImage}
                          alt={a.title}
                          loading="lazy"
                          decoding="async"
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s' }}
                          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        />
                      </div>
                    )}
                    <div style={{ padding: '0.9rem 1rem' }}>
                      {a.publishedAt && (
                        <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--font-display)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                          {new Date(a.publishedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      )}
                      <p style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '0.88rem',
                        color: '#fff',
                        lineHeight: 1.3,
                        fontWeight: 700,
                        margin: 0,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}>
                        {a.title}
                      </p>
                    </div>
                  </motion.div>
                </Link>
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
