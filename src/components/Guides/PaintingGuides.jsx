import { motion } from 'framer-motion';
import { useStore } from '../../stores/useStore';
import { useState } from 'react';

export default function PaintingGuides() {
    const { paintingGuides, setCurrentView } = useStore();
    const [selectedFaction, setSelectedFaction] = useState('all');
    const [selectedDifficulty, setSelectedDifficulty] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredGuides = paintingGuides.filter(guide => {
        const matchesFaction = selectedFaction === 'all' || guide.faction === selectedFaction;
        const matchesDifficulty = selectedDifficulty === 'all' || guide.difficulty === selectedDifficulty;
        const matchesSearch = guide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            guide.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesFaction && matchesDifficulty && matchesSearch;
    });

    const handleGuideClick = (guideId) => {
        useStore.getState().selectGuide(guideId);
        setCurrentView('guideDetail');
    };

    return (
        <motion.div
            className="guides-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                padding: '6rem 2rem 2rem',
                overflowY: 'auto',
                background: 'linear-gradient(180deg, rgba(10,10,20,0.95) 0%, rgba(5,5,15,0.98) 100%)',
                zIndex: 100
            }}
        >
            {/* Close Button */}
            <motion.button
                onClick={() => setCurrentView('galaxy')}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                style={{
                    position: 'fixed',
                    top: '1.5rem',
                    right: '1.5rem',
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)',
                    border: '2px solid rgba(255,255,255,0.3)',
                    color: '#fff',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    backdropFilter: 'blur(10px)'
                }}
            >
                ✕
            </motion.button>

            {/* Header */}
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                style={{ marginBottom: '3rem', textAlign: 'center' }}
            >
                <h1 style={{
                    fontFamily: 'Orbitron, sans-serif',
                    fontSize: '3rem',
                    background: 'linear-gradient(90deg, #00ced1, #87cefa)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '1rem'
                }}>
                    GUÍAS DE PINTURA
                </h1>
                <p style={{ color: '#aaa', fontSize: '1.1rem' }}>
                    Aprende técnicas profesionales paso a paso
                </p>
            </motion.div>

            {/* Filters */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="glass-panel"
                style={{
                    padding: '1.5rem',
                    marginBottom: '2rem',
                    display: 'flex',
                    gap: '1rem',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <input
                    type="text"
                    placeholder="Buscar guías..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        padding: '0.8rem 1.2rem',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.2)',
                        background: 'rgba(0,0,0,0.3)',
                        color: '#fff',
                        fontSize: '1rem',
                        minWidth: '250px'
                    }}
                />

                <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    style={{
                        padding: '0.8rem 1.2rem',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.2)',
                        background: 'rgba(0,0,0,0.3)',
                        color: '#fff',
                        fontSize: '1rem'
                    }}
                >
                    <option value="all">Todas las dificultades</option>
                    <option value="principiante">Principiante</option>
                    <option value="intermedio">Intermedio</option>
                    <option value="avanzado">Avanzado</option>
                </select>

                <select
                    value={selectedFaction}
                    onChange={(e) => setSelectedFaction(e.target.value)}
                    style={{
                        padding: '0.8rem 1.2rem',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.2)',
                        background: 'rgba(0,0,0,0.3)',
                        color: '#fff',
                        fontSize: '1rem'
                    }}
                >
                    <option value="all">Todas las facciones</option>
                    <option value="thousand-sons">Thousand Sons</option>
                    <option value="space-wolves">Space Wolves</option>
                    <option value="chaos-marines">Chaos Marines</option>
                    <option value="space-marines">Space Marines</option>
                </select>
            </motion.div>

            {/* Guides Grid */}
            <motion.div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                    gap: '2rem',
                    maxWidth: '1400px',
                    margin: '0 auto'
                }}
            >
                {filteredGuides.map((guide, index) => (
                    <motion.div
                        key={guide.id}
                        className="glass-panel"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                        whileHover={{ scale: 1.02, y: -5 }}
                        onClick={() => handleGuideClick(guide.id)}
                        style={{
                            cursor: 'pointer',
                            overflow: 'hidden',
                            position: 'relative'
                        }}
                    >
                        {/* Cover Image */}
                        <div style={{
                            width: '100%',
                            height: '200px',
                            overflow: 'hidden',
                            borderRadius: '12px 12px 0 0'
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

                        {/* Content */}
                        <div style={{ padding: '1.5rem' }}>
                            <h3 style={{
                                fontSize: '1.3rem',
                                marginBottom: '0.5rem',
                                color: '#fff'
                            }}>
                                {guide.title}
                            </h3>

                            <div style={{
                                display: 'flex',
                                gap: '1rem',
                                marginBottom: '1rem',
                                fontSize: '0.9rem',
                                color: '#aaa',
                                alignItems: 'center',
                                flexWrap: 'wrap'
                            }}>
                                <span>⏱️ {guide.estimatedTime}</span>
                                <span>📊 {guide.difficulty}</span>
                                {guide.faction && (
                                    <span style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.3rem'
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
                                gap: '0.5rem',
                                flexWrap: 'wrap',
                                marginBottom: '1rem'
                            }}>
                                {guide.tags.slice(0, 3).map(tag => (
                                    <span
                                        key={tag}
                                        style={{
                                            padding: '0.3rem 0.8rem',
                                            background: 'rgba(0,206,209,0.2)',
                                            borderRadius: '12px',
                                            fontSize: '0.8rem',
                                            color: '#00ced1'
                                        }}
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                paddingTop: '1rem',
                                borderTop: '1px solid rgba(255,255,255,0.1)'
                            }}>
                                <span style={{ color: '#888', fontSize: '0.9rem' }}>
                                    por {guide.author}
                                </span>
                                <div style={{ display: 'flex', gap: '1rem', color: '#aaa', fontSize: '0.9rem' }}>
                                    <span>❤️ {guide.likes}</span>
                                    <span>👁️ {guide.views}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {filteredGuides.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                        textAlign: 'center',
                        padding: '4rem 2rem',
                        color: '#888'
                    }}
                >
                    <p style={{ fontSize: '1.2rem' }}>No se encontraron guías con estos filtros</p>
                </motion.div>
            )}
        </motion.div>
    );
}
