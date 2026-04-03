import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import { useStore } from '../stores/useStore';
import Navbar from '../components/UI/Navbar';
import Footer from '../components/UI/Footer';
import ShareButton from '../components/UI/ShareButton';
import ReadingProgressBar from '../components/UI/ReadingProgressBar';

const BattleReportDetailPage = () => {
  const { id } = useParams();
  const { armies, userLikes, toggleLike } = useStore();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const data = await api.getBattleReport(id);
        setReport(data);
        if (data?.title) document.title = `${data.title} | The Immaterium`;
        // Track view (fire-and-forget)
        api.incrementReportViews(id);
      } catch (error) {
        console.error('Failed to fetch battle report:', error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchReport();
  }, [id]);

  const getFactionArmy = (factionId) => armies.find(a => a.id === factionId);
  const getFactionIcon = (factionId) => getFactionArmy(factionId)?.iconUrl || '';
  const getFactionColor = (factionId) => getFactionArmy(factionId)?.color || '#fff';

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

  if (!report) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-darker)', padding: '4rem 2rem', color: 'var(--color-light)', textAlign: 'center' }}>
        <Navbar />
        <h1 style={{ marginTop: '6rem', color: 'rgba(255,255,255,0.5)' }}>Informe no encontrado</h1>
        <Link to="/battle-reports" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>← Volver a Informes</Link>
      </div>
    );
  }

  const f0 = report.factions?.[0];
  const f1 = report.factions?.[1];
  const p1 = report.armies?.player1;
  const p2 = report.armies?.player2;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-darker)', display: 'flex', flexDirection: 'column' }}>
      <ReadingProgressBar />
      <Navbar />

      <div style={{
        flex: 1,
        maxWidth: '1000px',
        margin: '0 auto',
        padding: 'clamp(5rem, 10vw, 6.5rem) clamp(1rem, 4vw, 2rem) clamp(2rem, 4vw, 3rem)',
        width: '100%',
      }}>
        {/* Back + Share */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <Link to="/battle-reports" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            color: 'rgba(255,255,255,0.4)', textDecoration: 'none',
            fontSize: '0.85rem', letterSpacing: '1px',
            transition: 'color 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.color = '#f9cb28'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
          >
            ← Volver a Informes
          </Link>
          <ShareButton label="Compartir" />
        </div>

        {/* Hero: VS section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 'var(--radius-xl)',
            padding: 'clamp(1.5rem, 4vw, 2.5rem)',
            marginBottom: '1.5rem',
            textAlign: 'center',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* Background gradient */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse at 50% 0%, rgba(255,100,100,0.06) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          {/* Faction icons */}
          {f0 && f1 && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 'clamp(1rem, 5vw, 3rem)',
              marginBottom: '1.5rem',
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                {getFactionIcon(f0) && (
                  <img
                    src={getFactionIcon(f0)}
                    alt=""
                    style={{
                      width: 'clamp(50px, 10vw, 90px)',
                      height: 'clamp(50px, 10vw, 90px)',
                      objectFit: 'contain',
                      filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.3))',
                    }}
                  />
                )}
                {report.finalScore && (
                  <span style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(2rem, 6vw, 3.5rem)',
                    fontWeight: 700,
                    color: '#fff',
                    lineHeight: 1,
                  }}>
                    {report.finalScore.player1}
                  </span>
                )}
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
                  {p1?.name || 'Jugador 1'}
                </span>
              </div>

              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.5rem, 5vw, 2.5rem)',
                fontWeight: 900,
                color: '#ff6464',
                letterSpacing: '3px',
                textShadow: '0 0 20px rgba(255,100,100,0.5)',
              }}>
                VS
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                {getFactionIcon(f1) && (
                  <img
                    src={getFactionIcon(f1)}
                    alt=""
                    style={{
                      width: 'clamp(50px, 10vw, 90px)',
                      height: 'clamp(50px, 10vw, 90px)',
                      objectFit: 'contain',
                      filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.3))',
                    }}
                  />
                )}
                {report.finalScore && (
                  <span style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(2rem, 6vw, 3.5rem)',
                    fontWeight: 700,
                    color: '#fff',
                    lineHeight: 1,
                  }}>
                    {report.finalScore.player2}
                  </span>
                )}
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
                  {p2?.name || 'Jugador 2'}
                </span>
              </div>
            </div>
          )}

          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
            color: '#fff',
            marginBottom: '1rem',
            lineHeight: 1.2,
            letterSpacing: '1px',
          }}>
            {report.title}
          </h1>

          <div style={{
            display: 'flex', gap: '1.25rem', flexWrap: 'wrap',
            justifyContent: 'center',
            color: 'rgba(255,255,255,0.4)',
            fontSize: '0.82rem',
          }}>
            {report.date && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>{new Date(report.date).toLocaleDateString('es-ES')}</span>}
            {report.mission && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>{report.mission}</span>}
            {report.points && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" y1="19" x2="19" y2="13"/><line x1="16" y1="16" x2="20" y2="20"/><line x1="19" y1="21" x2="21" y2="19"/></svg>{report.points} pts</span>}
          </div>

          {report.tags?.length > 0 && (
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '1rem' }}>
              {report.tags.map(tag => (
                <span key={tag} style={{
                  padding: '3px 10px',
                  background: 'rgba(255,100,100,0.1)',
                  border: '1px solid rgba(255,100,100,0.2)',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  color: '#ff8080',
                }}>
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {report.isFavorite && (
            <div style={{ marginTop: '1rem', color: '#ff6464', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              Favorito del Admin
            </div>
          )}

          {/* Like button */}
          {report.likes != null && (
            <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'center' }}>
              <motion.button
                onClick={() => toggleLike(report.id, 'report')}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.45rem',
                  background: userLikes.includes(report.id) ? 'rgba(255,80,80,0.12)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${userLikes.includes(report.id) ? 'rgba(255,80,80,0.3)' : 'rgba(255,255,255,0.12)'}`,
                  borderRadius: '20px', padding: '0.4rem 1rem',
                  color: userLikes.includes(report.id) ? '#ff6464' : 'rgba(255,255,255,0.45)',
                  fontSize: '0.82rem', cursor: 'pointer',
                  transition: 'all 0.2s', fontFamily: 'var(--font-body)',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill={userLikes.includes(report.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                {report.likes + (userLikes.includes(report.id) ? 1 : 0)} Me gusta
              </motion.button>
            </div>
          )}
        </motion.div>

        {/* Army lists */}
        {report.armies && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            style={{
              background: 'rgba(255,255,255,0.025)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 'var(--radius-xl)',
              padding: 'clamp(1.5rem, 4vw, 2rem)',
              marginBottom: '1.5rem',
            }}
          >
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.75rem',
              letterSpacing: '3px',
              color: '#f9cb28',
              textTransform: 'uppercase',
              marginBottom: '1.5rem',
              textAlign: 'center',
            }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" y1="19" x2="19" y2="13"/><line x1="16" y1="16" x2="20" y2="20"/><line x1="19" y1="21" x2="21" y2="19"/></svg>
                Listas de Ejército
              </span>
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {[
                { player: p1, factionId: f0 },
                { player: p2, factionId: f1 },
              ].map(({ player, factionId }, i) => player && (
                <ArmyListDisplay key={i} player={player} color={getFactionColor(factionId)} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Narrative */}
        {report.narrative?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            style={{
              background: 'rgba(255,255,255,0.025)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 'var(--radius-xl)',
              padding: 'clamp(1.5rem, 4vw, 2rem)',
              marginBottom: '1.5rem',
            }}
          >
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.75rem',
              letterSpacing: '3px',
              color: '#ff6464',
              textTransform: 'uppercase',
              marginBottom: '1.5rem',
            }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                Narrativa de Batalla
              </span>
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {report.narrative.map((entry, index) => (
                <div
                  key={index}
                  style={{
                    paddingLeft: '1.25rem',
                    borderLeft: '3px solid rgba(255,100,100,0.35)',
                  }}
                >
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                    marginBottom: '0.75rem',
                    background: 'rgba(255,100,100,0.1)',
                    border: '1px solid rgba(255,100,100,0.2)',
                    borderRadius: 'var(--radius-md)',
                    padding: '3px 10px',
                  }}>
                    <span style={{ color: '#ff8080', fontSize: '0.75rem', fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '0.5px' }}>
                      Turno {entry.turn} — {entry.phase}
                    </span>
                  </div>
                  <div
                    dangerouslySetInnerHTML={{ __html: entry.text }}
                    className="rich-content"
                    style={{
                      color: 'rgba(255,255,255,0.7)',
                      lineHeight: 1.8,
                      fontSize: '0.95rem',
                      margin: 0,
                    }}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Battle images */}
        {report.images?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{
              background: 'rgba(255,255,255,0.025)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 'var(--radius-xl)',
              padding: 'clamp(1.5rem, 4vw, 2rem)',
              marginBottom: '1.5rem',
            }}
          >
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.75rem',
              letterSpacing: '3px',
              color: 'var(--color-primary)',
              textTransform: 'uppercase',
              marginBottom: '1.25rem',
            }}>
              Imágenes de la Batalla
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(140px, 25vw, 220px), 1fr))',
              gap: '0.75rem',
            }}>
              {report.images.map((url, i) => (
                <div key={i} style={{
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,0.08)',
                  aspectRatio: '4/3',
                }}>
                  <img
                    src={url}
                    alt={`Imagen ${i + 1}`}
                    loading="lazy"
                    decoding="async"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.3s' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Key moments */}
        {report.keyMoments?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            style={{
              background: 'rgba(255,255,255,0.025)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 'var(--radius-xl)',
              padding: 'clamp(1.5rem, 4vw, 2rem)',
              marginBottom: '1.5rem',
            }}
          >
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.75rem',
              letterSpacing: '3px',
              color: '#f9cb28',
              textTransform: 'uppercase',
              marginBottom: '1.25rem',
            }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                Momentos Clave
              </span>
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {report.keyMoments.map((moment, index) => (
                <div key={index} style={{
                  display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                  background: 'rgba(255,100,100,0.07)',
                  border: '1px solid rgba(255,100,100,0.15)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '0.75rem 1rem',
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: '0.9rem',
                  lineHeight: 1.6,
                }}>
                  <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                  </span>
                  {moment}
                </div>
              ))}
            </div>

            {report.mvp && (
              <div style={{
                marginTop: '1.25rem',
                background: 'rgba(255,215,0,0.08)',
                border: '1px solid rgba(255,215,0,0.2)',
                borderRadius: 'var(--radius-lg)',
                padding: '1rem 1.25rem',
              }}>
                <h3 style={{
                  color: '#ffd700',
                  marginBottom: '0.4rem',
                  fontSize: '0.8rem',
                  letterSpacing: '2px',
                  fontFamily: 'var(--font-display)',
                }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>
                    MVP DE LA BATALLA
                  </span>
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1rem', margin: 0 }}>{report.mvp}</p>
              </div>
            )}
          </motion.div>
        )}
        {/* YouTube embed */}
        {report.youtube_url && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            style={{ marginBottom: '1.5rem' }}
          >
            <div style={{
              background: 'rgba(255,255,255,0.025)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 'var(--radius-xl)',
              padding: 'clamp(1.5rem, 4vw, 2rem)',
            }}>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.75rem',
                letterSpacing: '3px',
                color: '#ff4444',
                textTransform: 'uppercase',
                marginBottom: '1.25rem',
              }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                  Vídeo de la Batalla
                </span>
              </h2>
              <YouTubeEmbed url={report.youtube_url} />
            </div>
          </motion.div>
        )}
      </div>

      <Footer />
    </div>
  );
};

