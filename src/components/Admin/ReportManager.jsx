import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../services/api';
import { useStore } from '../../stores/useStore';
import { useToast } from './Toast';
import { parseArmyList } from '../../utils/armyListParser';

// ─── Constants ───────────────────────────────────────────────────────────────

const PHASE_OPTIONS = [
    'Movimiento',
    'Psíquica',
    'Disparo',
    'Combate',
    'Mando',
    'Estratagema',
    'Otro',
];

const EMPTY_FORM = {
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
    player1ListText: '',
    player2_name: '',
    player2_faction: '',
    player2_score: 0,
    player2_list: [],
    player2ListText: '',
    keyMoments: [],
    mvp: '',
    images: [],
};

// ─── Shared style helpers ─────────────────────────────────────────────────────

const inputStyle = {
    padding: '0.75rem 1rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: 'var(--color-light)',
    fontSize: '0.95rem',
    width: '100%',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'border-color 0.2s',
};

const labelStyle = {
    display: 'block',
    marginBottom: '0.4rem',
    color: 'rgba(255,255,255,0.55)',
    fontSize: '0.78rem',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    fontFamily: 'var(--font-display)',
};

const sectionDivider = {
    borderTop: '1px solid rgba(255,255,255,0.07)',
    paddingTop: '1.5rem',
    marginTop: '0.25rem',
};

const sectionHeader = {
    fontFamily: 'var(--font-display)',
    fontSize: '0.7rem',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    color: 'rgba(255,255,255,0.35)',
    margin: '0 0 1rem 0',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
};

const sectionHeaderLine = {
    flex: 1,
    height: '1px',
    background: 'rgba(255,255,255,0.07)',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const SectionHeader = ({ children, accent }) => (
    <div style={{ ...sectionHeader, color: accent || 'rgba(255,255,255,0.35)' }}>
        <span>{children}</span>
        <div style={sectionHeaderLine} />
    </div>
);

const FieldLabel = ({ children }) => (
    <label style={labelStyle}>{children}</label>
);

const Input = ({ style, ...props }) => (
    <input style={{ ...inputStyle, ...style }} {...props} />
);

const Textarea = ({ style, ...props }) => (
    <textarea style={{ ...inputStyle, minHeight: '90px', resize: 'vertical', ...style }} {...props} />
);

const Select = ({ style, children, ...props }) => (
    <select style={{ ...inputStyle, cursor: 'pointer', ...style }} {...props}>
        {children}
    </select>
);

// Chip badge used for tags and key moments
const Chip = ({ label, onRemove, color = 'rgba(255,0,100,0.15)', textColor = 'var(--color-secondary)' }) => (
    <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
        padding: '0.3rem 0.7rem',
        background: color,
        borderRadius: '20px',
        fontSize: '0.82rem',
        color: textColor,
        border: `1px solid ${textColor}33`,
        flexShrink: 0,
    }}>
        {label}
        <button
            type="button"
            onClick={onRemove}
            style={{
                background: 'none',
                border: 'none',
                color: textColor,
                cursor: 'pointer',
                padding: '0',
                lineHeight: 1,
                fontSize: '1rem',
                opacity: 0.7,
                minWidth: '18px',
                minHeight: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >×</button>
    </span>
);

// Inline chip input (enter to add)
const ChipInput = ({ placeholder, onAdd, color, textColor }) => {
    const [val, setVal] = useState('');
    return (
        <input
            placeholder={placeholder}
            value={val}
            onChange={e => setVal(e.target.value)}
            onKeyDown={e => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    if (val.trim()) { onAdd(val.trim()); setVal(''); }
                }
            }}
            style={{
                ...inputStyle,
                fontSize: '0.85rem',
                padding: '0.55rem 0.9rem',
            }}
        />
    );
};

// Score stepper
const ScoreStepper = ({ value, onChange, accentColor }) => {
    const isWinning = value !== null && value !== undefined;
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center' }}>
            <button
                type="button"
                onClick={() => onChange(Math.max(0, value - 1))}
                style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    border: `2px solid ${accentColor}55`,
                    background: `${accentColor}15`,
                    color: accentColor,
                    fontSize: '1.4rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    lineHeight: 1,
                    flexShrink: 0,
                    transition: 'background 0.15s',
                }}
            >−</button>
            <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: '2.5rem',
                fontWeight: 700,
                color: accentColor,
                minWidth: '3ch',
                textAlign: 'center',
                lineHeight: 1,
            }}>
                {value}
            </span>
            <button
                type="button"
                onClick={() => onChange(value + 1)}
                style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    border: `2px solid ${accentColor}55`,
                    background: `${accentColor}15`,
                    color: accentColor,
                    fontSize: '1.4rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    lineHeight: 1,
                    flexShrink: 0,
                    transition: 'background 0.15s',
                }}
            >+</button>
        </div>
    );
};

