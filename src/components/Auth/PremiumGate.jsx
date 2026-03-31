import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../../stores/useStore';
import { api } from '../../services/api';

export default function PremiumGate({ guide }) {
  const { token, purchases, openAuthModal } = useStore();
  const [loading, setLoading] = useState(false);
  const isPurchased = purchases.includes(String(guide.id));

  if (!guide.isPremium && !guide.is_premium) return null;
  if (isPurchased) return null;

  const priceEuros = guide.price ? (guide.price / 100).toFixed(2) : null;

  const handleBuy = async () => {
    if (!token) { openAuthModal(); return; }
    setLoading(true);
    try {
      const { url } = await api.createCheckoutSession(guide.id, token);
      if (url) window.location.href = url;
    } catch (e) {
      console.error('Checkout error:', e);
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ marginTop: '1.5rem' }}
    >
      {/* Main gate card */}
      <div style={{
        background: 'linear-gradient(160deg, rgba(12,10,2,0.98) 0%, rgba(6,5,1,0.99) 100%)',
        border: '1px solid rgba(255,215,0,0.3)',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        boxShadow: '0 8px 40px rgba(255,215,0,0.08)',
      }}>
        {/* Top gold accent line */}
        <div style={{
          height: '3px',
          background: 'linear-gradient(90deg, transparent 0%, #FFD700 30%, #FFA500 70%, transparent 100%)',
        }} />

        {/* Content */}
        <div style={{
          padding: 'clamp(1.5rem, 5vw, 2.5rem)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.25rem',
          textAlign: 'center',
        }}>
          {/* Lock icon */}
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              width: '64px', height: '64px', flexShrink: 0,
              background: 'radial-gradient(circle, rgba(255,215,0,0.15) 0%, rgba(255,140,0,0.06) 70%)',
              border: '1px solid rgba(255,215,0,0.45)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 32px rgba(255,215,0,0.18)',
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </motion.div>

          {/* Text */}
          <div>
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1rem, 3vw, 1.25rem)',
              color: '#FFD700',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              marginBottom: '0.6rem',
            }}>
              Contenido Premium
            </h3>
            <p style={{
              color: 'rgba(255,255,255,0.5)',
              fontSize: 'clamp(0.82rem, 2vw, 0.9rem)',
              lineHeight: 1.65,
              maxWidth: '380px',
              margin: '0 auto',
            }}>
              {token
                ? 'Esta guía requiere un pago único para desbloquear el acceso completo.'
                : 'Crea una cuenta gratuita o inicia sesión para acceder a este contenido premium.'}
            </p>
          </div>

          {/* Price block */}
          {priceEuros && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.2rem',
              background: 'rgba(255,215,0,0.07)',
              border: '1px solid rgba(255,215,0,0.25)',
              borderRadius: '16px',
              padding: '0.9rem 2rem',
            }}>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.8rem, 5vw, 2.4rem)',
                fontWeight: 900,
                color: '#FFD700',
                lineHeight: 1,
                letterSpacing: '-1px',
              }}>
                {priceEuros}€
              </span>
              <span style={{ fontSize: '0.72rem', color: 'rgba(255,215,0,0.5)', letterSpacing: '2px', textTransform: 'uppercase' }}>
                acceso permanente
              </span>
            </div>
          )}

          {/* CTA button */}
          <motion.button
            whileHover={!loading ? { scale: 1.04, boxShadow: '0 10px 32px rgba(255,215,0,0.4)' } : {}}
            whileTap={!loading ? { scale: 0.97 } : {}}
            onClick={handleBuy}
            disabled={loading}
            style={{
              background: loading ? 'rgba(255,215,0,0.3)' : 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
              border: 'none',
              borderRadius: '14px',
              padding: 'clamp(0.8rem, 2.5vw, 1rem) clamp(1.5rem, 5vw, 2.5rem)',
              color: loading ? 'rgba(0,0,0,0.4)' : '#000',
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: 'clamp(0.82rem, 2vw, 0.95rem)',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
              width: '100%',
              maxWidth: '320px',
              transition: 'all 0.25s',
            }}
          >
            {loading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                  style={{ width: '16px', height: '16px', border: '2px solid rgba(0,0,0,0.2)', borderTop: '2px solid rgba(0,0,0,0.7)', borderRadius: '50%' }}
                />
                Redirigiendo...
              </>
            ) : token ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                  <line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
                {priceEuros ? `Comprar por ${priceEuros}€` : 'Comprar ahora'}
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                  <polyline points="10 17 15 12 10 7"/>
                  <line x1="15" y1="12" x2="3" y2="12"/>
                </svg>
                Iniciar sesión para comprar
              </>
            )}
          </motion.button>

          {/* Secondary note */}
          <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.22)', margin: 0, lineHeight: 1.5 }}>
            Pago seguro con Stripe · Sin suscripción · Acceso inmediato
          </p>
        </div>
      </div>

      {/* Blurred preview hint below */}
      <div style={{
        marginTop: '0.75rem',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        position: 'relative',
        pointerEvents: 'none',
      }}>
        <div style={{
          padding: '1.5rem',
          background: 'rgba(255,255,255,0.015)',
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: 'var(--radius-xl)',
          filter: 'blur(5px)',
          userSelect: 'none',
        }}>
          {[70, 95, 55, 80, 45].map((w, i) => (
            <div key={i} style={{ height: '10px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', marginBottom: '0.6rem', width: `${w}%` }} />
          ))}
        </div>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(5,5,16,0.1) 0%, rgba(5,5,16,0.95) 100%)',
          borderRadius: 'var(--radius-xl)',
        }} />
      </div>
    </motion.div>
  );
}
