import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../stores/useStore';
import ImageModal from './ImageModal';
import UploadModal from './UploadModal';

export default function Gallery() {
  const { selectedPlanet, returnToGalaxy, selectImage, selectedImage, clearSelectedImage } = useStore();
  const [showUpload, setShowUpload] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);

  if (!selectedPlanet) return null;

  const filteredImages = showFavorites
    ? selectedPlanet.images.filter(img => img.isFavorite)
    : selectedPlanet.images;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    },
    exit: { opacity: 0 }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <motion.div
      className="gallery-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="gallery-header">
        <motion.h1
          className="gallery-title"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
        >
          {selectedPlanet.name}
        </motion.h1>

        <motion.button
          className="back-button"
          onClick={returnToGalaxy}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          ← Volver
        </motion.button>
      </div>

      {/* Favorites Toggle */}
      <motion.button
        onClick={() => setShowFavorites(!showFavorites)}
        style={{
          position: 'absolute',
          top: '20px',
          right: '100px', // Left of back button (if back button is top right, but back is top left in original code? No, back is `x: 50` initial. Let's place it nicely.)
          zIndex: 10,
          background: showFavorites ? '#ff0064' : 'rgba(255,255,255,0.1)',
          border: 'none',
          borderRadius: '20px',
          padding: '0.5rem 1rem',
          color: 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span>{showFavorites ? '♥' : '♡'}</span>
        <span>Favoritos</span>
      </motion.button>

      {filteredImages.length === 0 ? (
        <motion.div
          className="empty-state"
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          <div className="empty-state-icon" style={{ opacity: 0.3 }}>
            {showFavorites
              ? <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              : <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M18.37 2.63 14 7l-1.59-1.59a2 2 0 0 0-2.82 0L8 7l9 9 1.59-1.59a2 2 0 0 0 0-2.82L17 10l4.37-4.37a2.12 2.12 0 1 0-3-3z"/><path d="M9 8c-2 3-4 3.5-7 4l8 10c2-1 6-5 6-7"/><path d="M14.5 17.5 4.5 15"/></svg>
            }
          </div>
          <p className="empty-state-text">
            {showFavorites
              ? "No hay miniaturas favoritas en este ejército."
              : "No hay miniaturas aún. ¡Sube tu primera imagen!"}
          </p>
        </motion.div>
      ) : (
        <motion.div
          className="image-grid"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {filteredImages.map((image, index) => (
            <motion.div
              key={image.id}
              className="image-card"
              variants={itemVariants}
              onClick={() => selectImage(image)}
              whileHover={{
                scale: 1.03,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.98 }}
              layoutId={`image-${image.id}`}
            >
              <img src={image.url} alt={image.name || 'Miniatura'} />
              <div className="image-card-overlay">
                <span className="image-card-title">{image.name || `Miniatura ${index + 1}`}</span>
                {image.isFavorite && (
                  <span style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    display: 'flex'
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none" style={{ color: '#ff6464' }}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Upload Button */}
      <motion.button
        className="upload-button"
        onClick={() => setShowUpload(true)}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
      >
        +
      </motion.button>

      {/* Image Modal */}
      <AnimatePresence>
        {selectedImage && (
          <ImageModal
            image={selectedImage}
            onClose={clearSelectedImage}
          />
        )}
      </AnimatePresence>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUpload && (
          <UploadModal
            armyId={selectedPlanet.id}
            onClose={() => setShowUpload(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