/* ── YouTube helpers ────────────────────────────────────────────── */
function getYouTubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

function YouTubeEmbed({ url }) {
  const id = getYouTubeId(url);
  if (!id) return null;
  return (
    <div style={{ position: 'relative', paddingTop: '56.25%', borderRadius: '12px', overflow: 'hidden', background: '#000' }}>
      <iframe
        src={`https://www.youtube.com/embed/${id}`}
        title="Vídeo de YouTube"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
      />
    </div>
  );
}

/* ── Export helpers ────────────────────────────────────────────── */
function buildExportText(player, parsed) {
  const lines = [];
  if (parsed) {
    lines.push(`++ ${parsed.armyName || player.name} [${
      parsed.categories.flatMap(c => c.units).reduce((s, u) => s + (u.points || 0), 0)
    }pts] ++`);
    if (parsed.detachment) lines.push(`Destacamento: ${parsed.detachment}`);
    if (parsed.listSize)   lines.push(`Tamaño: ${parsed.listSize}`);
    lines.push('');
    parsed.categories.forEach(cat => {
      if (!cat.units.length) return;
      lines.push(`== ${cat.name.toUpperCase()} ==`);
      cat.units.forEach(u => {
        lines.push(`  + ${u.name} [${u.points || 0}pts]`);
        u.unitEnhancements?.forEach(e => lines.push(`      ✦ ${e}`));
        u.models?.forEach(m => {
          if (m.name) {
            const cnt = m.count > 1 ? `${m.count}× ` : '';
            lines.push(`      · ${cnt}${m.name}`);
          }
          m.equipment?.forEach(eq => lines.push(`          - ${eq}`));
        });
      });
      lines.push('');
    });
  } else {
    lines.push(`++ ${player.name} ++`);
    lines.push('');
    player.list?.forEach(u => lines.push(`  + ${u}`));
  }
  return lines.join('\n');
}

