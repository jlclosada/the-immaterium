import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/UI/Navbar';
import Footer from '../components/UI/Footer';

export default function NotFoundPage() {
  useEffect(() => {
    document.title = 'Página no encontrada | The Immaterium';
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-darker)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '6rem 1.5rem 3rem',
        textAlign: 'center',
      }}>
        {/* Glitchy 404 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          style={{ marginBottom: '2rem' }}
        >
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(5rem, 18vw, 12rem)',
            fontWeight: 900,
            letterSpacing: '-4px',
            lineHeight: 1,
            background: 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(0,212,255,0.04))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            color: 'transparent',
            textShadow: 'none',
            border: 'none',
            position: 'relative',
          }}>
            {/* Outline version */}
            <span style={{
              position: 'relative',
              WebkitTextStroke: '2px rgba(0,212,255,0.35)',
              WebkitTextFillColor: 'transparent',
            }}>
              404
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ maxWidth: '460px' }}
        >
          <p style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.65rem',
            letterSpacing: '4px',
            color: 'var(--color-primary)',
            textTransform: 'uppercase',
            opacity: 0.7,
            marginBottom: '0.75rem',
          }}>
            Perdido en el Inmaterium
          </p>

          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.4rem, 4vw, 2rem)',
            color: '#fff',
            letterSpacing: '1px',
            marginBottom: '1rem',
          }}>
            Página no encontrada
          </h1>

          <p style={{
            color: 'rgba(255,255,255,0.4)',
            fontSize: '0.95rem',
            lineHeight: 1.7,
            marginBottom: '2.5rem',
          }}>
            La ruta que buscas se ha desvanecido en la Corriente del Alma.
            Puede que haya sido consumida por el Caos o simplemente no exista.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/" style={{ textDecoration: 'none' }}>
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  padding: '0.8rem 1.75rem',
                  background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#000',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                }}
              >
                Volver al inicio
              </motion.button>
            </Link>

            <Link to="/search" style={{ textDecoration: 'none' }}>
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  padding: '0.8rem 1.75rem',
                  background: 'transparent',
                  border: '1px solid rgba(0,212,255,0.3)',
                  borderRadius: '12px',
                  color: 'var(--color-primary)',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                }}
              >
                Buscar contenido
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Decoration: floating particles */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: [0, 0.3, 0], y: -200 }}
              transition={{ delay: i * 0.8, duration: 4, repeat: Infinity, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                bottom: '20%',
                left: `${15 + i * 14}%`,
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                background: 'var(--color-primary)',
              }}
            />
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
