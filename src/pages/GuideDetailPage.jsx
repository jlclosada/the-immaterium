import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import { useStore } from '../stores/useStore';
import Header from '../components/UI/Header';
import Footer from '../components/UI/Footer';
import ImageModal from '../components/Gallery/ImageModal';
import PremiumGate from '../components/Auth/PremiumGate';

// ── YouTube helpers ────────────────────────────────────────────────────────────
function getYouTubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

function YouTubeEmbed({ url }) {
  const id = getYouTubeId(url);
  if (!id) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12 }}
      style={{ marginBottom: '1.5rem', borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', background: '#000', position: 'relative', paddingTop: '56.25%' }}
    >
      <iframe
        src={`https://www.youtube.com/embed/${id}`}
        title="Vídeo de YouTube"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
      />
    </motion.div>
  );
}

const DIFFICULTY_COLORS = {
  beginner: { bg: 'rgba(80,200,120,0.12)', border: 'rgba(80,200,120,0.3)', color: '#50c878', label: 'Principiante' },
  intermediate: { bg: 'rgba(255,180,50,0.12)', border: 'rgba(255,180,50,0.3)', color: '#ffb432', label: 'Intermedio' },
  advanced: { bg: 'rgba(255,80,80,0.12)', border: 'rgba(255,80,80,0.3)', color: '#ff6464', label: 'Avanzado' },
};

const getDifficultyStyle = (difficulty) => {
  const key = (difficulty || '').toLowerCase();
  return DIFFICULTY_COLORS[key] || { bg: 'rgba(255,255,255,0.08)', border: 'rgba(255,255,255,0.15)', color: '#aaa', label: difficulty };
};

