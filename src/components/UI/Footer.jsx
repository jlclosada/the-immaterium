import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer style={{
            background: 'linear-gradient(to top, #050510 0%, #0a0a1a 100%)',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            padding: '4rem 2rem 2rem',
            marginTop: 'auto',
            position: 'relative',
            zIndex: 10
        }}>
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '3rem',
                marginBottom: '3rem'
            }}>
                {/* Brand / About */}
                <div>
                    <h3 style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '1.5rem',
                        color: 'var(--color-primary)',
                        marginBottom: '1rem',
                        letterSpacing: '2px'
                    }}>
                        THE IMMATERIUM
                    </h3>
                    <p style={{
                        color: '#888',
                        lineHeight: '1.6',
                        fontSize: '0.95rem'
                    }}>
                        Archives of the 41st Millennium. Serving the Emperor and the community with the latest reports, guides, and lore from the grim darkness of the far future.
                    </p>
                </div>

                {/* Quick Links */}
                <div>
                    <h4 style={{
                        color: '#fff',
                        marginBottom: '1.2rem',
                        fontFamily: 'var(--font-display)',
                        letterSpacing: '1px'
                    }}>
                        NAVEGACIÓN
                    </h4>
                    <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        <li><FooterLink to="/armies">Ejércitos</FooterLink></li>
                        <li><FooterLink to="/guides">Guías de Pintura</FooterLink></li>
                        <li><FooterLink to="/battle-reports">Informes de Batalla</FooterLink></li>
                        <li><FooterLink to="/">Inicio</FooterLink></li>
                    </ul>
                </div>

                {/* Resources */}
                <div>
                    <h4 style={{
                        color: '#fff',
                        marginBottom: '1.2rem',
                        fontFamily: 'var(--font-display)',
                        letterSpacing: '1px'
                    }}>
                        RECURSOS
                    </h4>
                    <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        <li><FooterLink to="/login">Acceso Admin</FooterLink></li>
                        <li>
                            <a
                                href="https://www.warhammer-community.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    color: '#aaa',
                                    textDecoration: 'none',
                                    transition: 'color 0.2s',
                                    fontSize: '0.95rem'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.color = 'var(--color-primary)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.color = '#aaa';
                                }}
                            >
                                Warhammer Community
                            </a>
                        </li>
                    </ul>
                </div>

                {/* Legal / Quote */}
                <div>
                    <h4 style={{
                        color: 'var(--color-accent)',
                        marginBottom: '1.2rem',
                        fontFamily: 'var(--font-display)',
                        letterSpacing: '1px'
                    }}>
                        PENSAMIENTO DEL DÍA
                    </h4>
                    <blockquote style={{
                        color: '#aaa',
                        fontStyle: 'italic',
                        borderLeft: '2px solid var(--color-accent)',
                        paddingLeft: '1rem',
                        margin: 0
                    }}>
                        "Hope is the first step on the road to disappointment."
                    </blockquote>
                </div>
            </div>

            {/* Bottom Bar */}
            <div style={{
                borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                paddingTop: '2rem',
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem',
                color: '#555',
                fontSize: '0.85rem'
            }}>
                <div>
                    &copy; {currentYear} The Immaterium. Fan Project.
                </div>
                <div>
                    Unofficial Warhammer 40k Fan Site. Not affiliated with Games Workshop.
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
            fontSize: '0.95rem'
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
