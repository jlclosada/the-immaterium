import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useStore } from '../../stores/useStore';
import { useToast } from './Toast';

const LoreManager = () => {
    const [loreEntries, setLoreEntries] = useState([]);
    const [armies, setArmies] = useState([]);
    const [editingLore, setEditingLore] = useState(null);
    const token = useStore(state => state.token);
    const toast = useToast();
    const [formData, setFormData] = useState({
        id: '',
        title: '',
        category: 'historia',
        content: '',
        tags: [],
        relatedFaction: '',
        author: 'Administratum',
        isFeatured: false
    });
    const [newTag, setNewTag] = useState('');

    useEffect(() => {
        fetchLoreEntries();
        fetchArmies();
    }, []);

    const fetchLoreEntries = async () => {
        try {
            const data = await api.getLoreEntries();
            setLoreEntries(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching lore:', error);
            toast('Error al cargar las entradas de lore', 'error');
        }
    };

    const fetchArmies = async () => {
        try {
            const data = await api.getArmies();
            setArmies(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching armies:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dataToSend = {
                ...formData,
                id: formData.id || `lore-${Date.now()}`,
                relatedFaction: formData.relatedFaction || null,
                isFeatured: formData.isFeatured || false
            };

            if (editingLore) {
                await api.updateLoreEntry(editingLore.id, dataToSend, token);
                toast('Entrada de lore actualizada exitosamente', 'success');
            } else {
                await api.createLoreEntry(dataToSend, token);
                toast('Entrada de lore creada exitosamente', 'success');
            }

            resetForm();
            fetchLoreEntries();
        } catch (error) {
            console.error('Error saving lore:', error);
            toast('Error al guardar: ' + error.message, 'error');
        }
    };

    const handleEdit = (lore) => {
        setEditingLore(lore);
        setFormData({
            id: lore.id,
            title: lore.title,
            category: lore.category,
            content: lore.content,
            tags: lore.tags || [],
            relatedFaction: lore.relatedFaction?.id || '',
            author: lore.author,
            isFeatured: lore.isFeatured
        });
    };

    const handleDelete = async (id) => {
        try {
            await api.deleteLoreEntry(id, token);
            toast('Entrada eliminada exitosamente', 'success');
            fetchLoreEntries();
        } catch (error) {
            console.error('Error deleting lore:', error);
            toast('Error al eliminar la entrada', 'error');
        }
    };

    const resetForm = () => {
        setEditingLore(null);
        setFormData({
            id: '',
            title: '',
            category: 'historia',
            content: '',
            tags: [],
            relatedFaction: '',
            author: 'Administratum',
            isFeatured: false
        });
        setNewTag('');
    };

    const addTag = () => {
        if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
            setFormData({ ...formData, tags: [...formData.tags, newTag.trim()] });
            setNewTag('');
        }
    };

    const removeTag = (tagToRemove) => {
        setFormData({
            ...formData,
            tags: formData.tags.filter(tag => tag !== tagToRemove)
        });
    };

    return (
        <div style={{ padding: '2rem' }}>
            <h2 style={{ marginBottom: '2rem', color: 'var(--color-primary)' }}>
                📖 Gestión de Lore
            </h2>

            {/* Formulario */}
            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem' }}>
                    {editingLore ? 'Editar Entrada' : 'Nueva Entrada'}
                </h3>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                                Título *
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    background: 'rgba(0,0,0,0.3)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px',
                                    color: 'white'
                                }}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                                    Categoría *
                                </label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        background: 'rgba(0,0,0,0.3)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px',
                                        color: 'white'
                                    }}
                                >
                                    <option value="historia">Historia</option>
                                    <option value="faccion">Facción</option>
                                    <option value="evento">Evento</option>
                                    <option value="personaje">Personaje</option>
                                    <option value="lugar">Lugar</option>
                                    <option value="tecnologia">Tecnología</option>
                                    <option value="otro">Otro</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                                    Facción Relacionada
                                </label>
                                <select
                                    value={formData.relatedFaction}
                                    onChange={(e) => setFormData({ ...formData, relatedFaction: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        background: 'rgba(0,0,0,0.3)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px',
                                        color: 'white'
                                    }}
                                >
                                    <option value="">Ninguna</option>
                                    {armies.map(army => (
                                        <option key={army.id} value={army.id}>{army.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                                Autor
                            </label>
                            <input
                                type="text"
                                value={formData.author}
                                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    background: 'rgba(0,0,0,0.3)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px',
                                    color: 'white'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                                Contenido *
                            </label>
                            <textarea
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                required
                                rows={8}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    background: 'rgba(0,0,0,0.3)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px',
                                    color: 'white',
                                    fontFamily: 'inherit',
                                    resize: 'vertical'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                                Etiquetas
                            </label>
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <input
                                    type="text"
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            addTag();
                                        }
                                    }}
                                    placeholder="Nueva etiqueta..."
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        background: 'rgba(0,0,0,0.3)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px',
                                        color: 'white'
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={addTag}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        background: 'var(--color-primary)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: '#000',
                                        cursor: 'pointer',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    Añadir
                                </button>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {formData.tags.map(tag => (
                                    <span
                                        key={tag}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            background: 'rgba(0, 212, 255, 0.2)',
                                            border: '1px solid var(--color-primary)',
                                            borderRadius: '20px',
                                            fontSize: '0.9rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}
                                    >
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => removeTag(tag)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: 'white',
                                                cursor: 'pointer',
                                                fontSize: '1rem'
                                            }}
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={formData.isFeatured}
                                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                                    style={{ width: '20px', height: '20px' }}
                                />
                                <span>⭐ Marcar como destacado</span>
                            </label>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button
                                type="submit"
                                style={{
                                    flex: 1,
                                    padding: '1rem',
                                    background: 'var(--color-primary)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: '#000',
                                    fontSize: '1rem',
                                    fontWeight: 'bold',
                                    cursor: 'pointer'
                                }}
                            >
                                {editingLore ? 'Actualizar' : 'Crear'} Entrada
                            </button>
                            {editingLore && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    style={{
                                        padding: '1rem 2rem',
                                        background: 'rgba(255,255,255,0.1)',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        borderRadius: '8px',
                                        color: 'white',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancelar
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </div>

            {/* Lista de entradas */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem' }}>Entradas Existentes ({loreEntries.length})</h3>
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {loreEntries.map(lore => (
                        <div
                            key={lore.id}
                            style={{
                                padding: '1.5rem',
                                background: 'rgba(0,0,0,0.3)',
                                borderRadius: '12px',
                                border: lore.isFeatured ? '2px solid var(--color-accent)' : '1px solid rgba(255,255,255,0.1)'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ color: 'var(--color-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        {lore.isFeatured && <span>⭐</span>}
                                        {lore.title}
                                    </h4>
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        <span style={{
                                            padding: '0.25rem 0.75rem',
                                            background: 'rgba(0, 212, 255, 0.2)',
                                            borderRadius: '12px',
                                            fontSize: '0.75rem'
                                        }}>
                                            {lore.category}
                                        </span>
                                        {lore.relatedFaction && (
                                            <span style={{
                                                padding: '0.25rem 0.75rem',
                                                background: 'rgba(255, 215, 0, 0.2)',
                                                borderRadius: '12px',
                                                fontSize: '0.75rem'
                                            }}>
                                                {lore.relatedFaction.name}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        onClick={() => handleEdit(lore)}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            background: 'var(--color-secondary)',
                                            border: 'none',
                                            borderRadius: '8px',
                                            color: 'white',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        ✏️ Editar
                                    </button>
                                    <button
                                        onClick={() => handleDelete(lore.id)}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            background: '#ff4d4d',
                                            border: 'none',
                                            borderRadius: '8px',
                                            color: 'white',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                {lore.excerpt}
                            </p>
                            <div style={{ fontSize: '0.85rem', color: '#888' }}>
                                Por {lore.author} • 👁️ {lore.views} vistas
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LoreManager;

