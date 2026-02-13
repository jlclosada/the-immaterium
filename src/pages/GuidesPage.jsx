import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const GuidesPage = () => {
    const navigate = useNavigate();
    const [guides, setGuides] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGuides = async () => {
            try {
                const data = await api.getPaintingGuides();
                setGuides(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Failed to fetch guides:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchGuides();
    }, []);

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--color-darker)',
            padding: '4rem 2rem',
            color: 'var(--color-light)'
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <header style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '3rem'
                }}>
                    <Link to="/" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: 'var(--color-primary)',
                        textDecoration: 'none',
                        fontFamily: 'var(--font-display)',
                        fontSize: '1.2rem'
                    }}>
                        ← Back to Home
                    </Link>
                    <h1 style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '2.5rem',
                        textTransform: 'uppercase',
                        background: 'linear-gradient(135deg, var(--color-secondary), var(--color-primary))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        margin: 0
                    }}>
                        Painting Guides
                    </h1>
                </header>

                {loading ? (
                    <div className="loading-spinner" style={{ margin: '5rem auto' }}></div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '2rem'
                    }}>
                        {guides.length > 0 ? guides.map((guide, index) => (
                            <motion.div
                                key={guide.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="glass-panel"
                                style={{ padding: '2rem', cursor: 'pointer' }}
                                onClick={() => navigate(`/guides/${guide.id}`)}
                                whileHover={{ scale: 1.02 }}
                            >
                                {guide.coverImage && (
                                    <div style={{
                                        width: '100%',
                                        height: '150px',
                                        marginBottom: '1rem',
                                        borderRadius: '8px',
                                        overflow: 'hidden'
                                    }}>
                                        <img 
                                            src={guide.coverImage} 
                                            alt={guide.title}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover'
                                            }}
                                        />
                                    </div>
                                )}
                                <h2 style={{
                                    fontFamily: 'var(--font-display)',
                                    marginBottom: '0.5rem',
                                    color: 'var(--color-secondary)'
                                }}>
                                    {guide.title}
                                </h2>
                                <div style={{
                                    display: 'flex',
                                    gap: '0.5rem',
                                    flexWrap: 'wrap',
                                    marginBottom: '1rem'
                                }}>
                                    <span style={{
                                        display: 'inline-block',
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '20px',
                                        background: 'rgba(255, 0, 255, 0.1)',
                                        color: 'var(--color-secondary)',
                                        fontSize: '0.8rem',
                                        border: '1px solid currentColor'
                                    }}>
                                        {guide.difficulty}
                                    </span>
                                    {guide.faction && (
                                        <span style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.3rem',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '20px',
                                            background: 'rgba(0, 206, 209, 0.1)',
                                            color: '#00ced1',
                                            fontSize: '0.8rem',
                                            border: '1px solid rgba(0, 206, 209, 0.3)'
                                        }}>
                                            <img 
                                                src={guide.faction.iconUrl} 
                                                alt={guide.faction.name}
                                                style={{
                                                    width: '16px',
                                                    height: '16px',
                                                    objectFit: 'contain'
                                                }}
                                            />
                                            {guide.faction.name}
                                        </span>
                                    )}
                                </div>
                                <div style={{
                                    display: 'flex',
                                    gap: '1rem',
                                    marginBottom: '1rem',
                                    fontSize: '0.9rem',
                                    color: '#aaa'
                                }}>
                                    <span>⏱️ {guide.estimatedTime}</span>
                                    <span>👁️ {guide.views} vistas</span>
                                    <span>❤️ {guide.likes}</span>
                                </div>
                                {guide.tags && guide.tags.length > 0 && (
                                    <div style={{
                                        display: 'flex',
                                        gap: '0.5rem',
                                        flexWrap: 'wrap',
                                        marginTop: '1rem'
                                    }}>
                                        {guide.tags.slice(0, 3).map(tag => (
                                            <span
                                                key={tag}
                                                style={{
                                                    padding: '0.2rem 0.6rem',
                                                    background: 'rgba(255,255,255,0.1)',
                                                    borderRadius: '12px',
                                                    fontSize: '0.75rem',
                                                    color: '#aaa'
                                                }}
                                            >
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )) : (
                            <div className="empty-state" style={{ gridColumn: '1/-1' }}>
                                <div className="empty-state-icon">🎨</div>
                                <div className="empty-state-text">No guides available yet. Check back soon!</div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default GuidesPage;