// Army list import (inline collapsible)
const ArmyListImport = ({ text, parsed, onChange, onParse, onApply, onClose, hasImported }) => {
    const [open, setOpen] = useState(false);

    return (
        <div style={{ marginTop: '0.75rem' }}>
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.4rem 0.85rem',
                    background: open ? 'rgba(0,212,255,0.12)' : 'rgba(0,212,255,0.06)',
                    border: '1px solid rgba(0,212,255,0.25)',
                    borderRadius: '6px',
                    color: 'var(--color-primary)',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontFamily: 'var(--font-display)',
                    letterSpacing: '0.04em',
                    transition: 'background 0.15s',
                    minHeight: '36px',
                }}
            >
                <span style={{ fontSize: '0.9em' }}>📋</span>
                Importar lista
                {hasImported && !open && (
                    <span style={{
                        background: 'rgba(74,222,128,0.2)',
                        color: '#4ade80',
                        borderRadius: '4px',
                        padding: '0.1rem 0.4rem',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                    }}>✓</span>
                )}
                <span style={{ fontSize: '0.7rem', opacity: 0.6, marginLeft: '2px' }}>{open ? '▲' : '▼'}</span>
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ overflow: 'hidden' }}
                    >
                        <div style={{
                            marginTop: '0.6rem',
                            background: 'rgba(0,212,255,0.04)',
                            border: '1px solid rgba(0,212,255,0.18)',
                            borderRadius: '10px',
                            padding: '1rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.75rem',
                        }}>
                            <textarea
                                placeholder={
                                    'Pega aquí la lista exportada desde la app oficial o BattleScribe...\n\nEjemplo:\nThousand Sons\nGrand Coven\nStrike Force (2.000 Points)\nCHARACTERS\nInfernal Master (130 Points)\n • 1x Fires of the Abyss\n ...'
                                }
                                value={text}
                                onChange={e => onChange(e.target.value)}
                                rows={9}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    background: 'rgba(0,0,0,0.3)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    fontSize: '0.8rem',
                                    fontFamily: 'monospace',
                                    resize: 'vertical',
                                    boxSizing: 'border-box',
                                    outline: 'none',
                                }}
                            />
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <button
                                    type="button"
                                    onClick={onParse}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        background: 'var(--color-primary)',
                                        border: 'none',
                                        borderRadius: '6px',
                                        color: '#000',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        fontSize: '0.85rem',
                                        minHeight: '36px',
                                    }}
                                >
                                    Parsear lista
                                </button>
                                {parsed && (
                                    <button
                                        type="button"
                                        onClick={() => { onApply(); setOpen(false); }}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            background: '#4ade80',
                                            border: 'none',
                                            borderRadius: '6px',
                                            color: '#000',
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            fontSize: '0.85rem',
                                            minHeight: '36px',
                                        }}
                                    >
                                        ✓ Aplicar
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setOpen(false)}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        background: 'rgba(255,255,255,0.06)',
                                        border: '1px solid rgba(255,255,255,0.12)',
                                        borderRadius: '6px',
                                        color: 'rgba(255,255,255,0.5)',
                                        cursor: 'pointer',
                                        fontSize: '0.85rem',
                                        minHeight: '36px',
                                    }}
                                >
                                    Cancelar
                                </button>
                            </div>
                            {parsed && (
                                <div style={{
                                    background: 'rgba(0,0,0,0.2)',
                                    borderRadius: '8px',
                                    padding: '0.75rem',
                                    fontSize: '0.8rem',
                                    maxHeight: '200px',
                                    overflowY: 'auto',
                                }}>
                                    <p style={{ color: 'var(--color-primary)', fontWeight: 700, margin: '0 0 0.5rem' }}>
                                        {parsed.armyName} — {parsed.detachment} — {parsed.listSize} ({parsed.points}pts)
                                    </p>
                                    {parsed.categories.map((cat, i) => (
                                        <div key={i} style={{ marginBottom: '0.5rem' }}>
                                            <p style={{
                                                color: 'rgba(255,255,255,0.4)',
                                                fontSize: '0.72rem',
                                                textTransform: 'uppercase',
                                                letterSpacing: '1px',
                                                margin: '0 0 0.25rem',
                                            }}>
                                                {cat.name}
                                            </p>
                                            {cat.units.map((u, j) => (
                                                <p key={j} style={{ color: 'rgba(255,255,255,0.75)', margin: '0 0 0.1rem', paddingLeft: '0.5rem' }}>
                                                    • {u.name} <span style={{ color: 'rgba(255,255,255,0.35)' }}>({u.points}pts)</span>
                                                </p>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Compact report card for the left panel
const ReportCard = ({ report, isActive, onEdit, onDelete }) => {
    const p1score = report.finalScore?.player1 ?? 0;
    const p2score = report.finalScore?.player2 ?? 0;
    const winner = p1score > p2score ? report.armies?.player1?.name : p2score > p1score ? report.armies?.player2?.name : null;

    return (
        <motion.div
            initial={{ x: -16, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            whileHover={{ x: 3 }}
            onClick={() => onEdit(report)}
            style={{
                padding: '0.9rem 1rem',
                background: isActive ? 'rgba(255,0,100,0.1)' : 'rgba(255,255,255,0.025)',
                border: isActive ? '1px solid rgba(255,0,100,0.4)' : '1px solid rgba(255,255,255,0.07)',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'background 0.15s, border-color 0.15s',
                position: 'relative',
            }}
        >
            {isActive && (
                <div style={{
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '3px',
                    height: '60%',
                    background: 'var(--color-secondary)',
                    borderRadius: '0 3px 3px 0',
                }} />
            )}
            <div style={{ paddingLeft: isActive ? '4px' : '0' }}>
                <p style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.9rem',
                    margin: '0 0 0.3rem',
                    color: isActive ? 'var(--color-light)' : 'rgba(255,255,255,0.85)',
                    lineHeight: 1.3,
                }}>
                    {report.title}
                </p>
                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    {report.date && (
                        <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)' }}>
                            {new Date(report.date).toLocaleDateString('es-ES')}
                        </span>
                    )}
                    {report.points && (
                        <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)' }}>
                            {report.points}pts
                        </span>
                    )}
                    {winner && (
                        <span style={{
                            fontSize: '0.68rem',
                            background: 'rgba(74,222,128,0.15)',
                            color: '#4ade80',
                            borderRadius: '4px',
                            padding: '0.1rem 0.4rem',
                        }}>
                            ★ {winner}
                        </span>
                    )}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', justifyContent: 'flex-end' }}>
                    <button
                        type="button"
                        onClick={e => { e.stopPropagation(); onEdit(report); }}
                        style={{
                            padding: '0.3rem 0.7rem',
                            background: 'rgba(0,212,255,0.1)',
                            border: '1px solid rgba(0,212,255,0.2)',
                            borderRadius: '6px',
                            color: 'var(--color-primary)',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            minHeight: '30px',
                        }}
                    >
                        Editar
                    </button>
                    <button
                        type="button"
                        onClick={e => { e.stopPropagation(); onDelete(report.id); }}
                        style={{
                            padding: '0.3rem 0.7rem',
                            background: 'rgba(255,50,50,0.08)',
                            border: '1px solid rgba(255,50,50,0.2)',
                            borderRadius: '6px',
                            color: '#f87171',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            minHeight: '30px',
                        }}
                    >
                        ×
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

// ─── Player panel ─────────────────────────────────────────────────────────────

const PlayerPanel = ({
    player, // 1 or 2
    accentColor,
    name, onNameChange,
    faction, onFactionChange,
    score, onScoreChange,
    playerList,
    listText,
    isWinner,
    importState,
    onImportChange,
    onImportParse,
    onImportApply,
    newUnit, onNewUnitChange,
    onAddUnit, onRemoveUnit,
}) => {
    const winnerBadge = isWinner && (
        <span style={{
            display: 'inline-block',
            background: 'rgba(74,222,128,0.2)',
            color: '#4ade80',
            borderRadius: '20px',
            padding: '0.2rem 0.75rem',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.05em',
            border: '1px solid rgba(74,222,128,0.3)',
        }}>
            ★ GANADOR
        </span>
    );

    return (
        <div style={{
            background: 'rgba(255,255,255,0.025)',
            border: `1px solid ${accentColor}33`,
            borderRadius: '12px',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
        }}>
            {/* Player header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.7rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    color: accentColor,
                }}>
                    Jugador {player}
                </span>
                {winnerBadge}
            </div>

            {/* Name */}
            <div>
                <FieldLabel>Nombre *</FieldLabel>
                <Input
                    placeholder="Nombre del jugador"
                    value={name}
                    onChange={e => onNameChange(e.target.value)}
                    required
                />
            </div>

            {/* Faction (free text) */}
            <div>
                <FieldLabel>Facción</FieldLabel>
                <Input
                    placeholder="Ej: Space Marines, Orks..."
                    value={faction}
                    onChange={e => onFactionChange(e.target.value)}
                />
            </div>

            {/* Score stepper */}
            <div>
                <FieldLabel>Puntuación</FieldLabel>
                <ScoreStepper
                    value={score}
                    onChange={onScoreChange}
                    accentColor={accentColor}
                />
            </div>

            {/* Army list */}
            <div>
                <FieldLabel>Lista de ejército</FieldLabel>
                {/* Manual unit input */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input
                        placeholder="Añadir unidad manualmente"
                        value={newUnit}
                        onChange={e => onNewUnitChange(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter') { e.preventDefault(); onAddUnit(); }
                        }}
                        style={{ ...inputStyle, fontSize: '0.85rem', padding: '0.55rem 0.9rem', flex: 1 }}
                    />
                    <button
                        type="button"
                        onClick={onAddUnit}
                        style={{
                            padding: '0.55rem 1rem',
                            background: `${accentColor}22`,
                            border: `1px solid ${accentColor}44`,
                            borderRadius: '8px',
                            color: accentColor,
                            cursor: 'pointer',
                            fontWeight: 700,
                            fontSize: '1rem',
                            minWidth: '44px',
                            minHeight: '44px',
                        }}
                    >+</button>
                </div>

                {/* Unit list */}
                {playerList.length > 0 && (
                    <div style={{
                        background: 'rgba(0,0,0,0.2)',
                        borderRadius: '8px',
                        padding: '0.5rem 0.75rem',
                        maxHeight: '140px',
                        overflowY: 'auto',
                        marginBottom: '0.5rem',
                    }}>
                        {playerList.map((unit, i) => (
                            <div key={i} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '0.2rem 0',
                                borderBottom: i < playerList.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                            }}>
                                <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)' }}>{unit}</span>
                                <button
                                    type="button"
                                    onClick={() => onRemoveUnit(i)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#f87171',
                                        cursor: 'pointer',
                                        padding: '0 0.25rem',
                                        fontSize: '0.95rem',
                                        minWidth: '24px',
                                        minHeight: '24px',
                                    }}
                                >×</button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Import section (collapsible) */}
                <ArmyListImport
                    text={importState.text}
                    parsed={importState.parsed}
                    onChange={t => onImportChange(t)}
                    onParse={onImportParse}
                    onApply={onImportApply}
                    hasImported={!!listText}
                />
            </div>
        </div>
    );
};

// ─── Main component ───────────────────────────────────────────────────────────

const ReportManager = () => {
    const [reports, setReports] = useState([]);
    const [armies, setArmies] = useState([]);
    const [editingReport, setEditingReport] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const token = useStore(state => state.token);
    const toast = useToast();
    const formPanelRef = useRef(null);

    const [formData, setFormData] = useState({ ...EMPTY_FORM });
    const [narrative, setNarrative] = useState([]);
    const [newNarrative, setNewNarrative] = useState({ turn: 1, phase: '', text: '' });
    const [newKeyMoment, setNewKeyMoment] = useState('');
    const [newImageUrl, setNewImageUrl] = useState('');
    const [newTagInput, setNewTagInput] = useState('');
    const [newPlayer1Unit, setNewPlayer1Unit] = useState('');
    const [newPlayer2Unit, setNewPlayer2Unit] = useState('');

    // Per-player import state
    const [import1, setImport1] = useState({ text: '', parsed: null });
    const [import2, setImport2] = useState({ text: '', parsed: null });

    useEffect(() => {
        loadReports();
        loadArmies();
    }, []);

    // Scroll form into view on mobile when it opens
    useEffect(() => {
        if (showForm && formPanelRef.current) {
            const isMobile = window.innerWidth < 768;
            if (isMobile) {
                formPanelRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }, [showForm]);

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
                player1ListText: formData.player1ListText,
                player2_name: formData.player2_name,
                player2_faction: formData.player2_faction,
                player2_score: formData.player2_score,
                player2_list: formData.player2_list,
                player2ListText: formData.player2ListText,
                narrative: narrative.map((n, idx) => ({
                    turn: n.turn,
                    phase: n.phase,
                    text: n.text,
                    order: idx,
                })),
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
            player1ListText: report.armies?.player1?.listText || '',
            player2_name: report.armies?.player2?.name || '',
            player2_faction: report.armies?.player2?.faction || '',
            player2_score: report.finalScore?.player2 || 0,
            player2_list: report.armies?.player2?.list || [],
            player2ListText: report.armies?.player2?.listText || '',
            keyMoments: report.keyMoments || [],
            mvp: report.mvp || '',
            images: report.images || [],
        });
        setNarrative(report.narrative || []);
        setImport1({ text: '', parsed: null });
        setImport2({ text: '', parsed: null });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Eliminar este informe?')) return;
        try {
            await api.deleteBattleReport(id, token);
            toast('Informe eliminado correctamente', 'success');
            loadReports();
            if (editingReport?.id === id) handleCancel();
        } catch (error) {
            console.error('Error deleting report', error);
            toast('Error al eliminar: ' + error.message, 'error');
        }
    };

    const handleCancel = () => {
        setEditingReport(null);
        setShowForm(false);
        setFormData({ ...EMPTY_FORM });
        setNarrative([]);
        setNewNarrative({ turn: 1, phase: '', text: '' });
        setNewKeyMoment('');
        setNewPlayer1Unit('');
        setNewPlayer2Unit('');
        setNewImageUrl('');
        setNewTagInput('');
        setImport1({ text: '', parsed: null });
        setImport2({ text: '', parsed: null });
    };

    // Tags
    const addTag = (tag) => {
        if (tag && !formData.tags.includes(tag)) {
            setFormData(f => ({ ...f, tags: [...f.tags, tag] }));
        }
    };
    const removeTag = (t) => setFormData(f => ({ ...f, tags: f.tags.filter(x => x !== t) }));

    // Factions (select from armies list)
    const addFaction = (id) => {
        if (id && !formData.factions.includes(id)) {
            setFormData(f => ({ ...f, factions: [...f.factions, id] }));
        }
    };
    const removeFaction = (id) => setFormData(f => ({ ...f, factions: f.factions.filter(x => x !== id) }));

    // Player lists
    const addPlayer1Unit = () => {
        if (newPlayer1Unit.trim()) {
            setFormData(f => ({ ...f, player1_list: [...f.player1_list, newPlayer1Unit.trim()] }));
            setNewPlayer1Unit('');
        }
    };
    const removePlayer1Unit = (i) => setFormData(f => ({ ...f, player1_list: f.player1_list.filter((_, idx) => idx !== i) }));

    const addPlayer2Unit = () => {
        if (newPlayer2Unit.trim()) {
            setFormData(f => ({ ...f, player2_list: [...f.player2_list, newPlayer2Unit.trim()] }));
            setNewPlayer2Unit('');
        }
    };
    const removePlayer2Unit = (i) => setFormData(f => ({ ...f, player2_list: f.player2_list.filter((_, idx) => idx !== i) }));

    // Key moments
    const addKeyMoment = () => {
        if (newKeyMoment.trim()) {
            setFormData(f => ({ ...f, keyMoments: [...f.keyMoments, newKeyMoment.trim()] }));
            setNewKeyMoment('');
        }
    };
    const removeKeyMoment = (i) => setFormData(f => ({ ...f, keyMoments: f.keyMoments.filter((_, idx) => idx !== i) }));

    // Images
    const addImage = () => {
        if (newImageUrl.trim()) {
            setFormData(f => ({ ...f, images: [...f.images, newImageUrl.trim()] }));
            setNewImageUrl('');
        }
    };
    const removeImage = (i) => setFormData(f => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }));

    // Narrative
    const addNarrative = () => {
        if (newNarrative.phase && newNarrative.text) {
            setNarrative(n => [...n, { ...newNarrative }]);
            setNewNarrative(n => ({ turn: n.turn + 1, phase: '', text: '' }));
        }
    };
    const removeNarrative = (i) => setNarrative(n => n.filter((_, idx) => idx !== i));

    // Army list import – player 1
    const handleParseImport1 = () => {
        const parsed = parseArmyList(import1.text);
        setImport1(s => ({ ...s, parsed }));
    };
    const handleApplyImport1 = () => {
        const { parsed } = import1;
        if (!parsed) return;
        const unitNames = parsed.categories.flatMap(c => c.units.map(u => `${u.name} (${u.points}pts)`));
        setFormData(f => ({
            ...f,
            player1ListText: JSON.stringify(parsed),
            player1_list: unitNames,
            player1_faction: f.player1_faction || parsed.armyName,
        }));
        setImport1({ text: '', parsed: null });
    };

    // Army list import – player 2
    const handleParseImport2 = () => {
        const parsed = parseArmyList(import2.text);
        setImport2(s => ({ ...s, parsed }));
    };
    const handleApplyImport2 = () => {
        const { parsed } = import2;
        if (!parsed) return;
        const unitNames = parsed.categories.flatMap(c => c.units.map(u => `${u.name} (${u.points}pts)`));
        setFormData(f => ({
            ...f,
            player2ListText: JSON.stringify(parsed),
            player2_list: unitNames,
            player2_faction: f.player2_faction || parsed.armyName,
        }));
        setImport2({ text: '', parsed: null });
    };

    // Winner calculation
    const p1IsWinner = formData.player1_score > formData.player2_score;
    const p2IsWinner = formData.player2_score > formData.player1_score;

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <>
            {/* Scoped responsive CSS */}
            <style>{`
                .rm-layout {
                    display: grid;
                    grid-template-columns: 300px 1fr;
                    gap: 1.5rem;
                    align-items: start;
                }
                .rm-left-panel {
                    position: sticky;
                    top: 1rem;
                    max-height: calc(100vh - 6rem);
                    overflow-y: auto;
                }
                .rm-form-scroll {
                    max-height: calc(100vh - 6rem);
                    overflow-y: auto;
                    padding-right: 4px;
                }
                .rm-players-grid {
                    display: grid;
                    grid-template-columns: 1fr auto 1fr;
                    gap: 1rem;
                    align-items: start;
                }
                .rm-vs-divider {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding-top: 3rem;
                    gap: 0.5rem;
                }
                .rm-header-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }
                .rm-meta-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr;
                    gap: 1rem;
                }
                @media (max-width: 900px) {
                    .rm-layout {
                        grid-template-columns: 1fr;
                    }
                    .rm-left-panel {
                        position: static;
                        max-height: none;
                    }
                    .rm-form-scroll {
                        max-height: none;
                    }
                    .rm-players-grid {
                        grid-template-columns: 1fr;
                    }
                    .rm-vs-divider {
                        flex-direction: row;
                        padding-top: 0;
                        padding: 0.5rem 0;
                    }
                    .rm-vs-divider-line {
                        flex: 1;
                        height: 1px !important;
                        width: auto !important;
                    }
                    .rm-meta-grid {
                        grid-template-columns: 1fr 1fr;
                    }
                    .rm-header-grid {
                        grid-template-columns: 1fr;
                    }
                }
                @media (max-width: 540px) {
                    .rm-meta-grid {
                        grid-template-columns: 1fr;
                    }
                }
                .rm-input-focus:focus {
                    border-color: rgba(0,212,255,0.4) !important;
                    box-shadow: 0 0 0 2px rgba(0,212,255,0.08);
                }
            `}</style>

            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                {/* Page title */}
                <motion.div
                    initial={{ y: -16, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}
                >
                    <h2 style={{
                        fontFamily: 'var(--font-display)',
                        color: 'var(--color-secondary)',
                        margin: 0,
                        fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
                    }}>
                        Informes de Batalla
                    </h2>
                    {!showForm && (
                        <button
                            type="button"
                            onClick={() => setShowForm(true)}
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: 'linear-gradient(135deg, var(--color-secondary), #ff6600)',
                                border: 'none',
                                borderRadius: '50px',
                                color: '#fff',
                                fontFamily: 'var(--font-display)',
                                fontSize: '0.9rem',
                                letterSpacing: '0.05em',
                                cursor: 'pointer',
                                boxShadow: '0 4px 15px rgba(255,0,100,0.25)',
                                minHeight: '44px',
                            }}
                        >
                            + Nuevo Informe
                        </button>
                    )}
                </motion.div>

                <div className="rm-layout">
                    {/* ── Left panel: reports list ── */}
                    <motion.div
                        className="rm-left-panel"
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.05 }}
                    >
                        <div style={{
                            background: 'rgba(255,255,255,0.025)',
                            border: '1px solid rgba(255,255,255,0.07)',
                            borderRadius: '14px',
                            overflow: 'hidden',
                        }}>
                            <div style={{
                                padding: '1rem 1.1rem 0.75rem',
                                borderBottom: '1px solid rgba(255,255,255,0.06)',
                            }}>
                                <p style={{
                                    margin: 0,
                                    fontFamily: 'var(--font-display)',
                                    fontSize: '0.7rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.12em',
                                    color: 'rgba(255,255,255,0.35)',
                                }}>
                                    Informes ({reports.length})
                                </p>
                            </div>
                            <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {reports.length === 0 && (
                                    <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: '0.85rem', padding: '1rem 0' }}>
                                        Sin informes aún
                                    </p>
                                )}
                                {reports.map((report, idx) => (
                                    <ReportCard
                                        key={report.id}
                                        report={report}
                                        isActive={editingReport?.id === report.id}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* ── Right panel: form ── */}
                    <AnimatePresence mode="wait">
                        {showForm ? (
                            <motion.div
                                key="form"
                                ref={formPanelRef}
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: 20, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div style={{
                                    background: 'rgba(255,255,255,0.025)',
                                    border: '1px solid rgba(255,255,255,0.07)',
                                    borderRadius: '14px',
                                    overflow: 'hidden',
                                }}>
                                    {/* Form header */}
                                    <div style={{
                                        padding: '1rem 1.5rem',
                                        borderBottom: '1px solid rgba(255,255,255,0.06)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                    }}>
                                        <p style={{
                                            margin: 0,
                                            fontFamily: 'var(--font-display)',
                                            fontSize: '1rem',
                                            color: editingReport ? 'var(--color-primary)' : 'var(--color-secondary)',
                                        }}>
                                            {editingReport ? `Editando: ${editingReport.title}` : 'Nuevo Informe'}
                                        </p>
                                        <button
                                            type="button"
                                            onClick={handleCancel}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: 'rgba(255,255,255,0.4)',
                                                cursor: 'pointer',
                                                fontSize: '1.4rem',
                                                lineHeight: 1,
                                                padding: '0.25rem',
                                                minWidth: '32px',
                                                minHeight: '32px',
                                            }}
                                            title="Cancelar"
                                        >×</button>
                                    </div>

                                    {/* Scrollable form body */}
                                    <div className="rm-form-scroll" style={{ padding: '1.5rem' }}>
                                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

                                            {/* ── Section: Cabecera ── */}
                                            <section>
                                                <SectionHeader accent="var(--color-primary)">Cabecera</SectionHeader>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                    {/* ID + Title */}
                                                    <div className="rm-header-grid">
                                                        <div>
                                                            <FieldLabel>ID *</FieldLabel>
                                                            <Input
                                                                className="rm-input-focus"
                                                                placeholder="battle-report-macragge-2024"
                                                                value={formData.id}
                                                                onChange={e => setFormData(f => ({ ...f, id: e.target.value }))}
                                                                disabled={!!editingReport}
                                                                required
                                                                style={editingReport ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                                                            />
                                                        </div>
                                                        <div>
                                                            <FieldLabel>Título *</FieldLabel>
                                                            <Input
                                                                className="rm-input-focus"
                                                                placeholder="Batalla épica en Macragge"
                                                                value={formData.title}
                                                                onChange={e => setFormData(f => ({ ...f, title: e.target.value }))}
                                                                required
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Misión / Puntos / Fecha */}
                                                    <div className="rm-meta-grid">
                                                        <div>
                                                            <FieldLabel>Misión *</FieldLabel>
                                                            <Input
                                                                className="rm-input-focus"
                                                                placeholder="Ej: Sweeping Engagement"
                                                                value={formData.mission}
                                                                onChange={e => setFormData(f => ({ ...f, mission: e.target.value }))}
                                                                required
                                                            />
                                                        </div>
                                                        <div>
                                                            <FieldLabel>Puntos *</FieldLabel>
                                                            <Input
                                                                className="rm-input-focus"
                                                                type="number"
                                                                min="0"
                                                                step="500"
                                                                value={formData.points}
                                                                onChange={e => setFormData(f => ({ ...f, points: parseInt(e.target.value) || 0 }))}
                                                                required
                                                            />
                                                        </div>
                                                        <div>
                                                            <FieldLabel>Fecha *</FieldLabel>
                                                            <Input
                                                                className="rm-input-focus"
                                                                type="date"
                                                                value={formData.date}
                                                                onChange={e => setFormData(f => ({ ...f, date: e.target.value }))}
                                                                required
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Tags */}
                                                    <div>
                                                        <FieldLabel>Tags</FieldLabel>
                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.5rem' }}>
                                                            {formData.tags.map(tag => (
                                                                <Chip
                                                                    key={tag}
                                                                    label={`#${tag}`}
                                                                    onRemove={() => removeTag(tag)}
                                                                    color="rgba(0,212,255,0.1)"
                                                                    textColor="var(--color-primary)"
                                                                />
                                                            ))}
                                                        </div>
                                                        <input
                                                            placeholder="Escribe un tag y pulsa Enter"
                                                            value={newTagInput}
                                                            onChange={e => setNewTagInput(e.target.value)}
                                                            onKeyDown={e => {
                                                                if (e.key === 'Enter') {
                                                                    e.preventDefault();
                                                                    if (newTagInput.trim()) {
                                                                        addTag(newTagInput.trim());
                                                                        setNewTagInput('');
                                                                    }
                                                                }
                                                            }}
                                                            style={{ ...inputStyle, fontSize: '0.85rem', padding: '0.6rem 0.9rem' }}
                                                        />
                                                    </div>

                                                    {/* Factions */}
                                                    <div>
                                                        <FieldLabel>Facciones vinculadas</FieldLabel>
                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.5rem' }}>
                                                            {formData.factions.map(factionId => {
                                                                const army = armies.find(a => a.id === factionId);
                                                                return army ? (
                                                                    <Chip
                                                                        key={factionId}
                                                                        label={army.name}
                                                                        onRemove={() => removeFaction(factionId)}
                                                                        color="rgba(255,0,100,0.1)"
                                                                        textColor="var(--color-secondary)"
                                                                    />
                                                                ) : null;
                                                            })}
                                                        </div>
                                                        <Select
                                                            onChange={e => {
                                                                if (e.target.value) { addFaction(e.target.value); e.target.value = ''; }
                                                            }}
                                                        >
                                                            <option value="">Seleccionar facción...</option>
                                                            {armies.map(army => (
                                                                <option key={army.id} value={army.id}>{army.name}</option>
                                                            ))}
                                                        </Select>
                                                    </div>
                                                </div>
                                            </section>

                                            {/* ── Section: Jugadores ── */}
                                            <section style={sectionDivider}>
                                                <SectionHeader accent="rgba(255,255,255,0.5)">Jugadores</SectionHeader>

                                                <div className="rm-players-grid">
                                                    {/* Player 1 */}
                                                    <PlayerPanel
                                                        player={1}
                                                        accentColor="var(--color-primary)"
                                                        name={formData.player1_name}
                                                        onNameChange={v => setFormData(f => ({ ...f, player1_name: v }))}
                                                        faction={formData.player1_faction}
                                                        onFactionChange={v => setFormData(f => ({ ...f, player1_faction: v }))}
                                                        score={formData.player1_score}
                                                        onScoreChange={v => setFormData(f => ({ ...f, player1_score: v }))}
                                                        playerList={formData.player1_list}
                                                        listText={formData.player1ListText}
                                                        isWinner={p1IsWinner}
                                                        importState={import1}
                                                        onImportChange={t => setImport1(s => ({ ...s, text: t, parsed: null }))}
                                                        onImportParse={handleParseImport1}
                                                        onImportApply={handleApplyImport1}
                                                        newUnit={newPlayer1Unit}
                                                        onNewUnitChange={setNewPlayer1Unit}
                                                        onAddUnit={addPlayer1Unit}
                                                        onRemoveUnit={removePlayer1Unit}
                                                    />

                                                    {/* VS divider */}
                                                    <div className="rm-vs-divider">
                                                        <div
                                                            className="rm-vs-divider-line"
                                                            style={{
                                                                width: '1px',
                                                                height: '40px',
                                                                background: 'rgba(255,255,255,0.08)',
                                                            }}
                                                        />
                                                        <span style={{
                                                            fontFamily: 'var(--font-display)',
                                                            fontSize: '0.75rem',
                                                            letterSpacing: '0.1em',
                                                            color: 'rgba(255,255,255,0.2)',
                                                            padding: '0.25rem 0',
                                                        }}>VS</span>
                                                        <div
                                                            className="rm-vs-divider-line"
                                                            style={{
                                                                width: '1px',
                                                                height: '40px',
                                                                background: 'rgba(255,255,255,0.08)',
                                                            }}
                                                        />
                                                    </div>

                                                    {/* Player 2 */}
                                                    <PlayerPanel
                                                        player={2}
                                                        accentColor="var(--color-secondary)"
                                                        name={formData.player2_name}
                                                        onNameChange={v => setFormData(f => ({ ...f, player2_name: v }))}
                                                        faction={formData.player2_faction}
                                                        onFactionChange={v => setFormData(f => ({ ...f, player2_faction: v }))}
                                                        score={formData.player2_score}
                                                        onScoreChange={v => setFormData(f => ({ ...f, player2_score: v }))}
                                                        playerList={formData.player2_list}
                                                        listText={formData.player2ListText}
                                                        isWinner={p2IsWinner}
                                                        importState={import2}
                                                        onImportChange={t => setImport2(s => ({ ...s, text: t, parsed: null }))}
                                                        onImportParse={handleParseImport2}
                                                        onImportApply={handleApplyImport2}
                                                        newUnit={newPlayer2Unit}
                                                        onNewUnitChange={setNewPlayer2Unit}
                                                        onAddUnit={addPlayer2Unit}
                                                        onRemoveUnit={removePlayer2Unit}
                                                    />
                                                </div>
                                            </section>

                                            {/* ── Section: Narrativa ── */}
                                            <section style={sectionDivider}>
                                                <SectionHeader accent="rgba(255,200,50,0.7)">Narrativa de Batalla</SectionHeader>

                                                {/* Existing entries */}
                                                {narrative.length > 0 && (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                                                        {narrative.map((entry, idx) => (
                                                            <motion.div
                                                                key={idx}
                                                                initial={{ opacity: 0, y: 8 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                style={{
                                                                    display: 'flex',
                                                                    alignItems: 'flex-start',
                                                                    gap: '0.75rem',
                                                                    padding: '0.75rem',
                                                                    background: 'rgba(0,0,0,0.2)',
                                                                    borderRadius: '8px',
                                                                    border: '1px solid rgba(255,255,255,0.06)',
                                                                }}
                                                            >
                                                                <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                                                    <span style={{
                                                                        fontFamily: 'var(--font-display)',
                                                                        fontSize: '0.7rem',
                                                                        color: 'rgba(255,200,50,0.8)',
                                                                        background: 'rgba(255,200,50,0.1)',
                                                                        borderRadius: '4px',
                                                                        padding: '0.15rem 0.4rem',
                                                                        whiteSpace: 'nowrap',
                                                                    }}>T{entry.turn}</span>
                                                                    <span style={{
                                                                        fontFamily: 'var(--font-display)',
                                                                        fontSize: '0.65rem',
                                                                        color: 'rgba(255,255,255,0.35)',
                                                                        textAlign: 'center',
                                                                    }}>{entry.phase}</span>
                                                                </div>
                                                                <p style={{ flex: 1, margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>
                                                                    {entry.text}
                                                                </p>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeNarrative(idx)}
                                                                    style={{
                                                                        flexShrink: 0,
                                                                        background: 'none',
                                                                        border: 'none',
                                                                        color: '#f87171',
                                                                        cursor: 'pointer',
                                                                        fontSize: '1rem',
                                                                        padding: '0',
                                                                        minWidth: '28px',
                                                                        minHeight: '28px',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        opacity: 0.6,
                                                                    }}
                                                                >×</button>
                                                            </motion.div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* New entry form */}
                                                <div style={{
                                                    background: 'rgba(255,200,50,0.03)',
                                                    border: '1px solid rgba(255,200,50,0.12)',
                                                    borderRadius: '10px',
                                                    padding: '1rem',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '0.75rem',
                                                }}>
                                                    <p style={{ margin: 0, fontSize: '0.72rem', color: 'rgba(255,200,50,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-display)' }}>
                                                        Nueva entrada
                                                    </p>
                                                    <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '0.75rem' }}>
                                                        <div>
                                                            <FieldLabel>Turno</FieldLabel>
                                                            <Input
                                                                type="number"
                                                                min="1"
                                                                max="5"
                                                                value={newNarrative.turn}
                                                                onChange={e => setNewNarrative(n => ({ ...n, turn: parseInt(e.target.value) || 1 }))}
                                                                style={{ textAlign: 'center', padding: '0.65rem 0.5rem' }}
                                                            />
                                                        </div>
                                                        <div>
                                                            <FieldLabel>Fase</FieldLabel>
                                                            <Select
                                                                value={newNarrative.phase}
                                                                onChange={e => setNewNarrative(n => ({ ...n, phase: e.target.value }))}
                                                            >
                                                                <option value="">Seleccionar fase...</option>
                                                                {PHASE_OPTIONS.map(p => (
                                                                    <option key={p} value={p}>{p}</option>
                                                                ))}
                                                            </Select>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <FieldLabel>Descripción</FieldLabel>
                                                        <Textarea
                                                            placeholder="Describe lo ocurrido en esta fase..."
                                                            value={newNarrative.text}
                                                            onChange={e => setNewNarrative(n => ({ ...n, text: e.target.value }))}
                                                            style={{ minHeight: '75px' }}
                                                        />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={addNarrative}
                                                        disabled={!newNarrative.phase || !newNarrative.text}
                                                        style={{
                                                            alignSelf: 'flex-start',
                                                            padding: '0.6rem 1.2rem',
                                                            background: newNarrative.phase && newNarrative.text
                                                                ? 'rgba(255,200,50,0.15)'
                                                                : 'rgba(255,255,255,0.04)',
                                                            border: `1px solid ${newNarrative.phase && newNarrative.text ? 'rgba(255,200,50,0.3)' : 'rgba(255,255,255,0.08)'}`,
                                                            borderRadius: '8px',
                                                            color: newNarrative.phase && newNarrative.text ? 'rgba(255,200,50,0.9)' : 'rgba(255,255,255,0.25)',
                                                            cursor: newNarrative.phase && newNarrative.text ? 'pointer' : 'not-allowed',
                                                            fontSize: '0.85rem',
                                                            fontWeight: 600,
                                                            minHeight: '38px',
                                                            transition: 'background 0.15s',
                                                        }}
                                                    >
                                                        + Añadir entrada
                                                    </button>
                                                </div>
                                            </section>

                                            {/* ── Section: Momentos clave ── */}
                                            <section style={sectionDivider}>
                                                <SectionHeader accent="rgba(167,139,250,0.7)">Momentos Clave</SectionHeader>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.6rem' }}>
                                                    {formData.keyMoments.map((m, i) => (
                                                        <Chip
                                                            key={i}
                                                            label={m}
                                                            onRemove={() => removeKeyMoment(i)}
                                                            color="rgba(167,139,250,0.1)"
                                                            textColor="rgba(167,139,250,0.9)"
                                                        />
                                                    ))}
                                                </div>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <input
                                                        placeholder="Añadir momento clave y pulsar Enter"
                                                        value={newKeyMoment}
                                                        onChange={e => setNewKeyMoment(e.target.value)}
                                                        onKeyDown={e => {
                                                            if (e.key === 'Enter') { e.preventDefault(); addKeyMoment(); }
                                                        }}
                                                        style={{ ...inputStyle, fontSize: '0.85rem', padding: '0.6rem 0.9rem', flex: 1 }}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={addKeyMoment}
                                                        style={{
                                                            padding: '0.6rem 1rem',
                                                            background: 'rgba(167,139,250,0.12)',
                                                            border: '1px solid rgba(167,139,250,0.25)',
                                                            borderRadius: '8px',
                                                            color: 'rgba(167,139,250,0.9)',
                                                            cursor: 'pointer',
                                                            fontSize: '1rem',
                                                            fontWeight: 700,
                                                            minWidth: '44px',
                                                            minHeight: '44px',
                                                        }}
                                                    >+</button>
                                                </div>
                                            </section>

                                            {/* ── Section: MVP ── */}
                                            <section style={sectionDivider}>
                                                <SectionHeader accent="rgba(74,222,128,0.7)">MVP</SectionHeader>
                                                <Input
                                                    placeholder="Unidad o jugador MVP de la batalla..."
                                                    value={formData.mvp}
                                                    onChange={e => setFormData(f => ({ ...f, mvp: e.target.value }))}
                                                />
                                            </section>

                                            {/* ── Section: Imágenes ── */}
                                            <section style={sectionDivider}>
                                                <SectionHeader accent="rgba(96,165,250,0.7)">Imágenes</SectionHeader>

                                                {/* Thumbnails grid */}
                                                {formData.images.length > 0 && (
                                                    <div style={{
                                                        display: 'grid',
                                                        gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                                                        gap: '0.5rem',
                                                        marginBottom: '0.75rem',
                                                    }}>
                                                        {formData.images.map((url, i) => (
                                                            <div key={i} style={{
                                                                position: 'relative',
                                                                borderRadius: '8px',
                                                                overflow: 'hidden',
                                                                border: '1px solid rgba(255,255,255,0.08)',
                                                                aspectRatio: '1',
                                                            }}>
                                                                <img
                                                                    src={url}
                                                                    alt=""
                                                                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                                                    onError={e => { e.target.style.opacity = 0.3; }}
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeImage(i)}
                                                                    style={{
                                                                        position: 'absolute',
                                                                        top: '4px',
                                                                        right: '4px',
                                                                        background: 'rgba(0,0,0,0.75)',
                                                                        border: 'none',
                                                                        color: '#f87171',
                                                                        borderRadius: '50%',
                                                                        width: '22px',
                                                                        height: '22px',
                                                                        cursor: 'pointer',
                                                                        fontSize: '0.8rem',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                    }}
                                                                >×</button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* URL input */}
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <input
                                                        placeholder="URL de imagen (https://...)"
                                                        value={newImageUrl}
                                                        onChange={e => setNewImageUrl(e.target.value)}
                                                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addImage(); } }}
                                                        style={{ ...inputStyle, fontSize: '0.85rem', padding: '0.6rem 0.9rem', flex: 1 }}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={addImage}
                                                        style={{
                                                            padding: '0.6rem 1rem',
                                                            background: 'rgba(96,165,250,0.12)',
                                                            border: '1px solid rgba(96,165,250,0.25)',
                                                            borderRadius: '8px',
                                                            color: 'rgba(96,165,250,0.9)',
                                                            cursor: 'pointer',
                                                            fontWeight: 700,
                                                            fontSize: '0.85rem',
                                                            whiteSpace: 'nowrap',
                                                            minHeight: '44px',
                                                        }}
                                                    >
                                                        + Añadir
                                                    </button>
                                                </div>
                                            </section>

                                            {/* ── Action buttons ── */}
                                            <div style={{
                                                ...sectionDivider,
                                                display: 'flex',
                                                flexWrap: 'wrap',
                                                gap: '0.75rem',
                                                alignItems: 'center',
                                            }}>
                                                <button
                                                    type="submit"
                                                    style={{
                                                        padding: '0.85rem 2rem',
                                                        background: 'linear-gradient(135deg, var(--color-secondary), #ff6600)',
                                                        border: 'none',
                                                        borderRadius: '50px',
                                                        color: '#fff',
                                                        fontFamily: 'var(--font-display)',
                                                        fontSize: '0.95rem',
                                                        letterSpacing: '0.05em',
                                                        cursor: 'pointer',
                                                        boxShadow: '0 4px 15px rgba(255,0,100,0.25)',
                                                        minHeight: '48px',
                                                        transition: 'transform 0.15s, box-shadow 0.15s',
                                                    }}
                                                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(255,0,100,0.35)'; }}
                                                    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 15px rgba(255,0,100,0.25)'; }}
                                                >
                                                    {editingReport ? 'Actualizar informe' : 'Crear informe'}
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={handleCancel}
                                                    style={{
                                                        padding: '0.85rem 1.5rem',
                                                        background: 'rgba(255,255,255,0.06)',
                                                        border: '1px solid rgba(255,255,255,0.1)',
                                                        borderRadius: '50px',
                                                        color: 'rgba(255,255,255,0.55)',
                                                        fontFamily: 'var(--font-display)',
                                                        fontSize: '0.9rem',
                                                        cursor: 'pointer',
                                                        minHeight: '48px',
                                                        transition: 'background 0.15s',
                                                    }}
                                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                                                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                                                >
                                                    Cancelar
                                                </button>

                                                {editingReport && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(editingReport.id)}
                                                        style={{
                                                            marginLeft: 'auto',
                                                            padding: '0.85rem 1.5rem',
                                                            background: 'rgba(255,50,50,0.08)',
                                                            border: '1px solid rgba(255,50,50,0.25)',
                                                            borderRadius: '50px',
                                                            color: '#f87171',
                                                            fontFamily: 'var(--font-display)',
                                                            fontSize: '0.9rem',
                                                            cursor: 'pointer',
                                                            minHeight: '48px',
                                                            transition: 'background 0.15s',
                                                        }}
                                                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,50,50,0.15)'; }}
                                                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,50,50,0.08)'; }}
                                                    >
                                                        Eliminar informe
                                                    </button>
                                                )}
                                            </div>

                                        </form>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    minHeight: '300px',
                                    background: 'rgba(255,255,255,0.015)',
                                    border: '1px dashed rgba(255,255,255,0.08)',
                                    borderRadius: '14px',
                                    gap: '1rem',
                                }}
                            >
                                <p style={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-display)', fontSize: '0.85rem', letterSpacing: '0.06em', margin: 0 }}>
                                    Selecciona un informe o crea uno nuevo
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setShowForm(true)}
                                    style={{
                                        padding: '0.75rem 1.75rem',
                                        background: 'rgba(255,0,100,0.1)',
                                        border: '1px solid rgba(255,0,100,0.25)',
                                        borderRadius: '50px',
                                        color: 'var(--color-secondary)',
                                        fontFamily: 'var(--font-display)',
                                        fontSize: '0.9rem',
                                        cursor: 'pointer',
                                        minHeight: '44px',
                                    }}
                                >
                                    + Nuevo Informe
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </>
    );
};

export default ReportManager;
