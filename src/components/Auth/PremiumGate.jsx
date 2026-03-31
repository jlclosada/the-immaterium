import { motion } from 'framer-motion';
import { useStore } from '../../stores/useStore';
import { api } from '../../services/api';

export default function PremiumGate({ guide }) {
  const { token, purchases, openAuthModal } = useStore();
  const isPurchased = purchases.includes(String(guide.id));

  if (!guide.isPremium && !guide.is_premium) return null;
  if (isPurchased) return null;

  const priceEuros = guide.price ? (guide.price / 100).toFixed(2) : null;

  const handleBuy = async () => {
    if (!token) {
      openAuthModal();
      return;
    }
    try {
      const { url } = await api.createCheckoutSession(guide.id, token);
      if (url) window.location.href = url;
    } catch (e) {
      console.error('Checkout error:', e);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        position: 'relative',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        marginTop: '1.5rem',
      }}
    >
      {/* Blurred content placeholder */}
      <div style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,215,0,0.2)',
        borderRadius: 'var(--radius-xl)',
        padding: '3rem 2rem',
        filter: 'blur(4px)',
        userSelect: 'none',
        pointerEvents: 'none',
        minHeight: '180px',
      }}>
        <div style={{ height: '14px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', marginBottom: '0.75rem', width: '70%' }} />
        <div style={{ height: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '0.5rem', width: '90%' }} />
        <div style={{ height: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '0.5rem', width: '60%' }} />
        <div style={{ height: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', width: '80%' }} />
      </div>

      {/* Overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(5,5,16,0.7) 0%, rgba(5,5,16,0.96) 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.25rem',
        padding: '2rem',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid rgba(255,215,0,0.25)',
      }}>
        {/* Lock icon */}
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            width: '56px', height: '56px',
            background: 'linear-gradient(135deg, rgba(255,215,0,0.18), rgba(255,160,0,0.12))',
            border: '1px solid rgba(255,215,0,0.4)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 28px rgba(255,215,0,0.2)',
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </motion.div>

        <div style={{ textAlign: 'center' }}>
          <h3 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.1rem',
            color: '#FFD700',
            letterSpacing: '2px',
            marginBottom: '0.5rem',
            textTransform: 'uppercase',
          }}>
            Contenido Premium
          </h3>
          <p style={{
            color: 'rgba(255,255,255,0.55)',
            fontSize: '0.875rem',
            lineHeight: 1.6,
            maxWidth: '340px',
          }}>
            {token
              ? 'Desbloquea el acceso completo a esta guía con un único pago.'
              : 'Inicia sesión o regístrate para acceder a este contenido premium.'}
          </p>
        </div>

        {priceEuros && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(255,215,0,0.1)',
            border: '1px solid rgba(255,215,0,0.3)',
            borderRadius: '30px',
            padding: '0.4rem 1.1rem',
          }}>
            <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#FFD700', fontFamily: 'var(--font-display)' }}>
              {priceEuros}€
            </span>
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,215,0,0.6)', letterSpacing: '1px' }}>acceso permanente</span>
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.05, boxShadow: '0 8px 28px rgba(255,215,0,0.35)' }}
          whileTap={{ scale: 0.97 }}
          onClick={handleBuy}
          style={{
            background: 'linear-gradient(135deg, #FFD700, #FFA500)',
            border: 'none',
            borderRadius: '14px',
            padding: '0.85rem 2.25rem',
            color: '#000',
            fontFamily: 'var(--font-display)',
            fontWeight: 'bold',
            fontSize: '0.9rem',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '0.6rem',
          }}
        >
          {token ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                <line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
              Comprar ahora
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                <polyline points="10 17 15 12 10 7"/>
                <line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
              Iniciar sesión
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}
