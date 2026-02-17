import { motion } from 'framer-motion';
import { useState } from 'react';

export default function ImageModal({ image, onClose }) {
  const [isZoomed, setIsZoomed] = useState(false);

  const toggleZoom = (e) => {
    e.stopPropagation();
    setIsZoomed(!isZoomed);
  };

  return (
    <motion.div
      className="image-modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.95)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: isZoomed ? 'zoom-out' : 'default'
      }}
    >
      <motion.div
        className="image-modal-content"
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        layoutId={`image-${image.id}`}
        style={{
          width: isZoomed ? '100%' : 'auto',
          height: isZoomed ? '100%' : 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: isZoomed ? 'auto' : 'hidden'
        }}
      >
        <motion.img
          src={image.url}
          alt={image.name || 'Miniatura'}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          style={{
            maxWidth: isZoomed ? 'none' : '95vw',
            maxHeight: isZoomed ? 'none' : '90vh',
            objectFit: 'contain',
            borderRadius: '8px',
            boxShadow: '0 0 50px rgba(0,0,0,0.5)',
            cursor: isZoomed ? 'zoom-out' : 'zoom-in',
            transition: 'all 0.3s ease'
          }}
          onClick={toggleZoom}
        />
      </motion.div>

      <motion.button
        className="close-modal"
        onClick={onClose}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0 }}
        transition={{ delay: 0.1 }}
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: 'rgba(255,255,255,0.1)',
          border: 'none',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          color: 'white',
          fontSize: '24px',
          cursor: 'pointer',
          zIndex: 2001,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        ✕
      </motion.button>
    </motion.div>
  );
}
