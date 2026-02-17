import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import Header from '../components/UI/Header';
import Footer from '../components/UI/Footer';

const ArmyDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [army, setArmy] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArmy = async () => {
            try {
                const data = await api.getArmy(id);
                setArmy(data);
            } catch (error) {
                console.error('Failed to fetch army:', error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchArmy();
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
            </div>
        );
    }

    if (!army) {
        return (
            <div style={{
                minHeight: '100vh',
                background: 'var(--color-darker)',
                padding: '4rem 2rem',
                color: 'var(--color-light)',
                textAlign: 'center'
            }}>
                <h1>Ejército no encontrado</h1>
                <Link to="/armies" style={{ color: 'var(--color-primary)' }}>Volver a Ejércitos</Link>
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
                padding: '4rem 2rem',
                color: 'var(--color-light)',
                maxWidth: '1200px',
                margin: '0 auto',
                paddingTop: '6rem',
                width: '100%'
            }}>
                <Link
                    to="/armies"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: 'var(--color-primary)',
                        textDecoration: 'none',
                        marginBottom: '2rem',
                        fontSize: '1.1rem'
                    }}
                >
                    ← Volver a Ejércitos
                </Link>

                {/* Main Content */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="glass-panel"
                    style={{ padding: '3rem', marginBottom: '2rem' }}
                >
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 2fr',
                        gap: '3rem',
                        marginBottom: '2rem'
                    }}>
                        {/* Icon */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'rgba(0,0,0,0.3)',
                            borderRadius: '20px',
                            padding: '2rem'
                        }}>
                            {army.iconUrl ? (
                                <img
                                    src={army.iconUrl}
                                    alt={army.name}
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '300px',
                                        objectFit: 'contain'
                                    }}
                                />
                            ) : (
                                <div style={{ fontSize: '8rem' }}>🛡️</div>
                            )}
                        </div>

                        {/* Info */}
                        <div>
                            <h1 style={{
                                fontFamily: 'var(--font-display)',
                                fontSize: '3rem',
                                marginBottom: '1rem',
                                color: 'var(--color-primary)'
                            }}>
                                {army.name}
                            </h1>

                            {army.planetName && (
                                <p style={{
                                    color: 'var(--color-secondary)',
                                    fontSize: '1.2rem',
                                    marginBottom: '1rem',
                                    fontStyle: 'italic'
                                }}>
                                    🪐 {army.planetName}
                                </p>
                            )}

                            <p style={{
                                color: 'rgba(255,255,255,0.8)',
                                lineHeight: '1.8',
                                fontSize: '1.1rem',
                                marginBottom: '2rem'
                            }}>
                                {army.description}
                            </p>

                            {army.history && (
                                <div style={{
                                    background: 'rgba(0,0,0,0.3)',
                                    borderRadius: '12px',
                                    padding: '1.5rem',
                                    marginTop: '2rem'
                                }}>
                                    <h2 style={{
                                        fontSize: '1.5rem',
                                        marginBottom: '1rem',
                                        color: 'var(--color-primary)'
                                    }}>
                                        Historia
                                    </h2>
                                    <p style={{
                                        color: 'rgba(255,255,255,0.7)',
                                        lineHeight: '1.8',
                                        fontSize: '1rem'
                                    }}>
                                        {army.history}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Images Gallery */}
                {army.images && army.images.length > 0 && (
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="glass-panel"
                        style={{ padding: '2rem', marginBottom: '2rem' }}
                    >
                        <h2 style={{
                            fontSize: '2rem',
                            marginBottom: '2rem',
                            color: 'var(--color-primary)',
                            fontFamily: 'var(--font-display)'
                        }}>
                            Galería de Miniaturas
                        </h2>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                            gap: '1.5rem'
                        }}>
                            {army.images.map((image) => (
                                <motion.div
                                    key={image.id}
                                    whileHover={{ scale: 1.05 }}
                                    style={{
                                        background: 'rgba(0,0,0,0.3)',
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <img
                                        src={image.url}
                                        alt={image.name}
                                        style={{
                                            width: '100%',
                                            aspectRatio: '1',
                                            objectFit: 'cover'
                                        }}
                                    />
                                    <div style={{
                                        padding: '1rem',
                                        textAlign: 'center'
                                    }}>
                                        <p style={{
                                            color: 'rgba(255,255,255,0.8)',
                                            margin: 0
                                        }}>
                                            {image.name}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {(!army.images || army.images.length === 0) && (
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="glass-panel"
                        style={{
                            padding: '3rem',
                            textAlign: 'center',
                            color: 'rgba(255,255,255,0.5)'
                        }}
                    >
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎨</div>
                        <p>No hay miniaturas en la galería aún</p>
                    </motion.div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default ArmyDetailPage;

