import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '../components/UI/Header';
import Footer from '../components/UI/Footer';
import { useStore } from '../stores/useStore';
import { useTranslation } from '../i18n/translations';

// ─── CONFIG ──────────────────────────────────────────────────────────
const YOUTUBE_CHANNEL_URL = 'https://www.youtube.com/@itsmrjoss';
const YOUTUBE_CHANNEL_ID = 'UCRSvtnW26zUos-X1uWfc7ZQ';
// ─────────────────────────────────────────────────────────────────────

const VideosPage = () => {
  const language = useStore((s) => s.language);
  const t = useTranslation(language);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    fetchYouTubeVideos();
  }, []);

  /* ── Carga vídeos del canal vía RSS feed (hasta 15 vídeos recientes) ── */
  const fetchYouTubeVideos = async () => {
    setLoading(true);
    try {
      const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${YOUTUBE_CHANNEL_ID}`;
      const response = await fetch(
        `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`
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
              thumbnail: item.thumbnail || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
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
        background: 'radial-gradient(ellipse at 50% 0%, #1a1a2e 0%, #050510 60%)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Header />

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
              background: 'linear-gradient(180deg, #fff 0%, rgba(255,255,255,0.6) 100%)',
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
                    paddingBottom: '56.25%'
