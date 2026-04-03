import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import Navbar from '../components/UI/Navbar';
import Footer from '../components/UI/Footer';
import { useTheme } from '../hooks/useTheme';

// ── Constants ──────────────────────────────────────────────────────────────

const STATE_META = {
  sin_montar:     { label: 'Sin montar',      bg: 'rgba(160,160,170,0.18)', color: '#b0b0b8', border: 'rgba(160,160,170,0.35)' },
  montada:        { label: 'Montada',         bg: 'rgba(60,130,220,0.18)',  color: '#6ab0f5', border: 'rgba(60,130,220,0.4)'  },
  imprimada:      { label: 'Imprimada',       bg: 'rgba(230,120,30,0.18)', color: '#f0924a', border: 'rgba(230,120,30,0.4)'  },
  pintada_parcial:{ label: 'Pintada parcial', bg: 'rgba(220,190,30,0.18)', color: '#e8d040', border: 'rgba(220,190,30,0.4)'  },
  pintada:        { label: 'Pintada',         bg: 'rgba(40,200,100,0.18)', color: '#40c878', border: 'rgba(40,200,100,0.4)'  },
  conversion:     { label: 'Conversión',      bg: 'rgba(160,60,220,0.18)', color: '#c078f0', border: 'rgba(160,60,220,0.4)'  },
};

const STATUS_META = {
  available: { label: 'Disponible', bg: 'rgba(40,200,100,0.2)',  color: '#40c878', border: 'rgba(40,200,100,0.5)'  },
  reserved:  { label: 'Reservado',  bg: 'rgba(220,190,30,0.2)', color: '#e8d040', border: 'rgba(220,190,30,0.5)'  },
  sold:      { label: 'Vendido',    bg: 'rgba(120,120,130,0.2)', color: '#888890', border: 'rgba(120,120,130,0.4)' },
};

const EMPTY_FORM = { name: '', surname: '', email: '', phone: '', address: '', notes: '' };

// ── Shared styles (theme-aware via CSS variables) ──────────────────────────

const getInputStyle = (isLight) => ({
  width: '100%',
  padding: '0.65rem 0.9rem',
  background: isLight ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.06)',
  border: isLight ? '1px solid rgba(0,120,200,0.22)' : '1px solid rgba(255,255,255,0.12)',
  borderRadius: '8px',
  color: isLight ? 'var(--text-primary)' : '#fff',
  fontSize: '0.9rem',
  fontFamily: 'var(--font-body)',
  outline: 'none',
  boxSizing: 'border-box',
});

const getLabelStyle = (isLight) => ({
  display: 'block',
  fontSize: '0.78rem',
  letterSpacing: '0.5px',
  color: isLight ? 'var(--text-dim)' : 'rgba(255,255,255,0.45)',
  marginBottom: '0.35rem',
  textTransform: 'uppercase',
});

// ── Sub-components ─────────────────────────────────────────────────────────

function StateBadge({ state }) {
  const meta = STATE_META[state] || { label: state, bg: 'rgba(255,255,255,0.1)', color: '#aaa', border: 'rgba(255,255,255,0.2)' };
  return (
    <span style={{
      display: 'inline-block',
      padding: '0.2rem 0.55rem',
      borderRadius: '6px',
      fontSize: '0.72rem',
      fontWeight: 600,
      letterSpacing: '0.3px',
      background: meta.bg,
      color: meta.color,
      border: `1px solid ${meta.border}`,
    }}>
      {meta.label}
    </span>
  );
}

function StatusBadge({ status }) {
  // Don't show any badge for available listings — it's the default
  if (!status || status === 'available') return null;
  const meta = STATUS_META[status] || STATUS_META.sold;
  return (
    <span style={{
      display: 'inline-block',
      padding: '0.25rem 0.65rem',
      borderRadius: '6px',
      fontSize: '0.75rem',
      fontWeight: 800,
      letterSpacing: '0.6px',
      textTransform: 'uppercase',
      background: status === 'reserved' ? 'rgba(232,170,0,0.85)' : 'rgba(100,100,110,0.85)',
      color: status === 'reserved' ? '#1a1200' : '#e0e0e8',
      border: `1px solid ${status === 'reserved' ? 'rgba(232,200,0,0.6)' : 'rgba(180,180,190,0.3)'}`,
      boxShadow: status === 'reserved' ? '0 1px 8px rgba(232,170,0,0.35)' : 'none',
    }}>
      {meta.label}
    </span>
  );
}

