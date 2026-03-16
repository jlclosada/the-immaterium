import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../../services/api';
import { useStore } from '../../stores/useStore';
import { useToast } from './Toast';

const ReportManager = () => {
    const [reports, setReports] = useState([]);
    const [armies, setArmies] = useState([]);
    const [editingReport, setEditingReport] = useState(null);
    const token = useStore(state => state.token);
    const toast = useToast();
    const [formData, setFormData] = useState({
        id: '',
        title: '',
        mission: '',
        points: 2000,
        date: new Date().toISOString().split('T')[0],
        tags: [],
        factions: [],
        player1_name: '',
        player1_faction: '',
        player1_score: 0,
        player1_list: [],
        player2_name: '',
        player2_faction: '',
        player2_score: 0,
        player2_list: [],
        keyMoments: [],
        mvp: '',
        images: []
    });
    const [narrative, setNarrative] = useState([]);
    const [newNarrative, setNewNarrative] = useState({ turn: 1, phase: '', text: '' });
    const [newKeyMoment, setNewKeyMoment] = useState('');
    const [newImageUrl, setNewImageUrl] = useState('');
    const [newPlayer1Unit, setNewPlayer1Unit] = useState('');
    const [newPlayer2Unit, setNewPlayer2Unit] = useState('');

    useEffect(() => {
        loadReports();
        loadArmies();
    }, []);

    const loadReports = async () => {
        try {
            const data = await api.getBattleReports();
            setReports(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to load reports', error);
            setReports([]);
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
                id: formData.id,
                title: formData.title,
                mission: formData.mission,
                points: formData.points,
                date: formData.date,
                tags: formData.tags,
                factions: formData.factions,
                keyMoments: formData.keyMoments,
                mvp: formData.mvp,
                images: formData.images,
                player1_name: formData.player1_name,
                player1_faction: formData.player1_faction,
                player1_score: formData.player1_score,
                player1_list: formData.player1_list,
                player2_name: formData.player2_name,
                player2_faction: formData.player2_faction,
                player2_score: formData.player2_score,
                player2_list: formData.player2_list,
                narrative: narrative.map(n => ({
                    turn: n.turn,
                    phase: n.phase,
                    text: n.text,
                    order: narrative.indexOf(n)
                }))
            };

            if (editingReport) {
                await api.updateBattleReport(editingReport.id, dataToSend, token);
                toast('Informe de batalla actualizado correctamente', 'success');
            } else {
                await api.createBattleReport(dataToSend, token);
                toast('Informe de batalla creado correctamente', 'success');
            }
            loadReports();
            handleCancel();
        } catch (error) {
            console.error('Error saving report', error);
            toast('Error al guardar: ' + error.message, 'error');
        }
    };

    const handleEdit = (report) => {
        setEditingReport(report);
        setFormData({
            id: report.id,
            title: report.title,
            mission: report.mission || '',
            points: report.points || 2000,
            date: report.date ? report.date.split('T')[0] : new Date().toISOString().split('T')[0],
            tags: report.tags || [],
            factions: report.factions || [],
            player1_name: report.armies?.player1?.name || '',
            player1_faction: report.armies?.player1?.faction || '',
            player1_score: report.finalScore?.player1 || 0,
            player1_list: report.armies?.player1?.list || [],
            player2_name: report.armies?.player2?.name || '',
            player2_faction: report.armies?.player2?.faction || '',
            player2_score: report.finalScore?.player2 || 0,
            player2_list: report.armies?.player2?.list || [],
            keyMoments: report.keyMoments || [],
            mvp: report.mvp || '',
            images: report.images || []
        });
        setNarrative(report.narrative || []);
    };

    const handleDelete = async (id) => {
        try {
            await api.deleteBattleReport(id, token);
            toast('Informe eliminado correctamente', 'success');
            loadReports();
        } catch (error) {
            console.error('Error deleting report', error);
            toast('Error al eliminar: ' + error.message, 'error');
        }
    };

    const handleCancel = () => {
        setEditingReport(null);
        setFormData({
            id: '',
            title: '',
            mission: '',
            points: 2000,
            date: new Date().toISOString().split('T')[0],
            tags: [],
            factions: [],
            player1_name: '',
            player1_faction: '',
            player1_score: 0,
            player1_list: [],
            player2_name: '',
            player2_faction: '',
            player2_score: 0,
            player2_list: [],
            keyMoments: [],
            mvp: '',
            images: []
        });
        setNarrative([]);
        setNewNarrative({ turn: 1, phase: '', text: '' });
        setNewKeyMoment('');
        setNewPlayer1Unit('');
        setNewPlayer2Unit('');
        setNewImageUrl('');
    };

    const addTag = (tag) => {
        if (tag.trim() && !formData.tags.includes(tag.trim())) {
            setFormData({ ...formData, tags: [...formData.tags, tag.trim()] });
        }
    };

    const removeTag = (tagToRemove) => {
        setFormData({ ...formData, tags: formData.tags.filter(t => t !== tagToRemove) });
    };

    const addFaction = (factionId) => {
        if (factionId && !formData.factions.includes(factionId)) {
            setFormData({ ...formData, factions: [...formData.factions, factionId] });
        }
    };

    const removeFaction = (factionToRemove) => {
        setFormData({ ...formData, factions: formData.factions.filter(f => f !== factionToRemove) });
    };

    const addPlayer1Unit = () => {
        if (newPlayer1Unit.trim()) {
            setFormData({
                ...formData,
                player1_list: [...formData.player1_list, newPlayer1Unit.trim()]
            });
            setNewPlayer1Unit('');
        }
    };

    const removePlayer1Unit = (index) => {
        setFormData({
            ...formData,
            player1_list: formData.player1_list.filter((_, i) => i !== index)
        });
    };

    const addPlayer2Unit = () => {
        if (newPlayer2Unit.trim()) {
            setFormData({
                ...formData,
                player2_list: [...formData.player2_list, newPlayer2Unit.trim()]
            });
            setNewPlayer2Unit('');
        }
    };

    const removePlayer2Unit = (index) => {
        setFormData({
            ...formData,
            player2_list: formData.player2_list.filter((_, i) => i !== index)
        });
    };

    const addKeyMoment = () => {
        if (newKeyMoment.trim()) {
            setFormData({
                ...formData,
                keyMoments: [...formData.keyMoments, newKeyMoment.trim()]
            });
            setNewKeyMoment('');
        }
    };

    const removeKeyMoment = (index) => {
        setFormData({
            ...formData,
            keyMoments: formData.keyMoments.filter((_, i) => i !== index)
        });
    };

    const addImage = () => {
        if (newImageUrl.trim()) {
            setFormData({ ...formData, images: [...formData.images, newImageUrl.trim()] });
            setNewImageUrl('');
        }
    };

    const removeImage = (index) => {
        setFormData({ ...formData, images: formData.images.filter((_, i) => i !== index) });
    };

    const addNarrative = () => {
        if (newNarrative.phase && newNarrative.text) {
            setNarrative([...narrative, { ...newNarrative }]);
            setNewNarrative({ turn: newNarrative.turn + 1, phase: '', text: '' });
        }
    };

    const removeNarrative = (index) => {
        setNarrative(narrative.filter((_, i) => i !== index));
    };

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
            >
                <h2 style={{
                    fontFamily: 'var(--font-display)',
                    color: '#ff0064',
                    marginBottom: '2rem',
                    fontSize: '2.5rem'
                }}>
                    Gestión de Informes de Batalla
                </h2>
            </motion.div>

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="glass-panel"
                style={{ padding: '2rem', marginBottom: '2rem', maxHeight: '85vh', overflowY: 'auto' }}
            >
                <h3 style={{
                    marginTop: 0,
                    marginBottom: '1.5rem',
                    fontFamily: 'var(--font-display)',
                    color: '#ff0064',
                    fontSize: '1.5rem'
                }}>
                    {editingReport ? 'Editar Informe' : '+ Nuevo Informe'}
                </h3>
                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.8)' }}>ID *</label>
                            <input
                                placeholder="battle-report-1"
                                value={formData.id}
                                onChange={e => setFormData({ ...formData, id: e.target.value })}
                                disabled={!!editingReport}
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
                                placeholder="Batalla épica en Macragge"
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

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.8)' }}>Misión *</label>
                            <input
                                placeholder="Misión de batalla"
                                value={formData.mission}
                                onChange={e => setFormData({ ...formData, mission: e.target.value })}
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
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.8)' }}>Puntos *</label>
                            <input
                                type="number"
                                value={formData.points}
                                onChange={e => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
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
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
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
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.8)' }}>Facciones *</label>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <select
                                onChange={e => {
                                    if (e.target.value) {
                                        addFaction(e.target.value);
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
                            >
                                <option value="">Seleccionar facción...</option>
                                {armies.map(army => (
                                    <option key={army.id} value={army.id}>{army.name}</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {formData.factions.map(factionId => {
                                const army = armies.find(a => a.id === factionId);
                                return army ? (
                                    <span key={factionId} style={{
                                        padding: '0.5rem 1rem',
                                        background: 'rgba(255,0,100,0.2)',
                                        borderRadius: '20px',
                                        color: '#ff6464',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}>
                                        {army.name}
                                        <button
                                            type="button"
                                            onClick={() => removeFaction(factionId)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: '#ff6464',
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
                                ) : null;
                            })}
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.8)' }}>Tags</label>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                            {formData.tags.map(tag => (
                                <span key={tag} style={{
                                    padding: '0.5rem 1rem',
                                    background: 'rgba(255,100,100,0.2)',
                                    borderRadius: '20px',
                                    color: '#ff6464',
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
                                            color: '#ff6464',
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
                                width: '100%'
                            }}
                        />
                    </div>

                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
                        <h4 style={{ color: 'var(--color-primary)', marginBottom: '1rem', fontSize: '1.2rem' }}>Jugador 1</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>Nombre *</label>
                                <input
                                    placeholder="Nombre del jugador"
                                    value={formData.player1_name}
                                    onChange={e => setFormData({ ...formData, player1_name: e.target.value })}
                                    required
                                    style={{
                                        padding: '0.8rem',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid var(--glass-border)',
                                        borderRadius: '8px',
                                        color: 'var(--color-light)',
                                        fontSize: '0.9rem',
                                        width: '100%'
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>Facción *</label>
                                <select
                                    value={formData.player1_faction}
                                    onChange={e => setFormData({ ...formData, player1_faction: e.target.value })}
                                    required
                                    style={{
                                        padding: '0.8rem',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid var(--glass-border)',
                                        borderRadius: '8px',
                                        color: 'var(--color-light)',
                                        fontSize: '0.9rem',
                                        width: '100%'
                                    }}
                                >
                                    <option value="">Seleccionar facción...</option>
                                    {armies.map(army => (
                                        <option key={army.id} value={army.id}>{army.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>Puntuación Final *</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    placeholder="0-100"
                                    value={formData.player1_score}
                                    onChange={e => setFormData({ ...formData, player1_score: parseInt(e.target.value) || 0 })}
                                    required
                                    style={{
                                        padding: '0.8rem',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid var(--glass-border)',
                                        borderRadius: '8px',
                                        color: 'var(--color-light)',
                                        fontSize: '0.9rem',
                                        width: '100%'
                                    }}
                                />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <input
                                placeholder="Añadir unidad a la lista"
                                value={newPlayer1Unit}
                                onChange={e => setNewPlayer1Unit(e.target.value)}
                                onKeyPress={e => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addPlayer1Unit();
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
                                onClick={addPlayer1Unit}
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
                                +
                            </button>
                        </div>
                        {formData.player1_list.length > 0 && (
                            <ul style={{ margin: 0, paddingLeft: '1.5rem', color: 'rgba(255,255,255,0.7)' }}>
                                {formData.player1_list.map((unit, index) => (
                                    <li key={index} style={{ marginBottom: '0.3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span>{unit}</span>
                                        <button
                                            type="button"
                                            onClick={() => removePlayer1Unit(index)}
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

                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
                        <h4 style={{ color: '#ff0064', marginBottom: '1rem', fontSize: '1.2rem' }}>Jugador 2</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>Nombre *</label>
                                <input
                                    placeholder="Nombre del jugador"
                                    value={formData.player2_name}
                                    onChange={e => setFormData({ ...formData, player2_name: e.target.value })}
                                    required
                                    style={{
                                        padding: '0.8rem',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid var(--glass-border)',
                                        borderRadius: '8px',
                                        color: 'var(--color-light)',
                                        fontSize: '0.9rem',
                                        width: '100%'
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>Facción *</label>
                                <select
                                    value={formData.player2_faction}
                                    onChange={e => setFormData({ ...formData, player2_faction: e.target.value })}
                                    required
                                    style={{
                                        padding: '0.8rem',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid var(--glass-border)',
                                        borderRadius: '8px',
                                        color: 'var(--color-light)',
                                        fontSize: '0.9rem',
                                        width: '100%'
                                    }}
                                >
                                    <option value="">Seleccionar facción...</option>
                                    {armies.map(army => (
                                        <option key={army.id} value={army.id}>{army.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>Puntuación Final *</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    placeholder="0-100"
                                    value={formData.player2_score}
                                    onChange={e => setFormData({ ...formData, player2_score: parseInt(e.target.value) || 0 })}
                                    required
                                    style={{
                                        padding: '0.8rem',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid var(--glass-border)',
                                        borderRadius: '8px',
                                        color: 'var(--color-light)',
                                        fontSize: '0.9rem',
                                        width: '100%'
                                    }}
                                />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <input
                                placeholder="Añadir unidad a la lista"
                                value={newPlayer2Unit}
                                onChange={e => setNewPlayer2Unit(e.target.value)}
                                onKeyPress={e => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addPlayer2Unit();
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
                                onClick={addPlayer2Unit}
                                style={{
                                    padding: '0.8rem 1.5rem',
                                    background: '#ff0064',
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
                        {formData.player2_list.length > 0 && (
                            <ul style={{ margin: 0, paddingLeft: '1.5rem', color: 'rgba(255,255,255,0.7)' }}>
                                {formData.player2_list.map((unit, index) => (
                                    <li key={index} style={{ marginBottom: '0.3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span>{unit}</span>
                                        <button
                                            type="button"
                                            onClick={() => removePlayer2Unit(index)}
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

                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.8)' }}>MVP de la Batalla *</label>
                        <textarea
                            placeholder="Describe el MVP de la batalla..."
                            value={formData.mvp}
                            onChange={e => setFormData({ ...formData, mvp: e.target.value })}
                            required
                            style={{
                                padding: '1rem',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '8px',
                                color: 'var(--color-light)',
                                fontSize: '1rem',
                                width: '100%',
                                minHeight: '100px',
                                resize: 'vertical'
                            }}
                        />
                    </div>

                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.8)' }}>Imágenes de la Batalla (Cloudinary, opcional)</label>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                            <input
                                placeholder="URL de imagen (https://res.cloudinary.com/...)"
                                value={newImageUrl}
                                onChange={e => setNewImageUrl(e.target.value)}
                                onKeyPress={e => { if (e.key === 'Enter') { e.preventDefault(); addImage(); } }}
                                style={{ padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--color-light)', fontSize: '0.9rem', flex: 1 }}
                            />
                            <button type="button" onClick={addImage} style={{ padding: '0.8rem 1.2rem', background: 'var(--color-primary)', border: 'none', borderRadius: '8px', color: 'var(--color-light)', cursor: 'pointer', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                                + Añadir
                            </button>
                        </div>
                        {formData.images.length > 0 && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem' }}>
                                {formData.images.map((url, i) => (
                                    <div key={i} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        <img src={url} alt="" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }} />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(i)}
                                            style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.7)', border: 'none', color: '#ff6464', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        >×</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.8)' }}>Momentos Clave</label>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <input
                                placeholder="Añadir momento clave"
                                value={newKeyMoment}
                                onChange={e => setNewKeyMoment(e.target.value)}
                                onKeyPress={e => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addKeyMoment();
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
                                onClick={addKeyMoment}
                                style={{
                                    padding: '0.8rem 1.5rem',
                                    background: 'rgba(255,100,100,0.3)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: '#ff6464',
                                    cursor: 'pointer',
                                    fontWeight: 'bold'
                                }}
                            >
                                +
                            </button>
                        </div>
                        {formData.keyMoments.length > 0 && (
                            <ul style={{ margin: 0, paddingLeft: '1.5rem', color: 'rgba(255,255,255,0.7)' }}>
                                {formData.keyMoments.map((moment, index) => (
                                    <li key={index} style={{ marginBottom: '0.3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span>— {moment}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeKeyMoment(index)}
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

                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <label style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem' }}>Narrativa de Batalla</label>
                            <button
                                type="button"
                                onClick={addNarrative}
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
                                + Añadir Entrada
                            </button>
                        </div>
                        {narrative.map((entry, index) => (
                            <div key={index} style={{
                                padding: '1rem',
                                background: 'rgba(0,0,0,0.3)',
                                borderRadius: '12px',
                                marginBottom: '1rem',
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <span style={{ color: '#ff0064', fontWeight: 'bold' }}>Turno {entry.turn} - {entry.phase}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeNarrative(index)}
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
                                <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0 }}>{entry.text}</p>
                            </div>
                        ))}
                        <div style={{
                            padding: '1rem',
                            background: 'rgba(0,0,0,0.3)',
                            borderRadius: '12px',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <input
                                    type="number"
                                    placeholder="Turno"
                                    value={newNarrative.turn}
                                    onChange={e => setNewNarrative({ ...newNarrative, turn: parseInt(e.target.value) || 1 })}
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
                                    placeholder="Fase (ej: Movimiento)"
                                    value={newNarrative.phase}
                                    onChange={e => setNewNarrative({ ...newNarrative, phase: e.target.value })}
                                    style={{
                                        padding: '0.8rem',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid var(--glass-border)',
                                        borderRadius: '8px',
                                        color: 'var(--color-light)',
                                        fontSize: '0.9rem'
                                    }}
                                />
                            </div>
                            <textarea
                                placeholder="Texto narrativo..."
                                value={newNarrative.text}
                                onChange={e => setNewNarrative({ ...newNarrative, text: e.target.value })}
                                style={{
                                    padding: '0.8rem',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '8px',
                                    color: 'var(--color-light)',
                                    fontSize: '0.9rem',
                                    width: '100%',
                                    minHeight: '80px',
                                    resize: 'vertical',
                                    marginBottom: '0.5rem'
                                }}
                            />
                            <button
                                type="button"
                                onClick={addNarrative}
                                disabled={!newNarrative.phase || !newNarrative.text}
                                style={{
                                    padding: '0.8rem 1.5rem',
                                    background: newNarrative.phase && newNarrative.text ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: newNarrative.phase && newNarrative.text ? 'var(--color-light)' : 'rgba(255,255,255,0.5)',
                                    cursor: newNarrative.phase && newNarrative.text ? 'pointer' : 'not-allowed',
                                    fontWeight: 'bold'
                                }}
                            >
                                + Añadir
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button type="submit" style={{
                            background: 'linear-gradient(135deg, #ff0064, #ff6600)',
                            border: 'none',
                            padding: '1rem 2rem',
                            borderRadius: '50px',
                            color: 'var(--color-light)',
                            fontFamily: 'var(--font-display)',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            letterSpacing: '1px',
                            transition: 'transform 0.2s',
                            boxShadow: '0 4px 15px rgba(255, 0, 100, 0.3)'
                        }}
                            onMouseEnter={e => e.target.style.transform = 'translateY(-2px)'}
                            onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
                        >
                            {editingReport ? 'Actualizar' : 'Crear'} Informe
                        </button>

                        {editingReport && (
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
                                    onClick={() => handleDelete(editingReport.id)}
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
                    color: '#ff0064',
                    marginBottom: '1.5rem',
                    fontSize: '1.5rem'
                }}>
                    Informes Existentes ({reports.length})
                </h3>
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {reports.map((report, index) => (
                        <motion.div
                            key={report.id}
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
                            <div style={{ flex: 1 }}>
                                <h4 style={{ margin: '0 0 5px 0', fontSize: '1.2rem', fontFamily: 'var(--font-display)' }}>{report.title}</h4>
                                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', flexWrap: 'wrap' }}>
                                    {report.date && <span>{new Date(report.date).toLocaleDateString('es-ES')}</span>}
                                    {report.mission && <span>{report.mission}</span>}
                                    {report.points && <span>{report.points} pts</span>}
                                    <span>❤ {report.likes || 0}</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button onClick={() => handleEdit(report)} style={{
                                    background: 'transparent',
                                    color: 'var(--color-light)',
                                    border: '1px solid #ff0064',
                                    padding: '0.5rem 1.5rem',
                                    borderRadius: '30px',
                                    cursor: 'pointer',
                                    fontFamily: 'var(--font-display)',
                                    transition: 'all 0.2s'
                                }}
                                    onMouseEnter={e => {
                                        e.target.style.background = '#ff0064';
                                        e.target.style.color = 'var(--color-light)';
                                    }}
                                    onMouseLeave={e => {
                                        e.target.style.background = 'transparent';
                                        e.target.style.color = 'var(--color-light)';
                                    }}
                                >
                                    Editar
                                </button>
                                <button
                                    onClick={() => handleDelete(report.id)}
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

export default ReportManager;
