/**
 * PROFILE PAGE — Edit profile, purchases, preferences, security
 */
import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../stores/useStore';
import { api } from '../services/api';
import Navbar from '../components/UI/Navbar';
import Footer from '../components/UI/Footer';

const GAMES = [
  { id: '40k',       label: 'Warhammer 40,000', icon: '⚔️',  color: '#cc2222' },
  { id: 'aos',       label: 'Age of Sigmar',     icon: '✨',  color: '#4488ff' },
  { id: 'hh',        label: 'Horus Heresy',      icon: '🔥', color: '#ff6600' },
  { id: 'necromunda',label: 'Necromunda',         icon: '🏙️', color: '#aa8833' },
  { id: 'kill_team', label: 'Kill Team',          icon: '🎯', color: '#33aa66' },
  { id: 'warcry',    label: 'Warcry',             icon: '🗡️', color: '#9944cc' },
];

const ARMIES_40K = [
  'Space Marines','Blood Angels','Dark Angels','Space Wolves','Grey Knights','Custodes',
  'Astra Militarum','Adeptus Mechanicus','Hermanas de Batalla','Necrones','Tiránidos','Tau',
  'Aeldari','Drukhari','Orkos','Chaos Space Marines','Death Guard','Thousand Sons',
  'World Eaters',"Emperor's Children",'Genestealers',
];
const ARMIES_AOS = [
  'Stormcast Eternals','Nighthaunt','Flesh-eater Courts','Ossiarch Bonereapers',
  'Slaves to Darkness','Maggotkin','Skaven','Orruk Warclans','Lumineth Realm-lords',
  'Idoneth Deepkin','Fyreslayers','Kharadron Overlords',
];
const ALL_ARMIES = [...ARMIES_40K, ...ARMIES_AOS];