function ImagePlaceholder() {
  return (
    <div style={{
      width: '100%', aspectRatio: '4/3',
      background: 'rgba(255,255,255,0.03)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'rgba(255,255,255,0.15)',
    }}>
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <path d="M21 15l-5-5L5 21"/>
      </svg>
    </div>
  );
}

// ── Listing Card ───────────────────────────────────────────────────────────

function ListingCard({ listing, onClick }) {
  const [hovered, setHovered] = useState(false);
  const { isLight } = useTheme();
  const img = listing.images && listing.images.length > 0 ? listing.images[0] : null;
  const isSold = listing.status === 'sold';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.18 } }}
      onClick={() => onClick(listing)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: isLight ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.025)',
        border: `1px solid ${hovered ? 'rgba(0,212,255,0.35)' : (isLight ? 'rgba(0,120,200,0.15)' : 'rgba(255,255,255,0.07)')}`,
        borderRadius: '14px',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        boxShadow: hovered
          ? (isLight ? '0 8px 32px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,120,200,0.2)' : '0 8px 32px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,212,255,0.12)')
          : (isLight ? '0 2px 12px rgba(0,0,0,0.07)' : 'none'),
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Image area */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        {img ? (
          <img
            className="mp-card-img"
            src={img}
            alt={listing.title}
            loading="lazy"
            decoding="async"
            style={{
              width: '100%',
              aspectRatio: '4/3',
              objectFit: 'cover',
              display: 'block',
              filter: isSold ? 'grayscale(0.6) brightness(0.7)' : 'none',
              transition: 'transform 0.3s',
              transform: hovered && !isSold ? 'scale(1.04)' : 'scale(1)',
            }}
          />
        ) : (
          <ImagePlaceholder />
        )}

        {/* Sold diagonal banner */}
        {isSold && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.45)',
            overflow: 'hidden',
          }}>
            <div style={{
              transform: 'rotate(-35deg)',
              background: 'rgba(120,120,130,0.85)',
              color: '#fff',
              fontFamily: 'var(--font-display)',
              fontSize: '1.4rem',
              letterSpacing: '4px',
              fontWeight: 900,
              padding: '0.35rem 4rem',
              width: '200%',
              textAlign: 'center',
              textShadow: '0 2px 8px rgba(0,0,0,0.6)',
              border: '2px solid rgba(255,255,255,0.25)',
            }}>
              VENDIDO
            </div>
          </div>
        )}

        {/* Badges overlay */}
        <div className="mp-card-badges" style={{
          position: 'absolute', top: '0.6rem', left: '0.6rem', right: '0.6rem',
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.4rem',
          pointerEvents: 'none',
        }}>
          <StateBadge state={listing.state} />
          <StatusBadge status={listing.status} />
        </div>
      </div>

      {/* Body */}
      <div className="mp-card-body" style={{ padding: '0.9rem 1rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
        <h3 className="mp-card-title" style={{
          margin: 0,
          fontFamily: 'var(--font-display)',
          fontSize: '0.98rem',
          fontWeight: 700,
          color: '#fff',
          letterSpacing: '0.5px',
          lineHeight: 1.3,
        }}>
          {listing.title}
        </h3>

        {listing.faction && (
          <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--color-secondary)', opacity: 0.85, fontWeight: 600, letterSpacing: '0.5px' }}>
            {listing.faction}
          </p>
        )}

        <p className="mp-card-price" style={{
          margin: '0.2rem 0 0',
          fontSize: '1.1rem',
          fontWeight: 800,
          color: 'var(--color-primary)',
          fontFamily: 'var(--font-display)',
          letterSpacing: '0.5px',
        }}>
          {listing.price != null
            ? `${parseFloat(listing.price).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`
            : '—'}
        </p>

        {listing.description && (
          <p style={{
            margin: '0.25rem 0 0',
            fontSize: '0.82rem',
            color: 'rgba(255,255,255,0.5)',
            lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {listing.description}
          </p>
        )}

        <div style={{ marginTop: 'auto', paddingTop: '0.75rem' }}>
          <button className="mp-card-btn" style={{
            background: 'transparent',
            border: `1px solid rgba(0,212,255,${hovered ? '0.5' : '0.25'})`,
            borderRadius: '8px',
            color: 'var(--color-primary)',
            padding: '0.45rem 0.9rem',
            fontSize: '0.82rem',
            fontFamily: 'var(--font-body)',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
            letterSpacing: '0.3px',
            minHeight: '44px',
            width: '100%',
            textAlign: 'center',
          }}>
            Ver detalles →
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Purchase Form ──────────────────────────────────────────────────────────

function PurchaseForm({ listing, onSuccess }) {
  const { isLight } = useTheme();
  const inputStyle = getInputStyle(isLight);
  const labelStyle = getLabelStyle(isLight);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitted, setSubmitted] = useState(null);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.surname.trim() || !form.email.trim()) {
      setError('Por favor, rellena los campos obligatorios (*).');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await api.createPurchaseRequest({
        listing: listing.id,
        name: form.name,
        surname: form.surname,
        email: form.email,
        phone: form.phone,
        address: form.address,
        notes: form.notes,
      });
      setSubmitted({ ...form });
      setSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError('Hubo un error al enviar la solicitud. Por favor, inténtalo de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success && submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'rgba(40,200,100,0.08)',
          border: '1px solid rgba(40,200,100,0.35)',
          borderRadius: '12px',
          padding: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <span style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(40,200,100,0.2)',
            border: '1px solid rgba(40,200,100,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.1rem', flexShrink: 0,
          }}>✓</span>
          <div>
            <p style={{ margin: 0, fontWeight: 700, color: '#40c878', fontFamily: 'var(--font-display)', letterSpacing: '0.5px' }}>
              ¡Solicitud enviada!
            </p>
            <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
              Hemos recibido tu solicitud para <strong style={{ color: '#fff' }}>{listing.title}</strong>.
              El vendedor se pondrá en contacto contigo en el email <strong style={{ color: 'var(--color-primary)' }}>{submitted.email}</strong> en los próximos días.
            </p>
          </div>
        </div>
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '8px',
          padding: '0.85rem 1rem',
          fontSize: '0.82rem',
          color: 'rgba(255,255,255,0.5)',
          lineHeight: 1.7,
        }}>
          <strong style={{ color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: '0.4rem' }}>Resumen de tu solicitud:</strong>
          {submitted.name} {submitted.surname} · {submitted.email}
          {submitted.phone ? ` · ${submitted.phone}` : ''}
          {submitted.address ? <><br />Dirección: {submitted.address}</> : ''}
          {submitted.notes ? <><br />Mensaje: {submitted.notes}</> : ''}
        </div>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      <p style={{ margin: 0, fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>
        * Campos obligatorios
      </p>

      <div className="mp-purchase-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div>
          <label style={labelStyle}>Nombre *</label>
          <input value={form.name} onChange={set('name')} placeholder="Tu nombre" style={inputStyle} required />
        </div>
        <div>
          <label style={labelStyle}>Apellidos *</label>
          <input value={form.surname} onChange={set('surname')} placeholder="Tus apellidos" style={inputStyle} required />
        </div>
      </div>

      <div>
        <label style={labelStyle}>Email *</label>
        <input type="email" value={form.email} onChange={set('email')} placeholder="tu@email.com" style={inputStyle} required />
      </div>

      <div>
        <label style={labelStyle}>Teléfono</label>
        <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+34 600 000 000" style={inputStyle} />
      </div>

      <div>
        <label style={labelStyle}>Dirección</label>
        <input value={form.address} onChange={set('address')} placeholder="Calle, ciudad, código postal..." style={inputStyle} />
      </div>

      <div>
        <label style={labelStyle}>Notas / Mensaje</label>
        <textarea
          value={form.notes}
          onChange={set('notes')}
          placeholder="Cualquier comentario o pregunta..."
          rows={3}
          style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }}
        />
      </div>

      {error && (
        <p style={{
          margin: 0, padding: '0.65rem 0.9rem',
          background: 'rgba(255,68,102,0.1)',
          border: '1px solid rgba(255,68,102,0.3)',
          borderRadius: '8px',
          color: '#ff6464', fontSize: '0.85rem',
        }}>
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        style={{
          padding: '0.75rem 1.5rem',
          borderRadius: '10px',
          border: 'none',
          cursor: submitting ? 'wait' : 'pointer',
          fontSize: '0.95rem',
          fontFamily: 'var(--font-body)',
          fontWeight: 700,
          letterSpacing: '0.5px',
          background: submitting
            ? 'rgba(0,212,255,0.3)'
            : 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
          color: submitting ? 'rgba(255,255,255,0.5)' : '#000',
          transition: 'all 0.2s',
        }}
      >
        {submitting ? 'Enviando...' : 'Enviar solicitud'}
      </button>
    </form>
  );
}

