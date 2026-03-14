import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import { useStore } from '../stores/useStore';
import Header from '../components/UI/Header';
import Footer from '../components/UI/Footer';

const BattleReportDetailPage = () => {
  const { id } = useParams();
  const { armies } = useStore();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const data = await api.getBattleReport(id);
        setReport(data);
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
      <div style={{ minHeight: '100vh', background: 'var(--color-darker)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!report) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-darker)', padding: '4rem 2rem', color: 'var(--color-light)', textAlign: 'center' }}>
        <Header />
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
      <Header />

      <div style={{
        flex: 1,
        maxWidth: '1000px',
        margin: '0 auto',
        padding: 'clamp(5rem, 10vw, 6.5rem) clamp(1rem, 4vw, 2rem) clamp(2rem, 4vw, 3rem)',
        width: '100%',
      }}>
        {/* Back */}
        <Link to="/battle-reports" style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
          color: 'rgba(255,255,255,0.4)', textDecoration: 'none',
          fontSize: '0.85rem', letterSpacing: '1px', marginBottom: '2rem',
          transition: 'color 0.2s',
        }}
          onMouseEnter={e => e.currentTarget.style.color = '#f9cb28'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
        >
          ← Volver a Informes
        </Link>

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
            {report.date && <span>📅 {new Date(report.date).toLocaleDateString('es-ES')}</span>}
            {report.mission && <span>🎯 {report.mission}</span>}
            {report.points && <span>⚔️ {report.points} pts</span>}
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
            <div style={{ marginTop: '1rem', color: '#ff6464', fontSize: '0.85rem' }}>❤️ Favorito del Admin</div>
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
              ⚔️ Listas de Ejército
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
              {[
                { player: p1, factionId: f0, colorFn: getFactionColor },
                { player: p2, factionId: f1, colorFn: getFactionColor },
              ].map(({ player, factionId, colorFn }, i) => player && (
                <div key={i}>
                  <h3 style={{
                    fontSize: '1rem',
                    marginBottom: '1rem',
                    color: colorFn(factionId),
                    fontFamily: 'var(--font-display)',
                    letterSpacing: '0.5px',
                  }}>
                    {player.name}
                  </h3>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {player.list?.map((unit, idx) => (
                      <li key={idx} style={{
                        padding: '0.5rem 0',
                        borderBottom: idx < (player.list?.length || 0) - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                        color: 'rgba(255,255,255,0.6)',
                        fontSize: '0.875rem',
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                      }}>
                        <span style={{ color: colorFn(factionId), fontSize: '0.7rem' }}>●</span>
                        {unit}
                      </li>
                    ))}
                  </ul>
                </div>
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
              📜 Narrativa de Batalla
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
                  <p style={{
                    color: 'rgba(255,255,255,0.7)',
                    lineHeight: 1.8,
                    fontSize: '0.95rem',
                    margin: 0,
                  }}>
                    {entry.text}
                  </p>
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
              ⚡ Momentos Clave
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
                  <span style={{ flexShrink: 0 }}>⚡</span>
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
                  🏆 MVP DE LA BATALLA
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1rem', margin: 0 }}>{report.mvp}</p>
              </div>
            )}
          </motion.div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default BattleReportDetailPage;
