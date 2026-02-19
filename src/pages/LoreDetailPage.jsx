import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import { useStore } from '../stores/useStore';
import { useTranslation } from '../i18n/translations';
import Header from '../components/UI/Header';
import Footer from '../components/UI/Footer';

const LoreDetailPage = () => {
    const { id } = useParams();
    const [lore, setLore] = useState(null);
    const [loading, setLoading] = useState(true);
    const language = useStore(state => state.language);
    const t = useTranslation(language);

    useEffect(() => {
        const fetchLore = async () => {
            try {
                const data = await api.getLoreEntry(id);
                setLore(data);
            } catch (error) {
                console.error('Failed to fetch lore entry:', error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchLore();
        }
    }, [id]);

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                background: 'var(--color-darker)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div className="loading-spinner"></div>
                <p style={{ marginLeft: '1rem', color: 'var(--color-primary)' }}>{t('loading')}</p>
            </div>
        );
    }

    if (!lore) {
        return (
            <div style={{
                minHeight: '100vh',
                background: 'var(--color-darker)',
                padding: '4rem 2rem',
                color: 'var(--color-light)',
                textAlign: 'center'
            }}>
                <Header />
                <h1>{t('loreTitle')} {t('notFound')}</h1>
                <Link to="/lore" style={{ color: 'var(--color-primary)' }}>{t('backToLore')}</Link>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--color-darker)',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <Header />
            <div style={{
                flex: 1,
                padding: 'clamp(2rem, 4vw, 4rem) clamp(1rem, 4vw, 2rem)',
                color: 'var(--color-light)',
                maxWidth: '900px',
                margin: '0 auto',
                paddingTop: 'clamp(5rem, 10vw, 6rem)',
                width: '100%'
            }}>
                <Link
                    to="/lore"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: 'var(--color-primary)',
                        textDecoration: 'none',
                        marginBottom: '2rem',
                        fontSize: 'clamp(1rem, 2.5vw, 1.1rem)'
                    }}
                >
                    ← {t('backToLore')}
                </Link>

                {/* Header */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="glass-panel"
                    style={{ padding: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: '2rem' }}
                >
                    {lore.isFeatured && (
                        <div style={{
                            display: 'inline-block',
                            background: 'var(--color-accent)',
                            color: '#000',
                            padding: '0.4rem 1rem',
                            borderRadius: '12px',
                            fontSize: '0.8rem',
                            fontWeight: 'bold',
                            marginBottom: '1rem'
                        }}>
                            ⭐ {t('featured')}
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                        <span style={{
                            background: 'rgba(0, 212, 255, 0.2)',
                            color: 'var(--color-primary)',
                            padding: '0.3rem 0.75rem',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            textTransform: 'uppercase'
                        }}>
                            {lore.category}
                        </span>
                        {lore.relatedFaction && (
                            <span style={{
                                background: 'rgba(255, 215, 0, 0.2)',
                                color: 'var(--color-accent)',
                                padding: '0.3rem 0.75rem',
                                borderRadius: '12px',
                                fontSize: '0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                            }}>
                                {lore.relatedFaction.iconUrl && (
                                    <img
                                        src={lore.relatedFaction.iconUrl}
                                        alt=""
                                        style={{
                                            width: '14px',
                                            height: '14px',
                                            objectFit: 'contain'
                                        }}
                                    />
                                )}
                                {lore.relatedFaction.name}
                            </span>
                        )}
                    </div>

                    <h1 style={{
                        fontSize: 'clamp(1.8rem, 5vw, 3rem)',
                        marginBottom: '1rem',
                        color: '#fff',
                        fontFamily: 'var(--font-display)',
                        lineHeight: '1.2'
                    }}>
                        {lore.title}
                    </h1>

                    <div style={{
                        display: 'flex',
                        gap: 'clamp(1rem, 3vw, 2rem)',
                        marginBottom: '1.5rem',
                        flexWrap: 'wrap',
                        color: '#aaa',
                        fontSize: 'clamp(0.85rem, 2vw, 0.95rem)'
                    }}>
                        <span>✍️ {lore.author}</span>
                        <span>📅 {new Date(lore.dateCreated).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US')}</span>
                        <span>👁️ {lore.views} {t('views')}</span>
                    </div>

                    {lore.tags && lore.tags.length > 0 && (
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {lore.tags.map(tag => (
                                <span
                                    key={tag}
                                    style={{
                                        padding: '0.4rem 1rem',
                                        background: 'rgba(0,206,209,0.2)',
                                        borderRadius: '12px',
                                        fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
                                        color: '#00ced1'
                                    }}
                                >
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Content */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="glass-panel"
                    style={{ padding: 'clamp(1.5rem, 3vw, 2rem)' }}
                >
                    <div style={{
                        color: '#ddd',
                        lineHeight: '1.8',
                        fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)',
                        whiteSpace: 'pre-wrap',
                        fontFamily: 'var(--font-body)'
                    }}>
                        {lore.content}
                    </div>
                </motion.div>

                {/* Related Faction Section */}
                {lore.relatedFaction && (
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        style={{ marginTop: '2rem' }}
                    >
                        <Link
                            to={`/armies/${lore.relatedFaction.id}`}
                            style={{ textDecoration: 'none' }}
                        >
                            <div className="glass-panel" style={{
                                padding: 'clamp(1rem, 2.5vw, 1.5rem)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = 'var(--color-primary)';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}>
                                {lore.relatedFaction.iconUrl && (
                                    <img
                                        src={lore.relatedFaction.iconUrl}
                                        alt={lore.relatedFaction.name}
                                        style={{
                                            width: '40px',
                                            height: '40px',
                                            objectFit: 'contain'
                                        }}
                                    />
                                )}
                                <div>
                                    <div style={{ color: '#888', fontSize: '0.8rem' }}>
                                        {t('relatedTo')}
                                    </div>
                                    <div style={{
                                        color: 'var(--color-primary)',
                                        fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
                                        fontWeight: 'bold'
                                    }}>
                                        {lore.relatedFaction.name}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default LoreDetailPage;

