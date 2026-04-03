import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ShareButton — uses the native Web Share API when available (mobile),
 * otherwise falls back to clipboard copy with a brief confirmation.
 */
export default function ShareButton({ url, title, label = 'Compartir' }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const target = url || window.location.href;
    const shareTitle = title || document.title;

    // Use native share sheet on mobile (Chrome Android, Safari iOS, etc.)
    if (navigator.share) {
      try {
        await navigator.share({ title: shareTitle, url: target });
        return;
      } catch (e) {
        // User cancelled or share failed — fall through to clipboard
        if (e.name === 'AbortError') return;
      }
    }

    // Desktop fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(target);
    } catch {
      // Legacy fallback for old browsers
      const el = document.createElement('textarea');
      el.value = target;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.button
      onClick={handleShare}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.96 }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.45rem',
        padding: '0.4rem 0.9rem',
        background: copied ? 'rgba(80,200,120,0.12)' : 'rgba(255,255,255,0.05)',
        border: `1px solid ${copied ? 'rgba(80,200,120,0.35)' : 'rgba(255,255,255,0.1)'}`,
        borderRadius: '20px',
        color: copied ? '#50c878' : 'rgba(255,255,255,0.45)',
        fontSize: '0.75rem',
        fontFamily: 'var(--font-body)',
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all 0.25s ease',
        letterSpacing: '0.3px',
        minHeight: '32px',
        whiteSpace: 'nowrap',
      }}
      title={label}
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.span
            key="check"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            ¡Copiado!
          </motion.span>
        ) : (
          <motion.span
            key="link"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3"/>
              <circle cx="6" cy="12" r="3"/>
              <circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
