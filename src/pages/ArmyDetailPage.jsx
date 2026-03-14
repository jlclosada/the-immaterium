import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { useStore } from '../stores/useStore';
import { useTranslation } from '../i18n/translations';
import Header from '../components/UI/Header';
import Footer from '../components/UI/Footer';

const ArmyDetailPage = () => {
  const { id } = useParams();
  const language = useStore(state => state.language);
  const t = useTranslation(language);
  const [army, setArmy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchArmy = async () => {
      try {
        const data = await api.getArmy(id);
        setArmy(data);
      } catch (error) {
        console.error('Failed to fetch army:', error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchArmy();
  }, [id]);

  const filteredImages = (army?.images || [])
    .filter(img => img.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0));

  const name = army ? (language === 'es' && army.nameEs ? army.nameEs : army.name) : '';
  const description = army ? (language === 'es' && army.descriptionEs ? army.descriptionEs : army.description) : '';
  const history = army ? (language === 'es' && army.historyEs ? army.historyEs : army.history) : '';

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-darker)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!army) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-darker)', padding: '4rem 2rem', color: 'var(--color-light)', textAlign: 'center' }}>
        <Header />
        <h1 style={{ marginTop: '6rem', color: 'rgba(255,255,255,0.5)' }}>Ejército no encontrado</h1>
        <Link to="/armies" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>← Volver a Ejércitos</Link>
      </div>
    );
  }

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
        {/* Back link */}
        <Link to="/armies" style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
          color: 'rgba(255,255,255,0.4)', textDecoration: 'none',
          fontSize: '0.85rem', letterSpacing: '1px', marginBottom: '2rem',
          transition: 'color 0.2s',
        }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--color-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
        >
          ← Volver a Ejércitos
        </Link>

        {/* Hero section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
            marginBottom: '1.5rem',
          }}
        >
          {/* Two-col layout — flex-wrap handles mobile */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 0,
          }}>
            {/* Icon column */}
            <div style={{
              minWidth: '200px',
              flex: '0 0 clamp(200px, 30%, 320px)',
              background: 'rgba(0,0,0,0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'clamp(2rem, 5vw, 3rem)',
              minHeight: '250px',
            }}>
              {army.iconUrl ? (
                <img
                  src={army.iconUrl}
                  alt={name}
                  style={{
                    maxWidth: '100%', maxHeight: '280px',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 0 30px rgba(0,212,255,0.25))',
                  }}
                />
              ) : (
                <div style={{ fontSize: 'clamp(4rem, 10vw, 8rem)', opacity: 0.3 }}>🛡️</div>
              )}
            </div>

            {/* Info column */}
            <div style={{
              flex: '1 1 300px',
              padding: 'clamp(1.5rem, 4vw, 2.5rem)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: '1rem',
            }}>
              <div>
                <h1 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(1.8rem, 5vw, 3rem)',
                  color: 'var(--color-primary)',
                  lineHeight: 1.15,
                  letterSpacing: '2px',
                  marginBottom: '0.4rem',
                }}>
                  {name}
                </h1>
                {army.planetName && (
                  <p style={{ color: 'var(--color-secondary)', fontSize: '0.95rem', fontStyle: 'italic', opacity: 0.8 }}>
                    🪐 {army.planetName}
                  </p>
                )}
              </div>

              <p style={{
                color: 'rgba(255,255,255,0.7)',
                lineHeight: 1.8,
                fontSize: 'clamp(0.9rem, 2vw, 1rem)',
              }}>
                {description}
              </p>

              {army.images?.length > 0 && (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  background: 'rgba(0,212,255,0.08)',
                  border: '1px solid rgba(0,212,255,0.2)',
                  borderRadius: 'var(--radius-full)',
                  padding: '0.35rem 0.9rem',
                  fontSize: '0.8rem',
                  color: 'var(--color-primary)',
                  alignSelf: 'flex-start',
                }}>
                  🖼️ {army.images.length} {army.images.length === 1 ? 'miniatura' : 'miniaturas'}
                </div>
              )}
            </div>
          </div>

          {/* Historia */}
          {history && (
            <div style={{
              padding: 'clamp(1.25rem, 3vw, 1.75rem) clamp(1.5rem, 4vw, 2.5rem)',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              background: 'rgba(0,0,0,0.2)',
            }}>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.75rem',
                letterSpacing: '3px',
                color: 'var(--color-primary)',
                textTransform: 'uppercase',
                marginBottom: '1rem',
                opacity: 0.8,
              }}>
                📜 Historia
              </h2>
              <p style={{
                color: 'rgba(255,255,255,0.65)',
                lineHeight: 1.85,
                fontSize: 'clamp(0.875rem, 2vw, 0.975rem)',
                whiteSpace: 'pre-line',
                borderLeft: '3px solid rgba(0,212,255,0.3)',
                paddingLeft: '1rem',
              }}>
                {history}
              </p>
            </div>
          )}
        </motion.div>

        {/* Gallery */}
        {army.images && army.images.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              background: 'rgba(255,255,255,0.025)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 'var(--radius-xl)',
              padding: 'clamp(1.5rem, 4vw, 2rem)',
            }}
          >
            {/* Gallery header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexWrap: 'wrap', gap: '1rem',
              marginBottom: '1.5rem',
            }}>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.1rem, 3vw, 1.5rem)',
                color: '#fff',
                letterSpacing: '2px',
                margin: 0,
              }}>
                🎨 Galería de Miniaturas
              </h2>
              <span style={{
                background: 'rgba(0,212,255,0.1)',
                border: '1px solid rgba(0,212,255,0.25)',
                borderRadius: 'var(--radius-full)',
                padding: '0.3rem 0.9rem',
                color: 'var(--color-primary)',
                fontSize: '0.8rem',
                fontWeight: 600,
              }}>
                {filteredImages.length} imágenes
              </span>
            </div>

            {/* Search */}
            <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
              <span style={{
                position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)',
                color: 'rgba(255,255,255,0.3)', pointerEvents: 'none',
              }}>🔍</span>
              <input
                type="text"
                placeholder="Buscar por nombre..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="search-bar"
                style={{ paddingLeft: '2.3rem', maxWidth: '400px' }}
              />
            </div>

            {filteredImages.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: '1rem',
              }}>
                {filteredImages.map(image => (
                  <motion.div
                    key={image.id}
                    whileHover={{ scale: 1.03, y: -3 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      borderRadius: 'var(--radius-lg)',
                      overflow: 'hidden',
                      cursor: 'zoom-in',
                      border: image.isFavorite
                        ? '2px solid var(--color-accent)'
                        : '1px solid rgba(255,255,255,0.08)',
                      background: 'rgba(0,0,0,0.3)',
                      position: 'relative',
                    }}
                    onClick={() => setSelectedImage(image)}
                  >
                    {image.isFavorite && (
                      <div style={{
                        position: 'absolute', top: '6px', right: '6px',
                        background: 'var(--color-accent)',
                        borderRadius: '50%',
                        width: '24px', height: '24px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.75rem', zIndex: 1,
                      }}>
                        ⭐
                      </div>
                    )}
                    <img
                      src={image.url}
                      alt={image.name}
                      style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }}
                    />
                    <div style={{
                      padding: '0.6rem 0.75rem',
                      fontSize: '0.78rem',
                      color: 'rgba(255,255,255,0.6)',
                      textAlign: 'center',
                      background: 'rgba(0,0,0,0.2)',
                    }}>
                      {image.name}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.3)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔍</div>
                <p>Sin imágenes con "{searchTerm}"</p>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.95)',
              zIndex: 2000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem',
            }}
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedImage(null)}
                style={{
                  position: 'absolute', top: '-14px', right: '-14px',
                  width: '36px', height: '36px',
                  borderRadius: '50%',
                  background: 'var(--color-primary)',
                  border: 'none', color: '#000',
                  fontSize: '1.1rem', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 'bold', zIndex: 1,
                }}
              >
                ✕
              </button>
              <img
                src={selectedImage.url}
                alt={selectedImage.name}
                style={{
                  maxWidth: '100%', maxHeight: '85vh',
                  objectFit: 'contain',
                  borderRadius: 'var(--radius-lg)',
                  display: 'block',
                }}
              />
              <div style={{
                background: 'rgba(0,0,0,0.7)',
                padding: '0.75rem 1rem',
                textAlign: 'center',
                borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
                color: 'rgba(255,255,255,0.8)',
                fontSize: '0.9rem',
              }}>
                {selectedImage.isFavorite && '⭐ '}{selectedImage.name}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default ArmyDetailPage;
