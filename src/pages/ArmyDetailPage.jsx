import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import Header from '../components/UI/Header';
import Footer from '../components/UI/Footer';

const ArmyDetailPage = () => {
    const { id } = useParams();
    const [army, setArmy] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);

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

    // Filtrar y ordenar imágenes
    const getFilteredImages = () => {
        if (!army?.images) return [];

        let filtered = army.images.filter(img =>
            img.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // Ordenar: favoritas primero
        return filtered.sort((a, b) => {
            if (a.isFavorite && !b.isFavorite) return -1;
            if (!a.isFavorite && b.isFavorite) return 1;
            return 0;
        });
    };

    const filteredImages = getFilteredImages();

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
                padding: 'clamp(1rem, 4vw, 4rem) clamp(1rem, 4vw, 2rem)',
                color: 'var(--color-light)',
                maxWidth: '1200px',
                margin: '0 auto',
                paddingTop: 'clamp(5rem, 10vw, 6rem)',
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
                        fontSize: 'clamp(0.9rem, 2vw, 1.1rem)'
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
                    style={{ padding: 'clamp(1.5rem, 4vw, 3rem)', marginBottom: '2rem' }}
                >
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 2fr',
                        gap: 'clamp(1.5rem, 4vw, 3rem)',
                        marginBottom: '2rem'
                    }}>
                        {/* Icon */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'rgba(0,0,0,0.3)',
                            borderRadius: '20px',
                            padding: 'clamp(1rem, 3vw, 2rem)',
                            minHeight: '200px'
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
                                <div style={{ fontSize: 'clamp(4rem, 10vw, 8rem)' }}>🛡️</div>
                            )}
                        </div>

                        {/* Info */}
                        <div>
                            <h1 style={{
                                fontFamily: 'var(--font-display)',
                                fontSize: 'clamp(2rem, 6vw, 3rem)',
                                marginBottom: '1rem',
                                color: 'var(--color-primary)',
                                lineHeight: '1.2'
                            }}>
                                {army.name}
                            </h1>

                            {army.planetName && (
                                <p style={{
                                    color: 'var(--color-secondary)',
                                    fontSize: 'clamp(1rem, 3vw, 1.2rem)',
                                    marginBottom: '1rem',
                                    fontStyle: 'italic'
                                }}>
                                    🪐 {army.planetName}
                                </p>
                            )}

                            <p style={{
                                color: 'rgba(255,255,255,0.8)',
                                lineHeight: '1.8',
                                fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)',
                                marginBottom: '2rem'
                            }}>
                                {army.description}
                            </p>
                        </div>
                    </div>

                    {/* Historia */}
                    {army.history && (
                        <div style={{
                            background: 'rgba(0,0,0,0.3)',
                            borderRadius: '12px',
                            padding: 'clamp(1rem, 3vw, 1.5rem)',
                            marginTop: '2rem',
                            borderLeft: '4px solid var(--color-primary)'
                        }}>
                            <h2 style={{
                                fontSize: 'clamp(1.2rem, 4vw, 1.5rem)',
                                marginBottom: '1rem',
                                color: 'var(--color-primary)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                <span>📜</span> Historia
                            </h2>
                            <p style={{
                                color: 'rgba(255,255,255,0.7)',
                                lineHeight: '1.8',
                                fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                                whiteSpace: 'pre-line'
                            }}>
                                {army.history}
                            </p>
                        </div>
                    )}
                </motion.div>

                {/* Images Gallery */}
                {army.images && army.images.length > 0 && (
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="glass-panel"
                        style={{ padding: 'clamp(1.5rem, 4vw, 2rem)', marginBottom: '2rem' }}
                    >
                        <div style={{ marginBottom: '2rem' }}>
                            <div style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: '1rem',
                                marginBottom: '1.5rem'
                            }}>
                                <h2 style={{
                                    fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                                    color: 'var(--color-primary)',
                                    fontFamily: 'var(--font-display)',
                                    margin: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    <span>🎨</span> Galería de Miniaturas
                                </h2>
                                <div style={{
                                    background: 'rgba(0, 212, 255, 0.1)',
                                    border: '1px solid rgba(0, 212, 255, 0.3)',
                                    borderRadius: '20px',
                                    padding: '0.5rem 1rem',
                                    color: 'var(--color-primary)',
                                    fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
                                    fontWeight: 'bold'
                                }}>
                                    {filteredImages.length} {filteredImages.length === 1 ? 'imagen' : 'imágenes'}
                                </div>
                            </div>

                            {/* Barra de búsqueda */}
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    placeholder="🔍 Buscar por nombre..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem',
                                        background: 'rgba(0,0,0,0.3)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '12px',
                                        color: 'white',
                                        fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                                        outline: 'none',
                                        transition: 'all 0.3s'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = 'var(--color-primary)';
                                        e.target.style.boxShadow = '0 0 0 2px rgba(0, 212, 255, 0.2)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                            </div>
                        </div>

                        {filteredImages.length > 0 ? (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                                gap: '1.5rem'
                            }}>
                                {filteredImages.map((image) => (
                                    <motion.div
                                        key={image.id}
                                        whileHover={{ scale: 1.05 }}
                                        style={{
                                            background: 'rgba(0,0,0,0.3)',
                                            borderRadius: '12px',
                                            overflow: 'hidden',
                                            cursor: 'pointer',
                                            border: image.isFavorite ? '2px solid var(--color-accent)' : '1px solid rgba(255,255,255,0.1)',
                                            position: 'relative'
                                        }}
                                        onClick={() => setSelectedImage(image)}
                                    >
                                        {image.isFavorite && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '8px',
                                                right: '8px',
                                                background: 'var(--color-accent)',
                                                borderRadius: '50%',
                                                width: '30px',
                                                height: '30px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '1rem',
                                                zIndex: 1,
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                                            }}>
                                                ⭐
                                            </div>
                                        )}
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
                                                margin: 0,
                                                fontSize: 'clamp(0.85rem, 2vw, 0.95rem)'
                                            }}>
                                                {image.name}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div style={{
                                textAlign: 'center',
                                padding: '3rem',
                                color: 'rgba(255,255,255,0.5)'
                            }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
                                <p>No se encontraron imágenes con "{searchTerm}"</p>
                            </div>
                        )}
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
                        <p style={{ fontSize: 'clamp(0.9rem, 2.5vw, 1rem)' }}>No hay miniaturas en la galería aún</p>
                    </motion.div>
                )}

                {/* Modal de imagen */}
                <AnimatePresence>
                    {selectedImage && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'rgba(0,0,0,0.95)',
                                zIndex: 1000,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '2rem'
                            }}
                            onClick={() => setSelectedImage(null)}
                        >
                            <motion.div
                                initial={{ scale: 0.9 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0.9 }}
                                style={{
                                    position: 'relative',
                                    maxWidth: '90%',
                                    maxHeight: '90%'
                                }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button
                                    onClick={() => setSelectedImage(null)}
                                    style={{
                                        position: 'absolute',
                                        top: '-15px',
                                        right: '-15px',
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        background: 'var(--color-primary)',
                                        border: 'none',
                                        color: '#000',
                                        fontSize: '1.5rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 'bold',
                                        zIndex: 1001
                                    }}
                                >
                                    ✕
                                </button>
                                <img
                                    src={selectedImage.url}
                                    alt={selectedImage.name}
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '85vh',
                                        objectFit: 'contain',
                                        borderRadius: '12px'
                                    }}
                                />
                                <div style={{
                                    background: 'rgba(0,0,0,0.8)',
                                    padding: '1rem',
                                    borderRadius: '0 0 12px 12px',
                                    textAlign: 'center',
                                    marginTop: '-4px'
                                }}>
                                    <p style={{
                                        color: 'white',
                                        margin: 0,
                                        fontSize: '1.1rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem'
                                    }}>
                                        {selectedImage.isFavorite && <span>⭐</span>}
                                        {selectedImage.name}
                                    </p>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <Footer />
        </div>
    );
};

export default ArmyDetailPage;

