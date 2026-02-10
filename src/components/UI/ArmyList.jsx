import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../stores/useStore';

export default function ArmyList() {
    const { armies, selectPlanet, currentView, setCurrentView } = useStore();

    if (currentView !== 'armyList') return null;

    return (
        <AnimatePresence>
            <motion.div
                className="army-list-overlay"
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
                    zIndex: 200, // Ensure it's above everything
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '2rem'
                }}
            >
                <div style={{
                    width: '100%',
                    maxWidth: '1200px',
                    height: '80%',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '2rem',
                    overflowY: 'auto',
                    padding: '1rem',
                    marginTop: '2rem' // Add margin for header space if needed
                }}>
                    {armies.map((army, index) => (
                        <motion.div
                            key={army.id}
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.05, translateY: -5 }}
                            onClick={() => {
                                selectPlanet(army.id);
                                setCurrentView('galaxy');
                            }}
                            style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: `1px solid ${army.color}`,
                                borderRadius: '16px',
                                padding: '2rem',
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '1rem',
                                boxShadow: `0 0 20px ${army.color}20`,
                                backdropFilter: 'blur(10px)'
                            }}
                        >
                            <div style={{
                                width: '100px',
                                height: '100px',
                                filter: `drop-shadow(0 0 15px ${army.emissive})`
                            }}>
                                <img
                                    src={army.iconUrl}
                                    alt={army.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                />
                            </div>

                            <h2 style={{
                                fontFamily: 'Orbitron, sans-serif',
                                color: army.emissive,
                                fontSize: '1.5rem',
                                textAlign: 'center',
                                margin: 0
                            }}>
                                {army.name}
                            </h2>

                            <p style={{
                                color: '#aaa',
                                textAlign: 'center',
                                margin: 0,
                                fontSize: '0.9rem'
                            }}>
                                {army.description}
                            </p>

                            <div style={{
                                marginTop: 'auto',
                                padding: '0.5rem 1rem',
                                border: `1px solid ${army.emissive}`,
                                borderRadius: '20px',
                                color: army.emissive,
                                fontSize: '0.8rem',
                                textTransform: 'uppercase',
                                letterSpacing: '1px'
                            }}>
                                Ver Planeta
                            </div>
                        </motion.div>
                    ))}
                </div>

                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setCurrentView('galaxy')}
                    style={{
                        position: 'absolute',
                        top: '6rem', // Moved down to avoid navbar overlap
                        right: '2rem',
                        background: 'none',
                        border: 'none',
                        color: 'white',
                        fontSize: '2rem',
                        cursor: 'pointer'
                    }}
                >
                    ✕
                </motion.button>
            </motion.div>
        </AnimatePresence>
    );
}
