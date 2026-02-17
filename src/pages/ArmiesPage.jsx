import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import Header from '../components/UI/Header';

const ArmiesPage = () => {
    const navigate = useNavigate();
    const [armies, setArmies] = useState([]);
    const [loading, setLoading] = useState(true);

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

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--color-darker)',
            padding: '4rem 2rem',
            color: 'var(--color-light)'
        }}>
            <Header />
            <div style={{ maxWidth: '1200px', margin: '0 auto', paddingTop: '6rem' }}>
                <header style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: '3rem',
                    textAlign: 'center'
                }}>
                    <h1 style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '3rem',
                        textTransform: 'uppercase',
                        background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        margin: 0,
                        letterSpacing: '2px'
                    }}>
                        Armies of 40k
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
                        {armies.map((army, index) => (
                            <motion.div
                                key={army.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="glass-panel"
                                style={{ padding: '2rem', cursor: 'pointer' }}
                                onClick={() => navigate(`/armies/${army.id}`)}
                                whileHover={{ scale: 1.02 }}
                            >
                                <div style={{
                                    height: '200px',
                                    marginBottom: '1.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: 'rgba(0,0,0,0.3)',
                                    borderRadius: '10px',
                                    padding: '1rem'
                                }}>
                                    {army.iconUrl ? (
                                        <img src={army.iconUrl} alt={army.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                    ) : (
                                        <div style={{ fontSize: '3rem' }}>🛡️</div>
                                    )}
                                </div>
                                <h2 style={{
                                    fontFamily: 'var(--font-display)',
                                    marginBottom: '1rem',
                                    color: 'var(--color-primary)'
                                }}>
                                    {army.name}
                                </h2>
                                {army.planetName && (
                                    <p style={{
                                        color: 'var(--color-secondary)',
                                        fontSize: '0.9rem',
                                        marginBottom: '0.5rem',
                                        fontStyle: 'italic'
                                    }}>
                                        🪐 {army.planetName}
                                    </p>
                                )}
                                {/* Miniature Count */}
                                {army.images && (
                                    <div style={{
                                        color: '#aaa',
                                        fontSize: '0.85rem',
                                        marginTop: '0.5rem'
                                    }}>
                                        🖼️ {army.images.length} Miniaturas
                                    </div>
                                )}
                                <p style={{
                                    color: 'rgba(255,255,255,0.7)',
                                    lineHeight: '1.6',
                                    marginBottom: '1rem'
                                }}>
                                    {army.description}
                                </p>
                                {army.history && (
                                    <details style={{
                                        marginBottom: '1rem',
                                        color: 'rgba(255,255,255,0.6)',
                                        fontSize: '0.9rem'
                                    }}>
                                        <summary style={{
                                            cursor: 'pointer',
                                            color: 'var(--color-primary)',
                                            marginBottom: '0.5rem'
                                        }}>
                                            Ver Historia
                                        </summary>
                                        <p style={{
                                            padding: '1rem',
                                            background: 'rgba(0,0,0,0.3)',
                                            borderRadius: '8px',
                                            lineHeight: '1.6',
                                            marginTop: '0.5rem'
                                        }}>
                                            {army.history}
                                        </p>
                                    </details>
                                )}
                                {army.images && army.images.length > 0 && (
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
                                        gap: '0.5rem',
                                        marginTop: '1rem'
                                    }}>
                                        {army.images.slice(0, 4).map((image) => (
                                            <img
                                                key={image.id}
                                                src={image.url}
                                                alt={image.name}
                                                style={{
                                                    width: '100%',
                                                    aspectRatio: '1',
                                                    objectFit: 'cover',
                                                    borderRadius: '8px',
                                                    border: '1px solid rgba(255,255,255,0.1)'
                                                }}
                                            />
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ArmiesPage;
