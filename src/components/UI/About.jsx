import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../stores/useStore';

export default function About() {
    const { currentView, setCurrentView } = useStore();

    if (currentView !== 'about') return null;

    return (
        <AnimatePresence>
            <motion.div
                className="about-overlay"
                initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                animate={{ opacity: 1, backdropFilter: 'blur(10px)' }}
                exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    background: 'rgba(0, 0, 0, 0.8)',
                    zIndex: 200,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '2rem'
                }}
                onClick={() => setCurrentView('galaxy')}
            >
                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: 'spring', delay: 0.1 }}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        background: 'rgba(20, 20, 30, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '24px',
                        padding: '3rem',
                        maxWidth: '600px',
                        width: '100%',
                        color: 'white',
                        boxShadow: '0 0 50px rgba(0, 0, 0, 0.5)',
                        position: 'relative'
                    }}
                >
                    <h1 style={{
                        fontFamily: 'Orbitron, sans-serif',
                        fontSize: '2.5rem',
                        marginBottom: '1rem',
                        background: 'linear-gradient(45deg, #00d4ff, #ff00ff)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        THE IMMATERIUM
                    </h1>

                    <p style={{ lineHeight: '1.6', color: '#ccc', marginBottom: '1.5rem' }}>
                        Bienvenido a mi proyecto personal, donde comparto mi trabajo de desarrollo web y mi pasión por el universo de Warhammer 40k. En esta plataforma podras ver mi trabajo de pintura de las diferentes facciones que colecciono, asi como subir tus propias fotos de tus miniaturas. Este proyecto es una forma de combinar mis habilidades técnicas con mi amor por este universo oscuro y fascinante. Espero que disfrutes explorando la galaxia tanto como yo disfruté creándola.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px' }}>
                            <h3 style={{ margin: '0 0 0.5rem 0', color: '#00d4ff' }}>Tecnología</h3>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#888' }}>
                                React Three Fiber<br />
                                Zustand<br />
                                Framer Motion<br />
                                Shaders GLSL
                            </p>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px' }}>
                            <h3 style={{ margin: '0 0 0.5rem 0', color: '#ff00ff' }}>Créditos</h3>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#888' }}>
                                Desarrollado por<br />
                                José Luis Cáceres<br />
                                2026
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => setCurrentView('galaxy')}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            background: 'linear-gradient(90deg, #00d4ff, #ff00ff)',
                            border: 'none',
                            borderRadius: '12px',
                            color: 'white',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            textTransform: 'uppercase',
                            letterSpacing: '2px',
                            transition: 'transform 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        Regresar a la Galaxia
                    </button>

                    <button
                        onClick={() => setCurrentView('galaxy')}
                        style={{
                            position: 'absolute',
                            top: '1.5rem',
                            right: '1.5rem',
                            background: 'none',
                            border: 'none',
                            color: 'rgba(255,255,255,0.5)',
                            fontSize: '1.5rem',
                            cursor: 'pointer'
                        }}
                    >
                        ✕
                    </button>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
