import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/UI/Navbar';
import Footer from '../components/UI/Footer';
import { useStore } from '../stores/useStore';
import { useTranslation } from '../i18n/translations';
import { useTheme } from '../hooks/useTheme';

// ─── CONFIG ──────────────────────────────────────────────────────────
const YOUTUBE_CHANNEL_URL = 'https://www.youtube.com/@itsmrjoss';
const YOUTUBE_CHANNEL_ID = 'UCRSvtnW26zUos-X1uWfc7ZQ';
// YouTube Data API v3 key (opcional pero necesaria para cargar TODOS los vídeos)
// Sin ella solo se cargan los 10 más recientes vía RSS.
// Configúrala en Netlify → Environment variables → VITE_YOUTUBE_API_KEY
const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY || '';
// ─────────────────────────────────────────────────────────────────────

const VideosPage = () => {
  const { isLight } = useTheme();
  const language = useStore((s) => s.language);
  const t = useTranslation(language);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSeries, setActiveSeries] = useState('all');

  useEffect(() => {
    document.title = 'Videos | The Immaterium';
  }, []);

  useEffect(() => {
    fetchYouTubeVideos();
  }, []);

  /* ── Estrategia:
     1. Si hay YOUTUBE_API_KEY → YouTube Data API v3 (pagina hasta obtener TODOS)
     2. Fallback → RSS feed vía rss2json (máx. 10 vídeos)
  ── */
  const fetchYouTubeVideos = async () => {
    setLoading(true);

    // ── 1. YouTube Data API v3 — carga TODOS los vídeos paginando ──
    if (YOUTUBE_API_KEY) {
      try {
        const allVideos = [];
        let pageToken = '';
        let hasMore = true;

        while (hasMore) {
          const url =
            `https://www.googleapis.com/youtube/v3/search` +
            `?key=${YOUTUBE_API_KEY}` +
            `&channelId=${YOUTUBE_CHANNEL_ID}` +
            `&part=snippet` +
            `&order=date` +
            `&type=video` +
            `&maxResults=50` +
            (pageToken ? `&pageToken=${pageToken}` : '');

          const res = await fetch(url);
          if (!res.ok) break;

          const data = await res.json();
          if (data.items?.length > 0) {
            const batch = data.items.map((item) => ({
              id: item.id.videoId,
              title: item.snippet.title,
              description: item.snippet.description?.substring(0, 200) || '',
              date: item.snippet.publishedAt?.split('T')[0] || '',
              thumbnail:
                item.snippet.thumbnails?.high?.url ||
                item.snippet.thumbnails?.medium?.url ||
                `https://img.youtube.com/vi/${item.id.videoId}/hqdefault.jpg`,
            }));
            allVideos.push(...batch);
          }

          pageToken = data.nextPageToken || '';
          hasMore = !!pageToken;
        }

        if (allVideos.length > 0) {
          setVideos(allVideos);
          setSelectedVideo(allVideos[0]);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn('YouTube API fetch failed, falling back to RSS:', err);
      }
    }

    // ── 2. Fallback: RSS feed (máx. 10 vídeos) ──
    try {
      const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${YOUTUBE_CHANNEL_ID}`;
      // Añadimos _t= para evitar caché de rss2json
      const cacheBuster = Math.floor(Date.now() / 60000); // cambia cada minuto
      const response = await fetch(
        `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}&_t=${cacheBuster}`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'ok' && data.items?.length > 0) {
          const fetched = data.items.map((item) => {
            const videoId = item.link?.includes('watch?v=')
              ? item.link.split('watch?v=')[1]?.split('&')[0]
              : item.guid?.split(':').pop();
            return {
              id: videoId,
              title: item.title,
              description: item.description?.replace(/<[^>]*>/g, '').substring(0, 200) || '',
              date: item.pubDate?.split(' ')[0] || '',
              thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
            };
          });
          setVideos(fetched);
          setSelectedVideo(fetched[0]);
        }
      }
    } catch (err) {
      console.warn('RSS feed fetch failed:', err);
    }
    setLoading(false);
  };

  /* ── Extrae la serie/juego del título (texto antes del primer "|") ── */
  const extractSeries = (title) => {
    const parts = title.split('|');
    if (parts.length > 1) return parts[0].trim().toUpperCase();
    return null;
  };

  /* ── Lista de series únicas detectadas en los vídeos ── */
  const seriesList = [...new Set(
    videos.map((v) => extractSeries(v.title)).filter(Boolean)
  )];

  /* ── Vídeos filtrados por búsqueda y serie ── */
  const filteredVideos = videos.filter((video) => {
    const matchesSearch = searchQuery.trim() === '' ||
      video.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeries = activeSeries === 'all' ||
      extractSeries(video.title) === activeSeries;
    return matchesSearch && matchesSeries;
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      style={{
        color: 'white',
        background: isLight ? 'var(--color-darker)' : 'radial-gradient(ellipse at 50% 0%, #1a1a2e 0%, #050510 60%)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Navbar />

      {/* Hero Section */}
      <section
        style={{
          paddingTop: 'clamp(6rem, 14vw, 10rem)',
          paddingBottom: 'clamp(2rem, 5vw, 3rem)',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -60%)',
            width: 'min(600px, 90vw)',
            height: 'min(600px, 90vw)',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,0,0,0.05) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          style={{ position: 'relative', zIndex: 1 }}
        >
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(0.6rem, 1.5vw, 0.7rem)',
              letterSpacing: '5px',
              color: '#ff4444',
              textTransform: 'uppercase',
              marginBottom: '0.75rem',
              opacity: 0.8,
            }}
          >
            {t('videosSubLabel')}
          </p>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.8rem, 6vw, 3.5rem)',
              letterSpacing: 'clamp(2px, 0.5vw, 6px)',
              background: isLight ? 'linear-gradient(180deg, #0d1333 0%, #2a4080 100%)' : 'linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.6) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              lineHeight: 1.15,
              marginBottom: '1rem',
            }}
          >
            {t('videosPageTitle')}
          </h1>
          <div
            style={{
              width: 'clamp(60px, 10vw, 120px)',
              height: '2px',
              background: 'linear-gradient(90deg, transparent, #ff4444, transparent)',
              margin: '0 auto 1.5rem',
            }}
          />
          <p
            style={{
              color: 'rgba(255,255,255,0.5)',
              maxWidth: '600px',
              margin: '0 auto',
              fontSize: 'clamp(0.9rem, 2vw, 1.05rem)',
              lineHeight: 1.7,
              padding: '0 1rem',
            }}
          >
            {t('videosPageDescription')}
          </p>

          {/* YouTube Channel Link */}
          <motion.a
            href={YOUTUBE_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              marginTop: '1.5rem',
              padding: '0.75rem 1.5rem',
              background: 'rgba(255, 0, 0, 0.12)',
              border: '1px solid rgba(255, 0, 0, 0.3)',
              borderRadius: '12px',
              color: '#ff4444',
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
              letterSpacing: '1px',
              textDecoration: 'none',
              textTransform: 'uppercase',
              transition: 'all 0.3s',
            }}
          >
            {/* YouTube icon */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
            {t('visitChannel')}
          </motion.a>
          {!YOUTUBE_API_KEY && videos.length > 0 && (
            <p style={{
              marginTop: '1rem',
              fontSize: '0.72rem',
              color: 'rgba(255,255,255,0.25)',
              letterSpacing: '0.5px',
              maxWidth: '450px',
              marginLeft: 'auto',
              marginRight: 'auto',
              lineHeight: 1.6,
            }}>
              {language === 'es'
                ? '⚡ Se muestran los 10 vídeos más recientes. Los nuevos pueden tardar unos minutos en aparecer.'
                : '⚡ Showing the 10 most recent videos. New uploads may take a few minutes to appear.'}
            </p>
          )}
        </motion.div>
      </section>

      {/* Main Content */}
      <section
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 clamp(1rem, 4vw, 2rem) clamp(3rem, 6vw, 5rem)',
          width: '100%',
          flex: 1,
        }}
      >
        {loading ? (
          <div
            style={{
              textAlign: 'center',
              padding: '4rem 0',
              color: 'rgba(255,255,255,0.5)',
            }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              style={{
                width: '40px',
                height: '40px',
                border: '3px solid rgba(255,255,255,0.1)',
                borderTop: '3px solid #ff4444',
                borderRadius: '50%',
                margin: '0 auto 1rem',
              }}
            />
            <p style={{ fontFamily: 'var(--font-display)', letterSpacing: '2px' }}>
              {t('loading')}
            </p>
          </div>
        ) : videos.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '4rem 1rem',
              color: 'rgba(255,255,255,0.5)',
            }}
          >
            <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>{t('noVideosFound')}</p>
            <motion.a
              href={YOUTUBE_CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#ff4444',
                textDecoration: 'none',
                fontFamily: 'var(--font-display)',
                fontSize: '0.9rem',
                letterSpacing: '1px',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
              {t('visitChannelDirectly')}
            </motion.a>
          </div>
        ) : (
          <>
            {/* Featured / Selected Video Player */}
            {selectedVideo && (
              <motion.div
                key={selectedVideo.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                style={{ marginBottom: 'clamp(2rem, 4vw, 3rem)' }}
              >
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    paddingBottom: '56.25%',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: '1px solid rgba(255, 0, 0, 0.2)',
                    boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
                    background: '#000',
                  }}
                >
                  <iframe
                    src={`https://www.youtube.com/embed/${selectedVideo.id}?rel=0&modestbranding=1`}
                    title={selectedVideo.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                    }}
                  />
                </div>
                <div style={{ marginTop: '1rem', padding: '0 0.25rem' }}>
                  <h2
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 'clamp(1.1rem, 3vw, 1.5rem)',
                      color: '#fff',
                      letterSpacing: '1px',
                      marginBottom: '0.5rem',
                      lineHeight: 1.3,
                    }}
                  >
                    {selectedVideo.title}
                  </h2>
                  {selectedVideo.date && (
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                      {formatDate(selectedVideo.date)}
                    </p>
                  )}
                  {selectedVideo.description && (
                    <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.95rem', lineHeight: 1.7, maxWidth: '800px' }}>
                      {selectedVideo.description}
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Search & Filter Bar */}
            <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Search input */}
              <div style={{ position: 'relative', maxWidth: '500px' }}>
                <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none', display: 'flex' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('searchVideos')}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.75rem',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: isLight ? 'var(--text-primary)' : '#fff',
                    fontSize: '0.9rem',
                    outline: 'none',
                    fontFamily: 'var(--font-body)',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'rgba(255,68,68,0.5)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>

              {/* Series filter pills */}
              {seriesList.length > 1 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveSeries('all')}
                    style={{
                      padding: '0.4rem 1rem',
                      borderRadius: '20px',
                      border: `1px solid ${activeSeries === 'all' ? '#ff4444' : 'rgba(255,255,255,0.12)'}`,
                      background: activeSeries === 'all' ? 'rgba(255,68,68,0.15)' : (isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)'),
                      color: activeSeries === 'all' ? '#ff4444' : 'rgba(255,255,255,0.5)',
                      fontFamily: 'var(--font-display)',
                      fontSize: '0.7rem',
                      letterSpacing: '1px',
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                      transition: 'all 0.2s',
                    }}
                  >
                    {t('all')}
                  </motion.button>
                  {seriesList.map((series) => (
                    <motion.button
                      key={series}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveSeries(series)}
                      style={{
                        padding: '0.4rem 1rem',
                        borderRadius: '20px',
                        border: `1px solid ${activeSeries === series ? '#ff4444' : 'rgba(255,255,255,0.12)'}`,
                        background: activeSeries === series ? 'rgba(255,68,68,0.15)' : 'rgba(255,255,255,0.04)',
                        color: activeSeries === series ? '#ff4444' : 'rgba(255,255,255,0.5)',
                        fontFamily: 'var(--font-display)',
                        fontSize: '0.7rem',
                        letterSpacing: '1px',
                        cursor: 'pointer',
                        textTransform: 'uppercase',
                        transition: 'all 0.2s',
                      }}
                    >
                      {series}
                    </motion.button>
                  ))}
                </div>
              )}

              {/* Videos count */}
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', letterSpacing: '2px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase' }}>
                {filteredVideos.length} / {videos.length} {t('videosCount')}
              </p>
            </div>

            {/* Video Grid */}
            {filteredVideos.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'rgba(255,255,255,0.4)' }}>
                <p style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>{t('noVideosFound')}</p>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setSearchQuery(''); setActiveSeries('all'); }}
                  style={{
                    padding: '0.5rem 1.25rem',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,68,68,0.3)',
                    background: 'rgba(255,68,68,0.1)',
                    color: '#ff4444',
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.8rem',
                    letterSpacing: '1px',
                    cursor: 'pointer',
                  }}
                >
                  {t('clearFilters')}
                </motion.button>
              </div>
            ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: 'clamp(1rem, 2.5vw, 1.5rem)' }}>
              {filteredVideos.map((video, idx) => (
                <motion.div
                  key={video.id + '-' + idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06, duration: 0.4 }}
                  whileHover={{ y: -6, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedVideo(video);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  style={{
                    cursor: 'pointer',
                    background: selectedVideo?.id === video.id ? 'rgba(255, 0, 0, 0.08)' : (isLight ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.03)'),
                    border: `1px solid ${selectedVideo?.id === video.id ? 'rgba(255, 0, 0, 0.3)' : 'rgba(255,255,255,0.07)'}`,
                    borderRadius: '14px',
                    overflow: 'hidden',
                    transition: 'border-color 0.3s, box-shadow 0.3s',
                  }}
                >
                  {/* Thumbnail */}
                  <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', background: isLight ? 'var(--color-dark)' : '#111' }}>
                    <img
                      src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
                      alt={video.title}
                      referrerPolicy="no-referrer"
                      crossOrigin="anonymous"
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    {/* Play icon overlay */}
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)', opacity: selectedVideo?.id === video.id ? 0 : 0.8, transition: 'opacity 0.3s' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255, 0, 0, 0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(255,0,0,0.4)' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                      </div>
                    </div>
                    {/* Now playing badge */}
                    {selectedVideo?.id === video.id && (
                      <div style={{ position: 'absolute', top: '8px', left: '8px', background: '#ff4444', color: '#fff', fontSize: '0.65rem', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'var(--font-display)' }}>
                        {t('nowPlaying')}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ padding: 'clamp(0.75rem, 2vw, 1rem)' }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(0.85rem, 2vw, 0.95rem)', color: '#fff', lineHeight: 1.4, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', letterSpacing: '0.5px' }}>
                      {video.title}
                    </h3>
                    {video.date && (
                      <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem', marginTop: '0.5rem', marginBottom: 0 }}>
                        {formatDate(video.date)}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
            )}
          </>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default VideosPage;
