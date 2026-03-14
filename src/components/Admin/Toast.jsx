import React, { createContext, useContext, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const ToastContext = createContext(null)

export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

const ICONS = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
}

const COLORS = {
  success: { border: '#00ff88', bg: 'rgba(0,255,136,0.1)', icon: '#00ff88' },
  error: { border: '#ff4466', bg: 'rgba(255,68,102,0.1)', icon: '#ff4466' },
  warning: { border: '#ffd700', bg: 'rgba(255,215,0,0.1)', icon: '#ffd700' },
  info: { border: '#00d4ff', bg: 'rgba(0,212,255,0.1)', icon: '#00d4ff' },
}

let toastIdCounter = 0

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = ++toastIdCounter
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, duration)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div style={{
        position: 'fixed',
        top: '1.5rem',
        right: '1.5rem',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        pointerEvents: 'none',
      }}>
        <AnimatePresence>
          {toasts.map(toast => {
            const c = COLORS[toast.type] || COLORS.info
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 60, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 60, scale: 0.9 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.9rem 1.2rem',
                  background: c.bg,
                  border: `1px solid ${c.border}`,
                  borderRadius: '12px',
                  backdropFilter: 'blur(20px)',
                  boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px ${c.border}22`,
                  minWidth: '260px',
                  maxWidth: '380px',
                  pointerEvents: 'auto',
                  cursor: 'pointer',
                }}
                onClick={() => removeToast(toast.id)}
              >
                <span style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: c.border + '22',
                  border: `1px solid ${c.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: c.icon,
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                  flexShrink: 0,
                }}>
                  {ICONS[toast.type]}
                </span>
                <span style={{
                  color: 'rgba(255,255,255,0.9)',
                  fontSize: '0.9rem',
                  fontFamily: 'var(--font-body)',
                  lineHeight: 1.4,
                  flex: 1,
                }}>
                  {toast.message}
                </span>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}
