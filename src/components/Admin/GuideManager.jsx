import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../services/api';
import { useStore } from '../../stores/useStore';
import { useToast } from './Toast';
import RichTextEditor from '../UI/RichTextEditor';

// ─── Shared input style ───────────────────────────────────────────────────────
const inputStyle = {
    padding: '0.75rem 1rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '10px',
    color: 'var(--color-light)',
    fontSize: '0.95rem',
    width: '100%',
    boxSizing: 'border-box',
    outline: 'none',
    fontFamily: 'var(--font-body)',
    transition: 'border-color 0.2s',
};

const labelStyle = {
    display: 'block',
    marginBottom: '0.4rem',
    color: 'rgba(255,255,255,0.7)',
    fontSize: '0.82rem',
    fontWeight: '600',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
};

const cardStyle = {
    background: 'rgba(255,255,255,0.025)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 'var(--radius-xl, 16px)',
    padding: '1.5rem',
};

const btnBase = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.4rem',
    minHeight: '44px',
    padding: '0 1.25rem',
    borderRadius: '10px',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'var(--font-body)',
    fontSize: '0.9rem',
    fontWeight: '600',
    transition: 'opacity 0.15s, transform 0.15s',
    whiteSpace: 'nowrap',
};

// ─── Difficulty badge helper ──────────────────────────────────────────────────
const DIFFICULTIES = [
    { value: 'principiante', label: 'Principiante', color: '#22c55e', bg: 'rgba(34,197,94,0.15)', border: 'rgba(34,197,94,0.4)' },
    { value: 'intermedio',   label: 'Intermedio',   color: '#f97316', bg: 'rgba(249,115,22,0.15)', border: 'rgba(249,115,22,0.4)' },
    { value: 'avanzado',     label: 'Avanzado',     color: '#ef4444', bg: 'rgba(239,68,68,0.15)',  border: 'rgba(239,68,68,0.4)'  },
];

function difficultyMeta(value) {
    return DIFFICULTIES.find(d => d.value === value) || DIFFICULTIES[0];
}

function DifficultyBadge({ value }) {
    const d = difficultyMeta(value);
    return (
        <span style={{
            padding: '0.2rem 0.65rem',
            borderRadius: '20px',
            background: d.bg,
            border: `1px solid ${d.border}`,
            color: d.color,
            fontSize: '0.75rem',
            fontWeight: '700',
            letterSpacing: '0.03em',
        }}>
            {d.label}
        </span>
    );
}

// ─── Step progress indicator ──────────────────────────────────────────────────
const WIZARD_STEPS = ['Info básica', 'Materiales', 'Pasos'];

