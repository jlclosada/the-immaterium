import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../../services/api';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        armies: 0,
        guides: 0,
        reports: 0,
        totalLikes: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const [armies, guides, reports] = await Promise.all([
                api.getArmies(),
                api.getPaintingGuides(),
                api.getBattleReports()
            ]);

            const armiesList = Array.isArray(armies) ? armies : (armies.results || []);
            const guidesList = Array.isArray(guides) ? guides : (guides.results || []);
            const reportsList = Array.isArray(reports) ? reports : (reports.results || []);

            const totalLikes = [
                ...guidesList.map(g => g.likes || 0),
                ...reportsList.map(r => r.likes || 0)
            ].reduce((a, b) => a + b, 0);

            setStats({
                armies: armiesList.length,
                guides: guidesList.length,
                reports: reportsList.length,
                totalLikes,
            });
        } catch (error) {
            console.error('Failed to load stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            title: 'Ejércitos',
            value: stats.armies,
            icon: <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
            color: 'var(--color-primary)',
            link: '/admin/armies'
        },
        {
            title: 'Guías de Pintura',
            value: stats.guides,
            icon: <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18.37 2.63 14 7l-1.59-1.59a2 2 0 0 0-2.82 0L8 7l9 9 1.59-1.59a2 2 0 0 0 0-2.82L17 10l4.37-4.37a2.12 2.12 0 1 0-3-3z"/><path d="M9 8c-2 3-4 3.5-7 4l8 10c2-1 6-5 6-7"/><path d="M14.5 17.5 4.5 15"/></svg>,
            color: 'var(--color-secondary)',
            link: '/admin/guides'
        },
        {
            title: 'Informes de Batalla',
            value: stats.reports,
            icon: <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" y1="19" x2="19" y2="13"/><line x1="16" y1="16" x2="20" y2="20"/><line x1="19" y1="21" x2="21" y2="19"/></svg>,
            color: '#ff0064',
            link: '/admin/reports'
        },
        {
            title: 'Total Likes',
            value: stats.totalLikes,
            icon: <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
            color: '#ff6464',
            link: null
        },
    ];

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
            >
                <h1 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '3rem',
                    marginBottom: '1rem',
                    background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    Panel de Administración
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.2rem', marginBottom: '3rem' }}>
                    Gestiona todo el contenido de Warhammer Galaxy desde aquí
                </p>
            </motion.div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '2rem',
                marginBottom: '3rem'
            }}>
                {statCards.map((card, index) => {
                    const content = (
                        <motion.div
                            key={card.title}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="glass-panel"
                            style={{
                                padding: '2rem',
                                cursor: card.link ? 'pointer' : 'default',
                                border: `2px solid ${card.color}33`,
                                transition: 'all 0.3s ease'
                            }}
                            whileHover={card.link ? { scale: 1.05, borderColor: card.color } : {}}
                            onClick={card.link ? () => window.location.href = card.link : undefined}
                        >
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: '1rem'
                            }}>
                                <span style={{ display: 'flex', opacity: 0.9 }}>{card.icon}</span>
                                {card.link && (
                                    <span style={{ color: card.color, fontSize: '1.5rem' }}>→</span>
                                )}
                            </div>
                            <h3 style={{
                                fontSize: '2.5rem',
                                margin: '0.5rem 0',
                                color: card.color,
                                fontFamily: 'var(--font-display)'
                            }}>
                                {card.value}
                            </h3>
                            <p style={{
                                color: 'rgba(255,255,255,0.7)',
                                margin: 0,
                                fontSize: '1.1rem'
                            }}>
                                {card.title}
                            </p>
                        </motion.div>
                    );

                    return card.link ? (
                        <Link key={card.title} to={card.link} style={{ textDecoration: 'none' }}>
                            {content}
                        </Link>
                    ) : content;
                })}
            </div>

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="glass-panel"
                style={{ padding: '2rem' }}
            >
                <h2 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.8rem',
                    marginBottom: '1.5rem',
                    color: 'var(--color-primary)'
                }}>
                    Acciones Rápidas
                </h2>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem'
                }}>
                    <Link to="/admin/armies" style={{ textDecoration: 'none' }}>
                        <button style={{
                            width: '100%',
                            padding: '1rem',
                            background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                            border: 'none',
                            borderRadius: '12px',
                            color: 'var(--color-light)',
                            fontFamily: 'var(--font-display)',
                            fontSize: '1rem',
                            cursor: 'pointer',
                            transition: 'transform 0.2s'
                        }}
                            onMouseEnter={e => e.target.style.transform = 'translateY(-2px)'}
                            onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
                        >
                            Nuevo Ejército
                        </button>
                    </Link>
                    <Link to="/admin/guides" style={{ textDecoration: 'none' }}>
                        <button style={{
                            width: '100%',
                            padding: '1rem',
                            background: 'linear-gradient(135deg, var(--color-secondary), #ff0064)',
                            border: 'none',
                            borderRadius: '12px',
                            color: 'var(--color-light)',
                            fontFamily: 'var(--font-display)',
                            fontSize: '1rem',
                            cursor: 'pointer',
                            transition: 'transform 0.2s'
                        }}
                            onMouseEnter={e => e.target.style.transform = 'translateY(-2px)'}
                            onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
                        >
                            Nueva Guía
                        </button>
                    </Link>
                    <Link to="/admin/reports" style={{ textDecoration: 'none' }}>
                        <button style={{
                            width: '100%',
                            padding: '1rem',
                            background: 'linear-gradient(135deg, #ff0064, #ff6600)',
                            border: 'none',
                            borderRadius: '12px',
                            color: 'var(--color-light)',
                            fontFamily: 'var(--font-display)',
                            fontSize: '1rem',
                            cursor: 'pointer',
                            transition: 'transform 0.2s'
                        }}
                            onMouseEnter={e => e.target.style.transform = 'translateY(-2px)'}
                            onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
                        >
                            Nuevo Informe
                        </button>
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default AdminDashboard;
