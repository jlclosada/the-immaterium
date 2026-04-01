/**
 * PROFILE PAGE — Edit profile, purchases, premium status
 */
import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../stores/useStore';
import { api } from '../services/api';
import Header from '../components/UI/Header';
import Footer from '../components/UI/Footer';

const FACTIONS = [
  { id: 'space_marines',  label: 'Space Marines',    color: '#4488cc' },
  { id: 'chaos',          label: 'Caos',              color: '#aa3333' },
  { id: 'necrons',        label: 'Necrones',          color: '#33aa77' },
  { id: 'tau',            label: 'Tau',               color: '#44bbcc' },
  { id: 'tyranids',       label: 'Tiránidos',         color: '#9944cc' },
  { id: 'eldar',          label: 'Aeldari',           color: '#ccaa33' },
  { id: 'orks',           label: 'Orkos',             color: '#558833' },
  { id: 'imperial_guard', label: 'Guardia Imperial',  color: '#886644' },
  { id: 'none',           label: 'Sin facción',       color: '#555' },
];

const PRESET_AVATARS = [
  'https://api.dicebear.com/8.x/bottts/svg?seed=marine&backgroundColor=1a1a2e',
  'https://api.dicebear.com/8.x/bottts/svg?seed=chaos&backgroundColor=1a0000',
  'https://api.dicebear.com/8.x/bottts/svg?seed=necron&backgroundColor=001a0d',
  'https://api.dicebear.com/8.x/bottts/svg?seed=tau&backgroundColor=001a1a',
  'https://api.dicebear.com/8.x/bottts/svg?seed=eldar&backgroundColor=1a1500',
  'https://api.dicebear.com/8.x/bottts/svg?seed=tyranid&backgroundColor=0d001a',
];

function Section({ title, icon, children, accent = 'var(--color-primary)' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'rgba(255,255,255,0.025)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '20px',
        overflow: 'hidden',
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.65rem',
        padding: '1.1rem 1.5rem',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(255,255,255,0.02)',
      }}>
        <span style={{ color: accent, display: 'flex' }}>{icon}</span>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.72rem', letterSpacing: '2.5px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>
          {title}
        </span>
      </div>
      <div style={{ padding: '1.5rem' }}>{children}</div>
    </motion.div>
  );
}

