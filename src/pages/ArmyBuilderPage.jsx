import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '../services/api'

/* ─── helpers ─────────────────────────────────────────────────────────── */
function getOrCreateUserId() {
  const key = 'wg-user-id'
  let id = localStorage.getItem(key)
  if (!id) { id = crypto.randomUUID(); localStorage.setItem(key, id) }
  return id
}

// 10th edition categories (no force org slots)
const ROLE_ORDER = [
  'Epic Hero', 'Character', 'Battleline',
  'Infantry', 'Mounted', 'Monster', 'Vehicle',
  'Dedicated Transport', 'Flyer', 'Fortification',
]
const ROLE_COLOR = {
  'Epic Hero':            '#ffd700',
  'Character':            '#ff9800',
  'Battleline':           '#4caf50',
  'Infantry':             '#2196f3',
  'Mounted':              '#00acc1',
  'Monster':              '#9c27b0',
  'Vehicle':              '#f44336',
  'Dedicated Transport':  '#795548',
  'Flyer':                '#00bcd4',
  'Fortification':        '#607d8b',
}

const CATEGORY_COLOR = { Imperium: '#00d4ff', Chaos: '#cc3333', Xenos: '#9b30ff', Unknown: '#888' }

function unitPoints(unit) {
  if (unit.points_per_model > 0) {
    return unit.base_points + (unit.model_count - unit.model_count_min) * unit.points_per_model
  }
  return unit.base_points
}

function listTotalPoints(units) {
  return units.reduce((sum, u) => sum + unitPoints(u), 0)
}

/* ─── sub-components ──────────────────────────────────────────────────── */

function PointsBar({ current, max }) {
  const pct = Math.min((current / max) * 100, 100)
  const over = current > max
  return (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontFamily: 'var(--font-display)', fontSize: '0.8rem' }}>
        <span style={{ color: over ? '#ff4466' : 'rgba(255,255,255,0.6)' }}>
          {over ? '⚠ SOBRE LÍMITE' : 'PUNTOS USADOS'}
        </span>
        <span style={{ color: over ? '#ff4466' : 'var(--color-primary)', fontWeight: 700 }}>
          {current} / {max}
        </span>
      </div>
      <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
        <motion.div
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4 }}
          style={{
            height: '100%',
            borderRadius: '4px',
            background: over
              ? 'linear-gradient(90deg, #ff4466, #ff0000)'
              : pct > 85
              ? 'linear-gradient(90deg, #ffd700, #ff9800)'
              : 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))',
          }}
        />
      </div>
    </div>
  )
}

