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
  const imageCount = army.images?.length || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4 }}
      onClick={onClick}
      whileHover={{ y: -5, boxShadow: '0 16px 48px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,212,255,0.18)' }}
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        transition: 'border-color 0.3s, box-shadow 0.3s',
        backdropFilter: 'blur(12px)',
        position: 'relative',
      }}
    >
      {/* Top accent */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
        background: 'linear-gradient(90deg, transparent, var(--color-primary), transparent)',
        opacity: 0.4,
      }} />

      {/* Icon area — clean, dark, centered icon */}
      <div style={{
        height: '140px',
        background: 'linear-gradient(160deg, rgba(0,20,40,0.8) 0%, rgba(5,5,20,0.95) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        position: 'relative',
      }}>
        {army.iconUrl ? (
          <img
            src={army.iconUrl}
            alt={name}
            style={{
              maxWidth: '90px',
              maxHeight: '90px',
              objectFit: 'contain',
              filter: 'drop-shadow(0 0 18px rgba(0,212,255,0.25)) brightness(1.1)',
              transition: 'filter 0.3s',
            }}
          />
        ) : (
          <div style={{ opacity: 0.15, color: 'var(--color-primary)' }}>
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
        )}

        {/* Gallery count badge */}
        {imageCount > 0 && (
          <div style={{
            position: 'absolute', bottom: '0.6rem', right: '0.6rem',
            background: 'rgba(0,212,255,0.12)',
            border: '1px solid rgba(0,212,255,0.2)',
            borderRadius: '20px',
            padding: '2px 7px',
            fontSize: '0.68rem',
            color: 'var(--color-primary)',
            display: 'flex', alignItems: 'center', gap: '3px',
          }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            {imageCount}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '1.25rem 1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        <div>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
            color: 'var(--color-light)',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            marginBottom: '0.2rem',
            lineHeight: 1.2,
          }}>
            {name}
          </h2>
          {army.planetName && (
            <p style={{
              color: 'var(--color-primary)',
              fontSize: '0.75rem',
              opacity: 0.7,
              display: 'flex', alignItems: 'center', gap: '3px',
            }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              {army.planetName}
            </p>
          )}
        </div>

        <p style={{
          color: 'rgba(255,255,255,0.5)',
          lineHeight: 1.65,
          fontSize: '0.82rem',
          flex: 1,
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          margin: 0,
        }}>
          {description}
        </p>

        {/* CTA */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '0.75rem',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          marginTop: 'auto',
        }}>
          <span style={{
            fontSize: '0.75rem',
            color: 'var(--color-primary)',
            letterSpacing: '1.5px',
            fontFamily: 'var(--font-display)',
            textTransform: 'uppercase',
            opacity: 0.8,
          }}>
            Ver facción
          </span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }}>
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
        </div>
      </div>
    </motion.div>
  );
};

export default ArmiesPage;
