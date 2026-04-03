import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import { useStore } from '../stores/useStore';
import { useTranslation } from '../i18n/translations';
import Navbar from '../components/UI/Navbar';
import Footer from '../components/UI/Footer';
import { renderMarkdown } from '../utils/renderMarkdown';
import { estimateReadTime } from '../utils/readTime';
import ShareButton from '../components/UI/ShareButton';

const CATEGORY_COLORS = {
  historia: '#a78bfa',
  faccion: 'var(--color-primary)',
  evento: '#ff6464',
  personaje: '#ffb432',
  lugar: '#50c878',
  tecnologia: 'var(--color-secondary)',
  otro: 'rgba(255,255,255,0.5)',
};

const getCategoryColor = (value) => CATEGORY_COLORS[value] || 'var(--color-primary)';

const LoreDetailPage = () => {
  const { id } = useParams();
  const [lore, setLore] = useState(null);
  const [loading, setLoading] = useState(true);
  const language = useStore(state => state.language);
  const userLikes = useStore(state => state.userLikes);
  const toggleLike = useStore(state => state.toggleLike);
  const t = useTranslation(language);

  useEffect(() => {
    const fetchLore = async () => {
      try {
        const data = await api.getLoreEntry(id);
        setLore(data);
        if (data?.title) document.title = `${data.title} | The Immaterium`;
      } catch (error) {
        console.error('Failed to fetch lore entry:', error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchLore();
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

  if (!lore) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-darker)', padding: '4rem 2rem', color: 'var(--color-light)', textAlign: 'center' }}>
        <Navbar />
        <h1 style={{ marginTop: '6rem', color: 'rgba(255,255,255,0.5)' }}>Entrada no encontrada</h1>
        <Link to="/lore" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>← {t('backToLore')}</Link>
      </div>
    );
  }

  const categoryColor = getCategoryColor(lore.category);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-darker)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <div style={{
        flex: 1,
        maxWidth: '900px',
        margin: '0 auto',
        padding: 'clamp(5rem, 10vw, 6.5rem) clamp(1rem, 4vw, 2rem) clamp(2rem, 4vw, 3rem)',
        width: '100%',
      }}>
        {/* Back + Share */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <Link to="/lore" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            color: 'rgba(255,255,255,0.4)', textDecoration: 'none',
            fontSize: '0.85rem', letterSpacing: '1px',
            transition: 'color 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--color-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
          >
            ← {t('backToLore')}
          </Link>
          <ShareButton label="Compartir" />
        </div>

        {/* Header card */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderLeft: `3px solid ${categoryColor}`,
            borderRadius: 'var(--radius-xl)',
            padding: 'clamp(1.5rem, 4vw, 2.5rem)',
            marginBottom: '1.5rem',
          }}
        >
          {/* Badges */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {lore.isFeatured && (
              <span style={{
                background: 'var(--color-accent)',
                color: '#000',
                padding: '3px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.7rem',
                fontWeight: 700,
              }}>
                ⭐ {t('featured')}
              </span>
            )}
            <span style={{
              padding: '3px 10px',
              borderRadius: 'var(--radius-full)',
              background: `${categoryColor}18`,
              border: `1px solid ${categoryColor}35`,
              color: categoryColor,
              fontSize: '0.7rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              {lore.category}
            </span>
            {lore.relatedFaction && (
              <span style={{
                padding: '3px 10px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(255,215,0,0.1)',
                border: '1px solid rgba(255,215,0,0.2)',
                color: 'var(--color-accent)',
                fontSize: '0.7rem',
                display: 'flex', alignItems: 'center', gap: '0.3rem',
              }}>
                {lore.relatedFaction.iconUrl && (
                  <img src={lore.relatedFaction.iconUrl} alt="" style={{ width: '13px', height: '13px', objectFit: 'contain' }} />
                )}
                {lore.relatedFaction.name}
              </span>
            )}
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.75rem, 5vw, 3rem)',
            color: '#fff',
            lineHeight: 1.2,
            letterSpacing: '1px',
            marginBottom: '1rem',
          }}>
            {lore.title}
          </h1>

          <div style={{
            display: 'flex', gap: '1.25rem', flexWrap: 'wrap',
            color: 'rgba(255,255,255,0.4)',
            fontSize: '0.82rem',
          }}>
            <span>{lore.author}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              {new Date(lore.dateCreated).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US')}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              {estimateReadTime(lore.content)} lectura
            </span>
          </div>

          {/* Tags + like */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1rem' }}>
            {lore.tags?.length > 0 && (
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {lore.tags.map(tag => (
                  <span key={tag} style={{
                    padding: '3px 10px',
                    background: 'rgba(0,206,209,0.1)',
                    border: '1px solid rgba(0,206,209,0.2)',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.75rem',
                    color: '#00ced1',
                  }}>
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            {/* Like button */}
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
              onClick={() => toggleLike(lore.id, 'lore')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
                padding: '0.35rem 0.9rem',
                background: userLikes.includes(lore.id) ? 'rgba(255,80,80,0.12)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${userLikes.includes(lore.id) ? 'rgba(255,80,80,0.3)' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: '20px',
                color: userLikes.includes(lore.id) ? '#ff6464' : 'rgba(255,255,255,0.4)',
                fontSize: '0.78rem', cursor: 'pointer',
                transition: 'all 0.2s',
                flexShrink: 0,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill={userLikes.includes(lore.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              {(lore.likes || 0) + (userLikes.includes(lore.id) ? 1 : 0)}
            </motion.button>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 'var(--radius-xl)',
            padding: 'clamp(1.5rem, 4vw, 2.5rem)',
            marginBottom: '1.5rem',
          }}
        >
          <div
            className="md-content"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(lore.content) }}
          />
        </motion.div>

        {/* Related faction */}
        {lore.relatedFaction && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Link to={`/armies/${lore.relatedFaction.id}`} style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 'var(--radius-xl)',
                padding: 'clamp(1rem, 3vw, 1.5rem)',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                transition: 'border-color 0.2s, transform 0.2s',
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(0,212,255,0.3)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {lore.relatedFaction.iconUrl && (
                  <img
                    src={lore.relatedFaction.iconUrl}
                    alt={lore.relatedFaction.name}
                    style={{ width: '44px', height: '44px', objectFit: 'contain', filter: 'drop-shadow(0 0 10px rgba(0,212,255,0.2))' }}
                  />
                )}
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.72rem', letterSpacing: '1px', marginBottom: '0.2rem' }}>
                    {t('relatedTo')}
                  </div>
                  <div style={{ color: 'var(--color-primary)', fontSize: '1.05rem', fontWeight: 600, fontFamily: 'var(--font-display)' }}>
                    {lore.relatedFaction.name}
                  </div>
                </div>
                <div style={{ marginLeft: 'auto', color: 'var(--color-primary)', opacity: 0.6, fontSize: '1.2rem' }}>→</div>
              </div>
            </Link>
          </motion.div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default LoreDetailPage;
