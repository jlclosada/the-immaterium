import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import Header from '../components/UI/Header';
import Footer from '../components/UI/Footer';

const LorePage = () => {
    const [loreEntries, setLoreEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchLore = async () => {
            try {
                const data = await api.getLoreEntries();
                setLoreEntries(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Failed to fetch lore:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLore();
    }, []);

    const categories = [
        { value: 'all', label: 'Todas' },
        { value: 'historia', label: 'Historia' },
        { value: 'faccion', label: 'Facción' },
        { value: 'evento', label: 'Evento' },
        { value: 'personaje', label: 'Personaje' },
        { value: 'lugar', label: 'Lugar' },
        { value: 'tecnologia', label: 'Tecnología' },
        { value: 'otro', label: 'Otro' }
    ];

    const filteredEntries = loreEntries.filter(entry => {
        const matchesCategory = selectedCategory === 'all' || entry.category === selectedCategory;
        const matchesSearch = entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            entry.excerpt?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

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
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        textAlign: 'center',
                        marginBottom: '3rem'
                    }}
                >
                    <h1 style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 'clamp(2.5rem, 8vw, 4rem)',
                        textTransform: 'uppercase',
                        background: 'linear-gradient(135deg, var(--color-accent), var(--color-primary))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        marginBottom: '1rem',
                        letterSpacing: '4px'
                    }}>
                        📖 Biblioteca de Lore
                    </h1>
                    <p style={{
                        fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
                        color: 'rgba(255,255,255,0.7)',
                        maxWidth: '700px',
                        margin: '0 auto'
                    }}>
                        Fragmentos de historia del universo de Warhammer 40,000
                    </p>
                </motion.div>

                {/* Búsqueda y filtros */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-panel"
                    style={{
                        padding: 'clamp(1rem, 3vw, 2rem)',
                        marginBottom: '2rem'
                    }}
                >
                    <input
                        type="text"
                        placeholder="🔍 Buscar en el lore..."
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
                            marginBottom: '1rem'
                        }}
                    />

                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.5rem'
                    }}>
                        {categories.map(cat => (
                            <button
                                key={cat.value}
                                onClick={() => setSelectedCategory(cat.value)}
                                style={{
                                    padding: '0.5rem 1rem',
                                    background: selectedCategory === cat.value
                                        ? 'var(--color-primary)'
                                        : 'rgba(255,255,255,0.05)',
                                    border: selectedCategory === cat.value
                                        ? '1px solid var(--color-primary)'
                                        : '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '20px',
                                    color: selectedCategory === cat.value ? '#000' : 'white',
                                    fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s',
                                    fontWeight: selectedCategory === cat.value ? 'bold' : 'normal'
                                }}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Lista de entradas */}
                {filteredEntries.length > 0 ? (
                    <div style={{
                        display: 'grid',
                        gap: '1.5rem'
                    }}>
                        {filteredEntries.map((entry, index) => (
                            <Link
                                key={entry.id}
                                to={`/lore/${entry.id}`}
                                style={{ textDecoration: 'none', color: 'inherit' }}
                            >
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 * index }}
                                    className="glass-panel"
                                    style={{
                                        padding: 'clamp(1.5rem, 3vw, 2rem)',
                                        cursor: 'pointer',
                                        position: 'relative',
                                        borderLeft: entry.isFeatured ? '4px solid var(--color-accent)' : 'none',
                                        transition: 'all 0.3s ease'
                                    }}
                                    whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(0, 212, 255, 0.3)' }}
                                >
                                {entry.isFeatured && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '1rem',
                                        right: '1rem',
                                        background: 'var(--color-accent)',
                                        color: '#000',
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '12px',
                                        fontSize: '0.75rem',
                                        fontWeight: 'bold'
                                    }}>
                                        ⭐ DESTACADO
                                    </div>
                                )}

                                <div style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '0.5rem',
                                    marginBottom: '1rem'
                                }}>
                                    <span style={{
                                        background: 'rgba(0, 212, 255, 0.2)',
                                        color: 'var(--color-primary)',
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '12px',
                                        fontSize: '0.75rem',
                                        fontWeight: 'bold',
                                        textTransform: 'uppercase'
                                    }}>
                                        {entry.category}
                                    </span>
                                    {entry.relatedFaction && (
                                        <span style={{
                                            background: 'rgba(255, 215, 0, 0.2)',
                                            color: 'var(--color-accent)',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '12px',
                                            fontSize: '0.75rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.25rem'
                                        }}>
                                            {entry.relatedFaction.iconUrl && (
                                                <img
                                                    src={entry.relatedFaction.iconUrl}
                                                    alt=""
                                                    style={{
                                                        width: '14px',
                                                        height: '14px',
                                                        objectFit: 'contain'
                                                    }}
                                                />
                                            )}
                                            {entry.relatedFaction.name}
                                        </span>
                                    )}
                                </div>

                                <h2 style={{
                                    fontFamily: 'var(--font-display)',
                                    fontSize: 'clamp(1.3rem, 4vw, 1.8rem)',
                                    color: 'var(--color-primary)',
                                    marginBottom: '1rem'
                                }}>
                                    {entry.title}
                                </h2>

                                <p style={{
                                    color: 'rgba(255,255,255,0.8)',
                                    lineHeight: '1.8',
                                    fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                                    marginBottom: '1rem'
                                }}>
                                    {entry.excerpt}
                                </p>

                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    fontSize: '0.85rem',
                                    color: '#888'
                                }}>
                                    <span>Por {entry.author}</span>
                                    <span>👁️ {entry.views} vistas</span>
                                </div>
                            </motion.div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="glass-panel"
                        style={{
                            padding: '4rem 2rem',
                            textAlign: 'center',
                            color: 'rgba(255,255,255,0.5)'
                        }}
                    >
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📚</div>
                        <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.2rem)' }}>
                            No se encontraron entradas de lore
                        </p>
                    </motion.div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default LorePage;

