import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../stores/useStore';

export default function PlanetInfo() {
  const { selectedPlanet, enterPlanet, isTransitioning, currentView } = useStore();

  const showPanel = selectedPlanet && !isTransitioning && currentView === 'galaxy';

  return (
    <AnimatePresence>
      {showPanel && (
        <motion.div
          className="planet-info glass-panel"
          initial={{ opacity: 0, x: -50, y: 20 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: -50, y: 20 }}
          transition={{ type: 'spring', stiffness: 100, damping: 15 }}
          style={{
            maxWidth: '450px',
            height: 'auto',
            maxHeight: '80vh',
            padding: '2.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            zIndex: 40 // Ensure lower than mobile menu (250)
          }}
        >
          {/* Scrollable Content Container */}
          <div style={{ overflowY: 'auto', paddingRight: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '12px',
                background: 'rgba(0,0,0,0.3)',
                padding: '5px',
                border: `1px solid ${selectedPlanet.color}`,
                flexShrink: 0
              }}>
                <img
                  src={selectedPlanet.iconUrl}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>
              <div>
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  style={{ margin: 0, fontSize: '1.8rem', color: selectedPlanet.emissive }}
                >
                  {selectedPlanet.name}
                </motion.h2>
                <p style={{ margin: 0, color: '#aaa', fontSize: '0.9rem' }}>
                  {selectedPlanet.planetName}
                </p>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              style={{
                borderLeft: `3px solid ${selectedPlanet.color}`,
                paddingLeft: '1rem',
                background: 'rgba(255,255,255,0.02)',
                padding: '1rem',
                borderRadius: '0 8px 8px 0'
              }}
            >
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#fff' }}>Misión</h4>
              <p style={{ margin: 0, fontSize: '1rem', fontStyle: 'italic', color: '#ddd' }}>
                "{selectedPlanet.description}"
              </p>
            </motion.div>

            {selectedPlanet.history && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <h4 style={{ margin: '0 0 0.5rem 0', color: selectedPlanet.emissive }}>Historia</h4>
                <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.6', color: '#ccc' }}>
                  {selectedPlanet.history}
                </p>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px',
                marginTop: '0.5rem'
              }}
            >
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.8rem', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff' }}>
                  {selectedPlanet.images.length}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase' }}>Fotografías</div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.8rem', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff' }}>
                  {selectedPlanet.size}AU
                </div>
                <div style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase' }}>Tamaño</div>
              </div>
            </motion.div>
          </div>

          {/* Sticky Button */}
          <motion.button
            className="enter-button"
            onClick={enterPlanet}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            whileHover={{
              scale: 1.02,
              boxShadow: `0 0 20px ${selectedPlanet.color}40`
            }}
            whileTap={{ scale: 0.98 }}
            style={{
              width: '100%',
              justifyContent: 'center',
              marginTop: 'auto', // Pushes to bottom in flex container
              flexShrink: 0
            }}
          >
            VER MINIATURAS
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
