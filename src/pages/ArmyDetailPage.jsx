import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { useStore } from '../stores/useStore';
import { useTranslation } from '../i18n/translations';
import Navbar from '../components/UI/Navbar';
import Footer from '../components/UI/Footer';
import ShareButton from '../components/UI/ShareButton';

/* ─── Related content card ─────────────────────────────────── */
const RELATED_CONFIG = {
  reports: { color: '#ff6464',                label: 'Informe de Batalla',  path: '/battle-reports', cta: 'Ver informe' },
  guides:  { color: 'var(--color-secondary)', label: 'Guía de Pintura',     path: '/guides',          cta: 'Ver guía'    },
  lore:    { color: 'var(--color-accent)',    label: 'Entrada de Lore',     path: '/lore',            cta: 'Leer lore'   },
  news:    { color: '#f59e0b',               label: 'Noticia',              path: '/news',            cta: 'Leer noticia'},
};

const RelatedCard = ({ item, type, language }) => {
  const cfg = RELATED_CONFIG[type];
  const title =
    language === 'es' && item.titleEs ? item.titleEs : item.title;
  const excerpt =
    item.summary || item.excerpt ||
    (language === 'es' && item.contentEs ? item.contentEs : item.content || item.description || '');

  return (
    <motion.div
      whileHover={{ y: -3 }}
      style={{
        background: 'rgba(255,255,255,0.025)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 'var(--radius-xl)',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.6rem',
      }}
    >
      <span style={{
        color: cfg.color,
        fontSize: '0.68rem',
        fontWeight: 700,
        fontFamily: 'var(--font-display)',
        letterSpacing: '1.5px',
        textTransform: 'uppercase',
      }}>
        {cfg.label}
      </span>
      <h3 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)',
        color: '#fff',
        lineHeight: 1.3,
        margin: 0,
      }}>
        {title}
      </h3>
      {excerpt && (
        <p style={{
          color: 'rgba(255,255,255,0.5)',
          fontSize: '0.85rem',
          lineHeight: 1.6,
          margin: 0,
          flex: 1,
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {excerpt}
        </p>
      )}
      <Link
        to={`${cfg.path}/${item.id}`}
        style={{
          color: cfg.color,
          textDecoration: 'none',
          fontSize: '0.82rem',
          fontWeight: 600,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.3rem',
          transition: 'gap 0.2s',
          alignSelf: 'flex-start',
          marginTop: '0.25rem',
        }}
        onMouseEnter={e => e.currentTarget.style.gap = '0.6rem'}
        onMouseLeave={e => e.currentTarget.style.gap = '0.3rem'}
      >
        {cfg.cta} →
      </Link>
    </motion.div>
  );
};

