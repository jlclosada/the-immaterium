import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { api } from '../../services/api'
import { useStore } from '../../stores/useStore'
import { useToast } from './Toast'

const inputStyle = {
  padding: '0.75rem 1rem',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '8px',
  color: 'var(--color-light)',
  fontSize: '0.95rem',
  width: '100%',
  outline: 'none',
  transition: 'border-color 0.2s',
  fontFamily: 'var(--font-body)',
}

const labelStyle = {
  display: 'block',
  marginBottom: '0.4rem',
  color: 'rgba(255,255,255,0.65)',
  fontSize: '0.8rem',
  letterSpacing: '1px',
  textTransform: 'uppercase',
}

const sectionTitle = {
  fontFamily: 'var(--font-display)',
  fontSize: '0.75rem',
  letterSpacing: '2px',
  color: 'rgba(255,255,255,0.35)',
  textTransform: 'uppercase',
  marginBottom: '1rem',
  paddingBottom: '0.5rem',
  borderBottom: '1px solid rgba(255,255,255,0.06)',
}

const emptyForm = {
  id: '', name: '', description: '', history: '',
  iconUrl: '', position: [0, 0, 0], size: 1.0,
  color: '#ffffff', emissive: '#ffffff',
  planetType: 'standard', planetName: '',
}

const planetTypes = [
  { value: 'standard', label: 'Standard' },
  { value: 'lightning', label: 'Lightning' },
  { value: 'snow', label: 'Snow' },
  { value: 'deformed', label: 'Deformed' },
  { value: 'tentacles', label: 'Tentacles' },
  { value: 'craters', label: 'Craters' },
  { value: 'terra', label: 'Terra' },
]

