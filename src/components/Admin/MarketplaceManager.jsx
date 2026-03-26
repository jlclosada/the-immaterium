import React, { useEffect, useState, useCallback } from 'react'
import ReactDOM from 'react-dom'
import { api } from '../../services/api'
import { useStore } from '../../stores/useStore'
import { useToast } from './Toast'

// ── Constants ──────────────────────────────────────────────────────────────

const STATE_OPTIONS = [
  { value: 'sin_montar',      label: 'Sin montar' },
  { value: 'montada',         label: 'Montada' },
  { value: 'imprimada',       label: 'Imprimada' },
  { value: 'pintada_parcial', label: 'Pintada parcial' },
  { value: 'pintada',         label: 'Pintada' },
  { value: 'conversion',      label: 'Conversión' },
]

const STATUS_OPTIONS = [
  { value: 'available', label: 'Disponible' },
  { value: 'reserved',  label: 'Reservado' },
  { value: 'sold',      label: 'Vendido' },
]

const REQUEST_STATUS_OPTIONS = [
  { value: 'pending',    label: 'Pendiente' },
  { value: 'contacted',  label: 'Contactado' },
  { value: 'confirmed',  label: 'Confirmado' },
  { value: 'closed',     label: 'Cerrado / Vendido' },
  { value: 'cancelled',  label: 'Cancelado' },
]

const STATE_META = {
  sin_montar:      { color: '#b0b0b8', bg: 'rgba(160,160,170,0.15)' },
  montada:         { color: '#6ab0f5', bg: 'rgba(60,130,220,0.15)' },
  imprimada:       { color: '#f0924a', bg: 'rgba(230,120,30,0.15)' },
  pintada_parcial: { color: '#e8d040', bg: 'rgba(220,190,30,0.15)' },
  pintada:         { color: '#40c878', bg: 'rgba(40,200,100,0.15)' },
  conversion:      { color: '#c078f0', bg: 'rgba(160,60,220,0.15)' },
}

const STATUS_META = {
  available: { color: '#40c878', bg: 'rgba(40,200,100,0.15)', border: 'rgba(40,200,100,0.35)' },
  reserved:  { color: '#e8d040', bg: 'rgba(220,190,30,0.15)',  border: 'rgba(220,190,30,0.35)'  },
  sold:      { color: '#888890', bg: 'rgba(120,120,130,0.15)', border: 'rgba(120,120,130,0.3)'  },
}

const REQUEST_STATUS_META = {
  pending:   { color: '#e8d040', bg: 'rgba(220,190,30,0.15)' },
  contacted: { color: '#6ab0f5', bg: 'rgba(60,130,220,0.15)' },
  confirmed: { color: '#40c878', bg: 'rgba(40,200,100,0.15)' },
  closed:    { color: '#b07af5', bg: 'rgba(140,80,220,0.15)' },
  cancelled: { color: '#ff6464', bg: 'rgba(255,68,102,0.15)' },
}

const EMPTY_FORM = {
  title: '',
  description: '',
  state: 'sin_montar',
  price: '',
  faction: '',
  game: '',
  tags: [],
  images: [],
  status: 'available',
}

// ── Shared styles ──────────────────────────────────────────────────────────

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

const labelStyle = {
  display: 'block',
  fontSize: '0.78rem',
  letterSpacing: '0.5px',
  color: 'rgba(255,255,255,0.4)',
  marginBottom: '0.35rem',
  textTransform: 'uppercase',
}