/* ── Army list display component ──────────────────────────────── */
const ArmyListDisplay = ({ player, color }) => {
  const [openUnits, setOpenUnits] = useState({});
  const [copied, setCopied]       = useState(false);
  const toggle = (key) => setOpenUnits(s => ({ ...s, [key]: !s[key] }));

  // Try to parse the rich listText JSON; fall back to simple list
  let parsed = null;
  if (player.listText) {
    try { parsed = JSON.parse(player.listText); } catch {}
  }

  const accentColor = color && color !== '#fff' ? color : '#00d4ff';

  const handleCopy = () => {
    const text = buildExportText(player, parsed);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      // fallback: open text in new window
      const w = window.open('', '_blank');
      w.document.write(`<pre style="font-family:monospace;white-space:pre-wrap;padding:1rem">${text}</pre>`);
    });
  };

  if (!parsed) {
    // Simple list fallback
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', gap: '0.5rem' }}>
          <h3 style={{ fontSize: '1rem', color: accentColor, fontFamily: 'var(--font-display)', letterSpacing: '0.5px', margin: 0 }}>
            {player.name}
          </h3>
          <button
            onClick={handleCopy}
            title="Copiar lista (texto)"
            style={{ background: copied ? 'rgba(80,200,120,0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${copied ? 'rgba(80,200,120,0.4)' : 'rgba(255,255,255,0.12)'}`, borderRadius: '8px', color: copied ? '#50c878' : 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: '4px 10px', fontSize: '0.72rem', fontFamily: 'var(--font-display)', letterSpacing: '0.5px', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            {copied
              ? <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Copiado</>
              : <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>Copiar lista</>
            }
          </button>
        </div>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {player.list?.map((unit, idx) => (
            <li key={idx} style={{
              padding: '0.5rem 0',
              borderBottom: idx < (player.list?.length || 0) - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
              color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}>
              <span style={{ color: accentColor, fontSize: '0.7rem' }}>●</span>
              {unit}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // Rich parsed list
  const totalPts = parsed.categories.flatMap(c => c.units).reduce((s, u) => s + (u.points || 0), 0);

  return (
    <div>
      {/* Player header */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.35rem' }}>
          <h3 style={{ fontSize: '1.1rem', color: accentColor, fontFamily: 'var(--font-display)', letterSpacing: '1px', margin: 0 }}>
            {player.name}
          </h3>
          <button
            onClick={handleCopy}
            title="Copiar lista en formato texto"
            style={{ flexShrink: 0, background: copied ? 'rgba(80,200,120,0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${copied ? 'rgba(80,200,120,0.4)' : 'rgba(255,255,255,0.12)'}`, borderRadius: '8px', color: copied ? '#50c878' : 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: '4px 10px', fontSize: '0.72rem', fontFamily: 'var(--font-display)', letterSpacing: '0.5px', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            {copied
              ? <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Copiado</>
              : <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>Copiar lista</>
            }
          </button>
        </div>
        <div style={{ marginTop: '0.35rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', color: '#fff', letterSpacing: '0.5px' }}>
            {parsed.armyName}
          </span>
          {parsed.detachment && (
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', padding: '2px 8px' }}>
              {parsed.detachment}
            </span>
          )}
          {parsed.listSize && (
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', padding: '2px 8px' }}>
              {parsed.listSize}
            </span>
          )}
        </div>
        <div style={{ marginTop: '0.4rem', fontSize: '0.8rem', color: accentColor, fontWeight: 700 }}>
          {totalPts} pts
        </div>
      </div>

      {/* Categories */}
      {parsed.categories.map((cat, ci) => (
        <div key={ci} style={{ marginBottom: '1rem' }}>
          <p style={{
            fontSize: '0.65rem', letterSpacing: '2.5px', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.3)', margin: '0 0 0.4rem',
            borderBottom: '1px solid rgba(255,255,255,0.07)', paddingBottom: '0.3rem',
          }}>
            {cat.name}
          </p>
          {cat.units.map((unit, ui) => {
            const key = `${ci}-${ui}`;
            const isOpen = openUnits[key];
            const hasDetail = unit.models?.some(m => m.equipment?.length > 0 || m.enhancements?.length > 0)
              || unit.unitEnhancements?.length > 0;
            return (
              <div key={ui} style={{ marginBottom: '0.3rem' }}>
                <button
                  onClick={() => hasDetail && toggle(key)}
                  style={{
                    width: '100%', background: 'none', border: 'none', padding: '0.35rem 0',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    cursor: hasDetail ? 'pointer' : 'default', gap: '0.5rem',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', minWidth: 0 }}>
                    <span style={{ color: accentColor, fontSize: '0.65rem', flexShrink: 0 }}>●</span>
                    <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem', textAlign: 'left' }}>{unit.name}</span>
                    {unit.unitEnhancements?.length > 0 && (
                      <span style={{ fontSize: '0.65rem', color: '#f59e0b', background: 'rgba(245,158,11,0.12)', borderRadius: '4px', padding: '1px 5px', flexShrink: 0 }}>
                        Reliquia
                      </span>
                    )}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                    <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>{unit.points}pts</span>
                    {hasDetail && (
                      <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.7rem' }}>{isOpen ? '▲' : '▼'}</span>
                    )}
                  </span>
                </button>

                {/* Expanded detail */}
                {isOpen && hasDetail && (
                  <div style={{
                    padding: '0.5rem 0.75rem',
                    background: 'rgba(0,0,0,0.2)',
                    borderLeft: `2px solid ${accentColor}40`,
                    borderRadius: '0 0 6px 6px',
                    marginBottom: '0.25rem',
                    fontSize: '0.8rem',
                  }}>
                    {unit.unitEnhancements?.length > 0 && (
                      <p style={{ color: '#f59e0b', margin: '0 0 0.4rem', fontStyle: 'italic' }}>
                        ✦ {unit.unitEnhancements.join(', ')}
                      </p>
                    )}
                    {unit.models?.map((model, mi) => (
                      <div key={mi} style={{ marginBottom: '0.4rem' }}>
                        {model.name && (
                          <p style={{ color: 'rgba(255,255,255,0.55)', margin: '0 0 0.2rem', fontWeight: 600 }}>
                            {model.count > 1 ? `${model.count}× ` : ''}{model.name}
                          </p>
                        )}
                        {model.equipment?.map((eq, ei) => (
                          <p key={ei} style={{ color: 'rgba(255,255,255,0.4)', margin: '0 0 0.1rem', paddingLeft: '0.75rem' }}>
                            – {eq}
                          </p>
                        ))}
                        {model.enhancements?.map((enh, ei) => (
                          <p key={ei} style={{ color: '#f59e0b', margin: '0 0 0.1rem', paddingLeft: '0.75rem', fontStyle: 'italic' }}>
                            ✦ {enh}
                          </p>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default BattleReportDetailPage;