const GuideDetailPage = () => {
  const { id } = useParams();
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const { purchases, user } = useStore();

  useEffect(() => {
    const fetchGuide = async () => {
      try {
        const data = await api.getGuide(id);
        setGuide(data);
        if (data?.title) document.title = `${data.title} | The Immaterium`;
      } catch (error) {
        console.error('Failed to fetch guide:', error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchGuide();
  }, [id]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-darker)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!guide) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-darker)', padding: '4rem 2rem', color: 'var(--color-light)', textAlign: 'center' }}>
        <Header />
        <h1 style={{ marginTop: '6rem', color: 'rgba(255,255,255,0.5)' }}>Guía no encontrada</h1>
        <Link to="/guides" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>← Volver a Guías</Link>
      </div>
    );
  }

  const diffStyle = getDifficultyStyle(guide.difficulty);
  const isPremium = guide.isPremium || guide.is_premium;
  const isPurchased = purchases.includes(String(guide.id));
  const userIsPremium = user?.isPremium || false;
  // Premium users, admins and leaders get all guides; individual purchases also unlock
  const isLocked = isPremium && !userIsPremium && !isPurchased && !user?.isAdmin && !user?.isLeader;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-darker)', display: 'flex', flexDirection: 'column' }}>
      <Header />

      {selectedImage && (
        <ImageModal isOpen onClose={() => setSelectedImage(null)} imageSrc={selectedImage} />
      )}

      <div style={{
        flex: 1,
        maxWidth: '900px',
        margin: '0 auto',
        padding: 'clamp(5rem, 10vw, 6.5rem) clamp(1rem, 4vw, 2rem) clamp(2rem, 4vw, 3rem)',
        width: '100%',
      }}>
        {/* Back */}
        <Link to="/guides" style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
          color: 'rgba(255,255,255,0.4)', textDecoration: 'none',
          fontSize: '0.85rem', letterSpacing: '1px', marginBottom: '2rem',
          transition: 'color 0.2s',
        }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--color-secondary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
        >
          ← Volver a Guías
        </Link>

        {/* Header card */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 'var(--radius-xl)',
            padding: 'clamp(1.5rem, 4vw, 2.5rem)',
            marginBottom: '1.5rem',
          }}
        >
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.6rem, 5vw, 2.5rem)',
            color: '#fff',
            lineHeight: 1.2,
            marginBottom: '1.25rem',
            letterSpacing: '1px',
          }}>
            {guide.title}
          </h1>

          {/* Meta */}
          <div style={{
            display: 'flex', gap: '0.75rem', flexWrap: 'wrap',
            marginBottom: '1.25rem', alignItems: 'center',
          }}>
            <span style={{
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              background: diffStyle.bg,
              border: `1px solid ${diffStyle.border}`,
              color: diffStyle.color,
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.5px',
            }}>
              {diffStyle.label}
            </span>
            {isPremium && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                padding: '5px 12px',
                borderRadius: 'var(--radius-full)',
                background: isPurchased ? 'rgba(80,200,120,0.1)' : 'rgba(255,215,0,0.1)',
                border: `1px solid ${isPurchased ? 'rgba(80,200,120,0.4)' : 'rgba(255,215,0,0.45)'}`,
                color: isPurchased ? '#50c878' : '#FFD700',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.5px',
              }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  {isPurchased
                    ? <><polyline points="20 6 9 17 4 12"/></>
                    : <><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>
                  }
                </svg>
                {isPurchased
                  ? 'Desbloqueado'
                  : guide.price
                    ? `Premium · ${(guide.price / 100).toFixed(2)}€`
                    : 'Premium'
                }
              </span>
            )}
            {guide.estimatedTime && (
              <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                {guide.estimatedTime}
              </span>
            )}
            {guide.author && (
              <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                {guide.author}
              </span>
            )}
            {guide.dateCreated && (
              <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                {new Date(guide.dateCreated).toLocaleDateString('es-ES')}
              </span>
            )}
            {guide.faction && (
              <span style={{
                display: 'flex', alignItems: 'center', gap: '0.35rem',
                fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)',
              }}>
                {guide.faction.iconUrl && (
                  <img src={guide.faction.iconUrl} alt={guide.faction.name}
                    style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
                )}
                {guide.faction.name}
              </span>
            )}
          </div>

          {/* Tags */}
          {guide.tags?.length > 0 && (
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {guide.tags.map(tag => (
                <span key={tag} style={{
                  padding: '3px 10px',
                  background: 'rgba(135,206,250,0.12)',
                  border: '1px solid rgba(135,206,250,0.2)',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.78rem',
                  color: 'var(--color-secondary)',
                }}>
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </motion.div>

        {/* Premium gate — shown when locked */}
        {isLocked && <PremiumGate guide={guide} />}

        {/* Cover image */}
        {guide.coverImage && !isLocked && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            style={{
              marginBottom: '1.5rem',
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              background: 'rgba(0,0,0,0.3)',
              maxHeight: '480px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <img
              src={guide.coverImage}
              alt={guide.title}
              style={{
                width: '100%', maxHeight: '480px',
                objectFit: 'contain', display: 'block',
              }}
            />
          </motion.div>
        )}

        {/* YouTube embed */}
        {guide.youtube_url && !isLocked && (
          <YouTubeEmbed url={guide.youtube_url} />
        )}

        {/* Materials */}
        {guide.materials?.length > 0 && !isLocked && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            style={{
              background: 'rgba(255,255,255,0.025)',
              border: '1px solid rgba(135,206,250,0.15)',
              borderRadius: 'var(--radius-xl)',
              padding: 'clamp(1.25rem, 3vw, 2rem)',
              marginBottom: '1.5rem',
            }}
          >
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.75rem',
              letterSpacing: '3px',
              color: 'var(--color-secondary)',
              textTransform: 'uppercase',
              marginBottom: '1.25rem',
              opacity: 0.85,
            }}>
              Materiales Necesarios
            </h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {guide.materials.map((material, i) => {
                // Support both old string format and new {name, paint} format
                const name  = typeof material === 'string' ? material : material.name
                const paint = typeof material === 'string' ? null  : material.paint
                return (
                  <li key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.65rem 0',
                    borderBottom: i < guide.materials.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '0.925rem',
                  }}>
                    {paint ? (
                      <span style={{
                        width: '20px', height: '20px', flexShrink: 0,
                        borderRadius: '5px', background: paint.color,
                        border: '1px solid rgba(255,255,255,0.18)',
                        display: 'inline-block',
                      }} />
                    ) : (
                      <span style={{ color: 'var(--color-secondary)', fontSize: '0.9rem', flexShrink: 0 }}>✓</span>
                    )}
                    <span style={{ flex: 1 }}>
                      {name}
                      {paint && (
                        <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', marginLeft: '0.5rem' }}>
                          {paint.brand_display} · {paint.range}
                        </span>
                      )}
                    </span>
                    {paint?.code && (
                      <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)', fontFamily: 'monospace' }}>
                        {paint.code}
                      </span>
                    )}
                  </li>
                )
              })}
            </ul>
          </motion.div>
        )}

        {/* Steps */}
        {!isLocked && guide.steps?.map((step, index) => (
          <motion.div
            key={step.stepNumber}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * (index + 2) }}
            style={{
              background: 'rgba(255,255,255,0.025)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 'var(--radius-xl)',
              padding: 'clamp(1.25rem, 3vw, 2rem)',
              marginBottom: '1.25rem',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Accent line */}
            <div style={{
              position: 'absolute', top: 0, left: 0, bottom: 0, width: '3px',
              background: 'linear-gradient(180deg, var(--color-secondary), var(--color-primary))',
              borderRadius: '3px 0 0 3px',
            }} />

            {/* Step header */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '1rem',
              marginBottom: '1rem', marginLeft: '0.5rem',
            }}>
              <div style={{
                width: '44px', height: '44px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--color-secondary), var(--color-primary))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.2rem', fontWeight: 700, color: '#000',
                flexShrink: 0,
                boxShadow: '0 0 20px rgba(135,206,250,0.3)',
              }}>
                {step.stepNumber}
              </div>
              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.1rem, 3vw, 1.4rem)',
                color: '#fff',
                margin: 0,
                letterSpacing: '0.5px',
              }}>
                {step.title}
              </h3>
            </div>

            <div
              dangerouslySetInnerHTML={{ __html: step.description }}
              style={{
                color: 'rgba(255,255,255,0.7)',
                lineHeight: 1.8,
                fontSize: '0.95rem',
                marginLeft: '0.5rem',
                marginBottom: step.images?.length > 0 || step.tips?.length > 0 ? '1.25rem' : 0,
              }}
              className="rich-content"
            />

            {/* Step images */}
            {step.images?.length > 0 && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '0.75rem',
                marginBottom: step.tips?.length > 0 ? '1.25rem' : 0,
                marginLeft: '0.5rem',
              }}>
                {step.images.map((img, imgIdx) => (
                  <div
                    key={imgIdx}
                    onClick={() => setSelectedImage(img)}
                    style={{
                      borderRadius: 'var(--radius-lg)',
                      overflow: 'hidden',
                      cursor: 'zoom-in',
                      border: '1px solid rgba(255,255,255,0.08)',
                      height: '180px',
                      background: 'rgba(0,0,0,0.3)',
                    }}
                  >
                    <img
                      src={img}
                      alt={`Paso ${step.stepNumber} - ${imgIdx + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Tips */}
            {step.tips?.length > 0 && (
              <div style={{
                background: 'rgba(135,206,250,0.07)',
                border: '1px solid rgba(135,206,250,0.15)',
                borderRadius: 'var(--radius-lg)',
                padding: '1rem 1.25rem',
                marginLeft: '0.5rem',
              }}>
                <h4 style={{ color: 'var(--color-secondary)', marginBottom: '0.5rem', fontSize: '0.85rem', letterSpacing: '1px' }}>
                  Consejos
                </h4>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'rgba(255,255,255,0.65)', fontSize: '0.875rem', lineHeight: 1.7 }}>
                  {step.tips.map((tip, tipIdx) => (
                    <li key={tipIdx} style={{ marginBottom: '0.25rem' }}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <Footer />
    </div>
  );
};

export default GuideDetailPage;
