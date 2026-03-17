import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../../services/api';
import { useStore } from '../../stores/useStore';
import { useToast } from './Toast';

const GuideManager = () => {
    const [guides, setGuides] = useState([]);
    const [armies, setArmies] = useState([]);
    const [editingGuide, setEditingGuide] = useState(null);
    const token = useStore(state => state.token);
    const toast = useToast();
    const [formData, setFormData] = useState({
        id: '',
        title: '',
        difficulty: 'principiante',
        estimatedTime: '',
        author: '',
        dateCreated: new Date().toISOString().split('T')[0],
        coverImage: '',
        tags: [],
        faction: null
    });
    const [materials, setMaterials] = useState([]);
    const [newMaterial, setNewMaterial] = useState('');
    const [steps, setSteps] = useState([]);
    const [editingStep, setEditingStep] = useState(null);
    const [newStepImages, setNewStepImages] = useState({});
    const [newStepTips, setNewStepTips] = useState({});

    useEffect(() => {
        loadGuides();
        loadArmies();
    }, []);

    const loadGuides = async () => {
        try {
            const data = await api.getPaintingGuides();
            setGuides(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to load guides', error);
            setGuides([]);
        }
    };

    const loadArmies = async () => {
        try {
            const data = await api.getArmies();
            setArmies(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to load armies', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dataToSend = {
                ...formData,
                estimated_time: formData.estimatedTime,
                date_created: formData.dateCreated,
                cover_image: formData.coverImage,
                faction: formData.faction?.id || null,
                materials: materials,
                steps: steps.map(step => ({
                    step_number: step.stepNumber,
                    title: step.title,
                    description: step.description,
                    images: step.images || [],
                    tips: step.tips || []
                }))
            };
            delete dataToSend.estimatedTime;
            delete dataToSend.dateCreated;
            delete dataToSend.coverImage;

            if (editingGuide) {
                await api.updateGuide(editingGuide.id, dataToSend, token);
                toast('Guía actualizada correctamente', 'success');
            } else {
                await api.createGuide(dataToSend, token);
                toast('Guía creada correctamente', 'success');
            }
            loadGuides();
            handleCancel();
        } catch (error) {
            console.error('Error saving guide', error);
            toast('Error al guardar: ' + error.message, 'error');
        }
    };

    const handleEdit = (guide) => {
        setEditingGuide(guide);
        setFormData({
            id: guide.id,
            title: guide.title,
            difficulty: guide.difficulty,
            estimatedTime: guide.estimatedTime || '',
            author: guide.author || '',
            dateCreated: guide.dateCreated ? guide.dateCreated.split('T')[0] : new Date().toISOString().split('T')[0],
            coverImage: guide.coverImage || '',
            tags: guide.tags || [],
            faction: guide.faction || null
        });
        setMaterials(guide.materials || []);
        setSteps(guide.steps || []);
    };

    const handleDelete = async (id) => {
        try {
            await api.deleteGuide(id, token);
            toast('Guía eliminada correctamente', 'success');
            loadGuides();
        } catch (error) {
            console.error('Error deleting guide', error);
            toast('Error al eliminar: ' + error.message, 'error');
        }
    };

    const handleCancel = () => {
        setEditingGuide(null);
        setFormData({
            id: '',
            title: '',
            difficulty: 'principiante',
            estimatedTime: '',
            author: '',
            dateCreated: new Date().toISOString().split('T')[0],
            coverImage: '',
            tags: [],
            faction: null
        });
        setMaterials([]);
        setSteps([]);
        setNewMaterial('');
        setEditingStep(null);
        setNewStepImages({});
    };

    const addMaterial = () => {
        if (newMaterial.trim()) {
            setMaterials([...materials, newMaterial.trim()]);
            setNewMaterial('');
        }
    };

    const removeMaterial = (index) => {
        setMaterials(materials.filter((_, i) => i !== index));
    };

    const addStep = () => {
        const newStep = {
            stepNumber: steps.length + 1,
            title: '',
            description: '',
            images: [],
            tips: []
        };
        setSteps([...steps, newStep]);
        setEditingStep(steps.length);
    };

    const updateStep = (index, field, value) => {
        const updatedSteps = [...steps];
        updatedSteps[index] = { ...updatedSteps[index], [field]: value };
        setSteps(updatedSteps);
    };

    const removeStep = (index) => {
        const updatedSteps = steps.filter((_, i) => i !== index).map((step, i) => ({
            ...step,
            stepNumber: i + 1
        }));
        setSteps(updatedSteps);
    };

    const addStepImage = (stepIndex, url) => {
        if (url.trim()) {
            const updatedSteps = [...steps];
            updatedSteps[stepIndex].images = [...(updatedSteps[stepIndex].images || []), url.trim()];
            setSteps(updatedSteps);
        }
    };

    const removeStepImage = (stepIndex, imageIndex) => {
        const updatedSteps = [...steps];
        updatedSteps[stepIndex].images = updatedSteps[stepIndex].images.filter((_, i) => i !== imageIndex);
        setSteps(updatedSteps);
    };

    const addStepTip = (stepIndex, tip) => {
        if (tip.trim()) {
            const updatedSteps = [...steps];
            updatedSteps[stepIndex].tips = [...(updatedSteps[stepIndex].tips || []), tip.trim()];
            setSteps(updatedSteps);
        }
    };

    const removeStepTip = (stepIndex, tipIndex) => {
        const updatedSteps = [...steps];
        updatedSteps[stepIndex].tips = updatedSteps[stepIndex].tips.filter((_, i) => i !== tipIndex);
        setSteps(updatedSteps);
    };

    const addTag = (tag) => {
        if (tag.trim() && !formData.tags.includes(tag.trim())) {
            setFormData({ ...formData, tags: [...formData.tags, tag.trim()] });
        }
    };

    const removeTag = (tagToRemove) => {
        setFormData({ ...formData, tags: formData.tags.filter(t => t !== tagToRemove) });
    };

    const difficulties = [
        { value: 'principiante', label: 'Principiante' },
        { value: 'intermedio', label: 'Intermedio' },
        { value: 'avanzado', label: 'Avanzado' }
    ];

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
            >
                <h2 style={{
                    fontFamily: 'var(--font-display)',
                    color: 'var(--color-secondary)',
                    marginBottom: '2rem',
                    fontSize: '2.5rem'
                }}>
                    Gestión de Guías de Pintura
                </h2>
            </motion.div>

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="glass-panel"
                style={{ padding: '2rem', marginBottom: '2rem', maxHeight: '80vh', overflowY: 'auto' }}
            >
                <h3 style={{
                    marginTop: 0,
                    marginBottom: '1.5rem',
                    fontFamily: 'var(--font-display)',
                    color: 'var(--color-secondary)',
                    fontSize: '1.5rem'
                }}>
                    {editingGuide ? 'Editar Guía' : 'Nueva Guía'}
                </h3>
                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.8)' }}>ID *</label>
                            <input
                                placeholder="guide-space-marines-1"
                                value={formData.id}
                                onChange={e => setFormData({ ...formData, id: e.target.value })}
                                disabled={!!editingGuide}
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
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.8)' }}>Título *</label>
                            <input
                                placeholder="Cómo pintar Space Marines"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
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

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.8)' }}>Dificultad *</label>
                            <select
                                value={formData.difficulty}
                                onChange={e => setFormData({ ...formData, difficulty: e.target.value })}
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
                            >
                                {difficulties.map(diff => (
                                    <option key={diff.value} value={diff.value}>{diff.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.8)' }}>Tiempo Estimado *</label>
                            <input
                                placeholder="2 horas"
                                value={formData.estimatedTime}
                                onChange={e => setFormData({ ...formData, estimatedTime: e.target.value })}
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
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.8)' }}>Autor *</label>
                            <input
                                placeholder="Nombre del autor"
                                value={formData.author}
                                onChange={e => setFormData({ ...formData, author: e.target.value })}
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
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.8)' }}>Fecha *</label>
                            <input
                                type="date"
                                value={formData.dateCreated}
                                onChange={e => setFormData({ ...formData, dateCreated: e.target.value })}
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
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.8)' }}>URL Imagen de Portada *</label>
                        <input
                            type="url"
                            placeholder="https://..."
                            value={formData.coverImage}
                            onChange={e => setFormData({ ...formData, coverImage: e.target.value })}
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
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.8)' }}>Ejército (Faction)</label>
                        <select
                            value={formData.faction?.id || ''}
                            onChange={e => {
                                const selectedArmy = armies.find(a => a.id === e.target.value);
                                setFormData({ ...formData, faction: selectedArmy || null });
                            }}
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
                            <option value="">Ninguno</option>
                            {armies.map(army => (
                                <option key={army.id} value={army.id}>{army.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.8)' }}>Tags</label>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                            {formData.tags.map(tag => (
                                <span key={tag} style={{
                                    padding: '0.5rem 1rem',
                                    background: 'rgba(0,206,209,0.2)',
                                    borderRadius: '20px',
                                    color: '#00ced1',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    #{tag}
                                    <button
                                        type="button"
                                        onClick={() => removeTag(tag)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#00ced1',
                                            cursor: 'pointer',
                                            fontSize: '1.2rem',
                                            padding: 0,
                                            width: '20px',
                                            height: '20px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                placeholder="Añadir tag"
                                onKeyPress={e => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addTag(e.target.value);
                                        e.target.value = '';
                                    }
                                }}
                                style={{
                                    padding: '0.8rem',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '8px',
                                    color: 'var(--color-light)',
                                    fontSize: '0.9rem',
                                    flex: 1
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.8)' }}>Materiales Necesarios</label>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                            <input
                                placeholder="Nombre del material"
                                value={newMaterial}
                                onChange={e => setNewMaterial(e.target.value)}
                                onKeyPress={e => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addMaterial();
                                    }
                                }}
                                style={{
                                    padding: '0.8rem',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '8px',
                                    color: 'var(--color-light)',
                                    fontSize: '0.9rem',
                                    flex: 1
                                }}
                            />
                            <button
                                type="button"
                                onClick={addMaterial}
                                style={{
                                    padding: '0.8rem 1.5rem',
                                    background: 'var(--color-secondary)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: 'var(--color-light)',
                                    cursor: 'pointer',
                                    fontWeight: 'bold'
                                }}
                            >
                                +
                            </button>
                        </div>
                        {materials.length > 0 && (
                            <div style={{ display: 'grid', gap: '0.5rem' }}>
                                {materials.map((material, index) => (
                                    <div key={index} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        padding: '0.8rem',
                                        background: 'rgba(0,0,0,0.3)',
                                        borderRadius: '8px'
                                    }}>
                                        <span style={{ flex: 1, color: 'rgba(255,255,255,0.8)' }}>{material}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeMaterial(index)}
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

                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <label style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem' }}>Pasos de la Guía</label>
                            <button
                                type="button"
                                onClick={addStep}
                                style={{
                                    padding: '0.8rem 1.5rem',
                                    background: 'var(--color-primary)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: 'var(--color-light)',
                                    cursor: 'pointer',
                                    fontWeight: 'bold'
                                }}
                            >
                                + Añadir Paso
                            </button>
                        </div>
                        {steps.map((step, stepIndex) => (
                            <div key={stepIndex} style={{
                                padding: '1.5rem',
                                background: 'rgba(0,0,0,0.3)',
                                borderRadius: '12px',
                                marginBottom: '1rem',
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h4 style={{ margin: 0, color: 'var(--color-secondary)' }}>Paso {step.stepNumber}</h4>
                                    <button
                                        type="button"
                                        onClick={() => removeStep(stepIndex)}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            background: 'rgba(255,0,0,0.2)',
                                            border: '1px solid rgba(255,0,0,0.5)',
                                            borderRadius: '8px',
                                            color: '#ff6464',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Eliminar
                                    </button>
                                </div>
                                <div style={{ display: 'grid', gap: '1rem' }}>
                                    <input
                                        placeholder="Título del paso"
                                        value={step.title}
                                        onChange={e => updateStep(stepIndex, 'title', e.target.value)}
                                        style={{
                                            padding: '0.8rem',
                                            background: 'rgba(255, 255, 255, 0.05)',
                                            border: '1px solid var(--glass-border)',
                                            borderRadius: '8px',
                                            color: 'var(--color-light)',
                                            fontSize: '0.9rem'
                                        }}
                                    />
                                    <textarea
                                        placeholder="Descripción del paso"
                                        value={step.description}
                                        onChange={e => updateStep(stepIndex, 'description', e.target.value)}
                                        style={{
                                            padding: '0.8rem',
                                            background: 'rgba(255, 255, 255, 0.05)',
                                            border: '1px solid var(--glass-border)',
                                            borderRadius: '8px',
                                            color: 'var(--color-light)',
                                            fontSize: '0.9rem',
                                            minHeight: '100px',
                                            resize: 'vertical'
                                        }}
                                    />
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>Imágenes del Paso</label>
                                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                            <input
                                                placeholder="URL de imagen (Cloudinary)"
                                                value={newStepImages[stepIndex] || ''}
                                                onChange={e => setNewStepImages({ ...newStepImages, [stepIndex]: e.target.value })}
                                                onKeyPress={e => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        addStepImage(stepIndex, newStepImages[stepIndex] || '');
                                                        setNewStepImages({ ...newStepImages, [stepIndex]: '' });
                                                    }
                                                }}
                                                style={{
                                                    padding: '0.8rem',
                                                    background: 'rgba(255, 255, 255, 0.05)',
                                                    border: '1px solid var(--glass-border)',
                                                    borderRadius: '8px',
                                                    color: 'var(--color-light)',
                                                    fontSize: '0.9rem',
                                                    flex: 1
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    addStepImage(stepIndex, newStepImages[stepIndex] || '');
                                                    setNewStepImages({ ...newStepImages, [stepIndex]: '' });
                                                }}
                                                style={{
                                                    padding: '0.8rem 1.2rem',
                                                    background: 'var(--color-primary)',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    color: 'var(--color-light)',
                                                    cursor: 'pointer',
                                                    fontWeight: 'bold',
                                                    whiteSpace: 'nowrap'
                                                }}
                                            >
                                                + Añadir
                                            </button>
                                        </div>
                                        {step.images && step.images.length > 0 && (
                                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                {step.images.map((img, imgIndex) => (
                                                    <div key={imgIndex} style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.5rem',
                                                        padding: '0.5rem',
                                                        background: 'rgba(0,206,209,0.1)',
                                                        borderRadius: '8px'
                                                    }}>
                                                        <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>{img.substring(0, 30)}...</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeStepImage(stepIndex, imgIndex)}
                                                            style={{
                                                                background: 'none',
                                                                border: 'none',
                                                                color: '#ff6464',
                                                                cursor: 'pointer',
                                                                fontSize: '1rem'
                                                            }}
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>Consejos</label>
                                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                            <input
                                                placeholder="Añadir consejo"
                                                value={newStepTips[stepIndex] || ''}
                                                onChange={e => setNewStepTips({ ...newStepTips, [stepIndex]: e.target.value })}
                                                onKeyPress={e => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        addStepTip(stepIndex, newStepTips[stepIndex] || '');
                                                        setNewStepTips({ ...newStepTips, [stepIndex]: '' });
                                                    }
                                                }}
                                                style={{
                                                    padding: '0.8rem',
                                                    background: 'rgba(255, 255, 255, 0.05)',
                                                    border: '1px solid var(--glass-border)',
                                                    borderRadius: '8px',
                                                    color: 'var(--color-light)',
                                                    fontSize: '0.9rem',
                                                    flex: 1
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    addStepTip(stepIndex, newStepTips[stepIndex] || '');
                                                    setNewStepTips({ ...newStepTips, [stepIndex]: '' });
                                                }}
                                                style={{
                                                    padding: '0.8rem 1.2rem',
                                                    background: 'var(--color-secondary)',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    color: '#000',
                                                    cursor: 'pointer',
                                                    fontWeight: 'bold',
                                                    whiteSpace: 'nowrap'
                                                }}
                                            >
                                                + Añadir
                                            </button>
                                        </div>
                                        {step.tips && step.tips.length > 0 && (
                                            <ul style={{ margin: 0, paddingLeft: '1.5rem', color: 'rgba(255,255,255,0.7)' }}>
                                                {step.tips.map((tip, tipIndex) => (
                                                    <li key={tipIndex} style={{ marginBottom: '0.3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span>{tip}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeStepTip(stepIndex, tipIndex)}
                                                            style={{
                                                                background: 'none',
                                                                border: 'none',
                                                                color: '#ff6464',
                                                                cursor: 'pointer',
                                                                fontSize: '1rem',
                                                                marginLeft: '1rem'
                                                            }}
                                                        >
                                                            ×
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button type="submit" style={{
                            background: 'linear-gradient(135deg, var(--color-secondary), var(--color-primary))',
                            border: 'none',
                            padding: '1rem 2rem',
                            borderRadius: '50px',
                            color: 'var(--color-light)',
                            fontFamily: 'var(--font-display)',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            letterSpacing: '1px',
                            transition: 'transform 0.2s',
                            boxShadow: '0 4px 15px rgba(255, 0, 255, 0.3)'
                        }}
                            onMouseEnter={e => e.target.style.transform = 'translateY(-2px)'}
                            onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
                        >
                            {editingGuide ? 'Actualizar' : 'Crear'} Guía
                        </button>

                        {editingGuide && (
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
                                    onClick={() => handleDelete(editingGuide.id)}
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
                                    Eliminar
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
                    Guías Existentes ({guides.length})
                </h3>
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {guides.map((guide, index) => (
                        <motion.div
                            key={guide.id}
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
                                {guide.coverImage && (
                                    <img
                                        src={guide.coverImage}
                                        alt={guide.title}
                                        style={{
                                            width: '80px',
                                            height: '80px',
                                            objectFit: 'cover',
                                            borderRadius: '12px'
                                        }}
                                    />
                                )}
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ margin: '0 0 5px 0', fontSize: '1.2rem', fontFamily: 'var(--font-display)' }}>{guide.title}</h4>
                                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)' }}>
                                        <span>{guide.difficulty}</span>
                                        <span>{guide.author}</span>
                                        <span>❤ {guide.likes || 0}</span>
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button onClick={() => handleEdit(guide)} style={{
                                    background: 'transparent',
                                    color: 'var(--color-light)',
                                    border: '1px solid var(--color-secondary)',
                                    padding: '0.5rem 1.5rem',
                                    borderRadius: '30px',
                                    cursor: 'pointer',
                                    fontFamily: 'var(--font-display)',
                                    transition: 'all 0.2s'
                                }}
                                    onMouseEnter={e => {
                                        e.target.style.background = 'var(--color-secondary)';
                                        e.target.style.color = 'var(--color-darker)';
                                    }}
                                    onMouseLeave={e => {
                                        e.target.style.background = 'transparent';
                                        e.target.style.color = 'var(--color-light)';
                                    }}
                                >
                                    Editar
                                </button>
                                <button
                                    onClick={() => handleDelete(guide.id)}
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
                                    Eliminar
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

export default GuideManager;
