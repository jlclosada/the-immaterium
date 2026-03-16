import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useStore } from '../stores/useStore';
import { useTranslation } from '../i18n/translations';
import Header from '../components/UI/Header';
import Footer from '../components/UI/Footer';

const ArmiesPage = () => {
  const navigate = useNavigate();
  const language = useStore(state => state.language);
  const t = useTranslation(language);
  const [armies, setArmies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchArmies = async () => {
      try {
        const data = await api.getArmies();
        setArmies(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch armies:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchArmies();
  }, []);

  const filteredArmies = armies.filter(army => {
    if (!army.images?.length) return false;
    const term = searchTerm.toLowerCase();
    const name = (language === 'es' && army.nameEs ? army.nameEs : army.name) || '';
    const desc = (language === 'es' && army.descriptionEs ? army.descriptionEs : army.description) || '';
    return name.toLowerCase().includes(term) || desc.toLowerCase().includes(term);
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
            color: 'var(--color-primary)',
            textTransform: 'uppercase',
            opacity: 0.7,
            marginBottom: '0.75rem',
          }}>
            Warhammer 40,000
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
            {t('armiesTitle')}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', letterSpacing: '1px' }}>
            {armies.length > 0 ? `${armies.length} facciones registradas` : ''}
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
              placeholder="Buscar facción..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="search-bar"
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
        </motion.div>

        {loading ? (
          <div className="loading-spinner" style={{ margin: '5rem auto' }} />
        ) : filteredArmies.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 2rem', color: 'rgba(255,255,255,0.3)' }}>
            <div style={{ marginBottom: '1rem', opacity: 0.25 }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
            <p style={{ fontSize: '1rem' }}>
              {searchTerm ? `Sin resultados para "${searchTerm}"` : 'No hay facciones registradas'}
            </p>
          </div>
        ) : (
          <div className="cards-grid">
            {filteredArmies.map((army, index) => (
              <ArmyCard key={army.id} army={army} index={index} language={language} onClick={() => navigate(`/armies/${army.id}`)} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

const ArmyCard = ({ army, index, language, onClick }) => {
  const name = language === 'es' && army.nameEs ? army.nameEs : army.name;
  const description = language === 'es' && army.descriptionEs ? army.descriptionEs : army.description;
  const previewImages = army.images?.slice(0, 3) || [];

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
        transition: 'border-color 0.3s, box-shadow 0.3s',
        backdropFilter: 'blur(8px)',
      }}
      onHoverStart={e => {}}
    >
      {/* Icon / Image area */}
      <div style={{
        height: '180px',
        background: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
      }}>
        {army.iconUrl ? (
          <img
            src={army.iconUrl}
            alt={name}
            style={{
              maxWidth: '75%', maxHeight: '75%',
              objectFit: 'contain',
              filter: 'drop-shadow(0 0 20px rgba(0,212,255,0.3))',
              transition: 'transform 0.4s',
            }}
          />
        ) : (
          <div style={{ opacity: 0.2 }}>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
        )}
        {/* Image count badge */}
        {army.images?.length > 0 && (
          <div style={{
            position: 'absolute', bottom: '0.75rem', right: '0.75rem',
            background: 'rgba(0,0,0,0.7)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 'var(--radius-full)',
            padding: '2px 8px',
            fontSize: '0.7rem',
            color: 'rgba(255,255,255,0.6)',
            backdropFilter: 'blur(4px)',
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '3px' }}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            {army.images.length}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: 'clamp(1rem, 3vw, 1.5rem)', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
            color: 'var(--color-primary)',
            letterSpacing: '1px',
            marginBottom: '0.25rem',
          }}>
            {name}
          </h2>
          {army.planetName && (
            <p style={{
              color: 'var(--color-secondary)',
              fontSize: '0.8rem',
              fontStyle: 'italic',
              opacity: 0.8,
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              {army.planetName}
            </p>
          )}
        </div>

        <p style={{
          color: 'rgba(255,255,255,0.6)',
          lineHeight: 1.65,
          fontSize: '0.875rem',
          flex: 1,
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {description}
        </p>

        {/* Preview thumbnails */}
        {previewImages.length > 0 && (
          <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.25rem' }}>
            {previewImages.map(img => (
              <div key={img.id} style={{
                flex: 1, aspectRatio: '1',
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.08)',
              }}>
                <img
                  src={img.url}
                  alt={img.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div style={{
          fontSize: '0.8rem',
          color: 'var(--color-primary)',
          letterSpacing: '1px',
          fontFamily: 'var(--font-display)',
          opacity: 0.8,
          marginTop: 'auto',
          paddingTop: '0.5rem',
        }}>
          Ver facción →
        </div>
      </div>

      {/* Bottom accent */}
      <div style={{
        height: '2px',
        background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))',
        opacity: 0.25,
      }} />
    </motion.div>
  );
};

export default ArmiesPage;