const PLAYER_TYPES = [
  { id: 'competitive', label: 'Competitivo', icon: '🏆' },
  { id: 'narrative',   label: 'Narrativo',   icon: '📖' },
  { id: 'painter',     label: 'Pintor',      icon: '🎨' },
  { id: 'collector',   label: 'Coleccionista', icon: '📦' },
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
  const { token, user, purchases, setUser, logout, userLikes, userFavorites } = useStore();

  // Form state — Perfil
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [avatarInput, setAvatarInput] = useState('');

  // Form state — Gustos
  const [favoriteGame, setFavoriteGame] = useState('');
  const [favoriteArmies, setFavoriteArmies] = useState([]);
  const [playerTypes, setPlayerTypes] = useState([]);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [savePrefsMsg, setSavePrefsMsg] = useState('');

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
      setFavoriteGame(user.favorite_game || '');
      setFavoriteArmies(user.favorite_armies ? user.favorite_armies.split(',').filter(Boolean) : []);
      setPlayerTypes(user.player_types ? user.player_types.split(',').filter(Boolean) : []);
    }
  }, [token, user]);

  const handleSave = async () => {
    setSaving(true); setSaveMsg('');
    try {
      const data = await api.updateProfile(token, { name, username, bio, avatar_url: avatarUrl });
      setUser({ ...user, ...data.user }, purchases);
      setSaveMsg('✓ Perfil actualizado correctamente');
      setTimeout(() => setSaveMsg(''), 3000);
    } catch (e) {
      setSaveMsg('✗ ' + (e.message || 'Error al guardar'));
    } finally {
      setSaving(false);
    }
  };

  const handleSavePrefs = async () => {
    setSavingPrefs(true); setSavePrefsMsg('');
    try {
      const data = await api.updateProfile(token, {
        favorite_game: favoriteGame,
        favorite_armies: favoriteArmies.join(','),
        player_types: playerTypes.join(','),
      });
      setUser({ ...user, ...data.user }, purchases);
      setSavePrefsMsg('✓ Preferencias guardadas');
      setTimeout(() => setSavePrefsMsg(''), 3000);
    } catch (e) {
      setSavePrefsMsg('✗ ' + (e.message || 'Error al guardar'));
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleLogout = async () => {
    try { await api.logoutUser(token); } catch (_) {}
    logout();
    navigate('/');
  };

  const toggleArmy = (army) => {
    setFavoriteArmies(prev =>
      prev.includes(army) ? prev.filter(a => a !== army) : [...prev, army]
    );
  };

  const togglePlayerType = (typeId) => {
    setPlayerTypes(prev =>
      prev.includes(typeId) ? prev.filter(t => t !== typeId) : [...prev, typeId]
    );
  };

  const initials = (name || username || 'U').slice(0, 2).toUpperCase();
  const memberSince = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long' }) : '—';
  const isAdmin = user?.isAdmin;

  const tabs = [
    { id: 'profile',   label: 'Perfil',    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
    { id: 'gustos',    label: 'Gustos',    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> },
    { id: 'purchases', label: 'Compras',   icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> },
    { id: 'security',  label: 'Seguridad', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-darker)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

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
              {user?.isLeader && (
                <span style={{ padding: '2px 10px', borderRadius: '20px', background: 'rgba(80,200,120,0.15)', border: '1px solid rgba(80,200,120,0.4)', color: '#50c878', fontSize: '0.65rem', fontFamily: 'var(--font-display)', letterSpacing: '1.5px' }}>LÍDER</span>
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
          <div style={{ display: 'flex', gap: '1.25rem', paddingBottom: '0.5rem', flexWrap: 'wrap' }}>
            {[
              { label: 'Compras', value: purchases.length, color: 'var(--color-primary)' },
              { label: 'Me gustas', value: userLikes.length, color: '#ff6464' },
              { label: 'Favoritos', value: userFavorites.length, color: '#ffb432' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: s.color, fontWeight: 900 }}>{s.value}</div>
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

        {/* ── TAB: GUSTOS ── */}
        {activeTab === 'gustos' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Juego favorito */}
            <Section
              title="Juego favorito"
              accent="#cc2222"
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14.5 10c-.83 0-1.5-.67-1.5-1.5v-5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5z"/><path d="M20.5 10H19V8.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/><path d="M9.5 14c.83 0 1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5S8 21.33 8 20.5v-5c0-.83.67-1.5 1.5-1.5z"/><path d="M3.5 14H5v1.5c0 .83-.67 1.5-1.5 1.5S2 16.33 2 15.5 2.67 14 3.5 14z"/><path d="M14 14.5c0-.83.67-1.5 1.5-1.5h5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-5c-.83 0-1.5-.67-1.5-1.5z"/><path d="M15.5 9H14V7.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5S16.33 9 15.5 9z"/><path d="M10 9.5C10 8.67 9.33 8 8.5 8h-5C2.67 8 2 8.67 2 9.5S2.67 11 3.5 11h5c.83 0 1.5-.67 1.5-1.5z"/><path d="M8.5 15H10v1.5c0 .83-.67 1.5-1.5 1.5S7 17.33 7 16.5 7.67 15 8.5 15z"/></svg>}
            >
              <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)', marginBottom: '1rem' }}>
                Selecciona el juego al que más juegas o más te gusta:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.6rem' }}>
                <style>{`@media(min-width:600px){.games-grid{grid-template-columns:repeat(3,1fr)!important}}`}</style>
                {GAMES.map(game => {
                  const selected = favoriteGame === game.id;
                  return (
                    <motion.button
                      key={game.id}
                      className="games-grid"
                      onClick={() => setFavoriteGame(selected ? '' : game.id)}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      style={{
                        padding: '1rem 0.75rem',
                        borderRadius: '14px',
                        cursor: 'pointer',
                        border: `1px solid ${selected ? game.color : 'rgba(255,255,255,0.09)'}`,
                        background: selected ? `${game.color}18` : 'rgba(255,255,255,0.03)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                        transition: 'all 0.15s',
                        boxShadow: selected ? `0 0 16px ${game.color}30` : 'none',
                      }}
                    >
                      <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>{game.icon}</span>
                      <span style={{
                        fontFamily: 'var(--font-display)', fontSize: '0.65rem',
                        letterSpacing: '1px', textTransform: 'uppercase',
                        color: selected ? game.color : 'rgba(255,255,255,0.45)',
                        textAlign: 'center', lineHeight: 1.3,
                      }}>
                        {game.label}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </Section>

            {/* Ejércitos favoritos */}
            <Section
              title="Ejércitos favoritos"
              accent="var(--color-primary)"
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>}
            >
              <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)', marginBottom: '0.6rem' }}>
                Warhammer 40,000
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.25rem' }}>
                {ARMIES_40K.map(army => {
                  const sel = favoriteArmies.includes(army);
                  return (
                    <button key={army} onClick={() => toggleArmy(army)} style={{
                      padding: '5px 12px', borderRadius: '20px', cursor: 'pointer',
                      fontSize: '0.75rem', transition: 'all 0.15s',
                      border: `1px solid ${sel ? 'rgba(0,212,255,0.6)' : 'rgba(255,255,255,0.1)'}`,
                      background: sel ? 'rgba(0,212,255,0.14)' : 'rgba(255,255,255,0.03)',
                      color: sel ? 'var(--color-primary)' : 'rgba(255,255,255,0.4)',
                      fontWeight: sel ? 600 : 400,
                    }}>
                      {army}
                    </button>
                  );
                })}
              </div>
              <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)', marginBottom: '0.6rem' }}>
                Age of Sigmar
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {ARMIES_AOS.map(army => {
                  const sel = favoriteArmies.includes(army);
                  return (
                    <button key={army} onClick={() => toggleArmy(army)} style={{
                      padding: '5px 12px', borderRadius: '20px', cursor: 'pointer',
                      fontSize: '0.75rem', transition: 'all 0.15s',
                      border: `1px solid ${sel ? 'rgba(0,212,255,0.6)' : 'rgba(255,255,255,0.1)'}`,
                      background: sel ? 'rgba(0,212,255,0.14)' : 'rgba(255,255,255,0.03)',
                      color: sel ? 'var(--color-primary)' : 'rgba(255,255,255,0.4)',
                      fontWeight: sel ? 600 : 400,
                    }}>
                      {army}
                    </button>
                  );
                })}
              </div>
            </Section>

            {/* Tipo de jugador */}
            <Section
              title="Tipo de jugador"
              accent="#9944cc"
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>}
            >
              <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)', marginBottom: '1rem' }}>
                ¿Cómo defines tu estilo de juego? (puedes seleccionar varios)
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {PLAYER_TYPES.map(pt => {
                  const sel = playerTypes.includes(pt.id);
                  return (
                    <motion.button
                      key={pt.id}
                      onClick={() => togglePlayerType(pt.id)}
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.96 }}
                      style={{
                        padding: '8px 18px', borderRadius: '24px', cursor: 'pointer',
                        fontSize: '0.82rem', transition: 'all 0.15s',
                        border: `1px solid ${sel ? 'rgba(153,68,204,0.6)' : 'rgba(255,255,255,0.1)'}`,
                        background: sel ? 'rgba(153,68,204,0.18)' : 'rgba(255,255,255,0.03)',
                        color: sel ? '#cc88ff' : 'rgba(255,255,255,0.4)',
                        fontWeight: sel ? 600 : 400,
                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                        boxShadow: sel ? '0 0 12px rgba(153,68,204,0.25)' : 'none',
                      }}
                    >
                      <span>{pt.icon}</span>
                      <span>{pt.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </Section>

            {/* Save prefs bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <AnimatePresence>
                {savePrefsMsg && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{ fontSize: '0.83rem', color: savePrefsMsg.startsWith('✓') ? '#50c878' : '#ff8080' }}>
                    {savePrefsMsg}
                  </motion.span>
                )}
              </AnimatePresence>
              <motion.button onClick={handleSavePrefs} disabled={savingPrefs}
                whileHover={!savingPrefs ? { y: -2 } : {}} whileTap={!savingPrefs ? { scale: 0.97 } : {}}
                style={{
                  padding: '0.8rem 2rem',
                  background: savingPrefs ? 'rgba(0,212,255,0.12)' : 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                  border: 'none', borderRadius: '12px',
                  color: savingPrefs ? 'rgba(255,255,255,0.4)' : '#000',
                  fontFamily: 'var(--font-display)', fontSize: '0.8rem', fontWeight: 700,
                  letterSpacing: '2px', textTransform: 'uppercase', cursor: savingPrefs ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                }}>
                {savingPrefs ? (<><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }} style={{ width: '14px', height: '14px', border: '2px solid rgba(0,0,0,0.2)', borderTop: '2px solid rgba(0,0,0,0.7)', borderRadius: '50%' }} />Guardando...</>) : 'Guardar preferencias'}
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
