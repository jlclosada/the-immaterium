import { motion } from 'framer-motion';
import { useStore } from '../../stores/useStore';
import { useState, useEffect } from 'react';

export default function GuideDetail() {
    const { selectedGuide, clearSelectedGuide, returnToGalaxy, toggleLike, userLikes, incrementViews, addComment } = useStore();
    const [commentText, setCommentText] = useState('');

    useEffect(() => {
        if (selectedGuide) {
            incrementViews(selectedGuide.id, 'guide');
        }
    }, [selectedGuide]);

    if (!selectedGuide) {
        return null;
    }

    const isLiked = userLikes.includes(selectedGuide.id);

    const handleBack = () => {
        clearSelectedGuide();
        useStore.getState().setCurrentView('guides');
    };

    const handleAddComment = () => {
        if (commentText.trim()) {
            addComment(selectedGuide.id, 'guide', commentText);
            setCommentText('');
        }
    };

    return (
        <motion.div
            className="guide-detail"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                padding: '6rem 2rem 2rem',
                overflowY: 'auto',
                background: 'linear-gradient(180deg, rgba(10,10,20,0.95) 0%, rgba(5,5,15,0.98) 100%)',
                zIndex: 100
            }}
        >
            {/* Close Button */}
            <motion.button
                onClick={() => {
                    clearSelectedGuide();
                    setCurrentView('galaxy');
                }}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                style={{
                    position: 'fixed',
                    top: '1.5rem',
                    right: '1.5rem',
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)',
                    border: '2px solid rgba(255,255,255,0.3)',
                    color: '#fff',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    backdropFilter: 'blur(10px)'
                }}
            >
                ✕
            </motion.button>

            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                {/* Back Button */}
                <motion.button
                    onClick={handleBack}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                        padding: '0.8rem 1.5rem',
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px',
                        color: '#fff',
                        cursor: 'pointer',
                        marginBottom: '2rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <span>←</span>
                    <span>Volver a Guías</span>
                </motion.button>

                {/* Header */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="glass-panel"
                    style={{ padding: '2rem', marginBottom: '2rem' }}
                >
                    <h1 style={{
                        fontSize: '2.5rem',
                        marginBottom: '1rem',
                        color: '#fff'
                    }}>
                        {selectedGuide.title}
                    </h1>

                    <div style={{
                        display: 'flex',
                        gap: '2rem',
                        marginBottom: '1.5rem',
                        flexWrap: 'wrap',
                        color: '#aaa'
                    }}>
                        <span>👤 {selectedGuide.author}</span>
                        <span>⏱️ {selectedGuide.estimatedTime}</span>
                        <span>📊 {selectedGuide.difficulty}</span>
                        <span>📅 {new Date(selectedGuide.dateCreated).toLocaleDateString('es-ES')}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                        {selectedGuide.tags.map(tag => (
                            <span
                                key={tag}
                                style={{
                                    padding: '0.4rem 1rem',
                                    background: 'rgba(0,206,209,0.2)',
                                    borderRadius: '12px',
                                    fontSize: '0.9rem',
                                    color: '#00ced1'
                                }}
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>

                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                        <button
                            onClick={() => toggleLike(selectedGuide.id, 'guide')}
                            style={{
                                padding: '0.8rem 1.5rem',
                                background: isLiked ? 'rgba(255,0,100,0.3)' : 'rgba(255,255,255,0.1)',
                                border: `1px solid ${isLiked ? '#ff0064' : 'rgba(255,255,255,0.2)'}`,
                                borderRadius: '8px',
                                color: '#fff',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <span>{isLiked ? '❤️' : '🤍'}</span>
                            <span>{selectedGuide.likes}</span>
                        </button>

                        <span style={{ color: '#888' }}>👁️ {selectedGuide.views} vistas</span>
                    </div>
                </motion.div>

                {/* Cover Image */}
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    style={{
                        marginBottom: '2rem',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                    }}
                >
                    <img
                        src={selectedGuide.coverImage}
                        alt={selectedGuide.title}
                        style={{ width: '100%', height: 'auto', display: 'block' }}
                    />
                </motion.div>

                {/* Materials List */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="glass-panel"
                    style={{ padding: '2rem', marginBottom: '2rem' }}
                >
                    <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem', color: '#00ced1' }}>
                        Materiales Necesarios
                    </h2>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {selectedGuide.materials.map((material, index) => (
                            <li
                                key={index}
                                style={{
                                    padding: '0.8rem 0',
                                    borderBottom: index < selectedGuide.materials.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none',
                                    color: '#ddd'
                                }}
                            >
                                ✓ {material}
                            </li>
                        ))}
                    </ul>
                </motion.div>

                {/* Steps */}
                {selectedGuide.steps.map((step, index) => (
                    <motion.div
                        key={step.stepNumber}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 * (index + 3) }}
                        className="glass-panel"
                        style={{ padding: '2rem', marginBottom: '2rem' }}
                    >
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            marginBottom: '1rem'
                        }}>
                            <div style={{
                                width: '50px',
                                height: '50px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #00ced1, #87cefa)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem',
                                fontWeight: 'bold',
                                color: '#000'
                            }}>
                                {step.stepNumber}
                            </div>
                            <h3 style={{ fontSize: '1.5rem', color: '#fff', margin: 0 }}>
                                {step.title}
                            </h3>
                        </div>

                        <p style={{ color: '#ddd', lineHeight: '1.8', marginBottom: '1.5rem' }}>
                            {step.description}
                        </p>

                        {step.images.length > 0 && (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                                gap: '1rem',
                                marginBottom: '1.5rem'
                            }}>
                                {step.images.map((img, imgIndex) => (
                                    <img
                                        key={imgIndex}
                                        src={img}
                                        alt={`Paso ${step.stepNumber} - ${imgIndex + 1}`}
                                        style={{
                                            width: '100%',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                                        }}
                                    />
                                ))}
                            </div>
                        )}

                        {step.tips.length > 0 && (
                            <div style={{
                                background: 'rgba(0,206,209,0.1)',
                                border: '1px solid rgba(0,206,209,0.3)',
                                borderRadius: '8px',
                                padding: '1rem'
                            }}>
                                <h4 style={{ color: '#00ced1', marginBottom: '0.5rem' }}>💡 Consejos:</h4>
                                <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#ddd' }}>
                                    {step.tips.map((tip, tipIndex) => (
                                        <li key={tipIndex} style={{ marginBottom: '0.3rem' }}>{tip}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </motion.div>
                ))}

                {/* Comments Section */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="glass-panel"
                    style={{ padding: '2rem' }}
                >
                    <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: '#fff' }}>
                        Comentarios ({selectedGuide.comments.length})
                    </h2>

                    <div style={{ marginBottom: '2rem' }}>
                        <textarea
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Añade un comentario..."
                            style={{
                                width: '100%',
                                minHeight: '100px',
                                padding: '1rem',
                                borderRadius: '8px',
                                border: '1px solid rgba(255,255,255,0.2)',
                                background: 'rgba(0,0,0,0.3)',
                                color: '#fff',
                                fontSize: '1rem',
                                resize: 'vertical',
                                marginBottom: '1rem'
                            }}
                        />
                        <button
                            onClick={handleAddComment}
                            disabled={!commentText.trim()}
                            style={{
                                padding: '0.8rem 1.5rem',
                                background: commentText.trim() ? 'linear-gradient(135deg, #00ced1, #87cefa)' : 'rgba(255,255,255,0.1)',
                                border: 'none',
                                borderRadius: '8px',
                                color: commentText.trim() ? '#000' : '#666',
                                cursor: commentText.trim() ? 'pointer' : 'not-allowed',
                                fontWeight: 'bold'
                            }}
                        >
                            Publicar Comentario
                        </button>
                    </div>

                    {selectedGuide.comments.map((comment) => (
                        <div
                            key={comment.id}
                            style={{
                                padding: '1rem',
                                borderBottom: '1px solid rgba(255,255,255,0.1)',
                                marginBottom: '1rem'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ fontWeight: 'bold', color: '#00ced1' }}>{comment.author}</span>
                                <span style={{ color: '#888', fontSize: '0.9rem' }}>
                                    {new Date(comment.date).toLocaleDateString('es-ES')}
                                </span>
                            </div>
                            <p style={{ color: '#ddd', margin: 0 }}>{comment.text}</p>
                        </div>
                    ))}

                    {selectedGuide.comments.length === 0 && (
                        <p style={{ color: '#888', textAlign: 'center', padding: '2rem 0' }}>
                            Sé el primero en comentar esta guía
                        </p>
                    )}
                </motion.div>
            </div>
        </motion.div>
    );
}
