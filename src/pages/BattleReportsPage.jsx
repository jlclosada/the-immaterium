import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import Header from '../components/UI/Header';
import Footer from '../components/UI/Footer';

const BattleReportsPage = () => {
    const navigate = useNavigate();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const data = await api.getBattleReports();
                setReports(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Failed to fetch reports:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, []);

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
                        background: 'linear-gradient(135deg, #ff4d4d, #f9cb28)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        margin: 0,
                        letterSpacing: '2px'
                    }}>
                        Battle Reports
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
                        {reports.length > 0 ? reports.map((report, index) => (
                            <motion.div
                                key={report.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="glass-panel"
                                style={{ padding: '2rem', cursor: 'pointer' }}
                                onClick={() => navigate(`/battle-reports/${report.id}`)}
                                whileHover={{ scale: 1.02 }}
                            >
                                <h2 style={{
                                    fontFamily: 'var(--font-display)',
                                    marginBottom: '0.5rem',
                                    color: '#f9cb28'
                                }}>
                                    {report.title}
                                </h2>
                                <div style={{
                                    display: 'flex',
                                    gap: '1rem',
                                    marginBottom: '1rem',
                                    fontSize: '0.9rem',
                                    color: '#aaa',
                                    flexWrap: 'wrap'
                                }}>
                                    <span>📅 {new Date(report.date).toLocaleDateString('es-ES')}</span>
                                    <span>🎯 {report.mission}</span>
                                    <span>⚔️ {report.points} pts</span>
                                </div>
                                {report.armies && (
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        background: 'rgba(0,0,0,0.3)',
                                        padding: '0.75rem',
                                        borderRadius: '8px',
                                        marginBottom: '1rem'
                                    }}>
                                        <span style={{ fontWeight: 'bold' }}>{report.armies.player1?.faction || report.armies.player1?.name || 'Player 1'}</span>
                                        <span style={{ fontWeight: 'bold', color: '#f9cb28' }}>VS</span>
                                        <span style={{ fontWeight: 'bold' }}>{report.armies.player2?.faction || report.armies.player2?.name || 'Player 2'}</span>
                                    </div>
                                )}
                                {report.finalScore && (
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        background: 'rgba(255,215,0,0.1)',
                                        padding: '0.5rem',
                                        borderRadius: '8px',
                                        marginBottom: '1rem',
                                        fontSize: '0.9rem'
                                    }}>
                                        <span>{report.finalScore.player1}</span>
                                        <span style={{ fontWeight: 'bold' }}>-</span>
                                        <span>{report.finalScore.player2}</span>
                                    </div>
                                )}
                                {report.tags && report.tags.length > 0 && (
                                    <div style={{
                                        display: 'flex',
                                        gap: '0.5rem',
                                        flexWrap: 'wrap',
                                        marginBottom: '1rem'
                                    }}>
                                        {report.tags.slice(0, 3).map(tag => (
                                            <span
                                                key={tag}
                                                style={{
                                                    padding: '0.2rem 0.6rem',
                                                    background: 'rgba(255,100,100,0.2)',
                                                    borderRadius: '12px',
                                                    fontSize: '0.75rem',
                                                    color: '#ff6464'
                                                }}
                                            >
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                {/* Stats removed */}
                                {
                                    report.isFavorite && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '1rem',
                                            right: '1rem',
                                            fontSize: '1.2rem',
                                            zIndex: 10
                                        }}>
                                            ❤️
                                        </div>
                                    )
                                }
                            </motion.div>
                        )) : (
                            <div className="empty-state" style={{ gridColumn: '1/-1' }}>
                                <div className="empty-state-icon">⚔️</div>
                                <div className="empty-state-text">No battle reports logged yet. The galaxy is quiet... properly.</div>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default BattleReportsPage;