const ArmyManager = () => {
  const [armies, setArmies] = useState([])
  const [editingArmy, setEditingArmy] = useState(null)
  const [formData, setFormData] = useState(emptyForm)
  const [images, setImages] = useState([])
  const [newImageUrl, setNewImageUrl] = useState('')
  const [newImageName, setNewImageName] = useState('')
  const [loading, setLoading] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const token = useStore(state => state.token)
  const toast = useToast()

  useEffect(() => { loadArmies() }, [])

  const loadArmies = async () => {
    try {
      const data = await api.getArmies()
      setArmies(Array.isArray(data) ? data : [])
    } catch {
      toast('Error al cargar los ejércitos', 'error')
      setArmies([])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editingArmy) {
        await api.updateArmy(editingArmy.id, {
          name: formData.name,
          description: formData.description,
          history: formData.history || '',
          iconUrl: formData.iconUrl || editingArmy.iconUrl || '',
          position: formData.position,
          size: formData.size,
          color: formData.color,
          emissive: formData.emissive,
          planetType: formData.planetType,
          planetName: formData.planetName,
          images: images,
        }, token)
        toast('Ejército actualizado correctamente', 'success')
      } else {
        await api.createArmy({
          id: formData.id,
          name: formData.name,
          description: formData.description,
          history: formData.history || '',
          iconUrl: formData.iconUrl || '',
          position: formData.position,
          size: formData.size,
          color: formData.color,
          emissive: formData.emissive,
          planetType: formData.planetType,
          planetName: formData.planetName,
          images: images,
        }, token)
        toast('Ejército creado correctamente', 'success')
      }
      await loadArmies()
      handleCancel()
    } catch (error) {
      toast('Error al guardar: ' + error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (army) => {
    setEditingArmy(army)
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
      planetName: army.planetName || '',
    })
    setImages(army.images || [])
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    setLoading(true)
    try {
      await api.deleteArmy(id, token)
      toast('Ejército eliminado', 'success')
      await loadArmies()
      if (editingArmy?.id === id) handleCancel()
    } catch (error) {
      toast('Error al eliminar: ' + error.message, 'error')
    } finally {
      setLoading(false)
      setConfirmDelete(null)
    }
  }

  const handleCancel = () => {
    setEditingArmy(null)
    setFormData(emptyForm)
    setImages([])
    setNewImageUrl('')
    setNewImageName('')
  }

  const addImage = () => {
    if (!newImageUrl.trim() || !newImageName.trim()) {
      toast('URL y nombre de imagen son requeridos', 'warning')
      return
    }
    const newImg = {
      id: crypto.randomUUID(),
      url: newImageUrl.trim(),
      name: newImageName.trim(),
      isFavorite: false,
    }
    setImages(prev => [...prev, newImg])
    setNewImageUrl('')
    setNewImageName('')
  }

  const removeImage = async (index) => {
    const img = images[index]
    // If editing an existing army and the image already exists in DB, delete via API
    if (editingArmy && img.id && !img._local) {
      try {
        await api.deleteArmyImage(editingArmy.id, img.id, token)
        toast('Imagen eliminada', 'success')
      } catch (error) {
        toast('Error al eliminar imagen: ' + error.message, 'error')
        return
      }
    }
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const field = (key, value) => setFormData(f => ({ ...f, [key]: value }))

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-primary)', marginBottom: '0.5rem', fontSize: '2rem' }}>
          Gestión de Ejércitos
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '2rem', fontSize: '0.9rem' }}>
          {armies.length} ejército{armies.length !== 1 ? 's' : ''} registrado{armies.length !== 1 ? 's' : ''}
        </p>
      </motion.div>

      {/* FORM */}
      <motion.div
        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px',
          padding: '2rem',
          marginBottom: '2.5rem',
        }}
      >
        <h3 style={{ fontFamily: 'var(--font-display)', color: editingArmy ? 'var(--color-accent)' : 'var(--color-secondary)', marginBottom: '1.75rem', fontSize: '1.2rem' }}>
          {editingArmy ? `✏️ Editando: ${editingArmy.name}` : '➕ Nuevo Ejército'}
        </h3>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
          {/* Identificación */}
          <div>
            <p style={sectionTitle}>Identificación</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>ID *</label>
                <input
                  placeholder="space-marines"
                  value={formData.id}
                  onChange={e => field('id', e.target.value)}
                  disabled={!!editingArmy}
                  required
                  style={{ ...inputStyle, opacity: editingArmy ? 0.5 : 1 }}
                />
              </div>
              <div>
                <label style={labelStyle}>Nombre (EN) *</label>
                <input
                  placeholder="Space Marines"
                  value={formData.name}
                  onChange={e => field('name', e.target.value)}
                  required
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* Contenido */}
          <div>
            <p style={sectionTitle}>Contenido</p>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Descripción corta *</label>
                <textarea
                  placeholder="Frase o lema del ejército..."
                  value={formData.description}
                  onChange={e => field('description', e.target.value)}
                  required
                  style={{ ...inputStyle, minHeight: '70px', resize: 'vertical' }}
                />
              </div>
              <div>
                <label style={labelStyle}>Historia completa</label>
                <textarea
                  placeholder="Trasfondo e historia del ejército..."
                  value={formData.history}
                  onChange={e => field('history', e.target.value)}
                  style={{ ...inputStyle, minHeight: '130px', resize: 'vertical' }}
                />
              </div>
            </div>
          </div>

          {/* Visual */}
          <div>
            <p style={sectionTitle}>Visual</p>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={labelStyle}>URL del Icono *</label>
                <input
                  placeholder="https://..."
                  value={formData.iconUrl}
                  onChange={e => field('iconUrl', e.target.value)}
                  required
                  type="url"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Nombre del Planeta</label>
                <input
                  placeholder="Macragge"
                  value={formData.planetName}
                  onChange={e => field('planetName', e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Tipo de Planeta</label>
                <select
                  value={formData.planetType}
                  onChange={e => field('planetType', e.target.value)}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  {planetTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Tamaño (3D)</label>
                <input
                  type="number" step="0.1" min="0.5" max="5"
                  value={formData.size}
                  onChange={e => field('size', parseFloat(e.target.value))}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Color</label>
                <input
                  type="color" value={formData.color}
                  onChange={e => field('color', e.target.value)}
                  style={{ ...inputStyle, height: '44px', padding: '0.25rem', cursor: 'pointer' }}
                />
              </div>
              <div>
                <label style={labelStyle}>Emissive</label>
                <input
                  type="color" value={formData.emissive}
                  onChange={e => field('emissive', e.target.value)}
                  style={{ ...inputStyle, height: '44px', padding: '0.25rem', cursor: 'pointer' }}
                />
              </div>
            </div>
          </div>

          {/* Posición 3D */}
          <div>
            <p style={sectionTitle}>Posición 3D</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              {['X', 'Y', 'Z'].map((axis, i) => (
                <div key={axis}>
                  <label style={labelStyle}>{axis}</label>
                  <input
                    type="number" step="0.1" placeholder={axis}
                    value={formData.position[i]}
                    onChange={e => {
                      const pos = [...formData.position]
                      pos[i] = parseFloat(e.target.value) || 0
                      field('position', pos)
                    }}
                    style={inputStyle}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Imágenes */}
          <div>
            <p style={sectionTitle}>Galería de imágenes</p>
            {/* Add image row */}
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: '2 1 200px' }}>
                <label style={labelStyle}>URL de imagen</label>
                <input
                  placeholder="https://..."
                  value={newImageUrl}
                  onChange={e => setNewImageUrl(e.target.value)}
                  style={inputStyle}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addImage())}
                />
              </div>
              <div style={{ flex: '1 1 140px' }}>
                <label style={labelStyle}>Nombre</label>
                <input
                  placeholder="Battle pose"
                  value={newImageName}
                  onChange={e => setNewImageName(e.target.value)}
                  style={inputStyle}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addImage())}
                />
              </div>
              {/* Preview */}
              {newImageUrl && (
                <div style={{
                  width: '44px', height: '44px', borderRadius: '6px', overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,0.15)', flexShrink: 0,
                }}>
                  <img
                    src={newImageUrl}
                    alt="preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={e => { e.target.style.display = 'none' }}
                  />
                </div>
              )}
              <button
                type="button" onClick={addImage}
                style={{
                  padding: '0.75rem 1.25rem',
                  background: 'rgba(0,212,255,0.15)',
                  border: '1px solid rgba(0,212,255,0.4)',
                  borderRadius: '8px',
                  color: 'var(--color-primary)',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  flexShrink: 0,
                  height: '44px',
                  whiteSpace: 'nowrap',
                }}
              >
                + Añadir
              </button>
            </div>

            {/* Images list */}
            {images.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
                {images.map((img, index) => (
                  <div key={img.id || index} style={{
                    position: 'relative',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(0,0,0,0.3)',
                    aspectRatio: '16/10',
                  }}>
                    <img
                      src={img.url}
                      alt={img.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      onError={e => { e.target.src = '' }}
                    />
                    <div style={{
                      position: 'absolute', bottom: 0, left: 0, right: 0,
                      padding: '0.4rem 0.6rem',
                      background: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                      <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {img.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        style={{
                          background: 'rgba(255,68,102,0.7)',
                          border: 'none',
                          borderRadius: '4px',
                          color: '#fff',
                          cursor: 'pointer',
                          padding: '0.15rem 0.4rem',
                          fontSize: '0.7rem',
                          flexShrink: 0,
                          marginLeft: '0.4rem',
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem', textAlign: 'center', padding: '1.5rem' }}>
                No hay imágenes. Añade una URL arriba.
              </p>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                border: 'none',
                padding: '0.8rem 2rem',
                borderRadius: '50px',
                color: '#fff',
                fontFamily: 'var(--font-display)',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '0.9rem',
                letterSpacing: '1px',
                opacity: loading ? 0.7 : 1,
                boxShadow: '0 4px 15px rgba(0,212,255,0.25)',
                transition: 'all 0.2s',
              }}
            >
              {loading ? '⏳ Guardando...' : `💾 ${editingArmy ? 'Actualizar' : 'Crear'} Ejército`}
            </button>
            {editingArmy && (
              <>
                <button type="button" onClick={handleCancel}
                  style={{
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    padding: '0.8rem 1.5rem',
                    borderRadius: '50px',
                    color: 'var(--color-light)',
                    fontFamily: 'var(--font-display)',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    transition: 'all 0.2s',
                  }}
                >
                  Cancelar
                </button>
                <button type="button" onClick={() => setConfirmDelete(editingArmy.id)}
                  style={{
                    background: 'rgba(255,68,102,0.1)',
                    border: '1px solid rgba(255,68,102,0.4)',
                    padding: '0.8rem 1.5rem',
                    borderRadius: '50px',
                    color: '#ff6464',
                    fontFamily: 'var(--font-display)',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    transition: 'all 0.2s',
                  }}
                >
                  🗑️ Eliminar
                </button>
              </>
            )}
          </div>
        </form>
      </motion.div>

      {/* Confirm delete modal */}
      {confirmDelete && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, backdropFilter: 'blur(4px)',
        }}>
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            style={{
              background: 'rgba(10,10,26,0.95)',
              border: '1px solid rgba(255,68,102,0.4)',
              borderRadius: '16px',
              padding: '2rem',
              maxWidth: '400px',
              width: '90%',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⚠️</div>
            <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '0.75rem', color: '#ff6464' }}>
              ¿Eliminar ejército?
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              Esta acción no se puede deshacer. Se eliminarán también todas sus imágenes.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button onClick={() => setConfirmDelete(null)}
                style={{
                  padding: '0.7rem 1.5rem', background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px',
                  color: '#fff', cursor: 'pointer', fontFamily: 'var(--font-body)',
                }}
              >
                Cancelar
              </button>
              <button onClick={() => handleDelete(confirmDelete)}
                style={{
                  padding: '0.7rem 1.5rem', background: 'rgba(255,68,102,0.2)',
                  border: '1px solid rgba(255,68,102,0.6)', borderRadius: '8px',
                  color: '#ff6464', cursor: 'pointer', fontFamily: 'var(--font-body)',
                  fontWeight: '600',
                }}
              >
                Sí, eliminar
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Army list */}
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-secondary)', marginBottom: '1.25rem', fontSize: '1.1rem', letterSpacing: '1px' }}>
          Ejércitos existentes
        </h3>
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {armies.map((army, index) => (
            <motion.div
              key={army.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.04 }}
              style={{
                padding: '1rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                background: editingArmy?.id === army.id
                  ? 'rgba(0,212,255,0.06)'
                  : 'rgba(255,255,255,0.02)',
                border: editingArmy?.id === army.id
                  ? '1px solid rgba(0,212,255,0.25)'
                  : '1px solid rgba(255,255,255,0.06)',
                borderRadius: '12px',
                transition: 'all 0.2s',
              }}
            >
              {/* Icon */}
              <div style={{
                width: '48px', height: '48px',
                background: 'rgba(0,0,0,0.4)',
                borderRadius: '10px',
                padding: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                {army.iconUrl
                  ? <img src={army.iconUrl} alt={army.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  : <span style={{ fontSize: '1.5rem' }}>🛡️</span>
                }
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontFamily: 'var(--font-display)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {army.name}
                  </h4>
                  {army.images?.length > 0 && (
                    <span style={{
                      background: 'rgba(0,212,255,0.12)',
                      border: '1px solid rgba(0,212,255,0.25)',
                      borderRadius: '20px',
                      padding: '0.1rem 0.5rem',
                      fontSize: '0.7rem',
                      color: 'var(--color-primary)',
                      whiteSpace: 'nowrap',
                    }}>
                      {army.images.length} img
                    </span>
                  )}
                </div>
                <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem' }}>{army.id}</span>
                {army.planetName && (
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', marginLeft: '0.75rem' }}>
                    🪐 {army.planetName}
                  </span>
                )}
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                <button onClick={() => handleEdit(army)}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(0,212,255,0.4)',
                    padding: '0.45rem 1rem',
                    borderRadius: '20px',
                    color: 'var(--color-primary)',
                    cursor: 'pointer',
                    fontSize: '0.82rem',
                    fontFamily: 'var(--font-display)',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,212,255,0.12)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                >
                  ✏️ Editar
                </button>
                <button onClick={() => setConfirmDelete(army.id)}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255,68,102,0.3)',
                    padding: '0.45rem 0.75rem',
                    borderRadius: '20px',
                    color: '#ff6464',
                    cursor: 'pointer',
                    fontSize: '0.82rem',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,68,102,0.1)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                >
                  🗑️
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export default ArmyManager
