import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../../services/api';
import { useStore } from '../../stores/useStore';

const AdminDashboard = () => {
    const { token } = useStore();
    const [stats, setStats] = useState({
        armies: 0,
        guides: 0,
        reports: 0,
        lore: 0,
        news: 0,
        users: 0,
        listings: 0,
        purchaseRequests: 0,
    });
    const [engagement, setEngagement] = useState({ totalViews: 0, totalLikes: 0 });
    const [topContent, setTopContent] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        const results = await Promise.allSettled([
            api.getArmies(),
            api.getPaintingGuides(),
            api.getBattleReports(),
            api.getLoreEntries(),
            api.getNewsArticles(),
            api.getUsers(token),
            api.getListings(),
            api.getPurchaseRequests(token),
        ]);

        const safeLen = (res) => {
            if (res.status !== 'fulfilled') return 0;
            const d = res.value;
            return Array.isArray(d) ? d.length : (d?.results?.length ?? 0);
        };
        const safeArr = (res) => {
            if (res.status !== 'fulfilled') return [];
            const d = res.value;
            return Array.isArray(d) ? d : (d?.results ?? []);
        };

        setStats({
            armies: safeLen(results[0]),
            guides: safeLen(results[1]),
            reports: safeLen(results[2]),
            lore: safeLen(results[3]),
            news: safeLen(results[4]),
            users: safeLen(results[5]),
            listings: safeLen(results[6]),
            purchaseRequests: safeLen(results[7]),
        });

        // Compute engagement totals and top content from content that has views/likes
        const CONTENT_TYPES = [
            { arr: safeArr(results[1]), type: 'guide',  label: 'Guía',    route: '/guides',        color: 'var(--color-secondary)' },
            { arr: safeArr(results[2]), type: 'report', label: 'Batalla', route: '/battle-reports', color: '#ff6464' },
            { arr: safeArr(results[3]), type: 'lore',   label: 'Lore',    route: '/lore',           color: '#a855f7' },
            { arr: safeArr(results[4]), type: 'news',   label: 'Noticia', route: '/news',            color: '#f59e0b' },
        ];

        let totalViews = 0, totalLikes = 0;
        const allItems = [];
        for (const { arr, type, label, route, color } of CONTENT_TYPES) {
            for (const item of arr) {
                totalViews += item.views || 0;
                totalLikes += item.likes || 0;
                if (item.views || item.likes) {
                    allItems.push({ id: item.id, title: item.title, views: item.views || 0, likes: item.likes || 0, type, label, route, color });
                }
            }
        }
        allItems.sort((a, b) => (b.views + b.likes * 2) - (a.views + a.likes * 2));
        setEngagement({ totalViews, totalLikes });
        setTopContent(allItems.slice(0, 6));
        setLoading(false);
    };

    const statCards = [
        {
            title: 'Ejércitos',
            value: stats.armies,
            icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
            color: 'var(--color-primary)',
            link: '/admin/armies',
        },
        {
            title: 'Guías de Pintura',
            value: stats.guides,
            icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18.37 2.63 14 7l-1.59-1.59a2 2 0 0 0-2.82 0L8 7l9 9 1.59-1.59a2 2 0 0 0 0-2.82L17 10l4.37-4.37a2.12 2.12 0 1 0-3-3z"/><path d="M9 8c-2 3-4 3.5-7 4l8 10c2-1 6-5 6-7"/></svg>,
            color: 'var(--color-secondary)',
            link: '/admin/guides',
        },
        {
            title: 'Informes de Batalla',
            value: stats.reports,
            icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" y1="19" x2="19" y2="13"/><line x1="16" y1="16" x2="20" y2="20"/><line x1="19" y1="21" x2="21" y2="19"/></svg>,
            color: '#ff0064',
            link: '/admin/reports',
        },
        {
            title: 'Entradas de Lore',
            value: stats.lore,
            icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
            color: '#a855f7',
            link: '/admin/lore',
        },
        {
            title: 'Noticias',
            value: stats.news,
            icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a4 4 0 0 1-4 4z"/><path d="M8 6h12"/><path d="M8 10h12"/><path d="M8 14h8"/></svg>,
            color: '#f59e0b',
            link: '/admin/news',
        },
        {
            title: 'Usuarios',
            value: stats.users,
            icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
            color: '#6366f1',
            link: '/admin/users',
        },
        {
            title: 'Marketplace',
            value: stats.listings,
            icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
            color: '#10b981',
            link: '/admin/marketplace',
        },
        {
            title: 'Solicitudes de Compra',
            value: stats.purchaseRequests,
            icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
            color: '#ec4899',
            link: '/admin/marketplace',
            badge: stats.purchaseRequests > 0 ? stats.purchaseRequests : null,
        },
    ];

    const quickActions = [
        { label: '+ Nuevo Ejército', to: '/admin/armies', color: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' },
        { label: '+ Nueva Guía', to: '/admin/guides', color: 'linear-gradient(135deg, var(--color-secondary), #a855f7)' },
        { label: '+ Nuevo Informe', to: '/admin/reports', color: 'linear-gradient(135deg, #ff0064, #ff6600)' },
        { label: '+ Nuevo Lore', to: '/admin/lore', color: 'linear-gradient(135deg, #a855f7, #6366f1)' },
        { label: '+ Nueva Noticia', to: '/admin/news', color: 'linear-gradient(135deg, #f59e0b, #d97706)' },
        { label: 'Gestionar Usuarios', to: '/admin/users', color: 'linear-gradient(135deg, #6366f1, #8b5cf6)' },
        { label: 'Marketplace', to: '/admin/marketplace', color: 'linear-gradient(135deg, #10b981, #059669)' },
    ];

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                <div className="loading-spinner" />
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={{ marginBottom: '2.5rem' }}>
                <h1 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(1.8rem, 4vw, 3rem)',
                    marginBottom: '0.5rem',
                    background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                }}>
                    Panel de Administración
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1rem', margin: 0 }}>
                    Gestiona todo el contenido de The Immaterium desde aquí
                </p>
            </motion.div>

            {/* Stats grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: '1rem',
                marginBottom: '2.5rem',
            }}>
                {statCards.map((card, index) => (
                    <Link key={card.title} to={card.link} style={{ textDecoration: 'none' }}>
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: index * 0.06 }}
                            whileHover={{ y: -3, transition: { duration: 0.15 } }}
                            style={{
                                padding: '1.5rem',
                                background: 'rgba(255,255,255,0.025)',
                                border: `1px solid ${card.color}28`,
                                borderRadius: '16px',
                                cursor: 'pointer',
                                transition: 'border-color 0.2s, box-shadow 0.2s',
                                position: 'relative',
                                overflow: 'hidden',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.borderColor = `${card.color}60`;
                                e.currentTarget.style.boxShadow = `0 8px 24px rgba(0,0,0,0.3), 0 0 0 1px ${card.color}20`;
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.borderColor = `${card.color}28`;
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            {/* Glow background */}
                            <div style={{
                                position: 'absolute', top: 0, right: 0,
                                width: '80px', height: '80px',
                                borderRadius: '50%',
                                background: `${card.color}10`,
                                filter: 'blur(20px)',
                                pointerEvents: 'none',
                            }} />

                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <div style={{
                                    padding: '0.6rem',
                                    borderRadius: '10px',
                                    background: `${card.color}14`,
                                    border: `1px solid ${card.color}28`,
                                    color: card.color,
                                    display: 'flex',
                                }}>
                                    {card.icon}
                                </div>
                                <span style={{ color: card.color, fontSize: '1.1rem', opacity: 0.6 }}>→</span>
                            </div>

                            <div style={{
                                fontFamily: 'var(--font-display)',
                                fontSize: '2.2rem',
                                fontWeight: 700,
                                color: card.color,
                                lineHeight: 1,
                                marginBottom: '0.4rem',
                            }}>
                                {card.value}
                            </div>
                            <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.88rem', fontWeight: 500 }}>
                                {card.title}
                            </div>
                        </motion.div>
                    </Link>
                ))}
            </div>

            {/* Engagement summary */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.45 }}
                style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1rem',
                    marginBottom: '2rem',
                }}
            >
                {[
                    { label: 'Vistas Totales', value: engagement.totalViews.toLocaleString('es-ES'), icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>, color: 'var(--color-primary)' },
                    { label: 'Me Gustas Totales', value: engagement.totalLikes.toLocaleString('es-ES'), icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>, color: '#ff6464' },
                ].map((card, i) => (
                    <div key={i} style={{
                        padding: '1.25rem 1.5rem',
                        background: 'rgba(255,255,255,0.025)',
                        border: `1px solid ${card.color}28`,
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                    }}>
                        <div style={{ color: card.color, opacity: 0.7 }}>{card.icon}</div>
                        <div>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 700, color: card.color, lineHeight: 1 }}>{card.value}</div>
                            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem', marginTop: '0.25rem' }}>{card.label}</div>
                        </div>
                    </div>
                ))}
            </motion.div>

            {/* Top content */}
            {topContent.length > 0 && (
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        borderRadius: '20px',
                        padding: '1.75rem',
                        marginBottom: '2rem',
                    }}
                >
                    <h2 style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '1rem',
                        letterSpacing: '2px',
                        textTransform: 'uppercase',
                        color: 'rgba(255,255,255,0.45)',
                        marginBottom: '1.25rem',
                    }}>
                        Contenido más popular
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        {topContent.map((item, i) => (
                            <Link key={`${item.type}-${item.id}`} to={`${item.route}/${item.id}`} style={{ textDecoration: 'none' }}>
                                <motion.div
                                    whileHover={{ x: 4 }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '12px',
                                        background: 'rgba(255,255,255,0.02)',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        transition: 'background 0.2s',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                >
                                    <span style={{
                                        fontFamily: 'var(--font-display)',
                                        fontSize: '0.7rem',
                                        fontWeight: 700,
                                        color: 'rgba(255,255,255,0.2)',
                                        width: '1.5rem',
                                        flexShrink: 0,
                                    }}>
                                        #{i + 1}
                                    </span>
                                    <span style={{
                                        padding: '2px 8px',
                                        borderRadius: '999px',
                                        background: `${item.color}18`,
                                        border: `1px solid ${item.color}35`,
                                        color: item.color,
                                        fontSize: '0.62rem',
                                        fontFamily: 'var(--font-display)',
                                        fontWeight: 700,
                                        letterSpacing: '0.5px',
                                        flexShrink: 0,
                                    }}>
                                        {item.label}
                                    </span>
                                    <span style={{
                                        flex: 1,
                                        fontSize: '0.85rem',
                                        color: 'rgba(255,255,255,0.7)',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        fontFamily: 'var(--font-display)',
                                    }}>
                                        {item.title}
                                    </span>
                                    <div style={{ display: 'flex', gap: '0.75rem', flexShrink: 0 }}>
                                        {item.views > 0 && (
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)' }}>
                                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                                {item.views}
                                            </span>
                                        )}
                                        {item.likes > 0 && (
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.72rem', color: 'rgba(255,100,100,0.55)' }}>
                                                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                                                {item.likes}
                                            </span>
                                        )}
                                    </div>
                                </motion.div>
                            </Link>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Quick actions */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '20px',
                    padding: '1.75rem',
                }}
            >
                <h2 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1rem',
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.45)',
                    marginBottom: '1.25rem',
                }}>
                    Acciones Rápidas
                </h2>
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.65rem',
                }}>
                    {quickActions.map((action) => (
                        <Link key={action.to + action.label} to={action.to} style={{ textDecoration: 'none' }}>
                            <motion.button
                                whileHover={{ y: -2 }}
                                whileTap={{ scale: 0.97 }}
                                style={{
                                    padding: '0.65rem 1.25rem',
                                    background: action.color,
                                    border: 'none',
                                    borderRadius: '10px',
                                    color: '#fff',
                                    fontFamily: 'var(--font-display)',
                                    fontSize: '0.82rem',
                                    letterSpacing: '0.5px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
                                }}
                            >
                                {action.label}
                            </motion.button>
                        </Link>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

export default AdminDashboard;