function WizardProgress({ current }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: '2rem' }}>
            {WIZARD_STEPS.map((label, i) => {
                const done = i < current;
                const active = i === current;
                return (
                    <React.Fragment key={i}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                            <div style={{
                                width: '36px', height: '36px',
                                borderRadius: '50%',
                                background: done
                                    ? 'var(--color-secondary)'
                                    : active
                                        ? 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))'
                                        : 'rgba(255,255,255,0.08)',
                                border: active ? 'none' : done ? 'none' : '2px solid rgba(255,255,255,0.18)',
                                color: done || active ? '#000' : 'rgba(255,255,255,0.35)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.85rem', fontWeight: '700',
                                flexShrink: 0,
                                boxShadow: active ? '0 0 16px rgba(0,212,255,0.35)' : 'none',
                                transition: 'all 0.3s',
                            }}>
                                {done ? '✓' : i + 1}
                            </div>
                            <span style={{
                                marginTop: '0.4rem',
                                fontSize: '0.72rem',
                                fontWeight: active ? '700' : '400',
                                color: active ? 'var(--color-secondary)' : done ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.3)',
                                letterSpacing: '0.03em',
                                textAlign: 'center',
                                whiteSpace: 'nowrap',
                            }}>
                                {label}
                            </span>
                        </div>
                        {i < WIZARD_STEPS.length - 1 && (
                            <div style={{
                                height: '2px',
                                flex: 1,
                                background: done ? 'var(--color-secondary)' : 'rgba(255,255,255,0.1)',
                                marginBottom: '1.2rem',
                                transition: 'background 0.3s',
                            }} />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const GuideManager = () => {
    const [guides, setGuides] = useState([]);
    const [armies, setArmies] = useState([]);
    const [editingGuide, setEditingGuide] = useState(null);
    const [panelOpen, setPanelOpen] = useState(false);
    const [wizardStep, setWizardStep] = useState(0);
    const [stepError, setStepError] = useState('');
    const [armySearch, setArmySearch] = useState('');

    const token = useStore(state => state.token);
    const toast = useToast();
    const formPanelRef = useRef(null);

    const emptyForm = () => ({
        id: '',
        title: '',
        difficulty: 'principiante',
        estimatedTime: '',
        author: '',
        dateCreated: new Date().toISOString().split('T')[0],
        coverImage: '',
        tags: [],
        faction: null,
    });

    const [formData, setFormData] = useState(emptyForm());
    const [tagInput, setTagInput] = useState('');

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

    // Scroll form into view on mobile when it opens
    useEffect(() => {
        if (panelOpen && formPanelRef.current) {
            const isMobile = window.innerWidth < 900;
            if (isMobile) {
                formPanelRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }, [panelOpen]);

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

    const handleSubmit = async () => {
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
                    tips: step.tips || [],
                })),
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
            handleCloseWizard();
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
            faction: guide.faction || null,
        });
        setMaterials((guide.materials || []).map(m =>
            typeof m === 'string' ? { name: m, paint: null } : { name: m.name, paint: m.paint || null }
        ));
        setSteps(guide.steps || []);
        setWizardStep(0);
        setStepError('');
        setPanelOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Eliminar esta guía?')) return;
        try {
            await api.deleteGuide(id, token);
            toast('Guía eliminada correctamente', 'success');
            loadGuides();
        } catch (error) {
            console.error('Error deleting guide', error);
            toast('Error al eliminar: ' + error.message, 'error');
        }
    };

    const handleCloseWizard = () => {
        setPanelOpen(false);
        setEditingGuide(null);
        setFormData(emptyForm());
        setMaterials([]);
        setPaintSearch('');
        setPaintResults([]);
        setShowPaintDropdown(false);
        setSteps([]);
        setEditingStep(null);
        setNewStepImages({});
        setNewStepTips({});
        setTagInput('');
        setArmySearch('');
        setStepError('');
        setWizardStep(0);
    };

    const handleOpenNew = () => {
        setEditingGuide(null);
        setFormData(emptyForm());
        setMaterials([]);
        setSteps([]);
        setEditingStep(null);
        setNewStepImages({});
        setNewStepTips({});
        setTagInput('');
        setArmySearch('');
        setStepError('');
        setWizardStep(0);
        setPanelOpen(true);
    };

    // ── Validation ─────────────────────────────────────────────────────────────
    const validateStep = (step) => {
        if (step === 0) {
            if (!formData.title.trim()) return 'El título es obligatorio.';
            if (!formData.id.trim()) return 'El ID es obligatorio.';
        }
        return '';
    };

    const goNext = () => {
        const err = validateStep(wizardStep);
        if (err) { setStepError(err); return; }
        setStepError('');
        setWizardStep(s => s + 1);
    };

    const goPrev = () => {
        setStepError('');
        setWizardStep(s => s - 1);
    };

    // ── Paint search ───────────────────────────────────────────────────────────
    const addPaintMaterial = (paint) => {
        setMaterials(prev => [...prev, { name: paint.name, paint }]);
        setPaintSearch('');
        setPaintResults([]);
        setShowPaintDropdown(false);
    };

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

    // ── Steps ──────────────────────────────────────────────────────────────────
    const addStep = () => {
        const newStep = { stepNumber: steps.length + 1, title: '', description: '', images: [], tips: [] };
        setSteps(prev => [...prev, newStep]);
        setEditingStep(steps.length);
    };

    const updateStep = (index, field, value) => {
        setSteps(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
    };

    const removeStep = (index) => {
        setSteps(prev =>
            prev.filter((_, i) => i !== index).map((s, i) => ({ ...s, stepNumber: i + 1 }))
        );
        if (editingStep === index) setEditingStep(null);
        else if (editingStep > index) setEditingStep(editingStep - 1);
    };

    const moveStep = (index, dir) => {
        const newSteps = [...steps];
        const target = index + dir;
        if (target < 0 || target >= newSteps.length) return;
        [newSteps[index], newSteps[target]] = [newSteps[target], newSteps[index]];
        setSteps(newSteps.map((s, i) => ({ ...s, stepNumber: i + 1 })));
        if (editingStep === index) setEditingStep(target);
        else if (editingStep === target) setEditingStep(index);
    };

    const addStepImage = (stepIndex, url) => {
        if (!url.trim()) return;
        setSteps(prev => prev.map((s, i) => i === stepIndex ? { ...s, images: [...(s.images || []), url.trim()] } : s));
    };

    const removeStepImage = (stepIndex, imgIndex) => {
        setSteps(prev => prev.map((s, i) => i === stepIndex ? { ...s, images: s.images.filter((_, j) => j !== imgIndex) } : s));
    };

    const addStepTip = (stepIndex, tip) => {
        if (!tip.trim()) return;
        setSteps(prev => prev.map((s, i) => i === stepIndex ? { ...s, tips: [...(s.tips || []), tip.trim()] } : s));
    };

    const removeStepTip = (stepIndex, tipIndex) => {
        setSteps(prev => prev.map((s, i) => i === stepIndex ? { ...s, tips: s.tips.filter((_, j) => j !== tipIndex) } : s));
    };

    // ── Tags ───────────────────────────────────────────────────────────────────
    const addTag = (tag) => {
        if (tag.trim() && !formData.tags.includes(tag.trim())) {
            setFormData(f => ({ ...f, tags: [...f.tags, tag.trim()] }));
        }
    };
    const removeTag = (t) => setFormData(f => ({ ...f, tags: f.tags.filter(x => x !== t) }));

    // ── Faction search ─────────────────────────────────────────────────────────
    const filteredArmies = armySearch.trim()
        ? armies.filter(a => a.name.toLowerCase().includes(armySearch.toLowerCase()))
        : armies;

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            {/* Scoped responsive CSS */}
            <style>{`
                .guide-manager-layout { display: flex; gap: 1.5rem; align-items: flex-start; }
                .guide-list-panel { transition: flex 0.3s ease; min-width: 0; }
                .guide-form-panel { min-width: 0; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 1.5rem; position: sticky; top: 1rem; }
                @media (max-width: 900px) {
                    .guide-manager-layout { flex-direction: column; }
                    .guide-list-panel { width: 100% !important; flex: unset !important; }
                    .guide-form-panel { width: 100%; position: static; }
                }
            `}</style>

            {/* Header */}
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}
            >
                <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-secondary)', margin: 0, fontSize: '2rem' }}>
                    Guías de Pintura
                </h2>
                {!panelOpen && (
                    <button
                        onClick={handleOpenNew}
                        style={{
                            ...btnBase,
                            background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                            color: '#000',
                            fontFamily: 'var(--font-display)',
                            padding: '0 1.5rem',
                            minHeight: '46px',
                            borderRadius: '50px',
                            boxShadow: '0 4px 16px rgba(0,212,255,0.25)',
                        }}
                    >
                        + Nueva Guía
                    </button>
                )}
            </motion.div>

            {/* Split-panel layout */}
            <div className="guide-manager-layout">
                {/* ── List panel ── */}
                <div
                    className="guide-list-panel"
                    style={{ flex: panelOpen ? '0 0 38%' : '1' }}
                >
                    {/* Nueva Guía button when panel is open (inside list panel) */}
                    {panelOpen && (
                        <div style={{ marginBottom: '1rem' }}>
                            <button
                                onClick={handleOpenNew}
                                style={{
                                    ...btnBase,
                                    background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                                    color: '#000',
                                    fontFamily: 'var(--font-display)',
                                    padding: '0 1.25rem',
                                    minHeight: '40px',
                                    borderRadius: '50px',
                                    boxShadow: '0 4px 16px rgba(0,212,255,0.25)',
                                    fontSize: '0.85rem',
                                    width: '100%',
                                }}
                            >
                                + Nueva Guía
                            </button>
                        </div>
                    )}

                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
                        {guides.length === 0 ? (
                            <div style={{ ...cardStyle, textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.3)' }}>
                                No hay guías todavía. Crea la primera.
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gap: '0.75rem' }}>
                                {guides.map((guide, index) => (
                                    <motion.div
                                        key={guide.id}
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: index * 0.04 }}
                                        style={{
                                            ...cardStyle,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1rem',
                                            padding: panelOpen ? '0.75rem 1rem' : '1rem 1.25rem',
                                            transition: 'border-color 0.2s',
                                            cursor: 'default',
                                            borderColor: editingGuide?.id === guide.id ? 'rgba(0,212,255,0.4)' : 'rgba(255,255,255,0.07)',
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,212,255,0.25)'}
                                        onMouseLeave={e => e.currentTarget.style.borderColor = editingGuide?.id === guide.id ? 'rgba(0,212,255,0.4)' : 'rgba(255,255,255,0.07)'}
                                    >
                                        {/* Cover thumb — hide when panel is compressed */}
                                        {!panelOpen && (
                                            guide.coverImage ? (
                                                <img
                                                    src={guide.coverImage}
                                                    alt={guide.title}
                                                    style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '10px', flexShrink: 0 }}
                                                />
                                            ) : (
                                                <div style={{
                                                    width: '56px', height: '56px', borderRadius: '10px', flexShrink: 0,
                                                    background: 'rgba(255,255,255,0.05)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: '1.5rem', color: 'rgba(255,255,255,0.15)',
                                                }}>🖌</div>
                                            )
                                        )}

                                        {/* Info */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                                                <span style={{ fontFamily: 'var(--font-display)', fontSize: panelOpen ? '0.88rem' : '1rem', fontWeight: '700', color: 'var(--color-light)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {guide.title}
                                                </span>
                                                {!panelOpen && <DifficultyBadge value={guide.difficulty} />}
                                            </div>
                                            {!panelOpen && (
                                                <div style={{ marginTop: '0.2rem', fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                                    {guide.faction?.name && <span>{guide.faction.name}</span>}
                                                    {guide.author && <span>{guide.author}</span>}
                                                    {guide.estimatedTime && <span>{guide.estimatedTime}</span>}
                                                </div>
                                            )}
                                            {panelOpen && (
                                                <div style={{ marginTop: '0.15rem', fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)' }}>
                                                    {guide.difficulty}
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                                            <button
                                                onClick={() => handleEdit(guide)}
                                                style={{
                                                    ...btnBase,
                                                    background: 'transparent',
                                                    border: '1px solid rgba(0,212,255,0.35)',
                                                    color: 'var(--color-secondary)',
                                                    padding: '0 0.75rem',
                                                    minHeight: '32px',
                                                    fontSize: '0.78rem',
                                                }}
                                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,212,255,0.1)'; }}
                                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                                            >
                                                {panelOpen ? '✏️' : 'Editar'}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(guide.id)}
                                                style={{
                                                    ...btnBase,
                                                    background: 'transparent',
                                                    border: '1px solid rgba(255,100,100,0.3)',
                                                    color: '#ff6464',
                                                    padding: '0 0.75rem',
                                                    minHeight: '32px',
                                                    fontSize: '0.78rem',
                                                }}
                                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,100,100,0.1)'; }}
                                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                                            >
                                                {panelOpen ? '🗑️' : 'Eliminar'}
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* ── Form panel ── */}
                <AnimatePresence>
                    {panelOpen && (
                        <motion.div
                            key="guide-form-panel"
                            ref={formPanelRef}
                            className="guide-form-panel"
                            style={{ flex: '1' }}
                            initial={{ opacity: 0, x: 24 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 24 }}
                            transition={{ duration: 0.25, ease: 'easeOut' }}
                        >
                            {/* Panel header */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                justifyContent: 'space-between',
                                marginBottom: '1.25rem',
                                gap: '1rem',
                            }}>
                                <h3 style={{
                                    margin: 0,
                                    fontFamily: 'var(--font-display)',
                                    color: 'var(--color-secondary)',
                                    fontSize: '1.3rem',
                                    lineHeight: 1.2,
                                }}>
                                    {editingGuide ? `Editando: ${editingGuide.title}` : 'Nueva Guía'}
                                </h3>
                                <button
                                    onClick={handleCloseWizard}
                                    style={{
                                        ...btnBase,
                                        background: 'rgba(255,255,255,0.06)',
                                        color: 'rgba(255,255,255,0.5)',
                                        minHeight: '34px',
                                        width: '34px',
                                        padding: 0,
                                        borderRadius: '50%',
                                        fontSize: '1.2rem',
                                        flexShrink: 0,
                                    }}
                                    aria-label="Cerrar"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Step progress */}
                            <WizardProgress current={wizardStep} />

                            {/* Step content — scrollable */}
                            <div style={{ maxHeight: 'calc(100vh - 22rem)', overflowY: 'auto', paddingRight: '4px' }}>
                                <AnimatePresence mode="wait">
                                    {wizardStep === 0 && (
                                        <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                                            <StepInfoBasica
                                                formData={formData}
                                                setFormData={setFormData}
                                                armies={filteredArmies}
                                                armySearch={armySearch}
                                                setArmySearch={setArmySearch}
                                                tagInput={tagInput}
                                                setTagInput={setTagInput}
                                                addTag={addTag}
                                                removeTag={removeTag}
                                                editingGuide={editingGuide}
                                            />
                                        </motion.div>
                                    )}
                                    {wizardStep === 1 && (
                                        <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                                            <StepMateriales
                                                materials={materials}
                                                paintSearch={paintSearch}
                                                paintSearchRef={paintSearchRef}
                                                paintResults={paintResults}
                                                paintSearchLoading={paintSearchLoading}
                                                showPaintDropdown={showPaintDropdown}
                                                setShowPaintDropdown={setShowPaintDropdown}
                                                handlePaintSearchChange={handlePaintSearchChange}
                                                addPaintMaterial={addPaintMaterial}
                                                addTextMaterial={addTextMaterial}
                                                removeMaterial={removeMaterial}
                                            />
                                        </motion.div>
                                    )}
                                    {wizardStep === 2 && (
                                        <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                                            <StepPasos
                                                steps={steps}
                                                editingStep={editingStep}
                                                setEditingStep={setEditingStep}
                                                addStep={addStep}
                                                removeStep={removeStep}
                                                moveStep={moveStep}
                                                updateStep={updateStep}
                                                newStepImages={newStepImages}
                                                setNewStepImages={setNewStepImages}
                                                newStepTips={newStepTips}
                                                setNewStepTips={setNewStepTips}
                                                addStepImage={addStepImage}
                                                removeStepImage={removeStepImage}
                                                addStepTip={addStepTip}
                                                removeStepTip={removeStepTip}
                                                token={token}
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Navigation footer */}
                            <div style={{
                                borderTop: '1px solid rgba(255,255,255,0.07)',
                                paddingTop: '1rem',
                                marginTop: '1.25rem',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.5rem',
                            }}>
                                {stepError && (
                                    <div style={{
                                        padding: '0.6rem 1rem',
                                        background: 'rgba(239,68,68,0.12)',
                                        border: '1px solid rgba(239,68,68,0.35)',
                                        borderRadius: '8px',
                                        color: '#fca5a5',
                                        fontSize: '0.85rem',
                                    }}>
                                        {stepError}
                                    </div>
                                )}
                                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <button
                                        onClick={goPrev}
                                        disabled={wizardStep === 0}
                                        style={{
                                            ...btnBase,
                                            background: 'rgba(255,255,255,0.06)',
                                            color: wizardStep === 0 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.7)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            padding: '0 1.25rem',
                                            opacity: wizardStep === 0 ? 0.5 : 1,
                                            cursor: wizardStep === 0 ? 'not-allowed' : 'pointer',
                                        }}
                                    >
                                        ← Anterior
                                    </button>

                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                        <button
                                            onClick={handleCloseWizard}
                                            style={{
                                                ...btnBase,
                                                background: 'transparent',
                                                color: 'rgba(255,255,255,0.4)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                padding: '0 1rem',
                                            }}
                                        >
                                            Cancelar
                                        </button>

                                        {wizardStep < WIZARD_STEPS.length - 1 ? (
                                            <button
                                                onClick={goNext}
                                                style={{
                                                    ...btnBase,
                                                    background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                                                    color: '#000',
                                                    fontFamily: 'var(--font-display)',
                                                    padding: '0 1.5rem',
                                                    borderRadius: '50px',
                                                    boxShadow: '0 4px 14px rgba(0,212,255,0.25)',
                                                }}
                                            >
                                                Siguiente →
                                            </button>
                                        ) : (
                                            <button
                                                onClick={handleSubmit}
                                                style={{
                                                    ...btnBase,
                                                    background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                                                    color: '#000',
                                                    fontFamily: 'var(--font-display)',
                                                    padding: '0 1.75rem',
                                                    borderRadius: '50px',
                                                    boxShadow: '0 4px 16px rgba(0,212,255,0.3)',
                                                    fontSize: '1rem',
                                                }}
                                            >
                                                {editingGuide ? 'Actualizar' : 'Crear'} Guía
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 1 — Info básica
// ═══════════════════════════════════════════════════════════════════════════════
function StepInfoBasica({ formData, setFormData, armies, armySearch, setArmySearch, tagInput, setTagInput, addTag, removeTag, editingGuide }) {
    const [factionOpen, setFactionOpen] = useState(false);
    const factionRef = useRef(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (factionRef.current && !factionRef.current.contains(e.target)) setFactionOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const field = (key, value) => setFormData(f => ({ ...f, [key]: value }));

    return (
        <div style={{ display: 'grid', gap: '1.25rem' }}>
            {/* ID + Title */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                    <label style={labelStyle}>ID *</label>
                    <input
                        style={inputStyle}
                        placeholder="guia-space-marines"
                        value={formData.id}
                        onChange={e => field('id', e.target.value)}
                        disabled={!!editingGuide}
                    />
                </div>
                <div>
                    <label style={labelStyle}>Título *</label>
                    <input
                        style={inputStyle}
                        placeholder="Cómo pintar Space Marines"
                        value={formData.title}
                        onChange={e => field('title', e.target.value)}
                    />
                </div>
            </div>

            {/* Difficulty — visual card selector */}
            <div>
                <label style={labelStyle}>Dificultad</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                    {DIFFICULTIES.map(d => {
                        const selected = formData.difficulty === d.value;
                        return (
                            <button
                                key={d.value}
                                type="button"
                                onClick={() => field('difficulty', d.value)}
                                style={{
                                    ...btnBase,
                                    flexDirection: 'column',
                                    gap: '0.35rem',
                                    minHeight: '68px',
                                    padding: '0.75rem',
                                    borderRadius: '12px',
                                    background: selected ? d.bg : 'rgba(255,255,255,0.03)',
                                    border: `2px solid ${selected ? d.border : 'rgba(255,255,255,0.08)'}`,
                                    color: selected ? d.color : 'rgba(255,255,255,0.45)',
                                    fontWeight: selected ? '700' : '500',
                                    fontSize: '0.88rem',
                                    transition: 'all 0.2s',
                                    boxShadow: selected ? `0 0 12px ${d.border}` : 'none',
                                }}
                            >
                                <span style={{ fontSize: '1.3rem' }}>
                                    {d.value === 'principiante' ? '🟢' : d.value === 'intermedio' ? '🟠' : '🔴'}
                                </span>
                                {d.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Time + Author + Date */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                    <label style={labelStyle}>Tiempo estimado</label>
                    <input style={inputStyle} placeholder="2 horas" value={formData.estimatedTime} onChange={e => field('estimatedTime', e.target.value)} />
                </div>
                <div>
                    <label style={labelStyle}>Autor</label>
                    <input style={inputStyle} placeholder="Nombre del autor" value={formData.author} onChange={e => field('author', e.target.value)} />
                </div>
                <div>
                    <label style={labelStyle}>Fecha</label>
                    <input type="date" style={inputStyle} value={formData.dateCreated} onChange={e => field('dateCreated', e.target.value)} />
                </div>
            </div>

            {/* Cover image */}
            <div>
                <label style={labelStyle}>URL imagen de portada</label>
                <input type="url" style={inputStyle} placeholder="https://..." value={formData.coverImage} onChange={e => field('coverImage', e.target.value)} />
                {formData.coverImage && (
                    <div style={{ marginTop: '0.5rem', borderRadius: '10px', overflow: 'hidden', maxHeight: '120px' }}>
                        <img src={formData.coverImage} alt="preview" style={{ width: '100%', height: '120px', objectFit: 'cover' }}
                            onError={e => { e.target.style.display = 'none'; }} />
                    </div>
                )}
            </div>

            {/* Faction — searchable dropdown */}
            <div ref={factionRef} style={{ position: 'relative' }}>
                <label style={labelStyle}>Ejército / Facción</label>
                <input
                    style={inputStyle}
                    placeholder="Buscar facción…"
                    value={factionOpen ? armySearch : (formData.faction?.name || '')}
                    onFocus={() => { setFactionOpen(true); setArmySearch(''); }}
                    onChange={e => setArmySearch(e.target.value)}
                />
                {factionOpen && (
                    <div style={{
                        position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
                        background: 'rgba(10,10,26,0.98)',
                        border: '1px solid rgba(0,212,255,0.2)',
                        borderRadius: '10px',
                        zIndex: 50,
                        maxHeight: '200px',
                        overflowY: 'auto',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                    }}>
                        <button
                            type="button"
                            onMouseDown={() => { setFormData(f => ({ ...f, faction: null })); setFactionOpen(false); setArmySearch(''); }}
                            style={{
                                width: '100%', padding: '0.65rem 1rem',
                                background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)',
                                color: 'rgba(255,255,255,0.4)', cursor: 'pointer', textAlign: 'left', fontSize: '0.87rem',
                            }}
                        >
                            — Ninguna —
                        </button>
                        {armies.map(army => (
                            <button
                                key={army.id}
                                type="button"
                                onMouseDown={() => { setFormData(f => ({ ...f, faction: army })); setFactionOpen(false); setArmySearch(''); }}
                                style={{
                                    width: '100%', padding: '0.65rem 1rem',
                                    background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.04)',
                                    color: 'rgba(255,255,255,0.85)', cursor: 'pointer', textAlign: 'left', fontSize: '0.87rem',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,212,255,0.08)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                {army.name}
                            </button>
                        ))}
                        {armies.length === 0 && (
                            <div style={{ padding: '0.75rem 1rem', color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>Sin resultados</div>
                        )}
                    </div>
                )}
            </div>

            {/* Tags — chip input */}
            <div>
                <label style={labelStyle}>Tags</label>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                    {formData.tags.map(tag => (
                        <span key={tag} style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                            padding: '0.25rem 0.75rem',
                            background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.25)',
                            borderRadius: '20px', color: 'var(--color-secondary)', fontSize: '0.82rem',
                        }}>
                            #{tag}
                            <button type="button" onClick={() => removeTag(tag)} style={{ background: 'none', border: 'none', color: 'var(--color-secondary)', cursor: 'pointer', padding: 0, lineHeight: 1, fontSize: '1rem' }}>×</button>
                        </span>
                    ))}
                </div>
                <input
                    style={inputStyle}
                    placeholder="Escribe un tag y pulsa Enter"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => {
                        if (e.key === 'Enter') { e.preventDefault(); addTag(tagInput); setTagInput(''); }
                    }}
                />
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 2 — Materiales
// ═══════════════════════════════════════════════════════════════════════════════
function StepMateriales({
    materials, paintSearch, paintSearchRef, paintResults, paintSearchLoading,
    showPaintDropdown, setShowPaintDropdown,
    handlePaintSearchChange, addPaintMaterial, addTextMaterial, removeMaterial,
}) {
    return (
        <div style={{ display: 'grid', gap: '1.25rem' }}>
            <div>
                <p style={{ margin: '0 0 0.5rem 0', color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', fontWeight: '600' }}>
                    Materiales necesarios
                </p>
                <p style={{ margin: '0 0 1rem 0', fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)' }}>
                    Busca pinturas del catálogo o pulsa <kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '1px 5px', borderRadius: '4px' }}>Enter</kbd> para añadir texto libre.
                </p>

                {/* Paint search widget */}
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
                                ...inputStyle,
                                flex: 1,
                                width: 'auto',
                            }}
                        />
                        <button
                            type="button"
                            onClick={addTextMaterial}
                            title="Añadir como material de texto libre"
                            style={{
                                ...btnBase,
                                background: 'rgba(123,47,255,0.15)',
                                border: '1px solid rgba(123,47,255,0.35)',
                                color: 'var(--color-secondary)',
                                padding: '0 1rem',
                                flexShrink: 0,
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
                                <div style={{ padding: '1rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', textAlign: 'center' }}>Buscando…</div>
                            ) : paintResults.length === 0 ? (
                                <div style={{ padding: '1rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', textAlign: 'center' }}>Sin resultados — pulsa Enter para añadir como texto libre</div>
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
                                            <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>{paint.code}</span>
                                        )}
                                    </button>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* Added materials */}
                {materials.length > 0 && (
                    <div style={{ display: 'grid', gap: '0.4rem' }}>
                        {materials.map((material, index) => (
                            <div key={index} style={{
                                display: 'flex', alignItems: 'center', gap: '0.75rem',
                                padding: '0.6rem 0.9rem',
                                background: 'rgba(0,0,0,0.25)',
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
                                        ...btnBase,
                                        minHeight: '30px',
                                        padding: '0 0.6rem',
                                        background: 'rgba(255,0,0,0.08)',
                                        border: '1px solid rgba(255,0,0,0.25)',
                                        borderRadius: '6px',
                                        color: '#ff6464',
                                        fontSize: '0.8rem',
                                    }}
                                >✕</button>
                            </div>
                        ))}
                    </div>
                )}

                {materials.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.2)', fontSize: '0.85rem', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: '10px' }}>
                        Aún no has añadido materiales
                    </div>
                )}
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 3 — Pasos
// ═══════════════════════════════════════════════════════════════════════════════
function StepPasos({
    steps, editingStep, setEditingStep,
    addStep, removeStep, moveStep, updateStep,
    newStepImages, setNewStepImages,
    newStepTips, setNewStepTips,
    addStepImage, removeStepImage,
    addStepTip, removeStepTip,
    token,
}) {
    return (
        <div style={{ display: 'grid', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', fontWeight: '600' }}>
                    Pasos de la guía ({steps.length})
                </span>
                <button
                    type="button"
                    onClick={addStep}
                    style={{
                        ...btnBase,
                        background: 'rgba(0,212,255,0.1)',
                        border: '1px solid rgba(0,212,255,0.3)',
                        color: 'var(--color-secondary)',
                        padding: '0 1rem',
                        minHeight: '38px',
                        fontSize: '0.85rem',
                    }}
                >
                    + Añadir paso
                </button>
            </div>

            {steps.length === 0 && (
                <div style={{ textAlign: 'center', padding: '2.5rem', color: 'rgba(255,255,255,0.2)', fontSize: '0.85rem', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: '12px' }}>
                    Aún no hay pasos. Haz clic en "Añadir paso" para empezar.
                </div>
            )}

            {steps.map((step, stepIndex) => {
                const isEditing = editingStep === stepIndex;
                return (
                    <div key={stepIndex} style={{
                        background: isEditing ? 'rgba(0,212,255,0.04)' : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${isEditing ? 'rgba(0,212,255,0.25)' : 'rgba(255,255,255,0.07)'}`,
                        borderRadius: '12px',
                        overflow: 'hidden',
                        transition: 'border-color 0.2s',
                    }}>
                        {/* Step header — always visible */}
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                            padding: '0.75rem 1rem',
                            cursor: 'pointer',
                            userSelect: 'none',
                        }}
                            onClick={() => setEditingStep(isEditing ? null : stepIndex)}
                        >
                            {/* Step number badge */}
                            <span style={{
                                width: '28px', height: '28px', borderRadius: '50%',
                                background: 'var(--color-primary)',
                                color: '#fff',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.78rem', fontWeight: '700', flexShrink: 0,
                            }}>
                                {step.stepNumber}
                            </span>

                            <span style={{ flex: 1, color: step.title ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.3)', fontSize: '0.9rem', fontStyle: step.title ? 'normal' : 'italic' }}>
                                {step.title || 'Sin título'}
                            </span>

                            {/* Reorder buttons */}
                            <button type="button" onClick={e => { e.stopPropagation(); moveStep(stepIndex, -1); }}
                                disabled={stepIndex === 0}
                                style={{ ...btnBase, minHeight: '30px', width: '30px', padding: 0, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: stepIndex === 0 ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.5)', borderRadius: '6px', fontSize: '0.75rem' }}>↑</button>
                            <button type="button" onClick={e => { e.stopPropagation(); moveStep(stepIndex, 1); }}
                                disabled={stepIndex === steps.length - 1}
                                style={{ ...btnBase, minHeight: '30px', width: '30px', padding: 0, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: stepIndex === steps.length - 1 ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.5)', borderRadius: '6px', fontSize: '0.75rem' }}>↓</button>

                            <button type="button" onClick={e => { e.stopPropagation(); removeStep(stepIndex); }}
                                style={{ ...btnBase, minHeight: '30px', padding: '0 0.6rem', background: 'rgba(255,0,0,0.08)', border: '1px solid rgba(255,0,0,0.25)', color: '#ff6464', borderRadius: '6px', fontSize: '0.78rem' }}>
                                Eliminar
                            </button>

                            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', marginLeft: '0.25rem' }}>{isEditing ? '▲' : '▼'}</span>
                        </div>

                        {/* Inline step editor */}
                        {isEditing && (
                            <div style={{ padding: '0 1rem 1rem', display: 'grid', gap: '0.9rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                <div style={{ paddingTop: '0.75rem' }}>
                                    <label style={labelStyle}>Título del paso</label>
                                    <input
                                        style={inputStyle}
                                        placeholder="Título del paso"
                                        value={step.title}
                                        onChange={e => updateStep(stepIndex, 'title', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label style={labelStyle}>Descripción</label>
                                    <RichTextEditor
                                        value={step.description}
                                        onChange={val => updateStep(stepIndex, 'description', val)}
                                        token={token}
                                        placeholder="Describe este paso..."
                                        minHeight="100px"
                                    />
                                </div>

                                {/* Images */}
                                <div>
                                    <label style={labelStyle}>Imágenes</label>
                                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                        <input
                                            style={{ ...inputStyle, flex: 1, width: 'auto' }}
                                            placeholder="URL de imagen"
                                            value={newStepImages[stepIndex] || ''}
                                            onChange={e => setNewStepImages(prev => ({ ...prev, [stepIndex]: e.target.value }))}
                                            onKeyDown={e => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    addStepImage(stepIndex, newStepImages[stepIndex] || '');
                                                    setNewStepImages(prev => ({ ...prev, [stepIndex]: '' }));
                                                }
                                            }}
                                        />
                                        <button type="button"
                                            onClick={() => { addStepImage(stepIndex, newStepImages[stepIndex] || ''); setNewStepImages(prev => ({ ...prev, [stepIndex]: '' })); }}
                                            style={{ ...btnBase, background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.25)', color: 'var(--color-secondary)', padding: '0 0.9rem', flexShrink: 0 }}>
                                            + Añadir
                                        </button>
                                    </div>
                                    {step.images && step.images.length > 0 && (
                                        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                                            {step.images.map((img, imgIndex) => (
                                                <div key={imgIndex} style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(0,206,209,0.3)', background: 'rgba(0,0,0,0.4)' }}>
                                                    <img src={img} alt={`img${imgIndex}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
                                                    <button type="button" onClick={() => removeStepImage(stepIndex, imgIndex)}
                                                        style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(0,0,0,0.75)', border: 'none', color: '#ff6464', cursor: 'pointer', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', lineHeight: 1 }}>
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Tips */}
                                <div>
                                    <label style={labelStyle}>Consejos</label>
                                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                        <input
                                            style={{ ...inputStyle, flex: 1, width: 'auto' }}
                                            placeholder="Añadir consejo"
                                            value={newStepTips[stepIndex] || ''}
                                            onChange={e => setNewStepTips(prev => ({ ...prev, [stepIndex]: e.target.value }))}
                                            onKeyDown={e => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    addStepTip(stepIndex, newStepTips[stepIndex] || '');
                                                    setNewStepTips(prev => ({ ...prev, [stepIndex]: '' }));
                                                }
                                            }}
                                        />
                                        <button type="button"
                                            onClick={() => { addStepTip(stepIndex, newStepTips[stepIndex] || ''); setNewStepTips(prev => ({ ...prev, [stepIndex]: '' })); }}
                                            style={{ ...btnBase, background: 'rgba(123,47,255,0.12)', border: '1px solid rgba(123,47,255,0.3)', color: 'var(--color-secondary)', padding: '0 0.9rem', flexShrink: 0 }}>
                                            + Añadir
                                        </button>
                                    </div>
                                    {step.tips && step.tips.length > 0 && (
                                        <div style={{ display: 'grid', gap: '0.35rem' }}>
                                            {step.tips.map((tip, tipIndex) => (
                                                <div key={tipIndex} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', padding: '0.4rem 0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
                                                    <span style={{ color: 'var(--color-secondary)', flexShrink: 0, marginTop: '0.1rem' }}>💡</span>
                                                    <span style={{ flex: 1, color: 'rgba(255,255,255,0.75)', fontSize: '0.87rem' }}>{tip}</span>
                                                    <button type="button" onClick={() => removeStepTip(stepIndex, tipIndex)}
                                                        style={{ background: 'none', border: 'none', color: '#ff6464', cursor: 'pointer', fontSize: '1rem', padding: 0, lineHeight: 1, flexShrink: 0 }}>×</button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export default GuideManager;