/* ─── Main page ─────────────────────────────────────────────── */
const ArmyDetailPage = () => {
  const { id } = useParams();
  const language = useStore(state => state.language);
  const t = useTranslation(language);
  const [army, setArmy]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [searchTerm, setSearchTerm]       = useState('');
  const [related, setRelated]     = useState({ reports: [], guides: [], lore: [], news: [] });
  const [relatedTab, setRelatedTab] = useState('reports');

  useEffect(() => {
    const fetchArmy = async () => {
      try {
        const data = await api.getArmy(id);
        setArmy(data);
        if (data?.name) document.title = `${data.name} | The Immaterium`;
        loadRelated(data);
      } catch (err) {
        console.error('Failed to fetch army:', err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchArmy();
  }, [id]);

  const loadRelated = async (armyData) => {
    const armyName = armyData.name.toLowerCase();
    const armyId   = armyData.id;

    const [reportsRes, guidesRes, loreRes, newsRes] = await Promise.allSettled([
      api.getBattleReports(),
      api.getPaintingGuides(),
      api.getLoreEntries(),
      api.getNewsArticles(),
    ]);

    const safe = (r) =>
      r.status === 'fulfilled'
        ? Array.isArray(r.value) ? r.value : (r.value?.results || [])
        : [];

    const matchesArmy = (tags = []) =>
      tags.some(tag => tag.toLowerCase().includes(armyName));

    const reports = safe(reportsRes).filter(r =>
      r.player1?.faction?.toLowerCase().includes(armyName) ||
      r.player2?.faction?.toLowerCase().includes(armyName) ||
      matchesArmy(r.factions) || matchesArmy(r.tags)
    );
    const guides = safe(guidesRes).filter(g =>
      g.faction?.id === armyId || matchesArmy(g.tags)
    );
    const lore = safe(loreRes).filter(l =>
      l.relatedFaction?.id === armyId || matchesArmy(l.tags)
    );
    const news = safe(newsRes).filter(n => matchesArmy(n.tags));

    // Auto-select the first tab that has content
    const firstWithContent = ['reports','guides','lore','news']
      .find(k => ({ reports, guides, lore, news }[k].length > 0));
    if (firstWithContent) setRelatedTab(firstWithContent);

    setRelated({ reports, guides, lore, news });
  };

  const filteredImages = (army?.images || [])
    .filter(img => img.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0));

  const name        = army ? (language === 'es' && army.nameEs        ? army.nameEs        : army.name)        : '';
  const description = army ? (language === 'es' && army.descriptionEs ? army.descriptionEs : army.description) : '';
  const history     = army ? (language === 'es' && army.historyEs     ? army.historyEs     : army.history)     : '';

  const totalRelated =
    related.reports.length + related.guides.length +
    related.lore.length    + related.news.length;

  const relatedTabs = [
    { key: 'reports', label: 'Batallas', color: '#ff6464' },
    { key: 'guides',  label: 'Pintura',  color: 'var(--color-secondary)' },
    { key: 'lore',    label: 'Lore',     color: 'var(--color-accent)' },
    { key: 'news',    label: 'Noticias', color: '#f59e0b' },
  ].filter(tab => related[tab.key].length > 0);

  /* ── Loading ── */
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

  /* ── Not found ── */
  if (!army) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-darker)', padding: '4rem 2rem', color: 'var(--color-light)', textAlign: 'center' }}>
        <Navbar />
        <h1 style={{ marginTop: '6rem', color: 'rgba(255,255,255,0.5)' }}>Ejército no encontrado</h1>
        <Link to="/armies" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>← Volver a Ejércitos</Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-darker)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* ══ HERO ══════════════════════════════════════════════════ */}
      <section style={{
        position: 'relative',
        overflow: 'hidden',
        paddingTop: 'clamp(5.5rem, 12vw, 8.5rem)',
        paddingBottom: 'clamp(3rem, 6vw, 5rem)',
      }}>
        {/* Ambient glow */}
        <div style={{
          position: 'absolute', top: '40%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(700px, 140vw)', height: 'min(700px, 140vw)',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,212,255,0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{
          maxWidth: '860px',
          margin: '0 auto',
          padding: '0 clamp(1rem, 5vw, 2rem)',
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
        }}>
          {/* Back link + share */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <Link to="/armies" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              color: 'rgba(255,255,255,0.3)', textDecoration: 'none',
              fontSize: '0.75rem', letterSpacing: '2px',
              textTransform: 'uppercase', fontFamily: 'var(--font-display)',
              transition: 'color 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--color-primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
            >
              ← Ejércitos
            </Link>
            <ShareButton label="Compartir" />
          </div>

          {/* Icon */}
          {army.iconUrl && (
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              style={{
                display: 'inline-block',
                marginBottom: '2rem',
                filter: 'drop-shadow(0 0 50px rgba(0,212,255,0.25))',
              }}
            >
              <img
                src={army.iconUrl}
                alt={name}
                style={{
                  width: 'clamp(90px, 16vw, 150px)',
                  height: 'clamp(90px, 16vw, 150px)',
                  objectFit: 'contain',
                }}
              />
            </motion.div>
          )}

          {/* Name */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.2rem, 9vw, 5.5rem)',
              color: '#fff',
              letterSpacing: 'clamp(2px, 1.5vw, 8px)',
              textTransform: 'uppercase',
              lineHeight: 1.05,
              marginBottom: '1rem',
            }}
          >
            {name}
          </motion.h1>

          {/* Planet */}
          {army.planetName && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.28 }}
              style={{
                color: 'var(--color-primary)',
                fontSize: 'clamp(0.75rem, 2vw, 0.9rem)',
                letterSpacing: '3px',
                textTransform: 'uppercase',
                fontFamily: 'var(--font-display)',
                marginBottom: '1.75rem',
                opacity: 0.75,
              }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '5px' }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              {army.planetName}
            </motion.p>
          )}

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            style={{
              color: 'rgba(255,255,255,0.55)',
              fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)',
              lineHeight: 1.85,
              maxWidth: '680px',
              margin: '0 auto 2rem',
            }}
          >
            {description}
          </motion.p>

          {/* Stats chips */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}
          >
            {army.images?.length > 0 && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                background: 'rgba(0,212,255,0.07)',
                border: '1px solid rgba(0,212,255,0.18)',
                borderRadius: 'var(--radius-full)',
                padding: '0.4rem 1rem',
                fontSize: '0.78rem',
                color: 'var(--color-primary)',
                fontFamily: 'var(--font-display)',
                letterSpacing: '1px',
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                {army.images.length} {army.images.length === 1 ? 'miniatura' : 'miniaturas'}
              </span>
            )}
            {totalRelated > 0 && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 'var(--radius-full)',
                padding: '0.4rem 1rem',
                fontSize: '0.78rem',
                color: 'rgba(255,255,255,0.4)',
                fontFamily: 'var(--font-display)',
                letterSpacing: '1px',
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                {totalRelated} contenidos relacionados
              </span>
            )}
          </motion.div>
        </div>

        {/* Bottom gradient separator */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(0,212,255,0.15) 50%, transparent 100%)',
        }} />
      </section>

      {/* ══ HISTORIA ══════════════════════════════════════════════ */}
      {history && (
        <section style={{
          maxWidth: '780px',
          margin: '0 auto',
          padding: 'clamp(3rem, 7vw, 5rem) clamp(1rem, 5vw, 2rem)',
          width: '100%',
        }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.65rem',
              letterSpacing: '4px',
              color: 'var(--color-primary)',
              textTransform: 'uppercase',
              opacity: 0.65,
              marginBottom: '0.6rem',
            }}>
              Historia
            </p>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.3rem, 4vw, 1.9rem)',
              color: '#fff',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              marginBottom: '2rem',
            }}>
              Trasfondo del Ejército
            </h2>
            <div style={{
              borderLeft: '2px solid rgba(0,212,255,0.2)',
              paddingLeft: 'clamp(1.25rem, 3vw, 2rem)',
            }}>
              <p style={{
                color: 'rgba(255,255,255,0.68)',
                lineHeight: 2,
                fontSize: 'clamp(0.9rem, 2vw, 1.025rem)',
                whiteSpace: 'pre-line',
              }}>
                {history}
              </p>
            </div>
          </motion.div>
        </section>
      )}

      {/* ══ GALERÍA ═══════════════════════════════════════════════ */}
      {filteredImages.length > 0 || (army.images?.length > 0) ? (
        <section style={{
          background: 'rgba(0,0,0,0.18)',
          borderTop: '1px solid rgba(255,255,255,0.04)',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
          padding: 'clamp(3rem, 6vw, 5rem) 0',
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 clamp(1rem, 4vw, 2rem)' }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              {/* Header */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                marginBottom: '2rem',
              }}>
                <div>
                  <p style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.65rem',
                    letterSpacing: '4px',
                    color: 'var(--color-primary)',
                    textTransform: 'uppercase',
                    opacity: 0.65,
                    marginBottom: '0.5rem',
                  }}>
                    Colección
                  </p>
                  <h2 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(1.2rem, 3vw, 1.7rem)',
                    color: '#fff',
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    margin: 0,
                  }}>
                    Galería de Miniaturas
                  </h2>
                </div>
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute', left: '0.85rem', top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'rgba(255,255,255,0.28)',
                    pointerEvents: 'none', display: 'flex',
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  </span>
                  <input
                    type="text"
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="search-bar"
                    style={{ paddingLeft: '2.2rem', width: 'min(200px, 40vw)' }}
                  />
                </div>
              </div>

              {/* Grid */}
              {filteredImages.length > 0 ? (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(130px, 18vw, 190px), 1fr))',
                  gap: 'clamp(0.5rem, 1.5vw, 0.875rem)',
                }}>
                  {filteredImages.map((image, i) => (
                    <motion.div
                      key={image.id}
                      initial={{ opacity: 0, scale: 0.92 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: Math.min(i * 0.04, 0.4) }}
                      whileHover={{ scale: 1.04, y: -3 }}
                      style={{
                        borderRadius: 'var(--radius-lg)',
                        overflow: 'hidden',
                        cursor: 'zoom-in',
                        border: image.isFavorite
                          ? '2px solid var(--color-accent)'
                          : '1px solid rgba(255,255,255,0.06)',
                        background: 'rgba(0,0,0,0.3)',
                        position: 'relative',
                      }}
                      onClick={() => setSelectedImage(image)}
                    >
                      {image.isFavorite && (
                        <div style={{
                          position: 'absolute', top: '6px', right: '6px',
                          background: 'var(--color-accent)', borderRadius: '50%',
                          width: '22px', height: '22px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.65rem', zIndex: 1,
                        }}>⭐</div>
                      )}
                      <img
                        src={image.url}
                        alt={image.name}
                        style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }}
                      />
                      <div style={{
                        padding: '0.45rem 0.6rem',
                        fontSize: '0.72rem',
                        color: 'rgba(255,255,255,0.45)',
                        textAlign: 'center',
                        background: 'rgba(0,0,0,0.25)',
                      }}>
                        {image.name}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.25)' }}>
                  Sin imágenes que coincidan con "{searchTerm}"
                </div>
              )}
            </motion.div>
          </div>
        </section>
      ) : null}

      {/* ══ CONTENIDO RELACIONADO ═════════════════════════════════ */}
      {totalRelated > 0 && (
        <section style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: 'clamp(3rem, 6vw, 5rem) clamp(1rem, 4vw, 2rem)',
          width: '100%',
        }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.65rem',
              letterSpacing: '4px',
              color: 'var(--color-primary)',
              textTransform: 'uppercase',
              opacity: 0.65,
              marginBottom: '0.6rem',
            }}>
              Descubre más
            </p>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.2rem, 3vw, 1.7rem)',
              color: '#fff',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              marginBottom: '1.5rem',
            }}>
              Contenido Relacionado
            </h2>

            {/* Tab pills */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
              {relatedTabs.map(tab => {
                const active = relatedTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setRelatedTab(tab.key)}
                    style={{
                      padding: '0.4rem 1.1rem',
                      borderRadius: 'var(--radius-full)',
                      border: `1px solid ${active ? tab.color : 'rgba(255,255,255,0.1)'}`,
                      background: active ? `${tab.color}20` : 'transparent',
                      color: active ? tab.color : 'rgba(255,255,255,0.38)',
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-display)',
                      letterSpacing: '1.5px',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {tab.label}&nbsp;
                    <span style={{ opacity: 0.55, fontSize: '0.68rem' }}>
                      ({related[tab.key].length})
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Tab content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={relatedTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '1rem',
                }}
              >
                {related[relatedTab].map(item => (
                  <RelatedCard
                    key={item.id}
                    item={item}
                    type={relatedTab}
                    language={language}
                  />
                ))}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </section>
      )}

      {/* ══ LIGHTBOX ══════════════════════════════════════════════ */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.96)',
              zIndex: 2000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem',
            }}
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.88, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.88, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedImage(null)}
                style={{
                  position: 'absolute', top: '-14px', right: '-14px',
                  width: '34px', height: '34px',
                  borderRadius: '50%',
                  background: 'var(--color-primary)',
                  border: 'none', color: '#000',
                  fontSize: '1rem', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 'bold', zIndex: 1,
                }}
              >✕</button>
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
                background: 'rgba(0,0,0,0.65)',
                padding: '0.6rem 1rem',
                textAlign: 'center',
                borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
                color: 'rgba(255,255,255,0.75)',
                fontSize: '0.875rem',
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
