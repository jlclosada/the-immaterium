import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStore } from '../stores/useStore';
import { api } from '../services/api';
import Header from '../components/UI/Header';
import Footer from '../components/UI/Footer';

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const { token, setUser } = useStore();
  const [refreshed, setRefreshed] = useState(false);

  useEffect(() => {
    document.title = 'Pago completado | The Immaterium';
  }, []);

  // Refresh purchases so the newly unlocked guide shows immediately
  useEffect(() => {
    const refresh = async () => {
      if (!token) return;
      try {
        const data = await api.getMe(token);
        setUser(data.user, data.purchases || []);
      } catch (e) {
        console.error('Failed to refresh purchases', e);
      } finally {
        setRefreshed(true);
      }
    };
    // Small delay to give Stripe webhook time to process
    const t = setTimeout(refresh, 1500);
    return () => clearTimeout(t);
  }, [token]);

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
            border: '1px solid rgba(80,200,120,0.3)',
            borderRadius: '24px',
            padding: 'clamp(2rem, 6vw, 3.5rem)',
            maxWidth: '480px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 40px rgba(80,200,120,0.1)',
          }}
        >
          {/* Checkmark */}
          <motion.div
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.15 }}
            style={{
              width: '80px', height: '80px',
              background: 'linear-gradient(135deg, rgba(80,200,120,0.2), rgba(80,200,120,0.08))',
              border: '2px solid rgba(80,200,120,0.5)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.75rem',
              boxShadow: '0 0 40px rgba(80,200,120,0.25)',
            }}
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#50c878" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.4rem, 5vw, 2rem)',
              color: '#50c878',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              marginBottom: '0.75rem',
            }}
          >
            ¡Pago Completado!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.925rem', lineHeight: 1.7, marginBottom: '2rem' }}
          >
            Tu compra ha sido procesada correctamente. Ahora tienes acceso completo al contenido premium.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
          >
            <Link to="/guides" style={{
              display: 'block',
              background: 'linear-gradient(135deg, #50c878, #3aa85a)',
              border: 'none',
              borderRadius: '14px',
              padding: '0.9rem 2rem',
              color: '#000',
              fontFamily: 'var(--font-display)',
              fontWeight: 'bold',
              fontSize: '0.85rem',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              textDecoration: 'none',
              cursor: 'pointer',
            }}>
              Ver Guías
            </Link>
            <Link to="/" style={{
              display: 'block',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '14px',
              padding: '0.9rem 2rem',
              color: 'rgba(255,255,255,0.5)',
              fontFamily: 'var(--font-display)',
              fontSize: '0.8rem',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              textDecoration: 'none',
            }}>
              Volver al inicio
            </Link>
          </motion.div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
