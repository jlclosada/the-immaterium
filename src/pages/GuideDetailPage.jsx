import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import { useStore } from '../stores/useStore';

const GuideDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toggleLike, userLikes, incrementViews, addComment } = useStore();
    const [guide, setGuide] = useState(null);
    const [loading, setLoading] = useState(true);
    const [commentText, setCommentText] = useState('');

    useEffect(() => {
        const fetchGuide = async () => {
            try {
                const data = await api.getGuide(id);
                setGuide(data);
                incrementViews(id, 'guide');
            } catch (error) {
                console.error('Failed to fetch guide:', error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchGuide();
        }
    }, [id]);

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                background: 'var(--color-darker)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div className="loading-spinner"></div>
            </div>
        );
    }

    if (!guide) {
        return (
            <div style={{
                minHeight: '100vh',
                background: 'var(--color-darker)',
                padding: '4rem 2rem',
                color: 'var(--color-light)',
                textAlign: 'center'
            }}>
                <h1>Guía no encontrada</h1>
                <Link to="/guides" style={{ color: 'var(--color-primary)' }}>Volver a Guías</Link>
            </div>
        );
    }

    const isLiked = userLikes.includes(guide.id);

    const handleAddComment = () => {
        if (commentText.trim()) {
            addComment(guide.id, 'guide', commentText);
            setCommentText('');
            // Refresh guide to show new comment
            api.getGuide(id).then(setGuide);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--color-darker)',
            padding: '4rem 2rem',
            color: 'var(--color-light)'
        }}>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                <Link 
                    to="/guides"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: 'var(--color-primary)',
                        textDecoration: 'none',
                        marginBottom: '2rem',
                        fontSize: '1.1rem'
                    }}
                >
                    ← Volver a Guías
                </Link>

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
                        {guide.title}
                    </h1>

                    <div style={{
                        display: 'flex',
                        gap: '2rem',
                        marginBottom: '1.5rem',
                        flexWrap: 'wrap',
                        color: '#aaa'
                    }}>
                        <span>👤 {guide.author}</span>
                        <span>⏱️ {guide.estimatedTime}</span>
                        <span>📊 {guide.difficulty}</span>
                        <span>📅 {new Date(guide.dateCreated).toLocaleDateString('es-ES')}</span>
                        {guide.faction && (
                            <span style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                <img 
                                    src={guide.faction.iconUrl} 
                                    alt={guide.faction.name}
                                    style={{
                                        width: '20px',
                                        height: '20px',
                                        objectFit: 'contain'
                                    }}
                                />
                                {guide.faction.name}
                            </span>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                        {guide.tags && guide.tags.map(tag => (
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
                            onClick={() => toggleLike(guide.id, 'guide')}
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
                            <span>{guide.likes}</span>
                        </button>

                        <span style={{ color: '#888' }}>👁️ {guide.views} vistas</span>
                    </div>
                </motion.div>

                {/* Cover Image */}
                {guide.coverImage && (
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
                            src={guide.coverImage}
                            alt={guide.title}
                            style={{ width: '100%', height: 'auto', display: 'block' }}
                        />
                    </motion.div>
                )}

                {/* Materials List */}
                {guide.materials && guide.materials.length > 0 && (
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
                            {guide.materials.map((material, index) => (
                                <li
                                    key={index}
                                    style={{
                                        padding: '0.8rem 0',
                                        borderBottom: index < guide.materials.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none',
                                        color: '#ddd'
                                    }}
                                >
                                    ✓ {material}
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                )}

                {/* Steps */}
                {guide.steps && guide.steps.map((step, index) => (
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

                        {step.images && step.images.length > 0 && (
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

                        {step.tips && step.tips.length > 0 && (
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
                        Comentarios ({guide.comments ? guide.comments.length : 0})
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

                    {guide.comments && guide.comments.map((comment) => (
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

                    {(!guide.comments || guide.comments.length === 0) && (
                        <p style={{ color: '#888', textAlign: 'center', padding: '2rem 0' }}>
                            Sé el primero en comentar esta guía
                        </p>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default GuideDetailPage;

