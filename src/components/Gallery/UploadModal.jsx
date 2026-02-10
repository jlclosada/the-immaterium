import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../../stores/useStore';

export default function UploadModal({ armyId, onClose }) {
  const [isDragging, setIsDragging] = useState(false);
  const [imageName, setImageName] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const { addImageToArmy } = useStore();

  const handleFile = (file) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecciona una imagen');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, []);

  const handleFileInput = useCallback((e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, []);


  const handleSubmit = () => {
    if (!previewUrl) return;

    const imageData = {
      id: Date.now().toString(),
      url: previewUrl,
      name: imageName || 'Sin nombre',
      createdAt: new Date().toISOString()
    };

    addImageToArmy(armyId, imageData);
    onClose();
  };

  return (
    <motion.div
      className="upload-modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="upload-modal-content glass-panel"
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{
          marginBottom: '30px',
          fontFamily: 'var(--font-display)',
          background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          SUBIR MINIATURA
        </h2>

        {!previewUrl ? (
          <label
            className={`upload-dropzone ${isDragging ? 'drag-over' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              style={{ display: 'none' }}
            />
            <div className="upload-dropzone-icon">📷</div>
            <p className="upload-dropzone-text">
              Arrastra una imagen o haz clic para seleccionar
            </p>
          </label>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div style={{
              marginBottom: '20px',
              borderRadius: '15px',
              overflow: 'hidden',
              border: '2px solid var(--glass-border)'
            }}>
              <img
                src={previewUrl}
                alt="Preview"
                style={{
                  width: '100%',
                  maxHeight: '200px',
                  objectFit: 'cover'
                }}
              />
            </div>

            <input
              type="text"
              placeholder="Nombre de la miniatura (opcional)"
              value={imageName}
              onChange={(e) => setImageName(e.target.value)}
              style={{
                width: '100%',
                padding: '15px 20px',
                marginBottom: '20px',
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                borderRadius: '10px',
                color: 'var(--color-light)',
                fontFamily: 'var(--font-body)',
                fontSize: '1rem',
                outline: 'none'
              }}
            />
          </motion.div>
        )}

        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
          <motion.button
            className="nav-button"
            onClick={onClose}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            CANCELAR
          </motion.button>

          {previewUrl && (
            <motion.button
              className="enter-button"
              onClick={handleSubmit}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                border: 'none',
                borderRadius: '30px',
                padding: '15px 30px',
                color: 'var(--color-light)',
                fontFamily: 'var(--font-display)',
                fontSize: '0.9rem',
                letterSpacing: '2px',
                cursor: 'pointer'
              }}
            >
              SUBIR
            </motion.button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