const btnStyle = (variant = 'primary') => ({
  padding: '0.55rem 1.2rem',
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

// ── Badge helpers ──────────────────────────────────────────────────────────

function StateBadge({ state, stateDisplay }) {
  const meta = STATE_META[state] || { color: '#aaa', bg: 'rgba(255,255,255,0.1)' }
  return (
    <span style={{
      padding: '0.15rem 0.5rem', borderRadius: '6px',
      fontSize: '0.72rem', fontWeight: 600,
      background: meta.bg, color: meta.color,
    }}>
      {stateDisplay || state}
    </span>
  )
}

function StatusBadge({ status, statusDisplay }) {
  const meta = STATUS_META[status] || STATUS_META.available
  return (
    <span style={{
      padding: '0.15rem 0.5rem', borderRadius: '6px',
      fontSize: '0.72rem', fontWeight: 700,
      background: meta.bg, color: meta.color,
      border: `1px solid ${meta.border}`,
    }}>
      {statusDisplay || status}
    </span>
  )
}

// ── Form Modal (portal) ────────────────────────────────────────────────────

function ListingFormModal({ editing, onClose, onSaved, token, addToast }) {
  const [form, setForm] = useState(
    editing
      ? {
          title: editing.title || '',
          description: editing.description || '',
          state: editing.state || 'sin_montar',
          price: editing.price != null ? String(editing.price) : '',
          faction: editing.faction || '',
          game: editing.game || '',
          tags: Array.isArray(editing.tags) ? editing.tags : [],
          images: Array.isArray(editing.images) ? editing.images : [],
          status: editing.status || 'available',
        }
      : { ...EMPTY_FORM }
  )
  const [tagInput, setTagInput] = useState('')
  const [imageInput, setImageInput] = useState('')
  const [saving, setSaving] = useState(false)

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const addTag = () => {
    const t = tagInput.trim()
    if (t && !form.tags.includes(t)) {
      setForm(f => ({ ...f, tags: [...f.tags, t] }))
    }
    setTagInput('')
  }

  const removeTag = (tag) => setForm(f => ({ ...f, tags: f.tags.filter(t => t !== tag) }))

  const addImage = () => {
    const u = imageInput.trim()
    if (u && !form.images.includes(u)) {
      setForm(f => ({ ...f, images: [...f.images, u] }))
    }
    setImageInput('')
  }

  const removeImage = (url) => setForm(f => ({ ...f, images: f.images.filter(i => i !== url) }))

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) {
      addToast('El título es obligatorio', 'error')
      return
    }
    setSaving(true)
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        state: form.state,
        price: form.price !== '' ? parseFloat(form.price) : null,
        faction: form.faction.trim(),
        game: form.game.trim(),
        tags: form.tags,
        images: form.images,
      }
      if (editing) payload.status = form.status

      let result
      if (editing) {
        result = await api.updateListing(editing.id, payload, token)
      } else {
        result = await api.createListing(payload, token)
      }
      addToast(editing ? 'Anuncio actualizado' : 'Anuncio creado', 'success')
      onSaved(result)
    } catch (err) {
      addToast(err.message || 'Error al guardar', 'error')
    } finally {
      setSaving(false)
    }
  }

  return ReactDOM.createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.78)',
        backdropFilter: 'blur(5px)',
        zIndex: 1500,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem', overflowY: 'auto',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--color-dark)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '18px',
          padding: '2rem',
          width: '100%',
          maxWidth: '640px',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', color: '#fff', fontSize: '1.15rem', letterSpacing: '1px' }}>
            {editing ? 'Editar anuncio' : 'Nuevo anuncio'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '1.1rem' }}>✕</button>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          {/* Title */}
          <div>
            <label style={labelStyle}>Título *</label>
            <input value={form.title} onChange={set('title')} placeholder="Nombre de la miniatura o lote" style={inputStyle} required />
          </div>

          {/* Description */}
          <div>
            <label style={labelStyle}>Descripción</label>
            <textarea
              value={form.description}
              onChange={set('description')}
              placeholder="Describe el estado, detalles, historia..."
              rows={4}
              style={{ ...inputStyle, resize: 'vertical', minHeight: '90px' }}
            />
          </div>

          {/* State selector (visual chips) */}
          <div>
            <label style={labelStyle}>Estado de la miniatura</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {STATE_OPTIONS.map(opt => {
                const meta = STATE_META[opt.value] || {}
                const active = form.state === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, state: opt.value }))}
                    style={{
                      padding: '0.4rem 0.85rem',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontFamily: 'var(--font-body)',
                      fontWeight: active ? 700 : 400,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      background: active ? meta.bg : 'rgba(255,255,255,0.04)',
                      color: active ? meta.color : 'rgba(255,255,255,0.5)',
                      border: active
                        ? `1px solid ${meta.color}55`
                        : '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Price + faction row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={labelStyle}>Precio (€)</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  min="0" step="0.01"
                  value={form.price}
                  onChange={set('price')}
                  placeholder="0.00"
                  style={{ ...inputStyle, paddingRight: '2rem' }}
                />
                <span style={{
                  position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                  color: 'rgba(255,255,255,0.35)', fontSize: '0.85rem', pointerEvents: 'none',
                }}>€</span>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Facción</label>
              <input value={form.faction} onChange={set('faction')} placeholder="Ej: Space Marines" style={inputStyle} />
            </div>
          </div>

          {/* Game */}
          <div>
            <label style={labelStyle}>Juego (opcional)</label>
            <input value={form.game} onChange={set('game')} placeholder="Ej: Warhammer 40.000, Age of Sigmar..." style={inputStyle} />
          </div>

          {/* Tags chip input */}
          <div>
            <label style={labelStyle}>Etiquetas</label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <input
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
                placeholder="Escribe y pulsa Enter..."
                style={{ ...inputStyle, flex: 1 }}
              />
              <button type="button" onClick={addTag} style={{ ...btnStyle('ghost'), flexShrink: 0 }}>
                + Añadir
              </button>
            </div>
            {form.tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {form.tags.map(tag => (
                  <span key={tag} style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                    padding: '0.2rem 0.65rem',
                    background: 'rgba(0,212,255,0.1)',
                    border: '1px solid rgba(0,212,255,0.25)',
                    borderRadius: '20px',
                    fontSize: '0.78rem', color: 'var(--color-primary)',
                  }}>
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', padding: 0, fontSize: '0.8rem', lineHeight: 1 }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Images URL input */}
          <div>
            <label style={labelStyle}>Imágenes (URLs)</label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <input
                value={imageInput}
                onChange={e => setImageInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addImage() } }}
                placeholder="https://example.com/imagen.jpg"
                style={{ ...inputStyle, flex: 1 }}
              />
              <button type="button" onClick={addImage} style={{ ...btnStyle('ghost'), flexShrink: 0 }}>
                + Añadir
              </button>
            </div>
            {form.images.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {form.images.map((url, i) => (
                  <div key={i} style={{ position: 'relative', width: 72, height: 72 }}>
                    <img
                      src={url}
                      alt=""
                      style={{
                        width: '100%', height: '100%', objectFit: 'cover',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.1)',
                      }}
                      onError={e => { e.target.style.display = 'none' }}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(url)}
                      style={{
                        position: 'absolute', top: -6, right: -6,
                        width: 20, height: 20, borderRadius: '50%',
                        background: 'rgba(255,68,102,0.9)',
                        border: 'none', color: '#fff',
                        cursor: 'pointer', fontSize: '0.75rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, lineHeight: 1,
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Status — only when editing */}
          {editing && (
            <div>
              <label style={labelStyle}>Estado del anuncio</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {STATUS_OPTIONS.map(opt => {
                  const meta = STATUS_META[opt.value] || {}
                  const active = form.status === opt.value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, status: opt.value }))}
                      style={{
                        padding: '0.4rem 0.85rem',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                        fontFamily: 'var(--font-body)',
                        fontWeight: active ? 700 : 400,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        background: active ? meta.bg : 'rgba(255,255,255,0.04)',
                        color: active ? meta.color : 'rgba(255,255,255,0.5)',
                        border: active
                          ? `1px solid ${meta.border}`
                          : '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <button type="button" style={btnStyle('ghost')} onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" style={btnStyle('primary')} disabled={saving}>
              {saving ? 'Guardando...' : (editing ? 'Guardar cambios' : 'Publicar anuncio')}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}

// ── Purchase Requests Panel ────────────────────────────────────────────────

function PurchaseRequestsPanel({ token, listings, addToast }) {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [updatingId, setUpdatingId] = useState(null)
  const [closingRequest, setClosingRequest] = useState(null)
  const [saleForm, setSaleForm] = useState({ final_price: '', sale_notes: '' })

  const loadRequests = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.getPurchaseRequests(token)
      setRequests(Array.isArray(data) ? data : [])
    } catch (err) {
      addToast('Error al cargar solicitudes', 'error')
    } finally {
      setLoading(false)
    }
  }, [token])

  // keep old name as alias for backward compat inside useEffect
  const fetchRequests = loadRequests

  useEffect(() => {
    if (open) fetchRequests()
  }, [open, fetchRequests])

  const handleStatusChange = async (req, newStatus) => {
    if (newStatus === 'closed') {
      setClosingRequest(req)
      setSaleForm({ final_price: req.listing_price != null ? String(req.listing_price) : '', sale_notes: '' })
      return
    }
    setUpdatingId(req.id)
    try {
      await api.setPurchaseRequestStatus(req.id, newStatus, token)
      setRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: newStatus } : r))
      addToast('Estado actualizado', 'success')
    } catch (err) {
      addToast('Error al actualizar estado', 'error')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleCloseSale = async () => {
    const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/purchase-requests/${closingRequest.id}/set-status/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Token ${token}` },
      body: JSON.stringify({ status: 'closed', final_price: parseFloat(saleForm.final_price) || closingRequest.listing_price, sale_notes: saleForm.sale_notes })
    })
    if (response.ok) {
      setClosingRequest(null)
      setSaleForm({ final_price: '', sale_notes: '' })
      loadRequests()
      addToast('Venta cerrada correctamente', 'success')
    } else {
      addToast('Error al cerrar la venta', 'error')
    }
  }

  // Group requests by listing id
  const grouped = requests.reduce((acc, req) => {
    const key = req.listing
    if (!acc[key]) acc[key] = []
    acc[key].push(req)
    return acc
  }, {})

  const getListingTitle = (listingId) => {
    const listing = listings.find(l => l.id === listingId)
    return listing ? listing.title : `Anuncio #${listingId}`
  }

  const getListingPrice = (listingId) => {
    const listing = listings.find(l => l.id === listingId)
    return listing && listing.price != null ? parseFloat(listing.price).toFixed(2) : '—'
  }

  const totalPending = requests.filter(r => r.status === 'pending').length
  const pendingCount = totalPending

  return (
    <div style={{
      marginTop: '2rem',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '14px',
      overflow: 'hidden',
    }}>
      {/* Header toggle */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1rem 1.25rem',
          background: 'rgba(255,255,255,0.03)',
          border: 'none',
          borderBottom: open ? '1px solid rgba(255,255,255,0.07)' : 'none',
          color: '#fff',
          cursor: 'pointer',
          fontFamily: 'var(--font-display)',
          fontSize: '0.88rem',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          textAlign: 'left',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
          Solicitudes de compra
          {totalPending > 0 && (
            <span style={{
              background: 'rgba(255,140,30,0.85)',
              color: '#000',
              borderRadius: '20px',
              padding: '0.1rem 0.55rem',
              fontSize: '0.72rem',
              fontWeight: 700,
            }}>
              {totalPending} pendiente{totalPending !== 1 ? 's' : ''}
            </span>
          )}
        </span>
        <span style={{ fontSize: '0.75rem', opacity: 0.5, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }}>▼</span>
      </button>

      {open && (
        <div style={{ padding: '1.25rem' }}>
          {pendingCount > 0 && (
            <div style={{
              background: 'rgba(255,150,0,0.12)', border: '1px solid rgba(255,150,0,0.4)',
              borderRadius: '10px', padding: '0.75rem 1.25rem',
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              marginBottom: '1.5rem', color: '#ffa500'
            }}>
              <span style={{ fontSize: '1.2rem' }}>🔔</span>
              <span><strong>{pendingCount}</strong> solicitud{pendingCount !== 1 ? 'es' : ''} pendiente{pendingCount !== 1 ? 's' : ''} de respuesta</span>
            </div>
          )}
          {loading ? (
            <p style={{ color: 'rgba(255,255,255,0.35)', textAlign: 'center', padding: '1.5rem' }}>Cargando...</p>
          ) : requests.length === 0 ? (
            <p style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '1.5rem', fontSize: '0.88rem' }}>
              No hay solicitudes de compra todavía.
            </p>
          ) : (
            Object.entries(grouped).map(([listingId, reqs]) => (
              <div key={listingId} style={{ marginBottom: '1.5rem' }}>
                <h4 style={{
                  margin: '0 0 0.75rem',
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.78rem',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  color: 'var(--color-secondary)',
                  opacity: 0.8,
                }}>
                  {getListingTitle(parseInt(listingId))}
                  <span style={{ opacity: 0.45, marginLeft: '0.5rem', fontFamily: 'var(--font-body)', letterSpacing: 0, textTransform: 'none', fontSize: '0.78rem' }}>
                    ({reqs.length})
                  </span>
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {reqs.map(req => {
                    const meta = REQUEST_STATUS_META[req.status] || {}
                    return (
                      <div key={req.id} style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        borderRadius: '10px',
                        padding: '0.9rem 1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.55rem',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <div>
                            <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>
                              {req.name} {req.surname}
                            </span>
                            {req.created_at && (
                              <span style={{ marginLeft: '0.75rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>
                                {new Date(req.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                            )}
                          </div>
                          <span style={{
                            padding: '0.15rem 0.55rem', borderRadius: '6px',
                            fontSize: '0.72rem', fontWeight: 700,
                            background: meta.bg, color: meta.color,
                          }}>
                            {REQUEST_STATUS_OPTIONS.find(o => o.value === req.status)?.label || req.status}
                          </span>
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem 1.25rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
                          <span>📧 <a href={`mailto:${req.email}`} style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>{req.email}</a></span>
                          {req.phone && <span>📞 {req.phone}</span>}
                          {req.address && <span>📍 {req.address}</span>}
                        </div>

                        {req.notes && (
                          <p style={{
                            margin: 0,
                            padding: '0.5rem 0.75rem',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            color: 'rgba(255,255,255,0.5)',
                            fontStyle: 'italic',
                            lineHeight: 1.5,
                          }}>
                            "{req.notes}"
                          </p>
                        )}

                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                          <select
                            value={closingRequest?.id === req.id ? 'closed' : req.status}
                            disabled={updatingId === req.id}
                            onChange={e => handleStatusChange(req, e.target.value)}
                            style={{
                              padding: '0.35rem 0.6rem',
                              background: 'rgba(255,255,255,0.06)',
                              border: '1px solid rgba(255,255,255,0.12)',
                              borderRadius: '6px',
                              color: '#fff',
                              fontSize: '0.8rem',
                              fontFamily: 'var(--font-body)',
                              cursor: 'pointer',
                            }}
                          >
                            {REQUEST_STATUS_OPTIONS.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>

                          <button
                            onClick={() => {
                              const subject = encodeURIComponent(`Solicitud de compra - ${req.listing_title || 'miniatura'}`)
                              const body = encodeURIComponent(`Hola ${req.name},\n\nGracias por tu interés en "${req.listing_title}" (precio: ${req.listing_price}€).\n\nHemos recibido tu solicitud con los siguientes datos:\n- Nombre: ${req.name} ${req.surname}\n- Email: ${req.email}\n- Teléfono: ${req.phone || 'No indicado'}\n- Dirección: ${req.address || 'No indicada'}\n\n${req.notes ? 'Mensaje: ' + req.notes + '\n\n' : ''}Para confirmar la compra, nos pondremos en contacto contigo en los próximos días para coordinar el envío y el pago.\n\nSaludos,\nThe Immaterium`)
                              const mailtoUrl = `mailto:${req.email}?subject=${subject}&body=${body}`
                              window.location.href = mailtoUrl
                            }}
                            style={{
                              padding: '0.35rem 0.75rem',
                              background: 'rgba(0,180,255,0.12)',
                              border: '1px solid rgba(0,180,255,0.3)',
                              borderRadius: '6px',
                              color: '#00c8ff',
                              fontSize: '0.78rem',
                              fontFamily: 'var(--font-body)',
                              cursor: 'pointer',
                              fontWeight: 600,
                            }}
                          >
                            📧 Enviar email
                          </button>
                        </div>

                        {closingRequest?.id === req.id && (
                          <div style={{
                            marginTop: '0.5rem',
                            padding: '1rem',
                            background: 'rgba(140,80,220,0.08)',
                            border: '1px solid rgba(140,80,220,0.25)',
                            borderRadius: '8px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.75rem',
                          }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#b07af5', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              Cerrar venta
                            </div>
                            <div>
                              <label style={labelStyle}>Precio final (€)</label>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={saleForm.final_price}
                                onChange={e => setSaleForm(f => ({ ...f, final_price: e.target.value }))}
                                placeholder={req.listing_price != null ? String(req.listing_price) : '0.00'}
                                style={{ ...inputStyle, maxWidth: '160px' }}
                              />
                            </div>
                            <div>
                              <label style={labelStyle}>Notas del cierre</label>
                              <textarea
                                value={saleForm.sale_notes}
                                onChange={e => setSaleForm(f => ({ ...f, sale_notes: e.target.value }))}
                                placeholder="Notas opcionales sobre el cierre de la venta..."
                                rows={2}
                                style={{ ...inputStyle, resize: 'vertical', minHeight: '60px' }}
                              />
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button
                                onClick={handleCloseSale}
                                style={{
                                  padding: '0.4rem 1rem',
                                  background: 'rgba(140,80,220,0.2)',
                                  border: '1px solid rgba(140,80,220,0.5)',
                                  borderRadius: '7px',
                                  color: '#b07af5',
                                  fontSize: '0.82rem',
                                  fontFamily: 'var(--font-body)',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                }}
                              >
                                Confirmar cierre
                              </button>
                              <button
                                onClick={() => { setClosingRequest(null); setSaleForm({ final_price: '', sale_notes: '' }) }}
                                style={{
                                  padding: '0.4rem 1rem',
                                  background: 'rgba(255,255,255,0.05)',
                                  border: '1px solid rgba(255,255,255,0.1)',
                                  borderRadius: '7px',
                                  color: 'rgba(255,255,255,0.5)',
                                  fontSize: '0.82rem',
                                  fontFamily: 'var(--font-body)',
                                  cursor: 'pointer',
                                }}
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function MarketplaceManager() {
  const token = useStore(s => s.token)
  const addToast = useToast()

  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const fetchListings = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.getListings()
      setListings(Array.isArray(data) ? data : [])
    } catch (err) {
      addToast('Error al cargar anuncios', 'error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchListings() }, [fetchListings])

  const openCreate = () => {
    setEditing(null)
    setShowForm(true)
  }

  const openEdit = (listing) => {
    setEditing(listing)
    setShowForm(true)
  }

  const handleSaved = (result) => {
    setShowForm(false)
    setEditing(null)
    fetchListings()
  }

  const handleDelete = async (listing) => {
    if (!confirm(`¿Eliminar el anuncio "${listing.title}"? Esta acción no se puede deshacer.`)) return
    setDeletingId(listing.id)
    try {
      await api.deleteListing(listing.id, token)
      addToast('Anuncio eliminado', 'success')
      setListings(prev => prev.filter(l => l.id !== listing.id))
    } catch (err) {
      addToast('Error al eliminar el anuncio', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem',
      }}>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: '1.6rem',
            color: '#fff', margin: 0, letterSpacing: '1px',
          }}>
            Marketplace
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', margin: '0.3rem 0 0' }}>
            {listings.length} anuncio{listings.length !== 1 ? 's' : ''} publicado{listings.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button style={btnStyle('primary')} onClick={openCreate}>
          + Nuevo Anuncio
        </button>
      </div>

      {/* Listings */}
      {loading ? (
        <div style={{
          textAlign: 'center', padding: '3rem',
          color: 'rgba(255,255,255,0.35)',
        }}>
          Cargando anuncios...
        </div>
      ) : listings.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '3rem',
          background: 'rgba(255,255,255,0.025)',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.07)',
          color: 'rgba(255,255,255,0.35)',
          fontSize: '0.95rem',
        }}>
          No hay anuncios. Crea el primero con el botón de arriba.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {listings.map(listing => {
            const img = listing.images && listing.images.length > 0 ? listing.images[0] : null
            return (
              <div
                key={listing.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  background: 'rgba(255,255,255,0.025)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '12px',
                  padding: '0.85rem 1.1rem',
                  flexWrap: 'wrap',
                }}
              >
                {/* Thumbnail */}
                <div style={{
                  width: 56, height: 56, flexShrink: 0,
                  borderRadius: '8px', overflow: 'hidden',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {img ? (
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  ) : (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <path d="M21 15l-5-5L5 21"/>
                    </svg>
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
                    <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.92rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '240px' }}>
                      {listing.title}
                    </span>
                    <StateBadge state={listing.state} stateDisplay={listing.state_display} />
                    <StatusBadge status={listing.status} statusDisplay={listing.status_display} />
                    {listing.requests_count > 0 && (
                      <span style={{
                        background: 'rgba(255,140,30,0.85)',
                        color: '#000',
                        borderRadius: '20px',
                        padding: '0.1rem 0.5rem',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                      }}>
                        {listing.requests_count} solicitud{listing.requests_count !== 1 ? 'es' : ''}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem 1.5rem', flexWrap: 'wrap', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>
                    <span style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '0.9rem' }}>
                      {listing.price != null
                        ? `${parseFloat(listing.price).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`
                        : '—'}
                    </span>
                    {listing.faction && <span>{listing.faction}</span>}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                  <button
                    onClick={() => openEdit(listing)}
                    title="Editar"
                    style={{
                      padding: '0.4rem 0.8rem', borderRadius: '7px',
                      background: 'rgba(255,255,255,0.07)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: 'rgba(255,255,255,0.7)', cursor: 'pointer',
                      fontSize: '0.82rem', fontFamily: 'var(--font-body)', fontWeight: 600,
                    }}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(listing)}
                    disabled={deletingId === listing.id}
                    title="Eliminar"
                    style={{
                      padding: '0.4rem 0.8rem', borderRadius: '7px',
                      background: 'rgba(255,68,102,0.1)',
                      border: '1px solid rgba(255,68,102,0.25)',
                      color: '#ff6464', cursor: 'pointer',
                      fontSize: '0.82rem', fontFamily: 'var(--font-body)', fontWeight: 600,
                    }}
                  >
                    {deletingId === listing.id ? '...' : 'Eliminar'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Purchase Requests Panel */}
      <PurchaseRequestsPanel
        token={token}
        listings={listings}
        addToast={addToast}
      />

      {/* Form modal */}
      {showForm && (
        <ListingFormModal
          editing={editing}
          onClose={() => { setShowForm(false); setEditing(null) }}
          onSaved={handleSaved}
          token={token}
          addToast={addToast}
        />
      )}
    </div>
  )
}
