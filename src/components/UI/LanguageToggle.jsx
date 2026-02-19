import React from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../../stores/useStore';

const LanguageToggle = () => {
    const { language, setLanguage } = useStore();

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
                display: 'flex',
                gap: '0.5rem',
                alignItems: 'center',
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '0.4rem',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
        >
            {/* Bandera España */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setLanguage('es')}
                style={{
                    background: language === 'es'
                        ? 'rgba(0, 212, 255, 0.2)'
                        : 'transparent',
                    border: language === 'es'
                        ? '2px solid var(--color-primary)'
                        : '2px solid transparent',
                    borderRadius: '8px',
                    padding: '0.3rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '40px',
                    height: '32px',
                    transition: 'all 0.3s ease',
                    boxShadow: language === 'es'
                        ? '0 0 10px rgba(0, 212, 255, 0.3)'
                        : 'none'
                }}
                title="Español"
            >
                <svg width="28" height="20" viewBox="0 0 900 600" style={{ borderRadius: '4px' }}>
                    <rect width="900" height="600" fill="#c60b1e"/>
                    <rect width="900" height="200" y="200" fill="#ffc400"/>
                </svg>
            </motion.button>

            {/* Bandera UK */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setLanguage('en')}
                style={{
                    background: language === 'en'
                        ? 'rgba(0, 212, 255, 0.2)'
                        : 'transparent',
                    border: language === 'en'
                        ? '2px solid var(--color-primary)'
                        : '2px solid transparent',
                    borderRadius: '8px',
                    padding: '0.3rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '40px',
                    height: '32px',
                    transition: 'all 0.3s ease',
                    boxShadow: language === 'en'
                        ? '0 0 10px rgba(0, 212, 255, 0.3)'
                        : 'none'
                }}
                title="English"
            >
                <svg width="28" height="20" viewBox="0 0 60 30" style={{ borderRadius: '4px' }}>
                    <clipPath id="t">
                        <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/>
                    </clipPath>
                    <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
                    <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
                    <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#t)" stroke="#C8102E" strokeWidth="4"/>
                    <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
                    <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
                </svg>
            </motion.button>
        </motion.div>
    );
};

export default LanguageToggle;

