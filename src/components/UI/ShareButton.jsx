import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ShareButton — copies current page URL to clipboard with a brief confirmation.
 * Inline, minimal, works anywhere.
 */
export default function ShareButton({ url, label = 'Compartir enlace' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const target = url || window.location.href;
    try {
      await navigator.clipboard.writeText(target);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const el = document.createElement('textarea');
      el.value = target;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.button
      onClick={handleCopy}
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
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
