import React, { useEffect, useState, useCallback } from 'react'
import { useStore } from '../../stores/useStore'
import { useToast } from './Toast'

const API_URL = import.meta.env.VITE_API_URL || ''

const BRAND_CHOICES = [
  { value: 'citadel',      label: 'Citadel' },
  { value: 'vallejo',      label: 'Vallejo' },
  { value: 'army_painter', label: 'Army Painter' },
  { value: 'ak',           label: 'AK Interactive' },
  { value: 'scale75',      label: 'Scale 75' },
  { value: 'reaper',       label: 'Reaper' },
  { value: 'ammo',         label: 'AMMO by Mig' },
  { value: 'other',        label: 'Otro' },
]

const EMPTY_FORM = { brand: 'citadel', range: '', name: '', color: '#888888', code: '' }

const inputStyle = {
  width: '100%',
  padding: '0.6rem 0.85rem',
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '0.9rem',
  fontFamily: 'var(--font-body)',
  outline: 'none',
  boxSizing: 'border-box',
}

const btnStyle = (variant = 'primary') => ({
  padding: '0.55rem 1.25rem',
  borderRadius: '8px',
  border: 'none',
  cursor: 'pointer',
  fontSize: '0.85rem',
  fontFamily: 'var(--font-body)',
  fontWeight: 600,
  transition: 'all 0.2s',
  ...(variant === 'primary' ? {
    background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
    color: '#000',
  } : variant === 'danger' ? {
    background: 'rgba(255,68,102,0.15)',
    color: '#ff6464',
    border: '1px solid rgba(255,68,102,0.3)',
  } : {
    background: 'rgba(255,255,255,0.07)',
    color: 'rgba(255,255,255,0.7)',
    border: '1px solid rgba(255,255,255,0.12)',
  }),
})

