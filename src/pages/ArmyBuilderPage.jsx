import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '../services/api'
import Navbar from '../components/UI/Navbar'

/* ─── helpers ─────────────────────────────────────────────────────────── */
function getOrCreateUserId() {
  const key = 'wg-user-id'
  let id = localStorage.getItem(key)
  if (!id) { id = crypto.randomUUID(); localStorage.setItem(key, id) }
  return id
}

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

/**
 * Calculate points for a unit instance using 10th-ed two-tier pricing.
 * cost_thresholds: [{min_models, cost}, ...] sorted ascending by min_models.
 * e.g. [{min_models:1, cost:180}, {min_models:6, cost:360}]
 */
function unitPoints(unit) {
  const tiers = unit.cost_thresholds
  if (tiers && tiers.length > 1) {
    let cost = tiers[0].cost
    for (const tier of tiers) {
      if (unit.model_count >= tier.min_models) cost = tier.cost
      else break
    }
    return cost
  }
  if (unit.points_per_model > 0) {
    return unit.base_points + (unit.model_count - unit.model_count_min) * unit.points_per_model
  }
  return unit.base_points
}

function listTotalPoints(units) {
  return units.reduce((sum, u) => sum + unitPoints(u), 0)
}

/* ─── PointsBar ───────────────────────────────────────────────────────── */
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
            height: '100%', borderRadius: '4px',
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