// ── Detail Modal ───────────────────────────────────────────────────────────

function DetailModal({ listing, onClose }) {
  const [activeImage, setActiveImage] = useState(0);
  const [showForm, setShowForm] = useState(false);

  const images = listing.images || [];
  const isUnavailable = listing.status === 'sold' || listing.status === 'reserved';

  // Close on backdrop click or Escape key
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(6px)',
          zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem',
          overflowY: 'auto',
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          onClick={e => e.stopPropagation()}
          className="mp-modal-container"
          style={{
            background: 'var(--color-dark)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '18px',
            width: '100%',
            maxWidth: '860px',
            maxHeight: '90vh',
            overflowY: 'auto',
            position: 'relative',
            boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
          }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: '1rem', right: '1rem',
              zIndex: 10,
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '50%',
              width: 36, height: 36,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'rgba(255,255,255,0.7)',
              cursor: 'pointer', fontSize: '1.1rem',
            }}
            aria-label="Cerrar"
          >
            ✕
          </button>

          <div className="mp-modal-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 0 }}>
            {/* Left: image gallery */}
            <div className="mp-modal-left" style={{ borderRight: '1px solid rgba(255,255,255,0.07)', padding: '1.5rem' }}>
              {/* Main image */}
              <div style={{
                borderRadius: '12px',
                overflow: 'hidden',
                background: 'rgba(255,255,255,0.03)',
                aspectRatio: '4/3',
                marginBottom: '0.75rem',
              }}>
                {images.length > 0 ? (
                  <img
                    src={images[activeImage]}
                    alt={listing.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                ) : (
                  <ImagePlaceholder />
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      style={{
                        width: 56, height: 56,
                        borderRadius: '8px',
                        overflow: 'hidden',
                        border: `2px solid ${activeImage === i ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)'}`,
                        padding: 0, cursor: 'pointer',
                        transition: 'border-color 0.2s',
                        flexShrink: 0,
                      }}
                    >
                      <img src={img} alt="" loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: info + form */}
            <div className="mp-modal-right" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', overflowY: 'auto' }}>
              {/* Badges row */}
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                <StateBadge state={listing.state} />
                <StatusBadge status={listing.status} />
              </div>

              {/* Title */}
              <h2 style={{
                margin: 0,
                fontFamily: 'var(--font-display)',
                fontSize: '1.3rem',
                fontWeight: 800,
                color: '#fff',
                letterSpacing: '0.5px',
                lineHeight: 1.25,
              }}>
                {listing.title}
              </h2>

              {/* Price */}
              <p style={{
                margin: 0,
                fontFamily: 'var(--font-display)',
                fontSize: '1.8rem',
                fontWeight: 800,
                color: 'var(--color-primary)',
                letterSpacing: '1px',
                lineHeight: 1,
              }}>
                {listing.price != null
                  ? `${parseFloat(listing.price).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`
                  : '—'}
              </p>

              {/* Meta */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem 1.5rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.55)' }}>
                {listing.faction && (
                  <span><span style={{ color: 'rgba(255,255,255,0.3)' }}>Facción:</span> <strong style={{ color: 'rgba(255,255,255,0.85)' }}>{listing.faction}</strong></span>
                )}
                {listing.game && (
                  <span><span style={{ color: 'rgba(255,255,255,0.3)' }}>Juego:</span> <strong style={{ color: 'rgba(255,255,255,0.85)' }}>{listing.game}</strong></span>
                )}
              </div>

              {/* Tags */}
              {listing.tags && listing.tags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {listing.tags.map((tag, i) => (
                    <span key={i} style={{
                      padding: '0.2rem 0.6rem',
                      background: 'rgba(0,212,255,0.08)',
                      border: '1px solid rgba(0,212,255,0.2)',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      color: 'var(--color-primary)',
                      opacity: 0.9,
                    }}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Description */}
              {listing.description && (
                <p style={{
                  margin: 0,
                  fontSize: '0.88rem',
                  color: 'rgba(255,255,255,0.6)',
                  lineHeight: 1.65,
                  borderTop: '1px solid rgba(255,255,255,0.06)',
                  paddingTop: '0.75rem',
                }}>
                  {listing.description}
                </p>
              )}

              {/* CTA */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.9rem' }}>
                {isUnavailable ? (
                  <div>
                    <button
                      disabled
                      title={listing.status === 'sold' ? 'Este artículo ya ha sido vendido' : 'Este artículo está reservado'}
                      style={{
                        padding: '0.75rem 1.5rem',
                        borderRadius: '10px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        background: 'rgba(255,255,255,0.04)',
                        color: 'rgba(255,255,255,0.3)',
                        fontSize: '0.95rem',
                        fontFamily: 'var(--font-body)',
                        cursor: 'not-allowed',
                        width: '100%',
                      }}
                    >
                      {listing.status === 'sold' ? 'Vendido — no disponible' : 'Reservado — no disponible'}
                    </button>
                    <p style={{ margin: '0.5rem 0 0', fontSize: '0.78rem', color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>
                      {listing.status === 'sold'
                        ? 'Este artículo ya ha sido vendido.'
                        : 'Este artículo está actualmente reservado para otro comprador.'}
                    </p>
                  </div>
                ) : (
                  <>
                    {!showForm ? (
                      <button
                        onClick={() => setShowForm(true)}
                        style={{
                          padding: '0.8rem 1.5rem',
                          borderRadius: '10px',
                          border: 'none',
                          background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                          color: '#000',
                          fontSize: '0.95rem',
                          fontFamily: 'var(--font-body)',
                          fontWeight: 700,
                          cursor: 'pointer',
                          width: '100%',
                          letterSpacing: '0.5px',
                          transition: 'opacity 0.2s',
                        }}
                      >
                        Lo quiero
                      </button>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                      >
                        <div style={{
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '12px',
                          padding: '1.25rem',
                          marginBottom: '0.75rem',
                        }}>
                          <h4 style={{
                            margin: '0 0 1rem',
                            fontFamily: 'var(--font-display)',
                            fontSize: '0.85rem',
                            letterSpacing: '1px',
                            color: 'rgba(255,255,255,0.7)',
                            textTransform: 'uppercase',
                          }}>
                            Solicitar compra
                          </h4>
                          <PurchaseForm listing={listing} onSuccess={() => {}} />
                        </div>
                        <button
                          onClick={() => setShowForm(false)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'rgba(255,255,255,0.35)',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            padding: '0.25rem',
                            fontFamily: 'var(--font-body)',
                          }}
                        >
                          ← Cancelar
                        </button>
                      </motion.div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          <style>{`
            @media (max-width: 640px) {
              .mp-modal-container {
                border-radius: 12px !important;
                max-height: 95vh !important;
              }
              .mp-modal-grid {
                grid-template-columns: 1fr !important;
              }
              .mp-modal-left {
                border-right: none !important;
                border-bottom: 1px solid rgba(255,255,255,0.07) !important;
                padding: 0.85rem !important;
              }
              .mp-modal-left > div:first-child {
                aspect-ratio: 16/9 !important;
                max-height: 200px !important;
              }
              .mp-modal-right {
                padding: 0.85rem !important;
              }
              .mp-purchase-grid {
                grid-template-columns: 1fr !important;
              }
            }
          `}</style>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

const MarketplacePage = () => {
  const { id: urlId } = useParams();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterFaction, setFilterFaction] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedListing, setSelectedListing] = useState(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    document.title = 'Marketplace | The Immaterium';
  }, []);

  // Debounce search input
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(search), 380);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        const params = {};
        if (filterStatus) params.status = filterStatus;
        if (filterFaction) params.faction = filterFaction;
        if (debouncedSearch) params.search = debouncedSearch;
        const data = await api.getListings(params);
        const arr = Array.isArray(data) ? data : [];
        setListings(arr);
        // If navigated via /marketplace/:id, auto-open that listing
        if (urlId) {
          const match = arr.find(l => String(l.id) === String(urlId));
          if (match) setSelectedListing(match);
        }
      } catch (err) {
        console.error('Failed to fetch listings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, [filterStatus, filterFaction, debouncedSearch, urlId]);

  // Derive unique factions for the filter dropdown
  const factions = [...new Set(listings.map(l => l.faction).filter(Boolean))].sort();

  const filterBarItemStyle = {
    padding: '0.6rem 0.9rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '0.88rem',
    fontFamily: 'var(--font-body)',
    outline: 'none',
    cursor: 'pointer',
    transition: 'border-color 0.2s',
    minWidth: 0,
    boxSizing: 'border-box',
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-darker)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* Hero section */}
      <div style={{
        position: 'relative',
        overflow: 'hidden',
        paddingTop: 'clamp(5rem, 10vw, 7rem)',
        paddingBottom: 'clamp(2.5rem, 5vw, 4rem)',
        textAlign: 'center',
        background: 'linear-gradient(180deg, rgba(0,212,255,0.06) 0%, transparent 100%)',
      }}>
        {/* Decorative grid */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(0,212,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.04) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 0%, transparent 100%)',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.65rem',
            letterSpacing: '5px',
            color: 'var(--color-secondary)',
            textTransform: 'uppercase',
            opacity: 0.8,
            marginBottom: '0.6rem',
          }}>
            Miniaturas de segunda mano
          </p>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.2rem, 7vw, 4rem)',
            textTransform: 'uppercase',
            background: 'linear-gradient(135deg, #fff 30%, var(--color-primary))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            margin: 0,
            letterSpacing: '3px',
            lineHeight: 1.1,
          }}>
            Marketplace
          </h1>
          <p style={{
            marginTop: '1rem',
            fontSize: 'clamp(0.9rem, 2vw, 1.05rem)',
            color: 'rgba(255,255,255,0.45)',
            fontFamily: 'var(--font-body)',
            maxWidth: '480px',
            margin: '0.85rem auto 0',
            lineHeight: 1.55,
          }}>
            Encuentra miniaturas únicas pintadas por la comunidad, o hazte con ellas antes de que caigan en el Warp.
          </p>
        </div>
      </div>

      {/* Main content */}
      <div style={{
        flex: 1,
        maxWidth: '1280px',
        margin: '0 auto',
        padding: 'clamp(1.5rem, 4vw, 2.5rem) clamp(1rem, 4vw, 2rem) clamp(2rem, 4vw, 4rem)',
        width: '100%',
        boxSizing: 'border-box',
      }}>
        {/* Filter bar */}
        <div style={{
          display: 'flex',
          gap: '0.65rem',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '1 1 200px', minWidth: '160px' }}>
            <svg
              width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="rgba(255,255,255,0.35)" strokeWidth="2.5"
              style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            >
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar miniaturas..."
              style={{ ...filterBarItemStyle, paddingLeft: '2.2rem', width: '100%' }}
            />
          </div>

          {/* Status */}
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            style={{ ...filterBarItemStyle, flex: '0 1 160px' }}
          >
            <option value="">Todos los estados</option>
            <option value="available">Disponible</option>
            <option value="reserved">Reservado</option>
            <option value="sold">Vendido</option>
          </select>

          {/* Faction */}
          <select
            value={filterFaction}
            onChange={e => setFilterFaction(e.target.value)}
            style={{ ...filterBarItemStyle, flex: '0 1 180px' }}
          >
            <option value="">Todas las facciones</option>
            {factions.map(f => <option key={f} value={f}>{f}</option>)}
          </select>

          {/* Clear */}
          {(filterStatus || filterFaction || search) && (
            <button
              onClick={() => { setFilterStatus(''); setFilterFaction(''); setSearch(''); }}
              style={{
                ...filterBarItemStyle,
                flex: '0 0 auto',
                background: 'rgba(255,68,102,0.08)',
                border: '1px solid rgba(255,68,102,0.25)',
                color: '#ff8888',
                fontSize: '0.82rem',
              }}
            >
              ✕ Limpiar
            </button>
          )}
        </div>

        {/* Results count */}
        {!loading && (
          <p style={{
            fontSize: '0.8rem',
            color: 'rgba(255,255,255,0.3)',
            marginBottom: '1.25rem',
            letterSpacing: '0.3px',
          }}>
            {listings.length} {listings.length === 1 ? 'resultado' : 'resultados'}
          </p>
        )}

        {/* Grid */}
        {loading ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.25rem',
          }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{
                height: '340px',
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '14px',
                animation: 'pulse 1.5s ease-in-out infinite',
              }} />
            ))}
            <style>{`@keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:0.7} }`}</style>
          </div>
        ) : listings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '16px',
              color: 'rgba(255,255,255,0.3)',
            }}
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" style={{ marginBottom: '1rem', opacity: 0.4 }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <p style={{ fontSize: '1rem', margin: 0, fontFamily: 'var(--font-display)', letterSpacing: '1px' }}>
              No se han encontrado anuncios
            </p>
            <p style={{ fontSize: '0.85rem', margin: '0.5rem 0 0', opacity: 0.6 }}>
              Prueba con otros filtros o vuelve más tarde.
            </p>
          </motion.div>
        ) : (
          <div className="mp-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1.25rem',
          }}>
            <style>{`
              @media (max-width: 900px) { .mp-grid { grid-template-columns: repeat(2, 1fr) !important; } }
              @media (max-width: 560px) { .mp-grid { grid-template-columns: 1fr !important; } }

              /* Mobile card improvements */
              @media (max-width: 560px) {
                .mp-card-img { aspect-ratio: 16/9 !important; }
                .mp-card-body { padding: 0.75rem 0.9rem 0.9rem !important; gap: 0.25rem !important; }
                .mp-card-title { font-size: 0.95rem !important; }
                .mp-card-price { font-size: 1.15rem !important; }
                .mp-card-badges { gap: 0.3rem !important; }
                .mp-card-btn { min-height: 44px !important; font-size: 0.9rem !important; padding: 0.6rem 1rem !important; }
              }
            `}</style>
            {listings.map(listing => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onClick={setSelectedListing}
              />
            ))}
          </div>
        )}
      </div>

      <Footer />

      {/* Detail modal */}
      <AnimatePresence>
        {selectedListing && (
          <DetailModal
            listing={selectedListing}
            onClose={() => setSelectedListing(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MarketplacePage;
