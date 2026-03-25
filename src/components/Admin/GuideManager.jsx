import React, { useState, useEffect, useRef, useCallback } from 'react';
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
    // materials = [{name, paint: {id,brand,brand_display,range,name,color,code}|null}]
    const [materials, setMaterials] = useState([]);
    const [paintSearch, setPaintSearch] = useState('');
    const [paintResults, setPaintResults] = useState([]);
    const [paintSearchLoading, setPaintSearchLoading] = useState(false);
    const [showPaintDropdown, setShowPaintDropdown] = useState(false);
    const paintSearchRef = useRef(null);
    const paintDebounceRef = useRef(null);
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
                materials: materials.map(m => ({ name: m.name, paint_id: m.paint?.id || null })),
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
        // Normalize: API now returns [{name, paint}], old format is string[]
        setMaterials((guide.materials || []).map(m =>
            typeof m === 'string' ? { name: m, paint: null } : { name: m.name, paint: m.paint || null }
        ));
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
        setPaintSearch('');
        setPaintResults([]);
        setShowPaintDropdown(false);
        setSteps([]);
        setEditingStep(null);
        setNewStepImages({});
    };

    // Add a paint from search results
    const addPaintMaterial = (paint) => {
        setMaterials(prev => [...prev, { name: paint.name, paint }]);
        setPaintSearch('');
        setPaintResults([]);
        setShowPaintDropdown(false);
    };

    // Add a free-text material (no paint)
    const addTextMaterial = () => {
        const trimmed = paintSearch.trim();
        if (!trimmed) return;
        setMaterials(prev => [...prev, { name: trimmed, paint: null }]);
        setPaintSearch('');
        setPaintResults([]);
        setShowPaintDropdown(false);
    };

    const removeMaterial = (index) => {
        setMaterials(prev => prev.filter((_, i) => i !== index));
    };

    // Debounced paint search
    const handlePaintSearchChange = (value) => {
        setPaintSearch(value);
        setShowPaintDropdown(true);
        clearTimeout(paintDebounceRef.current);
        if (!value.trim()) { setPaintResults([]); return; }
        setPaintSearchLoading(true);
        paintDebounceRef.current = setTimeout(async () => {
            try {
                const results = await api.getPaints(value);
                setPaintResults(results.slice(0, 12));
            } catch {
                setPaintResults([]);
            } finally {
                setPaintSearchLoading(false);
            }
        }, 280);
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
        if (!url.trim()) return;
        setSteps(prev => prev.map((step, idx) =>
            idx === stepIndex
                ? { ...step, images: [...(step.images || []), url.trim()] }
                : step
        ));
    };

    const removeStepImage = (stepIndex, imageIndex) => {
        setSteps(prev => prev.map((step, idx) =>
            idx === stepIndex
                ? { ...step, images: step.images.filter((_, i) => i !== imageIndex) }
                : step
        ));
    };

    const addStepTip = (stepIndex, tip) => {
        if (!tip.trim()) return;
        setSteps(prev => prev.map((step, idx) =>
            idx === stepIndex
                ? { ...step, tips: [...(step.tips || []), tip.trim()] }
                : step
        ));
    };

    const removeStepTip = (stepIndex, tipIndex) => {
        setSteps(prev => prev.map((step, idx) =>
            idx === stepIndex
                ? { ...step, tips: step.tips.filter((_, i) => i !== tipIndex) }
                : step
        ));
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
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.8)' }}>
                            Materiales Necesarios
                        </label>
                        <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.75rem', marginTop: 0 }}>
                            Escribe para buscar pinturas del catálogo, o pulsa <kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '1px 5px', borderRadius: '4px' }}>Enter</kbd> para añadir texto libre.
                        </p>

                        {/* Paint search input */}
                        <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                    ref={paintSearchRef}
                                    placeholder="🔍 Buscar pintura (ej. Nuln Oil, Abaddon Black…)"
                                    value={paintSearch}
                                    onChange={e => handlePaintSearchChange(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') { e.preventDefault(); addTextMaterial(); }
                                        if (e.key === 'Escape') { setShowPaintDropdown(false); }
                                    }}
                                    onFocus={() => paintSearch && setShowPaintDropdown(true)}
                                    onBlur={() => setTimeout(() => setShowPaintDropdown(false), 200)}
                                    style={{
                                        padding: '0.8rem',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid var(--glass-border)',
                                        borderRadius: '8px',
                                        color: 'var(--color-light)',
                                        fontSize: '0.9rem',
                                        flex: 1,
                                        outline: 'none',
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={addTextMaterial}
                                    title="Añadir como material de texto libre"
                                    style={{
                                        padding: '0.8rem 1.2rem',
                                        background: 'rgba(123,47,255,0.2)',
                                        border: '1px solid rgba(123,47,255,0.4)',
                                        borderRadius: '8px',
                                        color: 'var(--color-secondary)',
                                        cursor: 'pointer',
                                        fontWeight: 'bold',
                                        fontSize: '1rem',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    + Texto
                                </button>
                            </div>

                            {/* Dropdown results */}
                            {showPaintDropdown && paintSearch.trim() && (
                                <div style={{
                                    position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
                                    background: 'rgba(14,14,30,0.98)',
                                    border: '1px solid rgba(0,212,255,0.25)',
                                    borderRadius: '10px',
                                    zIndex: 200,
                                    maxHeight: '260px',
                                    overflowY: 'auto',
                                    boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                                }}>
                                    {paintSearchLoading ? (
                                        <div style={{ padding: '1rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', textAlign: 'center' }}>
                                            Buscando…
                                        </div>
                                    ) : paintResults.length === 0 ? (
                                        <div style={{ padding: '1rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', textAlign: 'center' }}>
                                            Sin resultados — pulsa Enter para añadir como texto libre
                                        </div>
                                    ) : (
                                        paintResults.map(paint => (
                                            <button
                                                key={paint.id}
                                                type="button"
                                                onMouseDown={() => addPaintMaterial(paint)}
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                                                    width: '100%', padding: '0.65rem 1rem',
                                                    background: 'transparent',
                                                    border: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)',
                                                    color: 'rgba(255,255,255,0.85)', cursor: 'pointer',
                                                    textAlign: 'left', fontSize: '0.87rem',
                                                    transition: 'background 0.1s',
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,212,255,0.08)'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                            >
                                                <span style={{
                                                    width: '18px', height: '18px', flexShrink: 0,
                                                    borderRadius: '4px', background: paint.color,
                                                    border: '1px solid rgba(255,255,255,0.15)',
                                                    display: 'inline-block',
                                                }} />
                                                <span style={{ flex: 1 }}>
                                                    <strong>{paint.name}</strong>
                                                    <span style={{ color: 'rgba(255,255,255,0.4)', marginLeft: '0.5rem', fontSize: '0.78rem' }}>
                                                        {paint.brand_display} · {paint.range}
                                                    </span>
                                                </span>
                                                {paint.code && (
                                                    <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>
                                                        {paint.code}
                                                    </span>
                                                )}
                                            </button>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Added materials list */}
                        {materials.length > 0 && (
                            <div style={{ display: 'grid', gap: '0.4rem' }}>
                                {materials.map((material, index) => (
                                    <div key={index} style={{
                                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                                        padding: '0.6rem 0.9rem',
                                        background: 'rgba(0,0,0,0.3)',
                                        border: '1px solid rgba(255,255,255,0.06)',
                                        borderRadius: '8px',
                                    }}>
                                        {material.paint ? (
                                            <span style={{
                                                width: '18px', height: '18px', flexShrink: 0,
                                                borderRadius: '4px', background: material.paint.color,
                                                border: '1px solid rgba(255,255,255,0.15)',
                                                display: 'inline-block',
                                            }} />
                                        ) : (
                                            <span style={{ width: '18px', height: '18px', flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)' }}>✦</span>
                                        )}
                                        <span style={{ flex: 1, color: 'rgba(255,255,255,0.85)', fontSize: '0.88rem' }}>
                                            {material.name}
                                            {material.paint && (
                                                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginLeft: '0.5rem' }}>
                                                    {material.paint.brand_display} · {material.paint.range}
                                                </span>
                                            )}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => removeMaterial(index)}
                                            style={{
                                                padding: '0.3rem 0.7rem',
                                                background: 'rgba(255,0,0,0.1)',
                                                border: '1px solid rgba(255,0,0,0.3)',
                                                borderRadius: '6px',
                                                color: '#ff6464',
                                                cursor: 'pointer',
                                                fontSize: '0.8rem',
                                            }}
                                        >✕</button>
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
                                            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                                                {step.images.map((img, imgIndex) => (
                                                    <div key={imgIndex} style={{
                                                        position: 'relative',
                                                        width: '100px',
                                                        height: '100px',
                                                        borderRadius: '8px',
                                                        overflow: 'hidden',
                                                        border: '1px solid rgba(0,206,209,0.4)',
                                                        background: 'rgba(0,0,0,0.4)',
                                                    }}>
                                                        <img
                                                            src={img}
                                                            alt={`Paso ${step.stepNumber} imagen ${imgIndex + 1}`}
                                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                            onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                                        />
                                                        <div style={{
                                                            display: 'none',
                                                            position: 'absolute', inset: 0,
                                                            alignItems: 'center', justifyContent: 'center',
                                                            fontSize: '0.65rem', color: 'rgba(255,100,100,0.8)',
                                                            textAlign: 'center', padding: '0.25rem',
                                                        }}>
                                                            URL inválida
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeStepImage(stepIndex, imgIndex)}
                                                            style={{
                                                                position: 'absolute', top: '2px', right: '2px',
                                                                background: 'rgba(0,0,0,0.7)',
                                                                border: 'none',
                                                                color: '#ff6464',
                                                                cursor: 'pointer',
                                                                fontSize: '0.9rem',
                                                                width: '20px', height: '20px',
                                                                borderRadius: '50%',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                lineHeight: 1,
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
