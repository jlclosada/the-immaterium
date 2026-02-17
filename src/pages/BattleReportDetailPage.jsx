import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import { useStore } from '../stores/useStore';
import Header from '../components/UI/Header';

const BattleReportDetailPage = () => {
    const { id } = useParams();
    const { toggleLike, userLikes, incrementViews, addComment, armies } = useStore();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [commentText, setCommentText] = useState('');

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const data = await api.getBattleReport(id);
                setReport(data);
                incrementViews(id, 'report');
            } catch (error) {
                console.error('Failed to fetch battle report:', error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchReport();
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

    if (!report) {
        return (
            <div style={{
                minHeight: '100vh',
                background: 'var(--color-darker)',
                padding: '4rem 2rem',
                color: 'var(--color-light)',
                textAlign: 'center'
            }}>
                <h1>Informe de batalla no encontrado</h1>
                <Link to="/battle-reports" style={{ color: 'var(--color-primary)' }}>Volver a Informes</Link>
            </div>
        );
    }

    const isLiked = userLikes.includes(report.id);

    const handleAddComment = () => {
        if (commentText.trim()) {
            addComment(report.id, 'report', commentText);
            setCommentText('');
            // Refresh report to show new comment
            api.getBattleReport(id).then(setReport);
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
        <div style={{
            minHeight: '100vh',
            background: 'var(--color-darker)',
            padding: '4rem 2rem',
            color: 'var(--color-light)'
        }}>
            <Header />
            <div style={{ maxWidth: '1000px', margin: '0 auto', paddingTop: '6rem' }}>
                <Link
                    to="/battle-reports"
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
                    ← Volver a Informes
                </Link>

                {/* Header */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="glass-panel"
                    style={{ padding: '2rem', marginBottom: '2rem' }}
                >
                    {/* Faction Icons */}
                    {report.factions && report.factions.length >= 2 && (
                        <div style={{
                            display: 'flex',
                            gap: '1.5rem',
                            marginBottom: '1.5rem',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <img
                                src={getFactionIcon(report.factions[0])}
                                alt={report.factions[0]}
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
                                src={getFactionIcon(report.factions[1])}
                                alt={report.factions[1]}
                                style={{
                                    width: '80px',
                                    height: '80px',
                                    filter: 'drop-shadow(0 0 15px rgba(255,255,255,0.4))'
                                }}
                            />
                        </div>
                    )}

                    <h1 style={{
                        fontSize: '2.5rem',
                        marginBottom: '1rem',
                        color: '#fff',
                        textAlign: 'center'
                    }}>
                        {report.title}
                    </h1>

                    <div style={{
                        display: 'flex',
                        gap: '2rem',
                        marginBottom: '1.5rem',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        color: '#aaa'
                    }}>
                        <span>📅 {new Date(report.date).toLocaleDateString('es-ES')}</span>
                        <span>🎯 {report.mission}</span>
                        <span>⚔️ {report.points} pts</span>
                    </div>

                    {/* Final Score */}
                    {report.finalScore && report.armies && (
                        <div style={{
                            display: 'flex',
                            gap: '1rem',
                            marginBottom: '1.5rem',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <div style={{
                                padding: '1rem 2rem',
                                background: `linear-gradient(135deg, ${getFactionColor(report.factions?.[0])}33, ${getFactionColor(report.factions?.[0])}11)`,
                                borderRadius: '12px',
                                fontWeight: 'bold',
                                fontSize: '1.2rem',
                                color: getFactionColor(report.factions?.[0]),
                                border: `2px solid ${getFactionColor(report.factions?.[0])}66`
                            }}>
                                {report.armies.player1?.name}: {report.finalScore.player1}
                            </div>
                            <span style={{ color: '#666', fontSize: '1.5rem' }}>-</span>
                            <div style={{
                                padding: '1rem 2rem',
                                background: `linear-gradient(135deg, ${getFactionColor(report.factions?.[1])}33, ${getFactionColor(report.factions?.[1])}11)`,
                                borderRadius: '12px',
                                fontWeight: 'bold',
                                fontSize: '1.2rem',
                                color: getFactionColor(report.factions?.[1]),
                                border: `2px solid ${getFactionColor(report.factions?.[1])}66`
                            }}>
                                {report.armies.player2?.name}: {report.finalScore.player2}
                            </div>
                        </div>
                    )}

                    {report.tags && report.tags.length > 0 && (
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem', justifyContent: 'center' }}>
                            {report.tags.map(tag => (
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
                    )}

                    {/* Social buttons removed */}
                    {report.isFavorite && <span style={{ fontSize: '1.5rem' }}>❤️ Favorito del Admin</span>}
            </div>
        </motion.div>

                {/* Army Lists */ }
    {
        report.armies && (
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
                            color: getFactionColor(report.factions?.[0])
                        }}>
                            {report.armies.player1?.name}
                        </h3>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {report.armies.player1?.list?.map((unit, index) => (
                                <li
                                    key={index}
                                    style={{
                                        padding: '0.6rem 0',
                                        borderBottom: index < (report.armies.player1?.list?.length || 0) - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none',
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
                            color: getFactionColor(report.factions?.[1])
                        }}>
                            {report.armies.player2?.name}
                        </h3>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {report.armies.player2?.list?.map((unit, index) => (
                                <li
                                    key={index}
                                    style={{
                                        padding: '0.6rem 0',
                                        borderBottom: index < (report.armies.player2?.list?.length || 0) - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none',
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
        )
    }

    {/* Battle Narrative */ }
    {
        report.narrative && report.narrative.length > 0 && (
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

                {report.narrative.map((entry, index) => (
                    <div
                        key={index}
                        style={{
                            marginBottom: '2rem',
                            paddingBottom: '2rem',
                            borderBottom: index < report.narrative.length - 1 ? '2px solid rgba(255,255,255,0.1)' : 'none'
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
        )
    }

    {/* Key Moments */ }
    {
        report.keyMoments && report.keyMoments.length > 0 && (
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
                    {report.keyMoments.map((moment, index) => (
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

                {report.mvp && (
                    <div style={{
                        marginTop: '1.5rem',
                        padding: '1rem',
                        background: 'rgba(255,215,0,0.1)',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,215,0,0.3)'
                    }}>
                        <h3 style={{ color: '#ffd700', marginBottom: '0.5rem' }}>🏆 MVP de la Batalla</h3>
                        <p style={{ color: '#ddd', fontSize: '1.1rem', margin: 0 }}>{report.mvp}</p>
                    </div>
                )}
            </motion.div>
        )
    }

    {/* Stats Removed */ }
        </div >
        </div >
    );
};

export default BattleReportDetailPage;