/* ─── UnitConfigModal ─────────────────────────────────────────────────── */
function UnitConfigModal({ datasheet, onConfirm, onClose }) {
  const [modelCount, setModelCount] = useState(datasheet.model_count_min)

  // selectedOptions: { [groupName]: string (single) | string[] (multi) }
  const [selectedOptions, setSelectedOptions] = useState(() => {
    const init = {}
    datasheet.wargear_options?.forEach(group => {
      if (group.max <= 1) {
        init[group.name] = group.options?.[0]?.name ?? null
      } else {
        init[group.name] = []
      }
    })
    return init
  })

  const canChangeCount = datasheet.model_count_min !== datasheet.model_count_max

  // Compute preview points using the same logic as unitPoints()
  const previewUnit = { ...datasheet, model_count: modelCount, model_count_min: datasheet.model_count_min }
  const pts = unitPoints(previewUnit)

  // Tier label
  const tiers = datasheet.cost_thresholds
  let tierLabel = null
  if (tiers?.length > 1) {
    tierLabel = tiers.map((t, i) => {
      const next = tiers[i + 1]
      const rangeStr = next ? `${t.min_models}–${next.min_models - 1}` : `${t.min_models}+`
      return `${rangeStr} mod: ${t.cost}pts`
    }).join('  ·  ')
  }

  const selectSingle = (groupName, optionName) => {
    setSelectedOptions(prev => ({ ...prev, [groupName]: optionName }))
  }

  const toggleMulti = (groupName, optionName, maxSel) => {
    setSelectedOptions(prev => {
      const current = Array.isArray(prev[groupName]) ? prev[groupName] : []
      if (current.includes(optionName)) {
        return { ...prev, [groupName]: current.filter(n => n !== optionName) }
      } else if (current.length < maxSel) {
        return { ...prev, [groupName]: [...current, optionName] }
      }
      return prev
    })
  }

  const handleConfirm = () => {
    onConfirm({
      instanceId:       crypto.randomUUID(),
      datasheetId:      datasheet.id,
      name:             datasheet.name,
      role:             datasheet.role,
      base_points:      datasheet.base_points,
      points_per_model: datasheet.points_per_model,
      cost_thresholds:  datasheet.cost_thresholds || [],
      model_count:      modelCount,
      model_count_min:  datasheet.model_count_min,
      model_count_max:  datasheet.model_count_max,
      selected_options: selectedOptions,
      wargear_options:  datasheet.wargear_options || [],
    })
  }

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', zIndex: 500 }}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }}
        style={{
          position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: 'min(520px, 94vw)', maxHeight: '86vh',
          background: 'rgba(8,8,24,0.99)',
          border: '1px solid rgba(0,212,255,0.3)',
          borderRadius: '16px', zIndex: 600,
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '1rem 1.25rem 0.75rem',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.65rem', letterSpacing: '2px', color: 'rgba(255,255,255,0.35)', marginBottom: '0.25rem' }}>
              CONFIGURAR UNIDAD
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', color: '#fff', letterSpacing: '1px' }}>
              {datasheet.name}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', fontSize: '1.2rem', padding: '0', lineHeight: 1 }}>
            ✕
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.25rem' }}>

          {/* Model count */}
          {canChangeCount && (
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.65rem', fontFamily: 'var(--font-display)', letterSpacing: '2px', color: 'rgba(255,255,255,0.35)', marginBottom: '0.6rem' }}>
                NÚMERO DE MODELOS
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button
                  onClick={() => setModelCount(c => Math.max(datasheet.model_count_min, c - 1))}
                  disabled={modelCount <= datasheet.model_count_min}
                  style={{ width: '32px', height: '32px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: modelCount <= datasheet.model_count_min ? 0.3 : 1, flexShrink: 0 }}
                >−</button>
                <div style={{ flex: 1 }}>
                  <input
                    type="range"
                    min={datasheet.model_count_min}
                    max={datasheet.model_count_max}
                    value={modelCount}
                    onChange={e => setModelCount(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--color-primary)', cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.2rem' }}>
                    <span>{datasheet.model_count_min}</span>
                    <span style={{ color: 'var(--color-primary)', fontSize: '0.85rem', fontWeight: 700 }}>{modelCount}</span>
                    <span>{datasheet.model_count_max}</span>
                  </div>
                </div>
                <button
                  onClick={() => setModelCount(c => Math.min(datasheet.model_count_max, c + 1))}
                  disabled={modelCount >= datasheet.model_count_max}
                  style={{ width: '32px', height: '32px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: modelCount >= datasheet.model_count_max ? 0.3 : 1, flexShrink: 0 }}
                >+</button>
              </div>
              {tierLabel && (
                <div style={{ marginTop: '0.4rem', fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-display)' }}>
                  {tierLabel}
                </div>
              )}
            </div>
          )}

          {/* Wargear groups */}
          {datasheet.wargear_options?.length > 0 && (
            <div>
              <div style={{ fontSize: '0.65rem', fontFamily: 'var(--font-display)', letterSpacing: '2px', color: 'rgba(255,255,255,0.35)', marginBottom: '0.6rem' }}>
                EQUIPO Y ARMAS
              </div>
              {datasheet.wargear_options.map(group => {
                const isMulti = group.max > 1
                const selected = selectedOptions[group.name]
                return (
                  <div key={group.name} style={{ marginBottom: '0.85rem' }}>
                    <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.55)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontStyle: 'italic' }}>{group.name}</span>
                      {isMulti && (
                        <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.06)', padding: '1px 5px', borderRadius: '4px' }}>
                          máx {group.max}
                        </span>
                      )}
                      {!isMulti && group.min === 1 && (
                        <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.06)', padding: '1px 5px', borderRadius: '4px' }}>
                          elige 1
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {group.options?.map(opt => {
                        const isSelected = isMulti
                          ? Array.isArray(selected) && selected.includes(opt.name)
                          : selected === opt.name
                        return (
                          <button
                            key={opt.name}
                            onClick={() => {
                              if (isMulti) toggleMulti(group.name, opt.name, group.max)
                              else selectSingle(group.name, opt.name)
                            }}
                            style={{
                              padding: '0.3rem 0.75rem',
                              background: isSelected ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.04)',
                              border: `1px solid ${isSelected ? 'rgba(0,212,255,0.5)' : 'rgba(255,255,255,0.1)'}`,
                              borderRadius: '8px',
                              color: isSelected ? 'var(--color-primary)' : 'rgba(255,255,255,0.65)',
                              cursor: 'pointer', fontSize: '0.78rem',
                              transition: 'all 0.15s',
                              fontWeight: isSelected ? 600 : 400,
                            }}
                          >
                            {opt.name}
                            {opt.points > 0 && (
                              <span style={{ fontSize: '0.65rem', color: isSelected ? 'var(--color-primary)' : 'rgba(255,255,255,0.3)', marginLeft: '0.3rem' }}>
                                +{opt.points}pts
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* No config needed message */}
          {!canChangeCount && (!datasheet.wargear_options || datasheet.wargear_options.length === 0) && (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: 'rgba(255,255,255,0.3)', fontSize: '0.82rem' }}>
              Esta unidad no tiene opciones de configuración.
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '0.85rem 1.25rem',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'rgba(0,0,0,0.3)',
        }}>
          <div>
            <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-display)' }}>
              {modelCount} modelo{modelCount !== 1 ? 's' : ''}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-primary)' }}>
              {pts}<span style={{ fontSize: '0.65rem', opacity: 0.6 }}>pts</span>
            </span>
            <button
              onClick={handleConfirm}
              style={{
                padding: '0.5rem 1.25rem',
                background: 'linear-gradient(135deg, rgba(0,212,255,0.25), rgba(123,47,255,0.15))',
                border: '1px solid rgba(0,212,255,0.5)',
                borderRadius: '10px', color: 'var(--color-primary)',
                cursor: 'pointer', fontFamily: 'var(--font-display)',
                fontSize: '0.8rem', letterSpacing: '1px', fontWeight: 700,
                transition: 'all 0.2s',
              }}
            >
              AÑADIR
            </button>
          </div>
        </div>
      </motion.div>
    </>
  )
}

/* ─── DatasheetCard ───────────────────────────────────────────────────── */
function DatasheetCard({ datasheet, onAdd, added }) {
  const [expanded, setExpanded] = useState(false)
  const roleBg = ROLE_COLOR[datasheet.role] || '#888'

  const tiers = datasheet.cost_thresholds
  const ptsLabel = tiers?.length > 1
    ? `${tiers[0].cost} / ${tiers[tiers.length - 1].cost} pts`
    : `${datasheet.base_points} pts`

  return (
    <motion.div
      layout
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid ${added ? 'rgba(0,212,255,0.4)' : 'rgba(255,255,255,0.08)'}`,
        borderLeft: `3px solid ${roleBg}`,
        borderRadius: '8px', padding: '0.75rem',
        transition: 'border-color 0.2s',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.2rem' }}>
            <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-display)', letterSpacing: '1px', color: roleBg, background: `${roleBg}20`, padding: '1px 6px', borderRadius: '4px' }}>
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
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem', flexShrink: 0 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)', textAlign: 'right' }}>
            {ptsLabel}
          </div>
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <button
              onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}
              title="Ver detalles"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px', color: '#aaa', cursor: 'pointer', padding: '3px 7px', fontSize: '0.7rem' }}
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
                  <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-display)', letterSpacing: '1px', marginBottom: '0.3rem' }}>CARACTERÍSTICAS</div>
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
              {/* Keywords */}
              {(datasheet.keywords?.length > 0 || datasheet.faction_keywords?.length > 0) && (
                <div style={{ marginBottom: '0.6rem', display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                  {datasheet.faction_keywords?.map((kw, i) => (
                    <span key={`fkw-${i}`} style={{ fontSize: '0.6rem', background: 'rgba(0,212,255,0.1)', color: 'var(--color-primary)', padding: '1px 6px', borderRadius: '3px', fontFamily: 'var(--font-display)', letterSpacing: '0.5px' }}>{kw}</span>
                  ))}
                  {datasheet.keywords?.map((kw, i) => (
                    <span key={`kw-${i}`} style={{ fontSize: '0.6rem', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', padding: '1px 6px', borderRadius: '3px', fontFamily: 'var(--font-display)', letterSpacing: '0.5px' }}>{kw}</span>
                  ))}
                </div>
              )}
              {/* Weapons */}
              {datasheet.weapons?.length > 0 && (
                <div style={{ marginBottom: '0.6rem' }}>
                  <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-display)', letterSpacing: '1px', marginBottom: '0.3rem' }}>ARMAS</div>
                  {datasheet.weapons.map((w, i) => (
                    <div key={i} style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', marginBottom: '0.15rem', paddingLeft: '0.5rem', borderLeft: '2px solid rgba(255,255,255,0.1)' }}>
                      <span style={{ color: '#fff', fontWeight: 500 }}>{w.name}</span>
                      {w.range && w.range !== 'Melee' && <span style={{ color: 'rgba(255,255,255,0.4)' }}> · {w.range}</span>}
                      {(w.strength || w.ap || w.damage) && (
                        <span style={{ color: 'rgba(255,255,255,0.4)' }}>
                          {w.strength ? ` · F${w.strength}` : ''}
                          {w.ap ? ` PA${w.ap}` : ''}
                          {w.damage ? ` D${w.damage}` : ''}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {/* Abilities */}
              {datasheet.abilities?.length > 0 && (
                <div style={{ marginBottom: '0.5rem' }}>
                  <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-display)', letterSpacing: '1px', marginBottom: '0.3rem' }}>HABILIDADES</div>
                  {datasheet.abilities.map((a, i) => (
                    <div key={i} style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.3rem' }}>
                      <span style={{ color: '#ffd700', fontWeight: 600 }}>{a.name}: </span>{a.text}
                    </div>
                  ))}
                </div>
              )}
              {/* Wargear options */}
              {datasheet.wargear_options?.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-display)', letterSpacing: '1px', marginBottom: '0.3rem' }}>OPCIONES DE EQUIPO</div>
                  {datasheet.wargear_options.map((group, i) => (
                    <div key={i} style={{ marginBottom: '0.25rem', paddingLeft: '0.5rem', borderLeft: '2px solid rgba(255,255,255,0.08)' }}>
                      <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>
                        {group.name}{group.min != null && group.max != null && group.min !== group.max ? ` (${group.min}–${group.max})` : ''}:{' '}
                      </span>
                      {group.options?.map((opt, j) => (
                        <span key={j} style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.55)' }}>
                          {j > 0 ? ' · ' : ''}{opt.name}
                          {opt.points > 0 ? <span style={{ color: 'var(--color-primary)', fontSize: '0.6rem' }}> +{opt.points}pts</span> : null}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ─── ArmyUnitRow ─────────────────────────────────────────────────────── */
function ArmyUnitRow({ unit, onRemove, onChangeCount, onEdit }) {
  const roleBg = ROLE_COLOR[unit.role] || '#888'
  const pts = unitPoints(unit)
  const canChangeCount = unit.model_count_min !== unit.model_count_max
  const hasOptions = unit.wargear_options?.length > 0
  const [expanded, setExpanded] = useState(false)

  // Collect selected weapon labels for display
  const selectionSummary = []
  if (unit.selected_options && unit.wargear_options) {
    for (const group of unit.wargear_options) {
      const sel = unit.selected_options[group.name]
      if (!sel) continue
      const label = Array.isArray(sel)
        ? sel.length > 0 ? sel.join(', ') : null
        : sel
      if (label) selectionSummary.push(label)
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      style={{
        padding: '0.6rem 0.75rem',
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '8px',
        border: `1px solid rgba(255,255,255,0.06)`,
        borderLeft: `3px solid ${roleBg}`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.82rem', color: '#fff', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {unit.name}
          </div>
          {selectionSummary.length > 0 && (
            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', marginTop: '0.1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {selectionSummary.join(' · ')}
            </div>
          )}
          {canChangeCount && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.3rem' }}>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-primary)', fontFamily: 'var(--font-display)' }}>
            {pts}<span style={{ fontSize: '0.58rem', opacity: 0.5 }}>pts</span>
          </span>
          {hasOptions && (
            <button
              onClick={() => onEdit(unit)}
              title="Editar equipo"
              style={{ background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: '6px', color: '#ffd700', cursor: 'pointer', padding: '2px 6px', fontSize: '0.7rem' }}
            >✎</button>
          )}
          <button
            onClick={() => onRemove(unit.instanceId)}
            style={{ background: 'rgba(255,68,102,0.1)', border: '1px solid rgba(255,68,102,0.25)', borderRadius: '6px', color: '#ff6464', cursor: 'pointer', padding: '2px 8px', fontSize: '0.8rem' }}
          >✕</button>
        </div>
      </div>
    </motion.div>
  )
}

/* ─── main page ───────────────────────────────────────────────────────── */
export default function ArmyBuilderPage() {
  const { listId } = useParams()
  const navigate = useNavigate()
  const ownerId = getOrCreateUserId()

  const [factions, setFactions] = useState([])
  const [selectedFaction, setSelectedFaction] = useState(null)
  const [factionDetail, setFactionDetail] = useState(null)
  const [myLists, setMyLists] = useState([])
  const [loadingFactions, setLoadingFactions] = useState(true)
  const [loadingFaction, setLoadingFaction] = useState(false)

  const [currentList, setCurrentList] = useState(null)
  const [listName, setListName] = useState('Mi Lista')
  const [selectedDetachment, setSelectedDetachment] = useState('')
  const [gameSize, setGameSize] = useState(2000)
  const [units, setUnits] = useState([])

  const [activeTab, setActiveTab] = useState('browser')
  const [roleFilter, setRoleFilter] = useState('all')
  const [unitSearch, setUnitSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [exportText, setExportText] = useState('')
  const [showExport, setShowExport] = useState(false)

  // Unit config modal state
  const [configDatasheet, setConfigDatasheet] = useState(null) // null = closed
  const [editingUnit, setEditingUnit] = useState(null)         // unit being re-edited

  const saveTimer = useRef(null)

  useEffect(() => {
    document.title = 'Army Builder | The Immaterium';
  }, [])

  useEffect(() => {
    api.getBuilderFactions()
      .then(data => setFactions(data.results || data))
      .catch(console.error)
      .finally(() => setLoadingFactions(false))
  }, [])

  useEffect(() => {
    api.getBuilderLists(ownerId)
      .then(data => setMyLists(data.results || data))
      .catch(console.error)
  }, [ownerId])

  useEffect(() => {
    if (!selectedFaction) { setFactionDetail(null); return }
    setLoadingFaction(true)
    api.getBuilderFaction(selectedFaction.id)
      .then(data => {
        setFactionDetail(data)
        if (data.detachments?.length > 0 && !selectedDetachment) {
          setSelectedDetachment(data.detachments[0].name)
        }
      })
      .catch(console.error)
      .finally(() => setLoadingFaction(false))
  }, [selectedFaction])

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

  /* Open config modal for a new unit */
  const openAddConfig = (datasheet) => {
    setEditingUnit(null)
    setConfigDatasheet(datasheet)
  }

  /* Confirm from modal: add new or update existing */
  const handleConfigConfirm = (configuredUnit) => {
    if (editingUnit) {
      // Replace existing unit (keep instanceId from editing unit)
      setUnits(prev => prev.map(u =>
        u.instanceId === editingUnit.instanceId
          ? { ...configuredUnit, instanceId: editingUnit.instanceId }
          : u
      ))
    } else {
      setUnits(prev => [...prev, configuredUnit])
    }
    setConfigDatasheet(null)
    setEditingUnit(null)
    setActiveTab('list')
  }

  const openEditConfig = (unit) => {
    // Rebuild a fake "datasheet" from the unit's saved data
    const ds = {
      id:               unit.datasheetId,
      name:             unit.name,
      role:             unit.role,
      base_points:      unit.base_points,
      points_per_model: unit.points_per_model,
      cost_thresholds:  unit.cost_thresholds || [],
      model_count_min:  unit.model_count_min,
      model_count_max:  unit.model_count_max,
      wargear_options:  unit.wargear_options || [],
    }
    setEditingUnit(unit)
    setConfigDatasheet(ds)
  }

  const removeUnit = (instanceId) => {
    setUnits(prev => prev.filter(u => u.instanceId !== instanceId))
  }

  const changeCount = (instanceId, newCount) => {
    setUnits(prev => prev.map(u =>
      u.instanceId === instanceId ? { ...u, model_count: newCount } : u
    ))
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
    lines.push(`Límite: ${gameSize}pts`)
    lines.push('')

    const byRole = {}
    units.forEach(u => {
      if (!byRole[u.role]) byRole[u.role] = []
      byRole[u.role].push(u)
    })

    ROLE_ORDER.forEach(role => {
      if (!byRole[role]?.length) return
      lines.push(`== ${role.toUpperCase()} ==`)
      byRole[role].forEach(u => {
        const pts = unitPoints(u)
        const countStr = u.model_count_min !== u.model_count_max ? ` [${u.model_count} modelos]` : ''
        lines.push(`  + ${u.name}${countStr} [${pts}pts]`)

        // Selected wargear
        if (u.selected_options && u.wargear_options?.length > 0) {
          for (const group of u.wargear_options) {
            const sel = u.selected_options[group.name]
            if (!sel) continue
            const label = Array.isArray(sel)
              ? sel.length > 0 ? sel.join(', ') : null
              : sel
            if (label) lines.push(`      ${group.name}: ${label}`)
          }
        }
      })
      lines.push('')
    })

    lines.push(`++ Total: ${totalPoints}/${gameSize}pts ++`)
    return lines.join('\n')
  }

  const datasheets = factionDetail?.datasheets || []
  const filteredDatasheets = datasheets.filter(d => {
    const matchRole = roleFilter === 'all' || d.role === roleFilter
    const matchSearch = !unitSearch || d.name.toLowerCase().includes(unitSearch.toLowerCase())
    return matchRole && matchSearch
  })

  const rolesAvailable = [...new Set(datasheets.map(d => d.role))].sort(
    (a, b) => ROLE_ORDER.indexOf(a) - ROLE_ORDER.indexOf(b)
  )

  const unitsByRole = {}
  units.forEach(u => {
    if (!unitsByRole[u.role]) unitsByRole[u.role] = []
    unitsByRole[u.role].push(u)
  })

  /* ─── Render ─── */
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-darker)', color: 'var(--color-light)', paddingTop: '80px' }}>

      <Navbar />

      {/* Unit config modal */}
      <AnimatePresence>
        {configDatasheet && (
          <UnitConfigModal
            key={configDatasheet.id + (editingUnit?.instanceId || 'new')}
            datasheet={configDatasheet}
            onConfirm={handleConfigConfirm}
            onClose={() => { setConfigDatasheet(null); setEditingUnit(null) }}
          />
        )}
      </AnimatePresence>

      {/* Page header */}
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
                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ fontSize: '0.8rem', color: saveMsg.startsWith('✓') ? '#4caf50' : '#ff4466', fontFamily: 'var(--font-display)' }}
              >
                {saveMsg}
              </motion.span>
            )}
            <button
              onClick={() => navigate(-1)}
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: '0.5rem 1rem', fontSize: '0.8rem', fontFamily: 'var(--font-display)', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '0.35rem', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
            >
              ← SALIR
            </button>
            <button onClick={newList} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', padding: '0.5rem 1rem', fontSize: '0.8rem', fontFamily: 'var(--font-display)', letterSpacing: '1px' }}>
              + NUEVA LISTA
            </button>
            {units.length > 0 && (
              <>
                <button onClick={() => saveList(true)} disabled={saving} style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.35)', borderRadius: '8px', color: 'var(--color-primary)', cursor: 'pointer', padding: '0.5rem 1rem', fontSize: '0.8rem', fontFamily: 'var(--font-display)', letterSpacing: '1px', opacity: saving ? 0.6 : 1 }}>
                  {saving ? '…' : '💾 GUARDAR'}
                </button>
                <button onClick={() => { setExportText(generateExportText()); setShowExport(true) }} style={{ background: 'rgba(123,47,255,0.1)', border: '1px solid rgba(123,47,255,0.35)', borderRadius: '8px', color: 'var(--color-secondary)', cursor: 'pointer', padding: '0.5rem 1rem', fontSize: '0.8rem', fontFamily: 'var(--font-display)', letterSpacing: '1px' }}>
                  ↗ EXPORTAR
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1.5rem clamp(1rem, 4vw, 3rem)', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 420px)', gap: '1.5rem' }}>

        {/* LEFT: Browser / My Lists */}
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

          {/* BROWSER */}
          {activeTab === 'browser' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Faction selector */}
              <div>
                <div style={{ fontSize: '0.65rem', fontFamily: 'var(--font-display)', letterSpacing: '2px', color: 'rgba(255,255,255,0.35)', marginBottom: '0.5rem' }}>FACCIÓN</div>
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
                              {f.name}
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
                  <div style={{ fontSize: '0.65rem', fontFamily: 'var(--font-display)', letterSpacing: '2px', color: 'rgba(255,255,255,0.35)', marginBottom: '0.5rem' }}>DESTACAMENTO</div>
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
                    return d?.ability_text ? (
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
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem', alignItems: 'center' }}>
                    <input
                      type="text"
                      value={unitSearch}
                      onChange={e => setUnitSearch(e.target.value)}
                      placeholder="Buscar unidad…"
                      style={{ flex: '1 1 150px', padding: '0.4rem 0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '0.82rem', outline: 'none', fontFamily: 'var(--font-body)' }}
                    />
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                      <button onClick={() => setRoleFilter('all')} style={{ padding: '0.3rem 0.7rem', background: roleFilter === 'all' ? 'rgba(255,255,255,0.15)' : 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff', cursor: 'pointer', fontSize: '0.72rem' }}>
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
                          onAdd={openAddConfig}
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
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', letterSpacing: '2px' }}>SELECCIONA UNA FACCIÓN</div>
                  <div style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: 'rgba(255,255,255,0.2)' }}>para empezar a construir tu lista</div>
                </div>
              )}
            </div>
          )}

          {/* MY LISTS */}
          {activeTab === 'mylists' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {myLists.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'rgba(255,255,255,0.3)' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📋</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', letterSpacing: '2px' }}>NO TIENES LISTAS GUARDADAS</div>
                  <div style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>Crea tu primera lista en el builder</div>
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
                      borderRadius: '10px', cursor: 'pointer',
                    }}
                    onClick={() => loadList(list)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: '#fff', marginBottom: '0.25rem' }}>{list.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{list.faction_name || 'Sin facción'} · {list.detachment || 'Sin destacamento'}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', color: list.total_points > list.game_size ? '#ff4466' : 'var(--color-primary)', fontWeight: 700 }}>
                          {list.total_points}/{list.game_size}
                        </span>
                        <button
                          onClick={e => { e.stopPropagation(); deleteList(list.id) }}
                          style={{ background: 'rgba(255,68,102,0.1)', border: '1px solid rgba(255,68,102,0.2)', borderRadius: '6px', color: '#ff6464', cursor: 'pointer', padding: '2px 8px', fontSize: '0.75rem' }}
                        >✕</button>
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

        {/* RIGHT: Current List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'sticky', top: '90px', alignSelf: 'start', maxHeight: 'calc(100vh - 110px)', overflowY: 'auto' }}>
          {/* List header */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1rem' }}>
            <input
              type="text"
              value={listName}
              onChange={e => setListName(e.target.value)}
              style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontFamily: 'var(--font-display)', fontSize: '1rem', letterSpacing: '1px', padding: '0 0 0.4rem', outline: 'none', marginBottom: '0.75rem', boxSizing: 'border-box' }}
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

          {/* Units */}
          {units.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px dashed rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>+</div>
              <div style={{ fontSize: '0.8rem', fontFamily: 'var(--font-display)', letterSpacing: '1px' }}>AÑADE UNIDADES DESDE EL NAVEGADOR</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {ROLE_ORDER.filter(r => unitsByRole[r]?.length).map(role => (
                <div key={role}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.65rem', fontFamily: 'var(--font-display)', letterSpacing: '2px', color: ROLE_COLOR[role], marginBottom: '0.4rem' }}>
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
                          onEdit={openEditConfig}
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowExport(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(5px)', zIndex: 300 }} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 'min(620px, 93vw)', maxHeight: '82vh', background: 'rgba(10,10,26,0.98)', border: '1px solid rgba(0,212,255,0.25)', borderRadius: '16px', padding: '1.5rem', zIndex: 400, display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', margin: 0, color: 'var(--color-primary)', letterSpacing: '2px', fontSize: '0.9rem' }}>EXPORTAR LISTA</h3>
                <button onClick={() => setShowExport(false)} style={{ background: 'transparent', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
              </div>
              <textarea
                readOnly
                value={exportText}
                style={{ flex: 1, minHeight: '320px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#ccc', fontFamily: 'monospace', fontSize: '0.8rem', padding: '0.75rem', resize: 'vertical', outline: 'none' }}
              />
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => navigator.clipboard.writeText(exportText)}
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
