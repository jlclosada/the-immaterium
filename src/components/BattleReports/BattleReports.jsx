import { motion } from 'framer-motion';
import { useStore } from '../../stores/useStore';
import { useState } from 'react';

export default function BattleReports() {
    const { battleReports, setCurrentView, armies } = useStore();
    const [selectedFaction, setSelectedFaction] = useState('all');
    const [selectedPoints, setSelectedPoints] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredReports = battleReports.filter(report => {
        const matchesFaction = selectedFaction === 'all' || report.factions.includes(selectedFaction);
        const matchesPoints = selectedPoints === 'all' || report.points.toString() === selectedPoints;
        const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesFaction && matchesPoints && matchesSearch;
    });

    const handleReportClick = (reportId) => {
        useStore.getState().selectBattleReport(reportId);
        setCurrentView('battleReportDetail');
    };

    const getFactionIcon = (factionId) => {
        const army = armies.find(a => a.id === factionId);
        return army?.iconUrl || '';
    };

    return (
        <motion.div
            className="battle-reports-container fullscreen-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
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
                    background: 'linear-gradient(90deg, #ff0064, #ff6600)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '1rem'
                }}>
                    INFORMES DE BATALLA
                </h1>
                <p style={{ color: '#aaa', fontSize: '1.1rem' }}>
                    Revive épicas batallas del universo de Warhammer 40K
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
                    placeholder="Buscar informes..."
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
                    value={selectedPoints}
                    onChange={(e) => setSelectedPoints(e.target.value)}
                    style={{
                        padding: '0.8rem 1.2rem',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.2)',
                        background: 'rgba(0,0,0,0.3)',
                        color: '#fff',
                        fontSize: '1rem'
                    }}
                >
                    <option value="all">Todos los puntos</option>
                    <option value="1000">1000 pts</option>
                    <option value="1500">1500 pts</option>
                    <option value="2000">2000 pts</option>
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
                    <option value="tyranids">Tyranids</option>
                    <option value="space-marines">Space Marines</option>
                </select>
            </motion.div>

            {/* Reports Timeline */}
            <motion.div
                style={{
                    maxWidth: '1000px',
                    margin: '0 auto'
                }}
            >
                {filteredReports.map((report, index) => (
                    <motion.div
                        key={report.id}
                        className="glass-panel"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        whileHover={{ scale: 1.01, x: 5 }}
                        onClick={() => handleReportClick(report.id)}
                        style={{
                            cursor: 'pointer',
                            padding: '2rem',
                            marginBottom: '2rem',
                            position: 'relative'
                        }}
                    >
                        {/* Faction Icons */}
                        <div style={{
                            display: 'flex',
                            gap: '1rem',
                            marginBottom: '1rem',
                            alignItems: 'center'
                        }}>
                            {report.factions.map(factionId => (
                                <img
                                    key={factionId}
                                    src={getFactionIcon(factionId)}
                                    alt={factionId}
                                    style={{
                                        width: '50px',
                                        height: '50px',
                                        filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.3))'
                                    }}
                                />
                            ))}
                            <span style={{
                                fontSize: '2rem',
                                color: '#ff0064',
                                fontWeight: 'bold'
                            }}>VS</span>
                        </div>

                        {/* Title */}
                        <h2 style={{
                            fontSize: '1.8rem',
                            marginBottom: '1rem',
                            color: '#fff'
                        }}>
                            {report.title}
                        </h2>

                        {/* Meta Info */}
                        <div style={{
                            display: 'flex',
                            gap: '2rem',
                            marginBottom: '1rem',
                            flexWrap: 'wrap',
                            color: '#aaa',
                            fontSize: '0.95rem'
                        }}>
                            <span>{new Date(report.date).toLocaleDateString('es-ES')}</span>
                            <span>{report.mission}</span>
                            <span>{report.points} pts</span>
                            {report.mvp && <span>MVP: {report.mvp}</span>}
                        </div>

                        {/* Score */}
                        <div style={{
                            display: 'flex',
                            gap: '1rem',
                            marginBottom: '1rem',
                            alignItems: 'center'
                        }}>
                            <div style={{
                                padding: '0.5rem 1rem',
                                background: 'rgba(0,206,209,0.2)',
                                borderRadius: '8px',
                                fontWeight: 'bold',
                                color: '#00ced1'
                            }}>
                                {report.armies.player1.name}: {report.finalScore.player1}
                            </div>
                            <span style={{ color: '#666' }}>-</span>
                            <div style={{
                                padding: '0.5rem 1rem',
                                background: 'rgba(255,100,100,0.2)',
                                borderRadius: '8px',
                                fontWeight: 'bold',
                                color: '#ff6464'
                            }}>
                                {report.armies.player2.name}: {report.finalScore.player2}
                            </div>
                        </div>

                        {/* Tags */}
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                            {report.tags.map(tag => (
                                <span
                                    key={tag}
                                    style={{
                                        padding: '0.3rem 0.8rem',
                                        background: 'rgba(255,100,100,0.2)',
                                        borderRadius: '12px',
                                        fontSize: '0.8rem',
                                        color: '#ff6464'
                                    }}
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>

                        {/* Social Stats - REMOVED */}

                        {report.isFavorite && (
                            <div style={{
                                position: 'absolute',
                                top: '20px',
                                right: '20px',
                                fontSize: '1.5rem',
                                filter: 'drop-shadow(0 0 10px #ff0064)'
                            }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none" style={{ color: '#ff6464', filter: 'drop-shadow(0 0 10px #ff0064)' }}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                            </div>
                        )}
                    </motion.div>
                ))}
            </motion.div>

            {filteredReports.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                        textAlign: 'center',
                        padding: '4rem 2rem',
                        color: '#888'
                    }}
                >
                    <p style={{ fontSize: '1.2rem' }}>No se encontraron informes con estos filtros</p>
                </motion.div>
            )}
        </motion.div>
    );
}
