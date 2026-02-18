import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStore } from '../stores/useStore';
import { api } from '../services/api';
import Footer from '../components/UI/Footer';

const LandingPage = () => {
    const { fetchInitialData } = useStore();
    const [featuredArmy, setFeaturedArmy] = useState(null);
    const [featuredGuide, setFeaturedGuide] = useState(null);
    const [featuredReport, setFeaturedReport] = useState(null);

    useEffect(() => {
        fetchInitialData();
        loadFeaturedContent();
    }, []);

    const loadFeaturedContent = async () => {
        try {
            const [armies, guides, reports] = await Promise.all([
                api.getArmies(),
                api.getPaintingGuides(),
                api.getBattleReports()
            ]);

            // Get random or most recent items
            if (armies && armies.length > 0) {
                setFeaturedArmy(armies[0]);
            }
            if (guides && guides.length > 0) {
                setFeaturedGuide(guides[0]);
            }
            if (reports && reports.length > 0) {
                setFeaturedReport(reports[0]);
            }
        } catch (error) {
            console.error('Error loading featured content:', error);
        }
    };

    return (
        <div className="landing-page crt-flicker" style={{
            color: 'white',
            background: 'radial-gradient(circle at center, #1a1a2e 0%, #050510 100%)',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            overflowX: 'hidden'
        }}>
            <div className="scanline-overlay" />

            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                textAlign: 'center',
                position: 'relative',
                minHeight: '90vh'
            }}>
                {/* Background Texture/Effect */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                    zIndex: 0
                }} />

                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    style={{ zIndex: 1, marginBottom: '4rem' }}
                >
                    <h1 style={{
                        fontFamily: 'Orbitron',
                        fontSize: 'clamp(3rem, 8vw, 6rem)',
                        marginBottom: '1rem',
                        textShadow: '0 0 30px rgba(0, 212, 255, 0.5)',
                        letterSpacing: '0.5rem',
                        background: 'linear-gradient(180deg, #fff 0%, #888 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        THE IMMATERIUM
                    </h1>
                    <div style={{
                        width: '150px',
                        height: '4px',
                        background: 'linear-gradient(90deg, transparent, var(--color-primary), transparent)',
                        margin: '0 auto'
                    }} />
                </motion.div>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 1 }}
                    style={{
                        fontSize: 'clamp(1rem, 2vw, 1.2rem)',
                        maxWidth: '700px',
                        marginBottom: '5rem',
                        color: '#aaa',
                        lineHeight: '1.8',
                        letterSpacing: '1px',
                        zIndex: 1
                    }}
                >
                    ARCHIVES OF THE 41ST MILLENNIUM. EXPLORE THE ARMIES, MASTER THE ARTS OF WAR, AND REMEMBER THE FALLEN.
                </motion.p>

                <motion.div
                    className="grid-menu"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: '2rem',
                        width: '100%',
                        maxWidth: '1200px',
                        zIndex: 1,
                        padding: '0 1rem'
                    }}
                >
                    <SectionCard
                        to="/armies"
                        title="EJÉRCITOS"
                        subtitle="Facciones & Lore"
                        icon={
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                        }
                    />
                    <SectionCard
                        to="/guides"
                        title="PINTURA"
                        subtitle="Guías & Técnicas"
                        icon={
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 19l7-7 3 3-7 7-3-3z" />
                                <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                                <path d="M2 2l7.586 7.586" />
                                <circle cx="11" cy="11" r="2" />
                            </svg>
                        }
                    />
                    <SectionCard
                        to="/battle-reports"
                        title="BATALLAS"
                        subtitle="Reportes & Logs"
                        icon={
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" />
                                <line x1="13" y1="19" x2="19" y2="13" />
                                <line x1="16" y1="16" x2="20" y2="20" />
                                <line x1="19" y1="21" x2="21" y2="19" />
                                <polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5" />
                                <line x1="16" y1="14" x2="20" y2="10" />
                                <line x1="16.9" y1="6.1" x2="19.5" y2="3.5" />
                            </svg>
                        }
                    />
                </motion.div>

                <div style={{ marginTop: '5rem', zIndex: 1 }}>
                    <Link to="/login" style={{
                        color: 'var(--color-primary)',
                        textDecoration: 'none',
                        fontSize: '0.8rem',
                        letterSpacing: '2px',
                        textTransform: 'uppercase',
                        opacity: 0.5,
                        transition: 'opacity 0.3s'
                    }}
                        onMouseEnter={e => e.target.style.opacity = 1}
                        onMouseLeave={e => e.target.style.opacity = 0.5}
                    >
                        Administrative Access // Clearance Required
                    </Link>
                </div>
            </div>

            {/* Featured Content Section */}
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '4rem 2rem',
                width: '100%',
                zIndex: 2,
                position: 'relative'
            }}>
                <h3 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                    color: 'var(--color-accent)',
                    marginBottom: '2rem',
                    textAlign: 'center',
                    textTransform: 'uppercase',
                    letterSpacing: '3px'
                }}>
                    Contenido Destacado
                </h3>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '2rem'
                }}>
                    {/* Featured Faction */}
                    {featuredArmy && (
                        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'left', border: '1px solid var(--color-primary)' }}>
                            <span style={{
                                background: 'var(--color-primary)',
                                color: '#000',
                                padding: '4px 12px',
                                fontSize: '0.7rem',
                                fontWeight: 'bold',
                                borderRadius: '4px',
                                textTransform: 'uppercase'
                            }}>
                                Facción Destacada
                            </span>
                            <h4 style={{ margin: '1rem 0 0.5rem', fontSize: 'clamp(1.2rem, 3vw, 1.5rem)', color: '#fff' }}>
                                {featuredArmy.name}
                            </h4>
                            <p style={{ color: '#aaa', fontSize: '0.9rem', lineHeight: '1.6' }}>
                                {featuredArmy.description?.substring(0, 120)}...
                            </p>
                            <Link to={`/armies/${featuredArmy.id}`} style={{ display: 'inline-block', marginTop: '1rem', color: 'var(--color-primary)', textDecoration: 'none' }}>
                                Ver Facción →
                            </Link>
                        </div>
                    )}

                    {/* Latest Report */}
                    {featuredReport && (
                        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'left', border: '1px solid #ff4d4d' }}>
                            <span style={{
                                background: '#ff4d4d',
                                color: '#fff',
                                padding: '4px 12px',
                                fontSize: '0.7rem',
                                fontWeight: 'bold',
                                borderRadius: '4px',
                                textTransform: 'uppercase'
                            }}>
                                Reporte de Batalla
                            </span>
                            <h4 style={{ margin: '1rem 0 0.5rem', fontSize: 'clamp(1.2rem, 3vw, 1.5rem)', color: '#fff' }}>
                                {featuredReport.title}
                            </h4>
                            <p style={{ color: '#aaa', fontSize: '0.9rem', lineHeight: '1.6' }}>
                                {featuredReport.summary?.substring(0, 120) || featuredReport.description?.substring(0, 120)}...
                            </p>
                            <Link to={`/battle-reports/${featuredReport.id}`} style={{ display: 'inline-block', marginTop: '1rem', color: '#ff4d4d', textDecoration: 'none' }}>
                                Leer Reporte →
                            </Link>
                        </div>
                    )}

                    {/* Painting Tip */}
                    {featuredGuide && (
                        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'left', border: '1px solid var(--color-secondary)' }}>
                            <span style={{
                                background: 'var(--color-secondary)',
                                color: '#fff',
                                padding: '4px 12px',
                                fontSize: '0.7rem',
                                fontWeight: 'bold',
                                borderRadius: '4px',
                                textTransform: 'uppercase'
                            }}>
                                Técnica de Pintura
                            </span>
                            <h4 style={{ margin: '1rem 0 0.5rem', fontSize: 'clamp(1.2rem, 3vw, 1.5rem)', color: '#fff' }}>
                                {featuredGuide.title}
                            </h4>
                            <p style={{ color: '#aaa', fontSize: '0.9rem', lineHeight: '1.6' }}>
                                {featuredGuide.description?.substring(0, 120)}...
                            </p>
                            <Link to={`/guides/${featuredGuide.id}`} style={{ display: 'inline-block', marginTop: '1rem', color: 'var(--color-secondary)', textDecoration: 'none' }}>
                                Ver Técnica →
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
};

const SectionCard = ({ to, title, subtitle, icon }) => (
    <Link to={to} style={{ textDecoration: 'none' }}>
        <motion.div
            whileHover={{ scale: 1.02, translateY: -5 }}
            transition={{ duration: 0.2 }}
            className="glass-panel"
            style={{
                padding: '3rem 2rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <div style={{
                color: 'var(--color-primary)',
                marginBottom: '1.5rem',
                filter: 'drop-shadow(0 0 10px rgba(0, 212, 255, 0.3))'
            }}>
                {icon}
            </div>
            <h2 style={{
                fontFamily: 'Orbitron',
                fontSize: '1.8rem',
                margin: '0 0 0.5rem 0',
                color: 'white',
                letterSpacing: '2px'
            }}>
                {title}
            </h2>
            <span style={{
                color: '#666',
                fontFamily: 'Exo 2',
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                letterSpacing: '1px'
            }}>
                {subtitle}
            </span>

            {/* Hover Glint Effect */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: -100,
                width: '50px',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                transform: 'skewX(-20deg)',
                transition: 'left 0.5s'
            }} />
        </motion.div>
    </Link>
);

export default LandingPage;
