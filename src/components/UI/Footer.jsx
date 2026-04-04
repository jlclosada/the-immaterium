import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NAV_LINKS = [
  { to: '/', label: 'Inicio', icon: '⬡' },
  { to: '/marketplace', label: 'Marketplace', icon: '◈' },
  { to: '/armies', label: 'Ejércitos', icon: '◉' },
  { to: '/guides', label: 'Guías de pintura', icon: '◈' },
  { to: '/battle-reports', label: 'Batallas', icon: '◉' },
  { to: '/lore', label: 'Lore', icon: '◈' },
  { to: '/news', label: 'Noticias', icon: '◉' },
  { to: '/videos', label: 'Videos', icon: '◈' },
  { to: '/army-builder', label: 'Army Builder', icon: '◉' },
];

const EXTERNAL_LINKS = [
  { href: 'https://www.warhammer-community.com', label: 'Warhammer Community' },
  { href: 'https://www.games-workshop.com', label: 'Games Workshop' },
  { href: 'https://www.reddit.com/r/Warhammer40k/', label: 'r/Warhammer40k' },
  { href: 'https://www.bolterandchainsword.com', label: 'Bolter & Chainsword' },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{
      background: 'linear-gradient(180deg, var(--color-darker) 0%, rgba(0,0,0,0.98) 100%)',
      borderTop: '1px solid rgba(0,212,255,0.1)',
      marginTop: 'auto',
      position: 'relative',
      zIndex: 10,
      overflow: 'hidden',
    }}>
      {/* Top gradient accent */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
        background: 'linear-gradient(90deg, transparent, var(--color-primary), var(--color-secondary), var(--color-primary), transparent)',
        opacity: 0.6,
      }} />

      {/* Subtle background glow */}
      <div style={{
        position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '600px', height: '300px',
        background: 'radial-gradient(ellipse, rgba(0,212,255,0.03) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: 'clamp(3rem, 6vw, 5rem) clamp(1.25rem, 4vw, 2.5rem) clamp(1.5rem, 3vw, 2.5rem)',
        position: 'relative',
      }}>
        {/* Main grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
          gap: 'clamp(2.5rem, 5vw, 4rem)',
          marginBottom: 'clamp(2.5rem, 5vw, 4rem)',
        }}>
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
          >
            <Link to="/" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: '1.25rem' }}>
              <img
                src="/logo-full.png"
                alt="The Immaterium"
                style={{ height: '48px', width: 'auto', objectFit: 'contain' }}
              />
            </Link>
            <p style={{
              color: 'var(--text-dim)',
              lineHeight: 1.75,
              fontSize: 'clamp(0.82rem, 1.8vw, 0.9rem)',
              marginBottom: '1.5rem',
            }}>
              Comunidad española de Warhammer 40,000. Miniaturas, batallas, lore y mucho más del 41º milenio.
            </p>
            {/* Mini divider */}
            <div style={{
              width: '40px', height: '2px',
              background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))',
              borderRadius: '2px',
              marginBottom: '1.25rem',
            }} />
            <blockquote style={{
              color: 'var(--text-faint)',
              fontStyle: 'italic',
              fontSize: '0.8rem',
              lineHeight: 1.65,
              margin: 0,
              paddingLeft: '0.85rem',
              borderLeft: '2px solid rgba(0,212,255,0.25)',
            }}>
              "En la inmensidad sombría del lejano futuro, solo hay guerra."
            </blockquote>
          </motion.div>

          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h4 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.65rem',
              letterSpacing: '3px',
              color: 'var(--color-primary)',
              textTransform: 'uppercase',
              marginBottom: '1.4rem',
              opacity: 0.8,
            }}>
              Navegación
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {NAV_LINKS.map(link => (
                <li key={link.to}>
                  <FooterLink to={link.to}>{link.label}</FooterLink>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* External resources */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
          >
            <h4 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.65rem',
              letterSpacing: '3px',
              color: 'var(--color-secondary)',
              textTransform: 'uppercase',
              marginBottom: '1.4rem',
              opacity: 0.8,
            }}>
              Recursos
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {EXTERNAL_LINKS.map(link => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: 'var(--text-dim)',
                      textDecoration: 'none',
                      fontSize: 'clamp(0.82rem, 1.8vw, 0.9rem)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      transition: 'color 0.2s, padding-left 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-secondary)'; e.currentTarget.style.paddingLeft = '6px'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-dim)'; e.currentTarget.style.paddingLeft = '0'; }}
                  >
                    {link.label}
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
                      <line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/>
                    </svg>
                  </a>
                </li>
              ))}
              <li style={{ marginTop: '0.5rem' }}>
                <FooterLink to="/login" dim>Panel de Admin</FooterLink>
              </li>
            </ul>
          </motion.div>

          {/* Stats / identity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h4 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.65rem',
              letterSpacing: '3px',
              color: 'var(--color-accent)',
              textTransform: 'uppercase',
              marginBottom: '1.4rem',
              opacity: 0.8,
            }}>
              Comunidad
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { label: 'Warhammer 40,000', desc: 'Ciencia ficción épica' },
                { label: 'Comunidad española', desc: 'Miniaturas & hobby' },
                { label: '41º Milenio', desc: 'Lore & trasfondo' },
              ].map(item => (
                <div key={item.label} style={{
                  padding: '0.7rem 0.9rem',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: '10px',
                }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.72rem', color: 'var(--text-secondary)', letterSpacing: '0.5px', marginBottom: '0.2rem' }}>{item.label}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.25 }}
          style={{
            borderTop: '1px solid rgba(255,255,255,0.05)',
            paddingTop: 'clamp(1.25rem, 3vw, 1.75rem)',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <div style={{ fontSize: '0.78rem', color: 'var(--text-faint)' }}>
            © {currentYear} <span style={{ color: 'var(--text-dim)' }}>The Immaterium</span> · José Luis Cáceres
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', textAlign: 'right' }}>
            Sitio no oficial · No afiliado con Games Workshop Ltd.
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

const FooterLink = ({ to, children, dim }) => (
  <Link
    to={to}
    style={{
      color: dim ? 'var(--text-faint)' : 'var(--text-dim)',
      textDecoration: 'none',
      fontSize: 'clamp(0.82rem, 1.8vw, 0.9rem)',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.4rem',
      transition: 'color 0.2s, padding-left 0.2s',
    }}
    onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-primary)'; e.currentTarget.style.paddingLeft = '6px'; }}
    onMouseLeave={e => { e.currentTarget.style.color = dim ? 'var(--text-faint)' : 'var(--text-dim)'; e.currentTarget.style.paddingLeft = '0'; }}
  >
    {children}
  </Link>
);

export default Footer;
