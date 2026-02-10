import { motion } from 'framer-motion';

export default function ImageModal({ image, onClose }) {
  return (
    <motion.div
      className="image-modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="image-modal-content"
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        layoutId={`image-${image.id}`}
      >
        <motion.img
          src={image.url}
          alt={image.name || 'Miniatura'}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          style={{
            maxWidth: '95vw',
            maxHeight: '90vh',
            objectFit: 'contain', // Changed from cover/default to contain
            borderRadius: '8px',
            boxShadow: '0 0 50px rgba(0,0,0,0.5)'
          }}
          onClick={(e) => e.stopPropagation()}
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
      >
        ✕
      </motion.button>
    </motion.div>
  );
}
