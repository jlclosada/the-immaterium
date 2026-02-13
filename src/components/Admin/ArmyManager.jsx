import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../../services/api';
import { useStore } from '../../stores/useStore';

const ArmyManager = () => {
    const [armies, setArmies] = useState([]);
    const [editingArmy, setEditingArmy] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const token = useStore(state => state.token);
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        description: '',
        history: '',
        iconUrl: '',
        position: [0, 0, 0],
        size: 1.0,
        color: '#ffffff',
        emissive: '#ffffff',
        planetType: 'standard',
        planetName: ''
    });
    const [images, setImages] = useState([]);
    const [newImage, setNewImage] = useState({ id: '', url: '', name: '' });

    useEffect(() => {
        loadArmies();
    }, []);

    const loadArmies = async () => {
        try {
            const data = await api.getArmies();
            setArmies(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to load armies', error);
            setArmies([]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingArmy) {
                // For updates, send all form fields (PATCH will handle partial updates)
                const dataToSend = {
                    name: formData.name,
                    description: formData.description,
                    history: formData.history || '',
                    position: formData.position,
                    size: formData.size,
                    color: formData.color,
                    emissive: formData.emissive
                };
                
                // Always include iconUrl - use form value or current value
                dataToSend.iconUrl = formData.iconUrl || editingArmy.iconUrl || '';
                
                // Optional fields
                if (formData.planetType) dataToSend.planetType = formData.planetType;
                if (formData.planetName !== undefined) dataToSend.planetName = formData.planetName;
                
                await api.updateArmy(editingArmy.id, dataToSend, token);
                alert('Ejército actualizado correctamente');
            } else {
                // For creation, send all required fields (POST)
                const dataToSend = {
                    id: formData.id,
                    name: formData.name,
                    description: formData.description,
                    history: formData.history || '',
                    iconUrl: formData.iconUrl || '',
                    position: formData.position,
                    size: formData.size,
                    color: formData.color,
                    emissive: formData.emissive
                };
                
                if (formData.planetType) dataToSend.planetType = formData.planetType;
                if (formData.planetName) dataToSend.planetName = formData.planetName;
                
                await api.createArmy(dataToSend, token);
                alert('Ejército creado correctamente');
            }
            loadArmies();
            handleCancel();
        } catch (error) {
            console.error('Error saving army', error);
            alert('Error al guardar: ' + error.message);
        }
    };

    const handleEdit = (army) => {
        setEditingArmy(army);
        setFormData({
            id: army.id,
            name: army.name,
            description: army.description || '',
            history: army.history || '',
            iconUrl: army.iconUrl || '',
            position: army.position || [0, 0, 0],
            size: army.size || 1.0,
            color: army.color || '#ffffff',
            emissive: army.emissive || '#ffffff',
            planetType: army.planetType || 'standard',
            planetName: army.planetName || ''
        });
        setImages(army.images || []);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar este ejército?')) return;
        try {
            await api.deleteArmy(id, token);
            alert('Ejército eliminado correctamente');
            loadArmies();
        } catch (error) {
            console.error('Error deleting army', error);
            alert('Error al eliminar: ' + error.message);
        }
    };

    const handleCancel = () => {
        setEditingArmy(null);
        setFormData({
            id: '',
            name: '',
            description: '',
            history: '',
            iconUrl: '',
            position: [0, 0, 0],
            size: 1.0,
            color: '#ffffff',
            emissive: '#ffffff',
            planetType: 'standard',
            planetName: ''
        });
        setImages([]);
        setNewImage({ id: '', url: '', name: '' });
    };

    const addImage = () => {
        if (newImage.id && newImage.url && newImage.name) {
            setImages([...images, { ...newImage }]);
            setNewImage({ id: '', url: '', name: '' });
        }
    };

    const removeImage = (index) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const planetTypes = [
        { value: 'standard', label: 'Standard' },
        { value: 'lightning', label: 'Lightning' },
        { value: 'snow', label: 'Snow' },
        { value: 'deformed', label: 'Deformed' },
        { value: 'tentacles', label: 'Tentacles' },
        { value: 'craters', label: 'Craters' },
        { value: 'terra', label: 'Terra' }
    ];

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
            >
                <h2 style={{
                    fontFamily: 'var(--font-display)',
                    color: 'var(--color-primary)',
                    marginBottom: '2rem',
                    fontSize: '2.5rem'
                }}>
                    Gestión de Ejércitos
                </h2>
            </motion.div>

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="glass-panel"
                style={{ padding: '2rem', marginBottom: '2rem' }}
            >
                <h3 style={{
                    marginTop: 0,
                    marginBottom: '1.5rem',
                    fontFamily: 'var(--font-display)',
                    color: 'var(--color-secondary)',
                    fontSize: '1.5rem'
                }}>
                    {editingArmy ? '✏️ Editar Ejército' : '➕ Nuevo Ejército'}
                </h3>
                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.8)' }}>ID *</label>
                            <input
                                placeholder="space-marines"
                                value={formData.id}
                                onChange={e => setFormData({ ...formData, id: e.target.value })}
                                disabled={!!editingArmy}
                                required
                                style={{
                                    padding: '1rem',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '8px',
                                    color: 'var(--color-light)',
                                    fontSize: '1rem',
                                    width: '100%'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.8)' }}>Nombre *</label>
                            <input
                                placeholder="Space Marines"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                                style={{
                                    padding: '1rem',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '8px',
                                    color: 'var(--color-light)',
                                    fontSize: '1rem',
                                    width: '100%'
                                }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.8)' }}>Descripción *</label>
                        <textarea
                            placeholder="Descripción corta del ejército..."
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            required
                            style={{
                                padding: '1rem',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '8px',
                                color: 'var(--color-light)',
                                fontSize: '1rem',
                                width: '100%',
                                minHeight: '80px',
                                resize: 'vertical'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.8)' }}>Historia</label>
                        <textarea
                            placeholder="Historia completa del ejército..."
                            value={formData.history}
                            onChange={e => setFormData({ ...formData, history: e.target.value })}
                            style={{
                                padding: '1rem',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '8px',
                                color: 'var(--color-light)',
                                fontSize: '1rem',
                                width: '100%',
                                minHeight: '150px',
                                resize: 'vertical'
                            }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.8)' }}>URL del Icono *</label>
                            <input
                                placeholder="https://..."
                                value={formData.iconUrl}
                                onChange={e => setFormData({ ...formData, iconUrl: e.target.value })}
                                required
                                type="url"
                                style={{
                                    padding: '1rem',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '8px',
                                    color: 'var(--color-light)',
                                    fontSize: '1rem',
                                    width: '100%'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.8)' }}>Nombre del Planeta</label>
                            <input
                                placeholder="Macragge"
                                value={formData.planetName}
                                onChange={e => setFormData({ ...formData, planetName: e.target.value })}
                                style={{
                                    padding: '1rem',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '8px',
                                    color: 'var(--color-light)',
                                    fontSize: '1rem',
                                    width: '100%'
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.8)' }}>Tipo de Planeta</label>
                            <select
                                value={formData.planetType}
                                onChange={e => setFormData({ ...formData, planetType: e.target.value })}
                                style={{
                                    padding: '1rem',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '8px',
                                    color: 'var(--color-light)',
                                    fontSize: '1rem',
                                    width: '100%'
                                }}
                            >
                                {planetTypes.map(type => (
                                    <option key={type.value} value={type.value}>{type.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.8)' }}>Tamaño</label>
                            <input
                                type="number"
                                step="0.1"
                                min="0.5"
                                max="5"
                                value={formData.size}
                                onChange={e => setFormData({ ...formData, size: parseFloat(e.target.value) })}
                                style={{
                                    padding: '1rem',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '8px',
                                    color: 'var(--color-light)',
                                    fontSize: '1rem',
                                    width: '100%'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.8)' }}>Color</label>
                            <input
                                type="color"
                                value={formData.color}
                                onChange={e => setFormData({ ...formData, color: e.target.value })}
                                style={{
                                    padding: '0.5rem',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '8px',
                                    width: '100%',
                                    height: '50px',
                                    cursor: 'pointer'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.8)' }}>Emissive</label>
                            <input
                                type="color"
                                value={formData.emissive}
                                onChange={e => setFormData({ ...formData, emissive: e.target.value })}
                                style={{
                                    padding: '0.5rem',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '8px',
                                    width: '100%',
                                    height: '50px',
                                    cursor: 'pointer'
                                }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.8)' }}>Posición 3D (X, Y, Z)</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                            <input
                                type="number"
                                step="0.1"
                                placeholder="X"
                                value={formData.position[0]}
                                onChange={e => setFormData({
                                    ...formData,
                                    position: [parseFloat(e.target.value) || 0, formData.position[1], formData.position[2]]
                                })}
                                style={{
                                    padding: '1rem',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '8px',
                                    color: 'var(--color-light)',
                                    fontSize: '1rem'
                                }}
                            />
                            <input
                                type="number"
                                step="0.1"
                                placeholder="Y"
                                value={formData.position[1]}
                                onChange={e => setFormData({
                                    ...formData,
                                    position: [formData.position[0], parseFloat(e.target.value) || 0, formData.position[2]]
                                })}
                                style={{
                                    padding: '1rem',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '8px',
                                    color: 'var(--color-light)',
                                    fontSize: '1rem'
                                }}
                            />
                            <input
                                type="number"
                                step="0.1"
                                placeholder="Z"
                                value={formData.position[2]}
                                onChange={e => setFormData({
                                    ...formData,
                                    position: [formData.position[0], formData.position[1], parseFloat(e.target.value) || 0]
                                })}
                                style={{
                                    padding: '1rem',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '8px',
                                    color: 'var(--color-light)',
                                    fontSize: '1rem'
                                }}
                            />
                        </div>
                    </div>

                    <div style={{
                        borderTop: '1px solid rgba(255,255,255,0.1)',
                        paddingTop: '1.5rem',
                        marginTop: '1rem'
                    }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.8)' }}>Imágenes de la Galería</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '1rem', marginBottom: '1rem' }}>
                            <input
                                placeholder="ID imagen"
                                value={newImage.id}
                                onChange={e => setNewImage({ ...newImage, id: e.target.value })}
                                style={{
                                    padding: '0.8rem',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '8px',
                                    color: 'var(--color-light)',
                                    fontSize: '0.9rem'
                                }}
                            />
                            <input
                                placeholder="URL"
                                value={newImage.url}
                                onChange={e => setNewImage({ ...newImage, url: e.target.value })}
                                style={{
                                    padding: '0.8rem',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '8px',
                                    color: 'var(--color-light)',
                                    fontSize: '0.9rem'
                                }}
                            />
                            <input
                                placeholder="Nombre"
                                value={newImage.name}
                                onChange={e => setNewImage({ ...newImage, name: e.target.value })}
                                style={{
                                    padding: '0.8rem',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '8px',
                                    color: 'var(--color-light)',
                                    fontSize: '0.9rem'
                                }}
                            />
                            <button
                                type="button"
                                onClick={addImage}
                                style={{
                                    padding: '0.8rem 1.5rem',
                                    background: 'var(--color-primary)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: 'var(--color-darker)',
                                    cursor: 'pointer',
                                    fontWeight: 'bold'
                                }}
                            >
                                ➕
                            </button>
                        </div>
                        {images.length > 0 && (
                            <div style={{ display: 'grid', gap: '0.5rem' }}>
                                {images.map((img, index) => (
                                    <div key={index} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        padding: '0.8rem',
                                        background: 'rgba(0,0,0,0.3)',
                                        borderRadius: '8px'
                                    }}>
                                        <span style={{ flex: 1, color: 'rgba(255,255,255,0.8)' }}>{img.name}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                background: 'rgba(255,0,0,0.2)',
                                                border: '1px solid rgba(255,0,0,0.5)',
                                                borderRadius: '8px',
                                                color: '#ff6464',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button type="submit" style={{
                            background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                            border: 'none',
                            padding: '1rem 2rem',
                            borderRadius: '50px',
                            color: 'var(--color-light)',
                            fontFamily: 'var(--font-display)',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            letterSpacing: '1px',
                            transition: 'transform 0.2s',
                            boxShadow: '0 4px 15px rgba(0, 212, 255, 0.3)'
                        }}
                            onMouseEnter={e => e.target.style.transform = 'translateY(-2px)'}
                            onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
                        >
                            💾 {editingArmy ? 'Actualizar' : 'Crear'} Ejército
                        </button>

                        {editingArmy && (
                            <>
                                <button type="button" onClick={handleCancel} style={{
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    padding: '1rem 2rem',
                                    borderRadius: '50px',
                                    color: 'var(--color-light)',
                                    fontFamily: 'var(--font-display)',
                                    cursor: 'pointer',
                                    fontSize: '1rem',
                                    letterSpacing: '1px',
                                    transition: 'all 0.2s'
                                }}
                                    onMouseEnter={e => {
                                        e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                                        e.target.style.transform = 'translateY(-2px)';
                                    }}
                                    onMouseLeave={e => {
                                        e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                                        e.target.style.transform = 'translateY(0)';
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleDelete(editingArmy.id)}
                                    style={{
                                        background: 'rgba(255, 0, 0, 0.2)',
                                        border: '1px solid rgba(255, 0, 0, 0.5)',
                                        padding: '1rem 2rem',
                                        borderRadius: '50px',
                                        color: '#ff6464',
                                        fontFamily: 'var(--font-display)',
                                        cursor: 'pointer',
                                        fontSize: '1rem',
                                        letterSpacing: '1px',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={e => {
                                        e.target.style.background = 'rgba(255, 0, 0, 0.3)';
                                        e.target.style.transform = 'translateY(-2px)';
                                    }}
                                    onMouseLeave={e => {
                                        e.target.style.background = 'rgba(255, 0, 0, 0.2)';
                                        e.target.style.transform = 'translateY(0)';
                                    }}
                                >
                                    🗑️ Eliminar
                                </button>
                            </>
                        )}
                    </div>
                </form>
            </motion.div>

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <h3 style={{
                    fontFamily: 'var(--font-display)',
                    color: 'var(--color-secondary)',
                    marginBottom: '1.5rem',
                    fontSize: '1.5rem'
                }}>
                    Ejércitos Existentes ({armies.length})
                </h3>
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {armies.map((army, index) => (
                        <motion.div
                            key={army.id}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="glass-panel"
                            style={{
                                padding: '1.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                transition: 'transform 0.2s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateX(5px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 1 }}>
                                <div style={{
                                    width: '60px',
                                    height: '60px',
                                    background: 'rgba(0,0,0,0.3)',
                                    borderRadius: '12px',
                                    padding: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {army.iconUrl ? (
                                        <img src={army.iconUrl} alt={army.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                    ) : (
                                        <span style={{ fontSize: '2rem' }}>🛡️</span>
                                    )}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ margin: '0 0 5px 0', fontSize: '1.2rem', fontFamily: 'var(--font-display)' }}>{army.name}</h4>
                                    <small style={{ color: 'var(--color-primary)', letterSpacing: '1px' }}>{army.id}</small>
                                    {army.planetName && (
                                        <p style={{ margin: '5px 0 0 0', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
                                            🪐 {army.planetName}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button onClick={() => handleEdit(army)} style={{
                                    background: 'transparent',
                                    color: 'var(--color-light)',
                                    border: '1px solid var(--color-primary)',
                                    padding: '0.5rem 1.5rem',
                                    borderRadius: '30px',
                                    cursor: 'pointer',
                                    fontFamily: 'var(--font-display)',
                                    transition: 'all 0.2s'
                                }}
                                    onMouseEnter={e => {
                                        e.target.style.background = 'var(--color-primary)';
                                        e.target.style.color = 'var(--color-darker)';
                                    }}
                                    onMouseLeave={e => {
                                        e.target.style.background = 'transparent';
                                        e.target.style.color = 'var(--color-light)';
                                    }}
                                >
                                    ✏️ Editar
                                </button>
                                <button
                                    onClick={() => handleDelete(army.id)}
                                    style={{
                                        background: 'transparent',
                                        color: '#ff6464',
                                        border: '1px solid rgba(255,100,100,0.5)',
                                        padding: '0.5rem 1.5rem',
                                        borderRadius: '30px',
                                        cursor: 'pointer',
                                        fontFamily: 'var(--font-display)',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={e => {
                                        e.target.style.background = 'rgba(255,100,100,0.2)';
                                    }}
                                    onMouseLeave={e => {
                                        e.target.style.background = 'transparent';
                                    }}
                                >
                                    🗑️
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

export default ArmyManager;