function InputField({ label, value, onChange, placeholder, type = 'text', disabled, multiline }) {
  const [focused, setFocused] = useState(false);
  const base = {
    width: '100%', boxSizing: 'border-box',
    padding: '0.8rem 1rem',
    background: disabled ? 'rgba(255,255,255,0.02)' : focused ? 'rgba(0,212,255,0.04)' : 'rgba(255,255,255,0.04)',
    border: `1px solid ${disabled ? 'rgba(255,255,255,0.05)' : focused ? 'rgba(0,212,255,0.4)' : 'rgba(255,255,255,0.1)'}`,
    borderRadius: '10px', color: disabled ? 'rgba(255,255,255,0.35)' : '#fff',
    fontSize: '0.9rem', fontFamily: 'var(--font-body)', outline: 'none',
    transition: 'all 0.2s', resize: 'vertical',
  };
  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-display)', marginBottom: '0.4rem' }}>
        {label}
      </label>
      {multiline
        ? <textarea value={value} onChange={onChange} placeholder={placeholder} rows={3} disabled={disabled} style={base} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
        : <input type={type} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled} style={base} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
      }
    </div>
  );
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { token, user, purchases, setUser, logout } = useStore();

  // Form state
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [faction, setFaction] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [avatarInput, setAvatarInput] = useState('');

  // Password change
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwMsg, setPwMsg] = useState('');

  useEffect(() => {
    document.title = 'Mi perfil | The Immaterium';
    if (!token) { navigate('/signin'); return; }
    if (user) {
      setName(user.name || '');
      setUsername(user.username || '');
      setBio(user.bio || '');
      setAvatarUrl(user.avatarUrl || '');
      setFaction(user.favorite_faction || '');
    }
  }, [token, user]);

  const handleSave = async () => {
    setSaving(true); setSaveMsg('');
    try {
      const data = await api.updateProfile(token, { name, username, bio, avatar_url: avatarUrl, favorite_faction: faction });
      setUser({ ...user, ...data.user }, purchases);
      setSaveMsg('✓ Perfil actualizado correctamente');
      setTimeout(() => setSaveMsg(''), 3000);
    } catch (e) {
      setSaveMsg('✗ ' + (e.message || 'Error al guardar'));
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try { await api.logoutUser(token); } catch (_) {}
    logout();
    navigate('/');
  };

  const initials = (name || username || 'U').slice(0, 2).toUpperCase();
  const memberSince = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long' }) : '—';
  const isAdmin = user?.isAdmin;

  const tabs = [
    { id: 'profile',   label: 'Perfil', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
    { id: 'purchases', label: 'Compras', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> },
    { id: 'security',  label: 'Seguridad', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-darker)', display: 'flex', flexDirection: 'column' }}>
      <Header />

      {/* Hero banner */}
      <div style={{
        height: '220px', position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(135deg, #070718 0%, #0d0a24 50%, #07071a 100%)',
        flexShrink: 0,
      }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(rgba(0,212,255,0.06) 1px, transparent 1px)`, backgroundSize: '28px 28px' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(0,212,255,0.08) 0%, transparent 70%)' }} />
        {isAdmin && (
          <div style={{ position: 'absolute', top: '5rem', right: '2rem', padding: '4px 12px', background: 'rgba(180,20,20,0.15)', border: '1px solid rgba(180,20,20,0.4)', borderRadius: '4px', color: 'rgba(220,80,80,0.9)', fontSize: '0.65rem', fontFamily: 'var(--font-display)', letterSpacing: '2px' }}>
            ● ADMINISTRADOR
          </div>
        )}
      </div>

      <div style={{ flex: 1, maxWidth: '900px', margin: '0 auto', width: '100%', padding: '0 clamp(1rem, 4vw, 2rem) 4rem' }}>

        {/* Avatar + name card (overlapping banner) */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1.5rem', marginTop: '-60px', marginBottom: '2rem', flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{ position: 'relative' }}>
            <div style={{
              width: '110px', height: '110px', borderRadius: '50%',
              border: '4px solid var(--color-darker)',
              overflow: 'hidden', background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0,
            }} onClick={() => setShowAvatarPicker(v => !v)}>
              {avatarUrl ? (
                <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={e => { e.target.style.display = 'none'; }} />
              ) : (
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 900, color: '#000' }}>{initials}</span>
              )}
            </div>
            <div style={{
              position: 'absolute', bottom: '4px', right: '4px',
              width: '28px', height: '28px', borderRadius: '50%',
              background: 'var(--color-primary)', border: '2px solid var(--color-darker)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }} onClick={() => setShowAvatarPicker(v => !v)}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </div>

            {/* Avatar picker dropdown */}
            <AnimatePresence>
              {showAvatarPicker && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  style={{
                    position: 'absolute', top: '120px', left: 0, zIndex: 50,
                    background: 'rgba(8,8,22,0.98)', border: '1px solid rgba(0,212,255,0.2)',
                    borderRadius: '16px', padding: '1rem', width: '280px',
                    boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
                  }}
                >
                  <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.75rem', fontFamily: 'var(--font-display)', letterSpacing: '1px' }}>
                    AVATARES PREDEFINIDOS
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
                    {PRESET_AVATARS.map((url, i) => (
                      <div key={i} onClick={() => { setAvatarUrl(url); setShowAvatarPicker(false); }}
                        style={{ width: '72px', height: '72px', borderRadius: '50%', overflow: 'hidden', cursor: 'pointer', border: avatarUrl === url ? '2px solid var(--color-primary)' : '2px solid rgba(255,255,255,0.1)', background: '#1a1a2e' }}>
                        <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)', marginBottom: '0.4rem' }}>O pega una URL:</p>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <input value={avatarInput} onChange={e => setAvatarInput(e.target.value)}
                      placeholder="https://..." style={{ flex: 1, padding: '0.5rem 0.7rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '0.75rem', fontFamily: 'var(--font-body)', outline: 'none' }} />
                    <button onClick={() => { if (avatarInput) { setAvatarUrl(avatarInput); setAvatarInput(''); setShowAvatarPicker(false); } }}
                      style={{ padding: '0.5rem 0.75rem', background: 'var(--color-primary)', border: 'none', borderRadius: '8px', color: '#000', fontWeight: 700, cursor: 'pointer', fontSize: '0.78rem' }}>
                      OK
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Name + badges */}
          <div style={{ flex: 1, paddingBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.2rem, 4vw, 1.7rem)', color: '#fff', margin: 0 }}>
                {name || username || user?.email?.split('@')[0] || 'Usuario'}
              </h1>
              {isAdmin && (
                <span style={{ padding: '2px 10px', borderRadius: '20px', background: 'rgba(180,20,20,0.15)', border: '1px solid rgba(180,20,20,0.4)', color: '#ff8080', fontSize: '0.65rem', fontFamily: 'var(--font-display)', letterSpacing: '1.5px' }}>ADMIN</span>
              )}
              {user?.isPremium && (
                <span style={{ padding: '2px 10px', borderRadius: '20px', background: 'rgba(255,215,0,0.12)', border: '1px solid rgba(255,215,0,0.4)', color: '#FFD700', fontSize: '0.65rem', fontFamily: 'var(--font-display)', letterSpacing: '1.5px' }}>★ PREMIUM</span>
              )}
            </div>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.83rem', margin: 0 }}>
              {user?.email} · Miembro desde {memberSince}
            </p>
          </div>

          {/* Quick stats */}
          <div style={{ display: 'flex', gap: '1rem', paddingBottom: '0.5rem' }}>
            {[{ label: 'Compras', value: purchases.length }, { label: 'Guías', value: '—' }].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--color-primary)', fontWeight: 900 }}>{s.value}</div>
                <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '1px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '1.75rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '4px' }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              flex: 1, padding: '0.65rem', border: 'none', borderRadius: '8px', cursor: 'pointer',
              background: activeTab === tab.id ? 'rgba(0,212,255,0.1)' : 'transparent',
              boxShadow: activeTab === tab.id ? '0 0 0 1px rgba(0,212,255,0.25)' : 'none',
              color: activeTab === tab.id ? 'var(--color-primary)' : 'rgba(255,255,255,0.35)',
              fontFamily: 'var(--font-display)', fontSize: '0.72rem', letterSpacing: '1px',
              textTransform: 'uppercase', transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
            }}>
              <span style={{ display: 'flex' }}>{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>
        <style>{`.tab-label{display:none}@media(min-width:500px){.tab-label{display:inline}}`}</style>

        {/* ── TAB: PROFILE ── */}
        {activeTab === 'profile' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <Section title="Información personal" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1rem' }}>
                  <InputField label="Nombre" value={name} onChange={e => setName(e.target.value)} placeholder="Tu nombre completo" />
                  <InputField label="Nombre de usuario" value={username} onChange={e => setUsername(e.target.value)} placeholder="nombre_usuario" />
                </div>
                <InputField label="Email" value={user?.email || ''} disabled />
                <InputField label="Biografía" value={bio} onChange={e => setBio(e.target.value)} placeholder="Cuéntanos sobre ti, tu ejército favorito..." multiline />
              </div>
            </Section>

            <Section title="Ejército & estilo de juego" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>} accent="#87CEFA">
              <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.35)', marginBottom: '1rem' }}>Selecciona tu facción favorita:</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {FACTIONS.map(f => (
                  <button key={f.id} type="button" onClick={() => setFaction(faction === f.id ? '' : f.id)} style={{
                    padding: '6px 14px', borderRadius: '20px', cursor: 'pointer',
                    background: faction === f.id ? `${f.color}20` : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${faction === f.id ? f.color : 'rgba(255,255,255,0.1)'}`,
                    color: faction === f.id ? f.color : 'rgba(255,255,255,0.4)',
                    fontSize: '0.8rem', transition: 'all 0.15s', fontWeight: faction === f.id ? 600 : 400,
                  }}>
                    {f.label}
                  </button>
                ))}
              </div>
            </Section>

            {/* Save bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <AnimatePresence>
                {saveMsg && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{ fontSize: '0.83rem', color: saveMsg.startsWith('✓') ? '#50c878' : '#ff8080' }}>
                    {saveMsg}
                  </motion.span>
                )}
              </AnimatePresence>
              <motion.button onClick={handleSave} disabled={saving}
                whileHover={!saving ? { y: -2 } : {}} whileTap={!saving ? { scale: 0.97 } : {}}
                style={{
                  padding: '0.8rem 2rem',
                  background: saving ? 'rgba(0,212,255,0.12)' : 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                  border: 'none', borderRadius: '12px',
                  color: saving ? 'rgba(255,255,255,0.4)' : '#000',
                  fontFamily: 'var(--font-display)', fontSize: '0.8rem', fontWeight: 700,
                  letterSpacing: '2px', textTransform: 'uppercase', cursor: saving ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                }}>
                {saving ? (<><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }} style={{ width: '14px', height: '14px', border: '2px solid rgba(0,0,0,0.2)', borderTop: '2px solid rgba(0,0,0,0.7)', borderRadius: '50%' }} />Guardando...</>) : 'Guardar cambios'}
              </motion.button>
            </div>
          </div>
        )}

        {/* ── TAB: PURCHASES ── */}
        {activeTab === 'purchases' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Premium status */}
            <Section title="Estado Premium" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>} accent="#FFD700">
              {user?.isPremium ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,215,0,0.12)', border: '1px solid rgba(255,215,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '1.5rem' }}>★</span>
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', color: '#FFD700', fontSize: '0.9rem', letterSpacing: '1px', marginBottom: '0.2rem' }}>Cuenta Premium activa</div>
                    <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>Tienes acceso completo a todo el contenido premium</div>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', letterSpacing: '1px', marginBottom: '0.3rem' }}>
                      Cuenta gratuita
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)' }}>
                      Adquiere guías premium individualmente o mejora a Premium
                    </div>
                  </div>
                  <Link to="/guides" style={{
                    padding: '0.7rem 1.5rem', background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                    border: 'none', borderRadius: '10px', color: '#000',
                    fontFamily: 'var(--font-display)', fontSize: '0.75rem', fontWeight: 800,
                    letterSpacing: '1.5px', textDecoration: 'none',
                  }}>
                    ★ Ver guías premium
                  </Link>
                </div>
              )}
            </Section>

            {/* Purchase list */}
            <Section title={`Guías adquiridas (${purchases.length})`} icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>}>
              {purchases.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.25)' }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" style={{ marginBottom: '1rem', opacity: 0.3 }}><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                  <p style={{ fontSize: '0.87rem' }}>No tienes guías adquiridas aún</p>
                  <Link to="/guides" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontSize: '0.8rem' }}>Ver guías premium →</Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {purchases.map(guideId => (
                    <Link key={guideId} to={`/guides/${guideId}`} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '0.85rem 1rem', background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px',
                      textDecoration: 'none', transition: 'border-color 0.2s',
                    }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,212,255,0.25)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="2" strokeLinecap="round"><path d="M18.37 2.63 14 7l-1.59-1.59a2 2 0 0 0-2.82 0L8 7l9 9 1.59-1.59a2 2 0 0 0 0-2.82L17 10l4.37-4.37a2.12 2.12 0 1 0-3-3z"/></svg>
                        </div>
                        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.88rem' }}>Guía #{guideId}</span>
                      </div>
                      <span style={{ color: '#50c878', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                        Desbloqueada
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </Section>
          </div>
        )}

        {/* ── TAB: SECURITY ── */}
        {activeTab === 'security' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <Section title="Cambiar contraseña" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>} accent="#87CEFA">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px' }}>
                <InputField label="Contraseña actual" type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} placeholder="••••••••" />
                <InputField label="Nueva contraseña" type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="Mínimo 8 caracteres" />
                <InputField label="Confirmar nueva contraseña" type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="Repite la contraseña" />
                {pwMsg && <span style={{ fontSize: '0.8rem', color: pwMsg.startsWith('✓') ? '#50c878' : '#ff8080' }}>{pwMsg}</span>}
                <button onClick={() => {
                  if (!currentPw || !newPw || !confirmPw) { setPwMsg('✗ Rellena todos los campos'); return; }
                  if (newPw !== confirmPw) { setPwMsg('✗ Las contraseñas no coinciden'); return; }
                  if (newPw.length < 8) { setPwMsg('✗ Mínimo 8 caracteres'); return; }
                  setPwMsg('⚙ Funcionalidad disponible próximamente');
                }} style={{
                  padding: '0.8rem', background: 'rgba(135,206,250,0.1)', border: '1px solid rgba(135,206,250,0.25)',
                  borderRadius: '10px', color: 'var(--color-secondary)', fontFamily: 'var(--font-display)',
                  fontSize: '0.78rem', letterSpacing: '1.5px', cursor: 'pointer',
                }}>
                  Actualizar contraseña
                </button>
              </div>
            </Section>

            <Section title="Sesión activa" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '0.2rem' }}>Estás conectado como</p>
                  <p style={{ color: '#fff', fontSize: '0.9rem', margin: 0 }}>{user?.email}</p>
                </div>
                <button onClick={handleLogout} style={{
                  padding: '0.7rem 1.5rem', background: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.25)',
                  borderRadius: '10px', color: '#ff8080', cursor: 'pointer', fontFamily: 'var(--font-display)',
                  fontSize: '0.75rem', letterSpacing: '1px', transition: 'all 0.2s',
                }}>
                  Cerrar sesión
                </button>
              </div>
            </Section>

            {isAdmin && (
              <Section title="Acceso de administrador" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>} accent="rgba(180,20,20,0.9)">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.83rem', margin: 0 }}>Tu cuenta tiene privilegios de administrador</p>
                  <Link to="/admin" style={{
                    padding: '0.7rem 1.5rem', background: 'rgba(180,20,20,0.12)', border: '1px solid rgba(180,20,20,0.35)',
                    borderRadius: '10px', color: '#ff8080', textDecoration: 'none', fontFamily: 'var(--font-display)',
                    fontSize: '0.75rem', letterSpacing: '1px',
                  }}>
                    Ir al panel de control →
                  </Link>
                </div>
              </Section>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
