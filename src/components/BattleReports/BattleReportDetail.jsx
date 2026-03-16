import { motion } from 'framer-motion';
import { useStore } from '../../stores/useStore';
import { useState, useEffect } from 'react';

export default function BattleReportDetail() {
    const { selectedBattleReport, clearSelectedBattleReport, toggleLike, userLikes, incrementViews, addComment, armies } = useStore();
    const [commentText, setCommentText] = useState('');

    useEffect(() => {
        if (selectedBattleReport) {
            incrementViews(selectedBattleReport.id, 'report');
        }
    }, [selectedBattleReport]);

    if (!selectedBattleReport) {
        return null;
    }

    const isLiked = userLikes.includes(selectedBattleReport.id);

    const handleBack = () => {
        clearSelectedBattleReport();
        useStore.getState().setCurrentView('battleReports');
    };

    const handleAddComment = () => {
        if (commentText.trim()) {
            addComment(selectedBattleReport.id, 'report', commentText);
            setCommentText('');
        }
    };

    const getFactionIcon = (factionId) => {
        const army = armies.find(a => a.id === factionId);
        return army?.iconUrl || '';
    };

    const getFactionColor = (factionId) => {
        const army = armies.find(a => a.id === factionId);
        return army?.color || '#fff';
    };

    return (
        <motion.div
            className="battle-report-detail"
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
                onClick={() => {
                    clearSelectedBattleReport();
                    useStore.getState().setCurrentView('galaxy');
                }}
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

            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                {/* Back Button */}
                <motion.button
                    onClick={handleBack}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                        padding: '0.8rem 1.5rem',
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px',
                        color: '#fff',
                        cursor: 'pointer',
                        marginBottom: '2rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <span>←</span>
                    <span>Volver a Informes</span>
                </motion.button>

                {/* Header */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="glass-panel"
                    style={{ padding: '2rem', marginBottom: '2rem' }}
                >
                    {/* Faction Icons */}
                    <div style={{
                        display: 'flex',
                        gap: '1.5rem',
                        marginBottom: '1.5rem',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <img
                            src={getFactionIcon(selectedBattleReport.factions[0])}
                            alt={selectedBattleReport.factions[0]}
                            style={{
                                width: '80px',
                                height: '80px',
                                filter: 'drop-shadow(0 0 15px rgba(255,255,255,0.4))'
                            }}
                        />
                        <span style={{
                            fontSize: '3rem',
                            color: '#ff0064',
                            fontWeight: 'bold'
                        }}>VS</span>
                        <img
                            src={getFactionIcon(selectedBattleReport.factions[1])}
                            alt={selectedBattleReport.factions[1]}
                            style={{
                                width: '80px',
                                height: '80px',
                                filter: 'drop-shadow(0 0 15px rgba(255,255,255,0.4))'
                            }}
                        />
                    </div>

                    <h1 style={{
                        fontSize: '2.5rem',
                        marginBottom: '1rem',
                        color: '#fff',
                        textAlign: 'center'
                    }}>
                        {selectedBattleReport.title}
                    </h1>

                    <div style={{
                        display: 'flex',
                        gap: '2rem',
                        marginBottom: '1.5rem',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        color: '#aaa'
                    }}>
                        <span>{new Date(selectedBattleReport.date).toLocaleDateString('es-ES')}</span>
                        <span>{selectedBattleReport.mission}</span>
                        <span>{selectedBattleReport.points} pts</span>
                    </div>

                    {/* Final Score */}
                    <div style={{
                        display: 'flex',
                        gap: '1rem',
                        marginBottom: '1.5rem',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <div style={{
                            padding: '1rem 2rem',
                            background: `linear-gradient(135deg, ${getFactionColor(selectedBattleReport.factions[0])}33, ${getFactionColor(selectedBattleReport.factions[0])}11)`,
                            borderRadius: '12px',
                            fontWeight: 'bold',
                            fontSize: '1.2rem',
                            color: getFactionColor(selectedBattleReport.factions[0]),
                            border: `2px solid ${getFactionColor(selectedBattleReport.factions[0])}66`
                        }}>
                            {selectedBattleReport.armies.player1.name}: {selectedBattleReport.finalScore.player1}
                        </div>
                        <span style={{ color: '#666', fontSize: '1.5rem' }}>-</span>
                        <div style={{
                            padding: '1rem 2rem',
                            background: `linear-gradient(135deg, ${getFactionColor(selectedBattleReport.factions[1])}33, ${getFactionColor(selectedBattleReport.factions[1])}11)`,
                            borderRadius: '12px',
                            fontWeight: 'bold',
                            fontSize: '1.2rem',
                            color: getFactionColor(selectedBattleReport.factions[1]),
                            border: `2px solid ${getFactionColor(selectedBattleReport.factions[1])}66`
                        }}>
                            {selectedBattleReport.armies.player2.name}: {selectedBattleReport.finalScore.player2}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem', justifyContent: 'center' }}>
                        {selectedBattleReport.tags.map(tag => (
                            <span
                                key={tag}
                                style={{
                                    padding: '0.4rem 1rem',
                                    background: 'rgba(255,100,100,0.2)',
                                    borderRadius: '12px',
                                    fontSize: '0.9rem',
                                    color: '#ff6464'
                                }}
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>

                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', justifyContent: 'center' }}>
                        <button
                            onClick={() => toggleLike(selectedBattleReport.id, 'report')}
                            style={{
                                padding: '0.8rem 1.5rem',
                                background: isLiked ? 'rgba(255,0,100,0.3)' : 'rgba(255,255,255,0.1)',
                                border: `1px solid ${isLiked ? '#ff0064' : 'rgba(255,255,255,0.2)'}`,
                                borderRadius: '8px',
                                color: '#fff',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <span>{isLiked ? '♥' : '♡'}</span>
                            <span>{selectedBattleReport.likes}</span>
                        </button>

                    </div>
                </motion.div>

                {/* Army Lists */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="glass-panel"
                    style={{ padding: '2rem', marginBottom: '2rem' }}
                >
                    <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: '#fff', textAlign: 'center' }}>
                        Listas de Ejército
                    </h2>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        {/* Player 1 */}
                        <div>
                            <h3 style={{
                                fontSize: '1.3rem',
                                marginBottom: '1rem',
                                color: getFactionColor(selectedBattleReport.factions[0])
                            }}>
                                {selectedBattleReport.armies.player1.name}
                            </h3>
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                {selectedBattleReport.armies.player1.list.map((unit, index) => (
                                    <li
                                        key={index}
                                        style={{
                                            padding: '0.6rem 0',
                                            borderBottom: index < selectedBattleReport.armies.player1.list.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none',
                                            color: '#ddd'
                                        }}
                                    >
                                        • {unit}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Player 2 */}
                        <div>
                            <h3 style={{
                                fontSize: '1.3rem',
                                marginBottom: '1rem',
                                color: getFactionColor(selectedBattleReport.factions[1])
                            }}>
                                {selectedBattleReport.armies.player2.name}
                            </h3>
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                {selectedBattleReport.armies.player2.list.map((unit, index) => (
                                    <li
                                        key={index}
                                        style={{
                                            padding: '0.6rem 0',
                                            borderBottom: index < selectedBattleReport.armies.player2.list.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none',
                                            color: '#ddd'
                                        }}
                                    >
                                        • {unit}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </motion.div>

                {/* Battle Narrative */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="glass-panel"
                    style={{ padding: '2rem', marginBottom: '2rem' }}
                >
                    <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: '#fff' }}>
                        Narrativa de Batalla
                    </h2>

                    {selectedBattleReport.narrative.map((entry, index) => (
                        <div
                            key={index}
                            style={{
                                marginBottom: '2rem',
                                paddingBottom: '2rem',
                                borderBottom: index < selectedBattleReport.narrative.length - 1 ? '2px solid rgba(255,255,255,0.1)' : 'none'
                            }}
                        >
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                marginBottom: '1rem'
                            }}>
                                <div style={{
                                    padding: '0.5rem 1rem',
                                    background: 'linear-gradient(135deg, #ff0064, #ff6600)',
                                    borderRadius: '8px',
                                    fontWeight: 'bold',
                                    color: '#fff'
                                }}>
                                    Turno {entry.turn} - {entry.phase}
                                </div>
                            </div>
                            <p style={{ color: '#ddd', lineHeight: '1.8', fontSize: '1.05rem' }}>
                                {entry.text}
                            </p>
                        </div>
                    ))}
                </motion.div>

                {/* Key Moments */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="glass-panel"
                    style={{ padding: '2rem', marginBottom: '2rem' }}
                >
                    <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem', color: '#fff' }}>
                        Momentos Clave
                    </h2>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {selectedBattleReport.keyMoments.map((moment, index) => (
                            <li
                                key={index}
                                style={{
                                    padding: '1rem',
                                    marginBottom: '0.5rem',
                                    background: 'rgba(255,100,100,0.1)',
                                    borderLeft: '4px solid #ff6464',
                                    borderRadius: '4px',
                                    color: '#ddd'
                                }}
                            >
                                ⚡ {moment}
                            </li>
                        ))}
                    </ul>

                    <div style={{
                        marginTop: '1.5rem',
                        padding: '1rem',
                        background: 'rgba(255,215,0,0.1)',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,215,0,0.3)'
                    }}>
                        <h3 style={{ color: '#ffd700', marginBottom: '0.5rem' }}>MVP de la Batalla</h3>
                        <p style={{ color: '#ddd', fontSize: '1.1rem', margin: 0 }}>{selectedBattleReport.mvp}</p>
                    </div>
                </motion.div>

                {/* Comments Section */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="glass-panel"
                    style={{ padding: '2rem' }}
                >
                    <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: '#fff' }}>
                        Comentarios ({selectedBattleReport.comments.length})
                    </h2>

                    <div style={{ marginBottom: '2rem' }}>
                        <textarea
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Comparte tu opinión sobre esta batalla..."
                            style={{
                                width: '100%',
                                minHeight: '100px',
                                padding: '1rem',
                                borderRadius: '8px',
                                border: '1px solid rgba(255,255,255,0.2)',
                                background: 'rgba(0,0,0,0.3)',
                                color: '#fff',
                                fontSize: '1rem',
                                resize: 'vertical',
                                marginBottom: '1rem'
                            }}
                        />
                        <button
                            onClick={handleAddComment}
                            disabled={!commentText.trim()}
                            style={{
                                padding: '0.8rem 1.5rem',
                                background: commentText.trim() ? 'linear-gradient(135deg, #ff0064, #ff6600)' : 'rgba(255,255,255,0.1)',
                                border: 'none',
                                borderRadius: '8px',
                                color: commentText.trim() ? '#fff' : '#666',
                                cursor: commentText.trim() ? 'pointer' : 'not-allowed',
                                fontWeight: 'bold'
                            }}
                        >
                            Publicar Comentario
                        </button>
                    </div>

                    {selectedBattleReport.comments.map((comment) => (
                        <div
                            key={comment.id}
                            style={{
                                padding: '1rem',
                                borderBottom: '1px solid rgba(255,255,255,0.1)',
                                marginBottom: '1rem'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ fontWeight: 'bold', color: '#ff6464' }}>{comment.author}</span>
                                <span style={{ color: '#888', fontSize: '0.9rem' }}>
                                    {new Date(comment.date).toLocaleDateString('es-ES')}
                                </span>
                            </div>
                            <p style={{ color: '#ddd', margin: 0 }}>{comment.text}</p>
                        </div>
                    ))}

                    {selectedBattleReport.comments.length === 0 && (
                        <p style={{ color: '#888', textAlign: 'center', padding: '2rem 0' }}>
                            Sé el primero en comentar este informe de batalla
                        </p>
                    )}
                </motion.div>
            </div>
        </motion.div>
    );
}