export default function PaintManager() {
  const token = useStore(s => s.token)
  const { addToast } = useToast()

  const [paints, setPaints]       = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [filterBrand, setFilterBrand] = useState('')
  const [showForm, setShowForm]   = useState(false)
  const [editing, setEditing]     = useState(null)   // paint object or null
  const [form, setForm]           = useState(EMPTY_FORM)
  const [saving, setSaving]       = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const fetchPaints = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search)      params.set('search', search)
      if (filterBrand) params.set('search', filterBrand + (search ? ' ' + search : ''))
      const res = await fetch(`${API_URL}/api/paints/?${params}&ordering=brand,range,name&limit=500`)
      const data = await res.json()
      setPaints(data.results || data)
    } catch {
      addToast('Error al cargar pinturas', 'error')
    } finally {
      setLoading(false)
    }
  }, [search, filterBrand])

  useEffect(() => { fetchPaints() }, [fetchPaints])

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  const openEdit = (paint) => {
    setEditing(paint)
    setForm({ brand: paint.brand, range: paint.range, name: paint.name, color: paint.color, code: paint.code || '' })
    setShowForm(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.range.trim()) {
      addToast('Nombre y gama son obligatorios', 'error')
      return
    }
    setSaving(true)
    try {
      const method = editing ? 'PATCH' : 'POST'
      const url    = editing ? `${API_URL}/api/paints/${editing.id}/` : `${API_URL}/api/paints/`
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Token ${token}` },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(Object.values(err).flat().join(' ') || 'Error al guardar')
      }
      addToast(editing ? 'Pintura actualizada' : 'Pintura creada', 'success')
      setShowForm(false)
      fetchPaints()
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (paint) => {
    if (!confirm(`¿Borrar "${paint.name}"?`)) return
    setDeletingId(paint.id)
    try {
      const res = await fetch(`${API_URL}/api/paints/${paint.id}/`, {
        method: 'DELETE',
        headers: { Authorization: `Token ${token}` },
      })
      if (!res.ok) throw new Error('Error al borrar')
      addToast('Pintura eliminada', 'success')
      fetchPaints()
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setDeletingId(null)
    }
  }

  // Group by brand
  const grouped = paints.reduce((acc, p) => {
    const key = p.brand_display || p.brand
    if (!acc[key]) acc[key] = []
    acc[key].push(p)
    return acc
  }, {})

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: '#fff', margin: 0, letterSpacing: '1px' }}>
            Catálogo de Pinturas
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', margin: '0.3rem 0 0' }}>
            {paints.length} pintura{paints.length !== 1 ? 's' : ''} registrada{paints.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button style={btnStyle('primary')} onClick={openCreate}>
          + Nueva Pintura
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input
          placeholder="Buscar por nombre, gama, código..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...inputStyle, maxWidth: '320px', flex: 1 }}
        />
        <select
          value={filterBrand}
          onChange={e => setFilterBrand(e.target.value)}
          style={{ ...inputStyle, maxWidth: '200px' }}
        >
          <option value="">Todas las marcas</option>
          {BRAND_CHOICES.map(b => (
            <option key={b.value} value={b.value}>{b.label}</option>
          ))}
        </select>
      </div>

      {/* Form modal */}
      {showForm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem',
        }}>
          <div style={{
            background: 'var(--color-dark)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px',
            padding: '2rem',
            width: '100%',
            maxWidth: '480px',
          }}>
            <h2 style={{ fontFamily: 'var(--font-display)', color: '#fff', margin: '0 0 1.5rem', letterSpacing: '1px' }}>
              {editing ? 'Editar Pintura' : 'Nueva Pintura'}
            </h2>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Brand */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.4rem', letterSpacing: '0.5px' }}>
                  MARCA *
                </label>
                <select
                  value={form.brand}
                  onChange={e => setForm(f => ({ ...f, brand: e.target.value }))}
                  style={inputStyle}
                >
                  {BRAND_CHOICES.map(b => (
                    <option key={b.value} value={b.value}>{b.label}</option>
                  ))}
                </select>
              </div>

              {/* Range */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.4rem', letterSpacing: '0.5px' }}>
                  GAMA *
                </label>
                <input
                  value={form.range}
                  onChange={e => setForm(f => ({ ...f, range: e.target.value }))}
                  placeholder="Ej: Base, Layer, Contrast, Model Color..."
                  style={inputStyle}
                />
              </div>

              {/* Name */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.4rem', letterSpacing: '0.5px' }}>
                  NOMBRE *
                </label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Ej: Abaddon Black"
                  style={inputStyle}
                />
              </div>

              {/* Color + code row */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.4rem', letterSpacing: '0.5px' }}>
                    COLOR HEX
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input
                      type="color"
                      value={form.color}
                      onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                      style={{
                        width: '44px', height: '38px',
                        padding: '2px', border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: '8px', background: 'rgba(255,255,255,0.06)',
                        cursor: 'pointer',
                      }}
                    />
                    <input
                      value={form.color}
                      onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                      placeholder="#888888"
                      maxLength={7}
                      style={{ ...inputStyle, fontFamily: 'monospace' }}
                    />
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.4rem', letterSpacing: '0.5px' }}>
                    CÓDIGO (opcional)
                  </label>
                  <input
                    value={form.code}
                    onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
                    placeholder="Ej: GMC-022"
                    style={{ ...inputStyle, fontFamily: 'monospace' }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" style={btnStyle('ghost')} onClick={() => setShowForm(false)}>
                  Cancelar
                </button>
                <button type="submit" style={btnStyle('primary')} disabled={saving}>
                  {saving ? 'Guardando...' : (editing ? 'Guardar cambios' : 'Crear pintura')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Paint list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.4)' }}>
          Cargando...
        </div>
      ) : paints.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '3rem',
          background: 'rgba(255,255,255,0.025)', borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.07)',
          color: 'rgba(255,255,255,0.35)', fontSize: '0.95rem',
        }}>
          No hay pinturas. Crea la primera con el botón de arriba.
        </div>
      ) : (
        Object.entries(grouped).map(([brand, items]) => (
          <div key={brand} style={{ marginBottom: '2rem' }}>
            <h3 style={{
              fontFamily: 'var(--font-display)', fontSize: '0.75rem',
              letterSpacing: '3px', textTransform: 'uppercase',
              color: 'var(--color-secondary)', opacity: 0.8,
              marginBottom: '0.75rem',
            }}>
              {brand} <span style={{ opacity: 0.5, fontFamily: 'var(--font-body)', letterSpacing: 0 }}>({items.length})</span>
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '0.6rem',
            }}>
              {items.map(paint => (
                <div key={paint.id} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '10px',
                  padding: '0.65rem 0.9rem',
                }}>
                  {/* Color swatch */}
                  <span style={{
                    width: '28px', height: '28px', flexShrink: 0,
                    borderRadius: '6px', background: paint.color,
                    border: '1px solid rgba(255,255,255,0.18)',
                    display: 'inline-block',
                  }} />

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: '#fff', fontSize: '0.88rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {paint.name}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem' }}>
                      {paint.range}{paint.code ? ` · ${paint.code}` : ''}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0 }}>
                    <button
                      onClick={() => openEdit(paint)}
                      title="Editar"
                      style={{
                        padding: '4px 8px', borderRadius: '6px',
                        background: 'rgba(255,255,255,0.07)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: 'rgba(255,255,255,0.6)', cursor: 'pointer',
                        fontSize: '0.8rem',
                      }}
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => handleDelete(paint)}
                      disabled={deletingId === paint.id}
                      title="Borrar"
                      style={{
                        padding: '4px 8px', borderRadius: '6px',
                        background: 'rgba(255,68,102,0.1)',
                        border: '1px solid rgba(255,68,102,0.25)',
                        color: '#ff6464', cursor: 'pointer',
                        fontSize: '0.8rem',
                      }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