function DatasheetCard({ datasheet, onAdd, added }) {
  const [expanded, setExpanded] = useState(false)
  const roleBg = ROLE_COLOR[datasheet.role] || '#888'
  return (
    <motion.div
      layout
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid ${added ? 'rgba(0,212,255,0.4)' : 'rgba(255,255,255,0.08)'}`,
        borderLeft: `3px solid ${roleBg}`,
        borderRadius: '8px',
        padding: '0.75rem',
        cursor: 'pointer',
        transition: 'border-color 0.2s',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.2rem' }}>
            <span style={{
              fontSize: '0.65rem', fontFamily: 'var(--font-display)', letterSpacing: '1px',
              color: roleBg, background: `${roleBg}20`, padding: '1px 6px', borderRadius: '4px',
            }}>
              {datasheet.role}
            </span>
            {datasheet.is_character && (
              <span style={{ fontSize: '0.6rem', background: 'rgba(255,215,0,0.15)', color: '#ffd700', padding: '1px 5px', borderRadius: '4px' }}>
                ★ PERSONAJE
              </span>
            )}
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', color: '#fff', letterSpacing: '0.5px' }}>
            {datasheet.name}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', marginTop: '0.15rem' }}>
            {datasheet.model_count_min === datasheet.model_count_max
              ? `${datasheet.model_count_min} modelo${datasheet.model_count_min > 1 ? 's' : ''}`
              : `${datasheet.model_count_min}–${datasheet.model_count_max} modelos`}
            {datasheet.points_per_model > 0 && ` · ${datasheet.points_per_model} pts/modelo`}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem', flexShrink: 0 }}>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700,
            color: 'var(--color-primary)',
          }}>
            {datasheet.base_points}<span style={{ fontSize: '0.65rem', opacity: 0.6 }}> pts</span>
          </div>
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <button
              onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}
              title="Ver detalles"
              style={{
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '6px', color: '#aaa', cursor: 'pointer', padding: '3px 7px', fontSize: '0.7rem',
              }}
            >
              {expanded ? '▲' : '▼'}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onAdd(datasheet) }}
              title="Añadir a la lista"
              style={{
                background: added ? 'rgba(0,212,255,0.15)' : 'rgba(0,212,255,0.08)',
                border: `1px solid ${added ? 'rgba(0,212,255,0.5)' : 'rgba(0,212,255,0.2)'}`,
                borderRadius: '6px', color: added ? 'var(--color-primary)' : '#aaa',
                cursor: 'pointer', padding: '3px 8px', fontSize: '0.75rem', fontWeight: 700,
                transition: 'all 0.2s',
              }}
            >
              +
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ marginTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.75rem' }}>
              {/* Stats */}
              {datasheet.stats && Object.keys(datasheet.stats).length > 0 && (
                <div style={{ marginBottom: '0.6rem' }}>
                  <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-display)', letterSpacing: '1px', marginBottom: '0.3rem' }}>
                    CARACTERÍSTICAS
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {Object.entries(datasheet.stats).map(([k, v]) => (
                      <div key={k} style={{ textAlign: 'center', minWidth: '36px' }}>
                        <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-display)' }}>{k}</div>
                        <div style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 600 }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Weapons */}
              {datasheet.weapons?.length > 0 && (
                <div style={{ marginBottom: '0.6rem' }}>
                  <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-display)', letterSpacing: '1px', marginBottom: '0.3rem' }}>
                    ARMAS
                  </div>
                  {datasheet.weapons.map((w, i) => (
                    <div key={i} style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', marginBottom: '0.15rem', paddingLeft: '0.5rem', borderLeft: '2px solid rgba(255,255,255,0.1)' }}>
                      <span style={{ color: '#fff', fontWeight: 500 }}>{w.name}</span>
                      {w.range && w.range !== 'Melee' && <span style={{ color: 'rgba(255,255,255,0.4)' }}> · {w.range}</span>}
                      <span style={{ color: 'rgba(255,255,255,0.4)' }}> · F{w.strength} PA{w.ap} D{w.damage}</span>
                    </div>
                  ))}
                </div>
              )}
              {/* Abilities */}
              {datasheet.abilities?.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-display)', letterSpacing: '1px', marginBottom: '0.3rem' }}>
                    HABILIDADES
                  </div>
                  {datasheet.abilities.map((a, i) => (
                    <div key={i} style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.3rem' }}>
                      <span style={{ color: '#ffd700', fontWeight: 600 }}>{a.name}: </span>
                      {a.text}
                    </div>
                  ))}
                </div>
              )}
              {/* Wargear options */}
              {datasheet.wargear_options?.length > 0 && (
                <div style={{ marginTop: '0.4rem', fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>
                  {datasheet.wargear_options.map((o, i) => <div key={i}>• {o}</div>)}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function ArmyUnitRow({ unit, onRemove, onChangeCount }) {
  const roleBg = ROLE_COLOR[unit.role] || '#888'
  const pts = unitPoints(unit)
  const canChangeCount = unit.model_count_min !== unit.model_count_max

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.6rem 0.75rem',
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '8px',
        border: `1px solid rgba(255,255,255,0.06)`,
        borderLeft: `3px solid ${roleBg}`,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.82rem', color: '#fff', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {unit.name}
        </div>
        {canChangeCount && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.25rem' }}>
            <button
              onClick={() => onChangeCount(unit.instanceId, Math.max(unit.model_count_min, unit.model_count - 1))}
              disabled={unit.model_count <= unit.model_count_min}
              style={{ width: '20px', height: '20px', background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '4px', color: '#aaa', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: unit.model_count <= unit.model_count_min ? 0.3 : 1 }}
            >−</button>
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', minWidth: '40px', textAlign: 'center' }}>
              {unit.model_count} mod.
            </span>
            <button
              onClick={() => onChangeCount(unit.instanceId, Math.min(unit.model_count_max, unit.model_count + 1))}
              disabled={unit.model_count >= unit.model_count_max}
              style={{ width: '20px', height: '20px', background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '4px', color: '#aaa', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: unit.model_count >= unit.model_count_max ? 0.3 : 1 }}
            >+</button>
          </div>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)', fontFamily: 'var(--font-display)' }}>
          {pts}<span style={{ fontSize: '0.6rem', opacity: 0.5 }}>pts</span>
        </span>
        <button
          onClick={() => onRemove(unit.instanceId)}
          style={{ background: 'rgba(255,68,102,0.1)', border: '1px solid rgba(255,68,102,0.25)', borderRadius: '6px', color: '#ff6464', cursor: 'pointer', padding: '2px 8px', fontSize: '0.8rem' }}
        >
          ✕
        </button>
      </div>
    </motion.div>
  )
}

/* ─── main page ───────────────────────────────────────────────────────── */
export default function ArmyBuilderPage() {
  const { listId } = useParams()
  const navigate = useNavigate()
  const ownerId = getOrCreateUserId()

  // Data state
  const [factions, setFactions] = useState([])
  const [selectedFaction, setSelectedFaction] = useState(null)
  const [factionDetail, setFactionDetail] = useState(null) // includes datasheets
  const [myLists, setMyLists] = useState([])
  const [loadingFactions, setLoadingFactions] = useState(true)
  const [loadingFaction, setLoadingFaction] = useState(false)

  // Current list state
  const [currentList, setCurrentList] = useState(null)
  const [listName, setListName] = useState('Mi Lista')
  const [selectedDetachment, setSelectedDetachment] = useState('')
  const [gameSize, setGameSize] = useState(2000)
  const [units, setUnits] = useState([])

  // UI state
  const [activeTab, setActiveTab] = useState('browser') // 'browser' | 'list' | 'mylists'
  const [roleFilter, setRoleFilter] = useState('all')
  const [unitSearch, setUnitSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [exportText, setExportText] = useState('')
  const [showExport, setShowExport] = useState(false)

  const saveTimer = useRef(null)

  // Load factions on mount
  useEffect(() => {
    api.getBuilderFactions()
      .then(data => {
        const list = data.results || data
        setFactions(list)
      })
      .catch(console.error)
      .finally(() => setLoadingFactions(false))
  }, [])

  // Load my lists
  useEffect(() => {
    api.getBuilderLists(ownerId)
      .then(data => setMyLists(data.results || data))
      .catch(console.error)
  }, [ownerId])

  // Load faction detail when faction selected
  useEffect(() => {
    if (!selectedFaction) { setFactionDetail(null); return }
    setLoadingFaction(true)
    api.getBuilderFaction(selectedFaction.id)
      .then(data => {
        setFactionDetail(data)
        // Set first detachment automatically
        if (data.detachments?.length > 0 && !selectedDetachment) {
          setSelectedDetachment(data.detachments[0].name)
        }
      })
      .catch(console.error)
      .finally(() => setLoadingFaction(false))
  }, [selectedFaction])

  // If listId param, load that list
  useEffect(() => {
    if (!listId) return
    const found = myLists.find(l => l.id === listId)
    if (found) loadList(found)
  }, [listId, myLists])

  const loadList = (list) => {
    setListName(list.name)
    setGameSize(list.game_size)
    setSelectedDetachment(list.detachment || '')
    setUnits(list.units || [])
    setCurrentList(list)
    if (list.faction) {
      const f = factions.find(f => f.id === (list.faction?.id || list.faction))
      if (f) setSelectedFaction(f)
    }
    setActiveTab('list')
    navigate(`/army-builder/${list.id}`, { replace: true })
  }

  const totalPoints = listTotalPoints(units)

  // Autosave
  const scheduleAutoSave = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => saveList(false), 2000)
  }, [units, listName, selectedFaction, selectedDetachment, gameSize])

  useEffect(() => {
    if (units.length > 0 || currentList) scheduleAutoSave()
  }, [units, listName, selectedDetachment, gameSize])

  const saveList = async (showMessage = true) => {
    if (!selectedFaction && units.length === 0) return
    setSaving(true)
    const payload = {
      name: listName,
      owner_id: ownerId,
      faction: selectedFaction?.id || null,
      detachment: selectedDetachment,
      game_size: gameSize,
      total_points: totalPoints,
      units: units,
    }
    try {
      let saved
      if (currentList?.id) {
        saved = await api.updateBuilderList(currentList.id, payload)
      } else {
        saved = await api.createBuilderList(payload)
        setCurrentList(saved)
        navigate(`/army-builder/${saved.id}`, { replace: true })
      }
      // Refresh myLists
      const lists = await api.getBuilderLists(ownerId)
      setMyLists(lists.results || lists)
      if (showMessage) { setSaveMsg('✓ Lista guardada'); setTimeout(() => setSaveMsg(''), 2500) }
    } catch (err) {
      console.error(err)
      if (showMessage) { setSaveMsg('Error al guardar'); setTimeout(() => setSaveMsg(''), 3000) }
    } finally {
      setSaving(false)
    }
  }

  const addUnit = (datasheet) => {
    const newUnit = {
      instanceId: crypto.randomUUID(),
      datasheetId: datasheet.id,
      name: datasheet.name,
      role: datasheet.role,
      base_points: datasheet.base_points,
      points_per_model: datasheet.points_per_model,
      model_count: datasheet.model_count_min,
      model_count_min: datasheet.model_count_min,
      model_count_max: datasheet.model_count_max,
    }
    setUnits(prev => [...prev, newUnit])
    setActiveTab('list')
  }

  const removeUnit = (instanceId) => {
    setUnits(prev => prev.filter(u => u.instanceId !== instanceId))
  }

  const changeCount = (instanceId, newCount) => {
    setUnits(prev => prev.map(u => u.instanceId === instanceId ? { ...u, model_count: newCount } : u))
  }

  const newList = () => {
    setCurrentList(null)
    setListName('Mi Lista')
    setSelectedFaction(null)
    setFactionDetail(null)
    setSelectedDetachment('')
    setGameSize(2000)
    setUnits([])
    setActiveTab('browser')
    navigate('/army-builder', { replace: true })
  }

  const deleteList = async (id) => {
    if (!confirm('¿Eliminar esta lista?')) return
    await api.deleteBuilderList(id)
    const lists = await api.getBuilderLists(ownerId)
    setMyLists(lists.results || lists)
    if (currentList?.id === id) newList()
  }

  const generateExportText = () => {
    const lines = []
    lines.push(`++ ${listName} [${totalPoints}pts] ++`)
    lines.push('')
    if (selectedFaction) lines.push(`Facción: ${selectedFaction.name}`)
    if (selectedDetachment) lines.push(`Destacamento: ${selectedDetachment}`)
    lines.push(`Tamaño: ${gameSize} pts`)
    lines.push('')

    const byRole = {}
    units.forEach(u => {
      if (!byRole[u.role]) byRole[u.role] = []
      byRole[u.role].push(u)
    })

    ROLE_ORDER.forEach(role => {
      if (byRole[role]?.length) {
        lines.push(`== ${role} ==`)
        byRole[role].forEach(u => {
          const pts = unitPoints(u)
          const countStr = u.model_count_min !== u.model_count_max ? ` [${u.model_count} modelos]` : ''
          lines.push(`  + ${u.name}${countStr} [${pts}pts]`)
        })
        lines.push('')
      }
    })

    lines.push(`++ Total: ${totalPoints}/${gameSize}pts ++`)
    return lines.join('\n')
  }

  // Filtered datasheets
  const datasheets = factionDetail?.datasheets || []
  const filteredDatasheets = datasheets.filter(d => {
    const matchRole = roleFilter === 'all' || d.role === roleFilter
    const matchSearch = !unitSearch || d.name.toLowerCase().includes(unitSearch.toLowerCase())
    return matchRole && matchSearch
  })

  const rolesAvailable = [...new Set(datasheets.map(d => d.role))].sort((a, b) => ROLE_ORDER.indexOf(a) - ROLE_ORDER.indexOf(b))

  // Units grouped by role for list panel
  const unitsByRole = {}
  units.forEach(u => {
    if (!unitsByRole[u.role]) unitsByRole[u.role] = []
    unitsByRole[u.role].push(u)
  })

  /* ── Render ── */
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-darker)', color: 'var(--color-light)', paddingTop: '80px' }}>
      {/* Page Header */}
      <div style={{
        background: 'linear-gradient(180deg, rgba(0,212,255,0.05) 0%, transparent 100%)',
        borderBottom: '1px solid rgba(0,212,255,0.1)',
        padding: '1.5rem clamp(1rem, 4vw, 3rem)',
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.2rem, 3vw, 1.8rem)', letterSpacing: '3px', margin: 0, background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              ARMY BUILDER
            </h1>
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', margin: '0.2rem 0 0', fontFamily: 'var(--font-display)', letterSpacing: '1px' }}>
              Warhammer 40,000 · 10ª Edición
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {saveMsg && (
              <motion.span
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{ fontSize: '0.8rem', color: saveMsg.startsWith('✓') ? '#4caf50' : '#ff4466', fontFamily: 'var(--font-display)' }}
              >
                {saveMsg}
              </motion.span>
            )}
            <button
              onClick={newList}
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', padding: '0.5rem 1rem', fontSize: '0.8rem', fontFamily: 'var(--font-display)', letterSpacing: '1px' }}
            >
              + NUEVA LISTA
            </button>
            {units.length > 0 && (
              <>
                <button
                  onClick={() => saveList(true)}
                  disabled={saving}
                  style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.35)', borderRadius: '8px', color: 'var(--color-primary)', cursor: 'pointer', padding: '0.5rem 1rem', fontSize: '0.8rem', fontFamily: 'var(--font-display)', letterSpacing: '1px', opacity: saving ? 0.6 : 1 }}
                >
                  {saving ? '…' : '💾 GUARDAR'}
                </button>
                <button
                  onClick={() => { setExportText(generateExportText()); setShowExport(true) }}
                  style={{ background: 'rgba(123,47,255,0.1)', border: '1px solid rgba(123,47,255,0.35)', borderRadius: '8px', color: 'var(--color-secondary)', cursor: 'pointer', padding: '0.5rem 1rem', fontSize: '0.8rem', fontFamily: 'var(--font-display)', letterSpacing: '1px' }}
                >
                  ↗ EXPORTAR
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main layout: sidebar + content */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1.5rem clamp(1rem, 4vw, 3rem)', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 420px)', gap: '1.5rem' }}>

        {/* LEFT: Browser / My Lists panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Tab bar */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {[{ id: 'browser', label: '📚 Unidades' }, { id: 'mylists', label: `📋 Mis Listas (${myLists.length})` }].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '0.5rem 1rem',
                  background: activeTab === tab.id ? 'rgba(0,212,255,0.12)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${activeTab === tab.id ? 'rgba(0,212,255,0.35)' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: '8px',
                  color: activeTab === tab.id ? 'var(--color-primary)' : 'rgba(255,255,255,0.6)',
                  cursor: 'pointer', fontFamily: 'var(--font-display)', fontSize: '0.78rem', letterSpacing: '1px',
                  transition: 'all 0.2s',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* BROWSER tab */}
          {activeTab === 'browser' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Faction selector */}
              <div>
                <div style={{ fontSize: '0.65rem', fontFamily: 'var(--font-display)', letterSpacing: '2px', color: 'rgba(255,255,255,0.35)', marginBottom: '0.5rem' }}>
                  FACCIÓN
                </div>
                {loadingFactions ? (
                  <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>Cargando facciones…</div>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {['Imperium', 'Chaos', 'Xenos'].map(cat => {
                      const catFactions = factions.filter(f => f.category === cat)
                      if (!catFactions.length) return null
                      return (
                        <div key={cat} style={{ display: 'contents' }}>
                          {catFactions.map(f => (
                            <button
                              key={f.id}
                              onClick={() => setSelectedFaction(f.id === selectedFaction?.id ? null : f)}
                              style={{
                                padding: '0.4rem 0.9rem',
                                background: selectedFaction?.id === f.id ? `${CATEGORY_COLOR[cat]}20` : 'rgba(255,255,255,0.04)',
                                border: `1px solid ${selectedFaction?.id === f.id ? CATEGORY_COLOR[cat] : 'rgba(255,255,255,0.1)'}`,
                                borderRadius: '20px',
                                color: selectedFaction?.id === f.id ? '#fff' : 'rgba(255,255,255,0.55)',
                                cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'var(--font-display)',
                                letterSpacing: '0.5px', transition: 'all 0.2s',
                                fontWeight: selectedFaction?.id === f.id ? 600 : 400,
                              }}
                            >
                              {f.short_name || f.name}
                            </button>
                          ))}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Detachment selector */}
              {factionDetail?.detachments?.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.65rem', fontFamily: 'var(--font-display)', letterSpacing: '2px', color: 'rgba(255,255,255,0.35)', marginBottom: '0.5rem' }}>
                    DESTACAMENTO
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {factionDetail.detachments.map(d => (
                      <button
                        key={d.name}
                        onClick={() => setSelectedDetachment(d.name)}
                        title={`${d.ability_name}: ${d.ability_text}`}
                        style={{
                          padding: '0.4rem 0.9rem',
                          background: selectedDetachment === d.name ? 'rgba(0,212,255,0.12)' : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${selectedDetachment === d.name ? 'rgba(0,212,255,0.4)' : 'rgba(255,255,255,0.1)'}`,
                          borderRadius: '20px',
                          color: selectedDetachment === d.name ? 'var(--color-primary)' : 'rgba(255,255,255,0.55)',
                          cursor: 'pointer', fontSize: '0.8rem', transition: 'all 0.2s',
                        }}
                      >
                        {d.name}
                      </button>
                    ))}
                  </div>
                  {selectedDetachment && (() => {
                    const d = factionDetail.detachments.find(d => d.name === selectedDetachment)
                    return d ? (
                      <div style={{ marginTop: '0.5rem', padding: '0.6rem 0.8rem', background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.12)', borderRadius: '8px', fontSize: '0.75rem' }}>
                        <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{d.ability_name}: </span>
                        <span style={{ color: 'rgba(255,255,255,0.55)' }}>{d.ability_text}</span>
                      </div>
                    ) : null
                  })()}
                </div>
              )}

              {/* Datasheet list */}
              {selectedFaction && (
                <div>
                  {/* Filters */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem', alignItems: 'center' }}>
                    <input
                      type="text"
                      value={unitSearch}
                      onChange={e => setUnitSearch(e.target.value)}
                      placeholder="Buscar unidad…"
                      style={{ flex: '1 1 150px', padding: '0.4rem 0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '0.82rem', outline: 'none', fontFamily: 'var(--font-body)' }}
                    />
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => setRoleFilter('all')}
                        style={{ padding: '0.3rem 0.7rem', background: roleFilter === 'all' ? 'rgba(255,255,255,0.15)' : 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff', cursor: 'pointer', fontSize: '0.72rem' }}
                      >
                        Todo
                      </button>
                      {rolesAvailable.map(role => (
                        <button
                          key={role}
                          onClick={() => setRoleFilter(role === roleFilter ? 'all' : role)}
                          style={{
                            padding: '0.3rem 0.7rem',
                            background: roleFilter === role ? `${ROLE_COLOR[role]}25` : 'transparent',
                            border: `1px solid ${roleFilter === role ? ROLE_COLOR[role] : 'rgba(255,255,255,0.1)'}`,
                            borderRadius: '6px',
                            color: roleFilter === role ? ROLE_COLOR[role] : 'rgba(255,255,255,0.6)',
                            cursor: 'pointer', fontSize: '0.72rem', transition: 'all 0.15s',
                          }}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>

                  {loadingFaction ? (
                    <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem' }}>Cargando unidades…</div>
                  ) : filteredDatasheets.length === 0 ? (
                    <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem' }}>
                      {unitSearch ? 'No se encontraron unidades' : 'No hay unidades disponibles'}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '60vh', overflowY: 'auto', paddingRight: '0.25rem' }}>
                      {filteredDatasheets.map(d => (
                        <DatasheetCard
                          key={d.id}
                          datasheet={d}
                          onAdd={addUnit}
                          added={units.some(u => u.datasheetId === d.id)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {!selectedFaction && !loadingFactions && (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'rgba(255,255,255,0.3)' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>⚔</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', letterSpacing: '2px' }}>
                    SELECCIONA UNA FACCIÓN
                  </div>
                  <div style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: 'rgba(255,255,255,0.2)' }}>
                    para empezar a construir tu lista
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MY LISTS tab */}
          {activeTab === 'mylists' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {myLists.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'rgba(255,255,255,0.3)' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📋</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', letterSpacing: '2px' }}>
                    NO TIENES LISTAS GUARDADAS
                  </div>
                  <div style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>
                    Crea tu primera lista en el builder
                  </div>
                </div>
              ) : (
                myLists.map(list => (
                  <motion.div
                    key={list.id}
                    whileHover={{ scale: 1.01 }}
                    style={{
                      padding: '1rem',
                      background: currentList?.id === list.id ? 'rgba(0,212,255,0.08)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${currentList?.id === list.id ? 'rgba(0,212,255,0.3)' : 'rgba(255,255,255,0.08)'}`,
                      borderRadius: '10px',
                      cursor: 'pointer',
                    }}
                    onClick={() => loadList(list)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: '#fff', marginBottom: '0.25rem' }}>
                          {list.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                          {list.faction_name || 'Sin facción'} · {list.detachment || 'Sin destacamento'}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', color: list.total_points > list.game_size ? '#ff4466' : 'var(--color-primary)', fontWeight: 700 }}>
                          {list.total_points}/{list.game_size}
                        </span>
                        <button
                          onClick={e => { e.stopPropagation(); deleteList(list.id) }}
                          style={{ background: 'rgba(255,68,102,0.1)', border: '1px solid rgba(255,68,102,0.2)', borderRadius: '6px', color: '#ff6464', cursor: 'pointer', padding: '2px 8px', fontSize: '0.75rem' }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                    <div style={{ marginTop: '0.5rem' }}>
                      <PointsBar current={list.total_points} max={list.game_size} />
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </div>

        {/* RIGHT: Current List panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'sticky', top: '90px', alignSelf: 'start', maxHeight: 'calc(100vh - 110px)', overflowY: 'auto' }}>
          {/* List header */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1rem' }}>
            <input
              type="text"
              value={listName}
              onChange={e => setListName(e.target.value)}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                color: '#fff',
                fontFamily: 'var(--font-display)',
                fontSize: '1rem',
                letterSpacing: '1px',
                padding: '0 0 0.4rem',
                outline: 'none',
                marginBottom: '0.75rem',
                boxSizing: 'border-box',
              }}
              placeholder="Nombre de la lista…"
            />

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
              {[500, 1000, 1500, 2000, 2500, 3000].map(sz => (
                <button
                  key={sz}
                  onClick={() => setGameSize(sz)}
                  style={{
                    padding: '0.25rem 0.6rem',
                    background: gameSize === sz ? 'rgba(0,212,255,0.12)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${gameSize === sz ? 'rgba(0,212,255,0.35)' : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: '6px', color: gameSize === sz ? 'var(--color-primary)' : 'rgba(255,255,255,0.4)',
                    cursor: 'pointer', fontSize: '0.72rem', fontFamily: 'var(--font-display)',
                  }}
                >
                  {sz}
                </button>
              ))}
            </div>

            <PointsBar current={totalPoints} max={gameSize} />

            {selectedFaction && (
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.25rem' }}>
                <span style={{ color: CATEGORY_COLOR[selectedFaction.category] || '#aaa' }}>●</span>
                {' '}{selectedFaction.name}
                {selectedDetachment && <span style={{ color: 'rgba(255,255,255,0.3)' }}> · {selectedDetachment}</span>}
              </div>
            )}
          </div>

          {/* Units list */}
          {units.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px dashed rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>+</div>
              <div style={{ fontSize: '0.8rem', fontFamily: 'var(--font-display)', letterSpacing: '1px' }}>
                AÑADE UNIDADES DESDE EL NAVEGADOR
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {ROLE_ORDER.filter(r => unitsByRole[r]?.length).map(role => (
                <div key={role}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    fontSize: '0.65rem', fontFamily: 'var(--font-display)', letterSpacing: '2px',
                    color: ROLE_COLOR[role], marginBottom: '0.4rem',
                  }}>
                    <span style={{ flex: 1, height: '1px', background: `${ROLE_COLOR[role]}40` }} />
                    {role.toUpperCase()}
                    <span style={{ flex: 1, height: '1px', background: `${ROLE_COLOR[role]}40` }} />
                  </div>
                  <AnimatePresence mode="popLayout">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      {unitsByRole[role].map(u => (
                        <ArmyUnitRow
                          key={u.instanceId}
                          unit={u}
                          onRemove={removeUnit}
                          onChangeCount={changeCount}
                        />
                      ))}
                    </div>
                  </AnimatePresence>
                </div>
              ))}

              {/* Summary */}
              <div style={{ padding: '0.75rem', background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.12)', borderRadius: '8px', fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.6)' }}>
                  <span>Total unidades</span><span>{units.length}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.3rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
                  <span style={{ color: 'rgba(255,255,255,0.8)' }}>Total puntos</span>
                  <span style={{ color: totalPoints > gameSize ? '#ff4466' : 'var(--color-primary)' }}>{totalPoints} / {gameSize}</span>
                </div>
              </div>

              <button
                onClick={() => { setExportText(generateExportText()); setShowExport(true) }}
                style={{ width: '100%', padding: '0.6rem', background: 'rgba(123,47,255,0.08)', border: '1px solid rgba(123,47,255,0.25)', borderRadius: '8px', color: 'var(--color-secondary)', cursor: 'pointer', fontFamily: 'var(--font-display)', fontSize: '0.78rem', letterSpacing: '1px' }}
              >
                ↗ EXPORTAR LISTA
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Export modal */}
      <AnimatePresence>
        {showExport && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowExport(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(5px)', zIndex: 300 }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{
                position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                width: 'min(600px, 92vw)', maxHeight: '80vh',
                background: 'rgba(10,10,26,0.98)', border: '1px solid rgba(0,212,255,0.25)',
                borderRadius: '16px', padding: '1.5rem', zIndex: 400,
                display: 'flex', flexDirection: 'column', gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', margin: 0, color: 'var(--color-primary)', letterSpacing: '2px', fontSize: '0.9rem' }}>
                  EXPORTAR LISTA
                </h3>
                <button
                  onClick={() => setShowExport(false)}
                  style={{ background: 'transparent', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '1.2rem' }}
                >✕</button>
              </div>
              <textarea
                readOnly
                value={exportText}
                style={{
                  flex: 1, minHeight: '300px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px', color: '#ccc', fontFamily: 'monospace', fontSize: '0.8rem',
                  padding: '0.75rem', resize: 'vertical', outline: 'none',
                }}
              />
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => { navigator.clipboard.writeText(exportText) }}
                  style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', borderRadius: '8px', color: 'var(--color-primary)', cursor: 'pointer', padding: '0.5rem 1.25rem', fontFamily: 'var(--font-display)', fontSize: '0.78rem', letterSpacing: '1px' }}
                >
                  📋 COPIAR
                </button>
                <button
                  onClick={() => {
                    const blob = new Blob([exportText], { type: 'text/plain' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url; a.download = `${listName.replace(/\s+/g, '_')}.txt`; a.click()
                    URL.revokeObjectURL(url)
                  }}
                  style={{ background: 'rgba(123,47,255,0.1)', border: '1px solid rgba(123,47,255,0.3)', borderRadius: '8px', color: 'var(--color-secondary)', cursor: 'pointer', padding: '0.5rem 1.25rem', fontFamily: 'var(--font-display)', fontSize: '0.78rem', letterSpacing: '1px' }}
                >
                  ↓ DESCARGAR
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
