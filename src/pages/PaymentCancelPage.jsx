import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/UI/Header';
import Footer from '../components/UI/Footer';

export default function PaymentCancelPage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Pago cancelado | The Immaterium';
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-darker)', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '6rem 1.5rem 3rem',
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          style={{
            background: 'rgba(8,8,22,0.98)',
            border: '1px solid rgba(255,80,80,0.25)',
            borderRadius: '24px',
            padding: 'clamp(2rem, 6vw, 3.5rem)',
            maxWidth: '440px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
          }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
            style={{
              width: '72px', height: '72px',
              background: 'rgba(255,80,80,0.1)',
              border: '2px solid rgba(255,80,80,0.4)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.5rem',
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ff6464" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </motion.div>

          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.3rem, 5vw, 1.8rem)',
            color: '#ff6464',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            marginBottom: '0.75rem',
          }}>
            Pago Cancelado
          </h1>

          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '2rem' }}>
            No se ha realizado ningún cargo. Puedes intentarlo de nuevo cuando quieras.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button
              onClick={() => navigate(-1)}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '14px',
                padding: '0.9rem 2rem',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-display)',
                fontSize: '0.85rem',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              Volver
            </button>
            <Link to="/guides" style={{
              display: 'block',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '14px',
              padding: '0.9rem 2rem',
              color: 'rgba(255,255,255,0.4)',
              fontFamily: 'var(--font-display)',
              fontSize: '0.8rem',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              textDecoration: 'none',
            }}>
              Ver Guías
            </Link>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
