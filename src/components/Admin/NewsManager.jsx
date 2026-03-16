import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../../services/api';
import { useStore } from '../../stores/useStore';
import { useToast } from './Toast';

const inputStyle = {
    padding: '0.9rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid var(--glass-border)',
    borderRadius: '8px',
    color: 'var(--color-light)',
    fontSize: '0.95rem',
    width: '100%',
};

const NewsManager = () => {
    const [articles, setArticles] = useState([]);
    const [editing, setEditing] = useState(null);
    const token = useStore(state => state.token);
    const toast = useToast();
    const [newTagInput, setNewTagInput] = useState('');
    const [newImageUrl, setNewImageUrl] = useState('');
    const [formData, setFormData] = useState({
        id: '',
        title: '',
        content: '',
        coverImage: '',
        images: [],
        author: 'Administratum',
        tags: [],
        isPublished: true,
    });

    useEffect(() => { loadArticles(); }, []);

    const loadArticles = async () => {
        try {
            const data = await api.getNewsArticles();
            setArticles(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editing) {
                await api.updateNewsArticle(editing.id, formData, token);
                toast('Artículo actualizado', 'success');
            } else {
                await api.createNewsArticle(formData, token);
                toast('Artículo creado', 'success');
            }
            loadArticles();
            handleCancel();
        } catch (err) {
            toast('Error: ' + err.message, 'error');
        }
    };

    const handleEdit = (article) => {
        setEditing(article);
        setFormData({
            id: article.id,
            title: article.title,
            content: article.content,
            coverImage: article.coverImage || '',
            images: article.images || [],
            author: article.author || 'Administratum',
            tags: article.tags || [],
            isPublished: article.isPublished !== false,
        });
    };

    const handleDelete = async (id) => {
        try {
            await api.deleteNewsArticle(id, token);
            toast('Artículo eliminado', 'success');
            loadArticles();
        } catch (err) {
            toast('Error: ' + err.message, 'error');
        }
    };

    const handleCancel = () => {
        setEditing(null);
        setFormData({ id: '', title: '', content: '', coverImage: '', images: [], author: 'Administratum', tags: [], isPublished: true });
        setNewTagInput('');
        setNewImageUrl('');
    };

    const addTag = () => {
        const t = newTagInput.trim();
        if (t && !formData.tags.includes(t)) {
            setFormData({ ...formData, tags: [...formData.tags, t] });
            setNewTagInput('');
        }
    };

    const addImage = () => {
        if (newImageUrl.trim()) {
            setFormData({ ...formData, images: [...formData.images, newImageUrl.trim()] });
            setNewImageUrl('');
        }
    };

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-primary)', marginBottom: '2rem', fontSize: '2.5rem' }}>
                    Gestión de Noticias
                </h2>
            </motion.div>

            {/* Form */}
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
                className="glass-panel"
                style={{ padding: '2rem', marginBottom: '2rem', maxHeight: '85vh', overflowY: 'auto' }}
            >
                <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontFamily: 'var(--font-display)', color: 'var(--color-primary)', fontSize: '1.4rem' }}>
                    {editing ? 'Editar Artículo' : 'Nuevo Artículo'}
                </h3>
                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.25rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.4rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>ID *</label>
                            <input placeholder="noticia-1" value={formData.id} onChange={e => setFormData({ ...formData, id: e.target.value })} disabled={!!editing} required style={inputStyle} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.4rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>Título *</label>
                            <input placeholder="Título del artículo" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required style={inputStyle} />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.4rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>URL Imagen de Portada</label>
                            <input type="url" placeholder="https://res.cloudinary.com/..." value={formData.coverImage} onChange={e => setFormData({ ...formData, coverImage: e.target.value })} style={inputStyle} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.4rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>Autor</label>
                            <input placeholder="Administratum" value={formData.author} onChange={e => setFormData({ ...formData, author: e.target.value })} style={inputStyle} />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.4rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>
                            Contenido (Markdown) *
                        </label>
                        <textarea
                            placeholder="# Título&#10;&#10;Escribe el contenido en **Markdown**...&#10;&#10;Puedes usar _cursiva_, **negrita**, [enlaces](url), etc."
                            value={formData.content}
                            onChange={e => setFormData({ ...formData, content: e.target.value })}
                            required
                            style={{ ...inputStyle, minHeight: '280px', resize: 'vertical', fontFamily: 'monospace', lineHeight: 1.6 }}
                        />
                    </div>

                    {/* Images */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.4rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>Imágenes adicionales (Cloudinary)</label>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                            <input placeholder="https://..." value={newImageUrl} onChange={e => setNewImageUrl(e.target.value)}
                                onKeyPress={e => { if (e.key === 'Enter') { e.preventDefault(); addImage(); } }}
                                style={{ ...inputStyle, width: 'auto', flex: 1 }} />
                            <button type="button" onClick={addImage} style={{ padding: '0.8rem 1.2rem', background: 'var(--color-primary)', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                                + Añadir
                            </button>
                        </div>
                        {formData.images.length > 0 && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.5rem' }}>
                                {formData.images.map((url, i) => (
                                    <div key={i} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        <img src={url} alt="" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }} />
                                        <button type="button" onClick={() => setFormData({ ...formData, images: formData.images.filter((_, j) => j !== i) })}
                                            style={{ position: 'absolute', top: '3px', right: '3px', background: 'rgba(0,0,0,0.7)', border: 'none', color: '#ff6464', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Tags */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.4rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>Tags</label>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                            {formData.tags.map(tag => (
                                <span key={tag} style={{ padding: '0.4rem 0.9rem', background: 'rgba(0,212,255,0.15)', borderRadius: '20px', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                                    {tag}
                                    <button type="button" onClick={() => setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) })} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontSize: '1rem', lineHeight: 1, padding: 0 }}>×</button>
                                </span>
                            ))}
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input placeholder="Añadir tag" value={newTagInput} onChange={e => setNewTagInput(e.target.value)}
                                onKeyPress={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                                style={{ ...inputStyle, width: 'auto', flex: 1 }} />
                            <button type="button" onClick={addTag} style={{ padding: '0.8rem 1.2rem', background: 'rgba(0,212,255,0.2)', border: '1px solid rgba(0,212,255,0.3)', borderRadius: '8px', color: 'var(--color-primary)', cursor: 'pointer' }}>
                                + Añadir
                            </button>
                        </div>
                    </div>

                    {/* Published toggle */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <input type="checkbox" id="isPublished" checked={formData.isPublished} onChange={e => setFormData({ ...formData, isPublished: e.target.checked })} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                        <label htmlFor="isPublished" style={{ color: 'rgba(255,255,255,0.7)', cursor: 'pointer', userSelect: 'none' }}>Publicado</label>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button type="submit" style={{ flex: 1, padding: '1rem', background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', border: 'none', borderRadius: '8px', color: 'white', fontFamily: 'var(--font-display)', fontSize: '1rem', cursor: 'pointer', fontWeight: 'bold' }}>
                            {editing ? 'Actualizar' : 'Publicar'}
                        </button>
                        {editing && (
                            <button type="button" onClick={handleCancel} style={{ padding: '1rem 1.5rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}>
                                Cancelar
                            </button>
                        )}
                    </div>
                </form>
            </motion.div>

            {/* List */}
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="glass-panel" style={{ padding: '2rem' }}>
                <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontFamily: 'var(--font-display)', color: 'var(--color-primary)', fontSize: '1.4rem' }}>
                    Artículos ({articles.length})
                </h3>
                {articles.length === 0 ? (
                    <p style={{ color: 'rgba(255,255,255,0.4)' }}>No hay artículos aún.</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {articles.map(article => (
                            <div key={article.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', background: 'rgba(0,0,0,0.3)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', gap: '1rem' }}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
                                        <h4 style={{ color: 'var(--color-light)', margin: 0, fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{article.title}</h4>
                                        {!article.isPublished && (
                                            <span style={{ padding: '1px 7px', background: 'rgba(255,100,100,0.15)', border: '1px solid rgba(255,100,100,0.3)', borderRadius: '10px', color: '#ff8080', fontSize: '0.7rem', flexShrink: 0 }}>Borrador</span>
                                        )}
                                    </div>
                                    <p style={{ color: 'rgba(255,255,255,0.35)', margin: 0, fontSize: '0.8rem' }}>
                                        {article.author} · {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('es-ES') : ''}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                                    <button onClick={() => handleEdit(article)} style={{ padding: '0.5rem 1rem', background: 'rgba(0,212,255,0.15)', border: '1px solid rgba(0,212,255,0.3)', borderRadius: '8px', color: 'var(--color-primary)', cursor: 'pointer', fontSize: '0.85rem' }}>
                                        Editar
                                    </button>
                                    <button onClick={() => handleDelete(article.id)} style={{ padding: '0.5rem 1rem', background: 'rgba(255,0,0,0.1)', border: '1px solid rgba(255,0,0,0.3)', borderRadius: '8px', color: '#ff6464', cursor: 'pointer', fontSize: '0.85rem' }}>
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default NewsManager;
