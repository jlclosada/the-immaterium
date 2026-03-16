import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer style={{
            background: 'linear-gradient(to top, rgba(5, 5, 16, 1) 0%, rgba(10, 10, 26, 0.98) 100%)',
            borderTop: '1px solid rgba(0, 212, 255, 0.1)',
            padding: 'clamp(2rem, 6vw, 4rem) clamp(1rem, 4vw, 2rem) clamp(1.5rem, 4vw, 2rem)',
            marginTop: 'auto',
            position: 'relative',
            zIndex: 10
        }}>
            {/* Decorative Line */}
            <div style={{
                width: '100px',
                height: '3px',
                background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))',
                margin: '0 auto 3rem',
                borderRadius: '2px'
            }} />

            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))',
                gap: 'clamp(2rem, 4vw, 3rem)',
                marginBottom: 'clamp(2rem, 4vw, 3rem)'
            }}>
                {/* Brand / About */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                >
                    <h3 style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 'clamp(1.2rem, 3vw, 1.5rem)',
                        background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        marginBottom: '1rem',
                        letterSpacing: '2px'
                    }}>
                        THE IMMATERIUM
                    </h3>
                    <p style={{
                        color: '#888',
                        lineHeight: '1.7',
                        fontSize: 'clamp(0.85rem, 2vw, 0.95rem)'
                    }}>
                        Archivos del 41º Milenio. Una comunidad dedicada a Warhammer 40,000 con reportes de batalla, guías de pintura y lore del universo.
                    </p>
                </motion.div>

                {/* Quick Links */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                >
                    <h4 style={{
                        color: '#fff',
                        marginBottom: '1.2rem',
                        fontFamily: 'var(--font-display)',
                        letterSpacing: '1px',
                        fontSize: 'clamp(0.9rem, 2.5vw, 1rem)'
                    }}>
                        NAVEGACIÓN
                    </h4>
                    <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        <li><FooterLink to="/">Inicio</FooterLink></li>
                        <li><FooterLink to="/armies">Ejércitos</FooterLink></li>
                        <li><FooterLink to="/guides">Guías</FooterLink></li>
                        <li><FooterLink to="/battle-reports">Batallas</FooterLink></li>
                        <li><FooterLink to="/lore">Lore</FooterLink></li>
                    </ul>
                </motion.div>

                {/* Resources */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                >
                    <h4 style={{
                        color: '#fff',
                        marginBottom: '1.2rem',
                        fontFamily: 'var(--font-display)',
                        letterSpacing: '1px',
                        fontSize: 'clamp(0.9rem, 2.5vw, 1rem)'
                    }}>
                        RECURSOS
                    </h4>
                    <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        <li><FooterLink to="/login">Admin</FooterLink></li>
                        <li>
                            <a
                                href="https://www.warhammer-community.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    color: '#aaa',
                                    textDecoration: 'none',
                                    transition: 'all 0.2s',
                                    fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.color = 'var(--color-primary)';
                                    e.target.style.paddingLeft = '5px';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.color = '#aaa';
                                    e.target.style.paddingLeft = '0';
                                }}
                            >
                                Warhammer Community ↗
                            </a>
                        </li>
                    </ul>
                </motion.div>

                {/* Quote */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                >
                    <blockquote style={{
                        color: '#666',
                        fontStyle: 'italic',
                        fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
                        lineHeight: '1.6',
                        borderLeft: '3px solid var(--color-primary)',
                        paddingLeft: '1rem',
                        margin: 0
                    }}>
                        "En la inmensidad sombría del lejano futuro, solo hay guerra."
                    </blockquote>
                </motion.div>
            </div>

            {/* Bottom Bar */}
            <div style={{
                borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                paddingTop: 'clamp(1.5rem, 3vw, 2rem)',
                display: 'flex',
                flexDirection: window.innerWidth < 640 ? 'column' : 'row',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem',
                color: '#555',
                fontSize: 'clamp(0.75rem, 2vw, 0.85rem)',
                textAlign: 'center'
            }}>
                <div>
                    © {currentYear} The Immaterium. Proyecto de Fans.
                </div>
                <div style={{ fontSize: 'clamp(0.7rem, 1.8vw, 0.8rem)' }}>
                    Sitio no oficial de Warhammer 40k. No afiliado con Games Workshop.
                </div>
            </div>
        </footer>
    );
};

const FooterLink = ({ to, children }) => (
    <Link
        to={to}
        style={{
            color: '#aaa',
            textDecoration: 'none',
            transition: 'all 0.2s',
            fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem'
        }}
        onMouseEnter={(e) => {
            e.target.style.color = 'var(--color-primary)';
            e.target.style.paddingLeft = '5px';
        }}
        onMouseLeave={(e) => {
            e.target.style.color = '#aaa';
            e.target.style.paddingLeft = '0';
        }}
    >
        {children}
    </Link>
);

export default Footer;

