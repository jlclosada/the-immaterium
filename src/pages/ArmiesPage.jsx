import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useStore } from '../stores/useStore';
import { useTranslation } from '../i18n/translations';
import Navbar from '../components/UI/Navbar';
import Footer from '../components/UI/Footer';
import { useTheme } from '../hooks/useTheme';

const THEMES = {
  'sci-fi': {
    bg: '#050508',
    cardBg: 'rgba(0,20,40,0.8)',
    cardBg2: 'rgba(5,5,20,0.95)',
    topAccent: 'linear-gradient(90deg, transparent, var(--page-accent), transparent)',
    glow: '0 0 18px rgba(0,212,255,0.25)',
  },
  'medieval': {
    bg: '#080603',
    cardBg: 'rgba(25,15,5,0.85)',
    cardBg2: 'rgba(12,8,2,0.95)',
    topAccent: 'linear-gradient(90deg, transparent, var(--page-accent), transparent)',
    glow: '0 0 18px rgba(201,168,76,0.3)',
  },
};

const ArmiesPage = () => {
  const navigate = useNavigate();
  const language = useStore(state => state.language);
  const t = useTranslation(language);
  const [armies, setArmies] = useState([]);
  const [games, setGames] = useState([]);
  const [selectedGameId, setSelectedGameId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    document.title = 'Ejércitos & Facciones | The Immaterium';
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [armiesData, gamesData] = await Promise.allSettled([
          api.getArmies(),
          api.getGames(),
        ]);
        const armiesList = armiesData.status === 'fulfilled' ? (Array.isArray(armiesData.value) ? armiesData.value : []) : [];
        const gamesList = gamesData.status === 'fulfilled' ? (Array.isArray(gamesData.value) ? gamesData.value : []) : [];
        setArmies(armiesList);
        setGames(gamesList);
        // No auto-select — null = "Todos"
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const selectedGame = games.find(g => g.id === selectedGameId) || null;
  const theme = THEMES[selectedGame?.theme] || THEMES['sci-fi'];
  const accentColor = selectedGame?.accentColor || '#00d4ff';
  const { isLight } = useTheme();
  const secondaryColor = selectedGame?.secondaryColor || '#7b2fff';

  const user = useStore(s => s.user);
  const favoriteArmyNames = user?.favorite_armies
    ? user.favorite_armies.split(',').filter(Boolean).map(s => s.trim().toLowerCase())
    : [];

  const filteredArmies = armies.filter(army => {
    // null = "Todos" → show everything
    if (selectedGameId !== null) {
      if (army.gameId && army.gameId !== selectedGameId) return false;
      if (!army.gameId && games.length > 0 && games[0].id !== selectedGameId) return false;
    }
    // Search filter
    const term = searchTerm.toLowerCase();
    if (!term) return true;
    const name = (language === 'es' && army.nameEs ? army.nameEs : army.name) || '';
    const desc = (language === 'es' && army.descriptionEs ? army.descriptionEs : army.description) || '';
    return name.toLowerCase().includes(term) || desc.toLowerCase().includes(term);
  });

  // Sort: favorites first
  const sortedArmies = [...filteredArmies].sort((a, b) => {
    const aName = (a.name || '').toLowerCase();
    const bName = (b.name || '').toLowerCase();
    const aFav = favoriteArmyNames.some(f => aName.includes(f) || f.includes(aName));
    const bFav = favoriteArmyNames.some(f => bName.includes(f) || f.includes(bName));
    if (aFav && !bFav) return -1;
    if (!aFav && bFav) return 1;
    return 0;
  });

  return (
    <div style={{
      minHeight: '100vh',
      background: isLight ? 'var(--color-darker)' : theme.bg,
      display: 'flex',
      flexDirection: 'column',
      '--page-accent': accentColor,
      '--page-secondary': secondaryColor,
      transition: 'background 0.5s ease',
    }}>
      <Navbar />

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
          style={{ textAlign: 'center', marginBottom: 'clamp(1.5rem, 4vw, 2.5rem)' }}
        >
          <motion.p
            key={selectedGameId}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.65rem',
              letterSpacing: '4px',
              color: accentColor,
              textTransform: 'uppercase',
              marginBottom: '0.75rem',
            }}
          >
            {selectedGame?.name || 'Warhammer 40,000'}
          </motion.p>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2rem, 6vw, 3.5rem)',
            textTransform: 'uppercase',
            color: accentColor,
            letterSpacing: '3px',
            marginBottom: '1rem',
            transition: 'color 0.4s ease',
          }}>
            {t('armiesTitle')}
          </h1>
          <p style={{ color: isLight ? 'var(--text-dim)' : 'rgba(255,255,255,0.4)', fontSize: '0.9rem', letterSpacing: '1px' }}>
            {sortedArmies.length > 0 ? `${sortedArmies.length} facciones registradas` : ''}
          </p>
        </motion.div>

        {/* Game selector — pill tabs with count badges */}
        {games.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginBottom: 'clamp(1.5rem, 4vw, 2.5rem)', flexWrap: 'wrap' }}
          >
            {/* "Todos" tab */}
            {(() => {
              const isActive = selectedGameId === null;
              return (
                <button onClick={() => setSelectedGameId(null)} style={{
                  padding: '0.4rem 1.1rem', borderRadius: '20px', cursor: 'pointer',
                  fontFamily: 'var(--font-display)', fontSize: '0.68rem', letterSpacing: '1.5px', textTransform: 'uppercase',
                  border: `1px solid ${isActive ? 'rgba(0,212,255,0.55)' : 'rgba(255,255,255,0.12)'}`,
                  background: isActive ? 'rgba(0,212,255,0.1)' : 'rgba(255,255,255,0.04)',
                  color: isActive ? 'var(--color-primary)' : isLight ? 'var(--text-dim)' : 'rgba(255,255,255,0.45)',
                  transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.45rem',
                }}>
                  Todos
                  <span style={{ background: isActive ? 'rgba(0,212,255,0.2)' : 'rgba(255,255,255,0.08)', borderRadius: '10px', padding: '1px 7px', fontSize: '0.65rem', letterSpacing: 0 }}>
                    {armies.length}
                  </span>
                </button>
              );
            })()}
            {games.map(game => {
              const isActive = game.id === selectedGameId;
              const gAccent = game.accentColor || '#00d4ff';
              const count = armies.filter(a => a.gameId === game.id || a.game?.id === game.id).length;
              return (
                <button key={game.id} onClick={() => setSelectedGameId(game.id)} style={{
                  padding: '0.4rem 1.1rem', borderRadius: '20px', cursor: 'pointer',
                  fontFamily: 'var(--font-display)', fontSize: '0.68rem', letterSpacing: '1.5px', textTransform: 'uppercase',
                  border: `1px solid ${isActive ? `${gAccent}88` : 'rgba(255,255,255,0.12)'}`,
                  background: isActive ? `${gAccent}18` : 'rgba(255,255,255,0.04)',
                  color: isActive ? gAccent : isLight ? 'var(--text-dim)' : 'rgba(255,255,255,0.45)',
                  transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.45rem',
                }}>
                  {game.name}
                  <span style={{ background: isActive ? `${gAccent}30` : 'rgba(255,255,255,0.08)', borderRadius: '10px', padding: '1px 7px', fontSize: '0.65rem', letterSpacing: 0 }}>
                    {count || 0}
                  </span>
                </button>
              );
            })}
          </motion.div>
        )}

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
        ) : sortedArmies.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 2rem', color: 'rgba(255,255,255,0.3)' }}>
            <div style={{ marginBottom: '1rem', opacity: 0.25 }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <p style={{ fontSize: '1rem' }}>
              {searchTerm ? `Sin resultados para "${searchTerm}"` : 'No hay facciones registradas'}
            </p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedGameId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {favoriteArmyNames.length > 0 && filteredArmies.some(a => favoriteArmyNames.some(f => (a.name||'').toLowerCase().includes(f))) && (
                <div style={{ marginBottom: '1rem', padding: '0.6rem 1rem', borderRadius: '10px', background: 'rgba(255,215,0,0.07)', border: '1px solid rgba(255,215,0,0.2)', fontSize: '0.75rem', color: '#FFD700', fontFamily: 'var(--font-display)', letterSpacing: '1px' }}>
                  ⭐ Tus ejércitos favoritos aparecen primero
                </div>
              )}
              <div className="cards-grid">
                {sortedArmies.map((army, index) => (
                  <ArmyCard
                    key={army.id}
                    army={army}
                    index={index}
                    language={language}
                    theme={theme}
                    accentColor={accentColor}
                    onClick={() => navigate(`/armies/${army.id}`)}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      <Footer />
    </div>
  );
};

const ArmyCard = ({ army, index, language, theme, accentColor, onClick }) => {
  const { isLight } = useTheme();
  const name = language === 'es' && army.nameEs ? army.nameEs : army.name;
  const description = language === 'es' && army.descriptionEs ? army.descriptionEs : army.description;
  const imageCount = army.images?.length || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4 }}
      onClick={onClick}
      whileHover={{ y: -5, boxShadow: `0 16px 48px rgba(0,0,0,0.4), 0 0 0 1px ${accentColor}30` }}
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

      {/* Icon area */}
      <div style={{
        height: '140px',
        background: `linear-gradient(160deg, ${theme.cardBg} 0%, ${theme.cardBg2} 100%)`,
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
            loading="lazy"
            decoding="async"
            style={{
              maxWidth: '90px',
              maxHeight: '90px',
              objectFit: 'contain',
              filter: `drop-shadow(${theme.glow}) brightness(1.1)`,
              transition: 'filter 0.3s',
            }}
          />
        ) : (
          <div style={{ opacity: 0.15, color: accentColor }}>
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
        )}

        {imageCount > 0 && (
          <div style={{
            position: 'absolute', bottom: '0.6rem', right: '0.6rem',
            background: `${accentColor}1a`,
            border: `1px solid ${accentColor}33`,
            borderRadius: '20px',
            padding: '2px 7px',
            fontSize: '0.68rem',
            color: accentColor,
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
            color: 'var(--text-primary)',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            marginBottom: '0.2rem',
            lineHeight: 1.2,
          }}>
            {name}
          </h2>
          {army.planetName && (
            <p style={{
              color: accentColor,
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
          color: isLight ? 'var(--text-dim)' : 'rgba(255,255,255,0.5)',
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
            color: accentColor,
            letterSpacing: '1.5px',
            fontFamily: 'var(--font-display)',
            textTransform: 'uppercase',
            opacity: 0.8,
          }}>
            Ver facción
          </span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }}>
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
        </div>
      </div>
    </motion.div>
  );
};

export default ArmiesPage;
