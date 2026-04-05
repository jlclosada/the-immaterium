import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../services/api';
import { useStore } from '../../stores/useStore';
import { useToast } from './Toast';

const inputStyle = {
    padding: '0.9rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '8px',
    color: 'var(--color-light)',
    fontSize: '0.95rem',
    width: '100%',
    outline: 'none',
};

const EMPTY_FORM = { username: '', email: '', password: '' };

const UserManager = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const token = useStore(state => state.token);
    const user = useStore(s => s.user);
    const toast = useToast();

    // isAdmin: can manage users, assign roles, delete
    const isAdmin = user?.isAdmin || user?.is_staff;

    useEffect(() => { loadUsers(); }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await api.getUsers(token);
            const list = Array.isArray(data) ? data : [];
            setUsers(list);
        } catch (e) {
            toast('Error al cargar usuarios: ' + e.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const username = useStore(state => state.username);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!formData.username.trim() || !formData.password.trim()) {
            toast('El nombre de usuario y la contraseña son requeridos', 'error');
            return;
        }
        setSaving(true);
        try {
            const newUser = await api.createUser(formData, token);
            toast(`Admin "${newUser.username}" creado correctamente`, 'success');
            setUsers(prev => [newUser, ...prev]);
            setFormData(EMPTY_FORM);
            setShowForm(false);
        } catch (e) {
            toast('Error: ' + e.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleToggleActive = async (u) => {
        try {
            const result = await api.toggleUserActive(u.id, token);
            setUsers(prev => prev.map(x => x.id === u.id ? { ...x, isActive: result.isActive } : x));
            toast(
                result.isActive ? `${u.username} activado` : `${u.username} desactivado`,
                result.isActive ? 'success' : 'info'
            );
        } catch (e) {
            toast('Error: ' + e.message, 'error');
        }
    };

    const handleToggleLeader = async (u) => {
        try {
            const result = await api.toggleUserLeader(u.id, token);
            setUsers(prev => prev.map(x => x.id === u.id ? { ...x, isLeader: result.isLeader } : x));
            toast(
                result.isLeader ? `${u.username} es ahora Líder` : `${u.username} ya no es Líder`,
                result.isLeader ? 'success' : 'info'
            );
        } catch (e) {
            toast('Error: ' + e.message, 'error');
        }
    };

    const handleTogglePremium = async (u) => {
        try {
            const result = await api.toggleUserPremium(u.id, token);
            setUsers(prev => prev.map(x => x.id === u.id ? { ...x, isPremium: result.isPremium } : x));
            toast(
                result.isPremium ? `${u.username} tiene ahora Premium` : `${u.username} ya no tiene Premium`,
                result.isPremium ? 'success' : 'info'
            );
        } catch (e) {
            toast('Error: ' + e.message, 'error');
        }
    };

    const handleDelete = async (u) => {
        if (!window.confirm(`¿Eliminar al usuario "${u.username}"? Esta acción no se puede deshacer.`)) return;
        try {
            await api.deleteUser(u.id, token);
            setUsers(prev => prev.filter(x => x.id !== u.id));
            toast(`Usuario "${u.username}" eliminado`, 'success');
        } catch (e) {
            toast('Error: ' + e.message, 'error');
        }
    };

    const filtered = users.filter(u => {
        const term = searchTerm.toLowerCase();
        return (
            u.username.toLowerCase().includes(term) ||
            (u.email || '').toLowerCase().includes(term)
        );
    });

    const adminCount = users.filter(u => u.isAdmin || u.isStaff).length;
    const leaderCount = users.filter(u => u.isLeader).length;

    const getRoleBadge = (u) => {
        if (u.isAdmin || u.isStaff) return { label: 'Admin', color: 'var(--color-primary)', bg: 'rgba(0,212,255,0.1)', border: 'rgba(0,212,255,0.25)' };
        if (u.isLeader) return { label: 'Líder', color: '#50c878', bg: 'rgba(80,200,120,0.1)', border: 'rgba(80,200,120,0.3)' };
        if (u.isPremium) return { label: 'Premium', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)' };
        return { label: 'Usuario', color: 'rgba(255,255,255,0.3)', bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)' };
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}
            >
                <div>
                    <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-primary)', marginBottom: '0.4rem', fontSize: '2.5rem' }}>
                        Gestión de Usuarios
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.88rem' }}>
                        {adminCount} admin{adminCount !== 1 ? 's' : ''} · {leaderCount} líder{leaderCount !== 1 ? 'es' : ''}
                        {isAdmin ? <span style={{ marginLeft: '0.75rem', color: 'var(--color-primary)', fontSize: '0.8rem' }}>· Sesión como Admin</span> : ''}
                    </p>
                </div>
                {isAdmin && (
                    <button
                        onClick={() => { setShowForm(v => !v); setFormData(EMPTY_FORM); }}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: showForm ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                            border: showForm ? '1px solid rgba(255,255,255,0.2)' : 'none',
                            borderRadius: '10px',
                            color: '#fff',
                            fontFamily: 'var(--font-display)',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            letterSpacing: '0.5px',
                        }}
                    >
                        {showForm ? 'Cancelar' : 'Nuevo Admin'}
                    </button>
                )}
            </motion.div>

            {/* Role legend */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}
                className="glass-panel"
                style={{ padding: '1rem 1.5rem', marginBottom: '1.5rem', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}
            >
                {[
                    { role: 'Admin', color: 'var(--color-primary)', desc: 'Acceso total. Gestiona usuarios, roles y todo el contenido.' },
                    { role: 'Líder', color: '#50c878', desc: 'Acceso al panel. Crea/edita/elimina contenido. Sin gestión de usuarios.' },
                    { role: 'Premium', color: '#f59e0b', desc: 'Acceso a contenido premium.' },
                    { role: 'Usuario', color: 'rgba(255,255,255,0.3)', desc: 'Usuario registrado estándar.' },
                ].map(({ role, color, desc }) => (
                    <div key={role} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, marginTop: '5px', flexShrink: 0 }} />
                        <div>
                            <span style={{ color, fontWeight: 600, fontSize: '0.82rem', fontFamily: 'var(--font-display)' }}>{role}: </span>
                            <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.8rem' }}>{desc}</span>
                        </div>
                    </div>
                ))}
            </motion.div>

            {/* Create admin form */}
            <AnimatePresence>
                {showForm && isAdmin && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginBottom: '1.5rem' }}
                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                        style={{ overflow: 'hidden' }}
                    >
                        <div className="glass-panel" style={{ padding: '1.75rem' }}>
                            <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-primary)', marginTop: 0, marginBottom: '1.5rem', fontSize: '1.2rem' }}>
                                Crear nuevo administrador
                            </h3>
                            <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.4rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem' }}>
                                        Usuario *
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="nombre_admin"
                                        value={formData.username}
                                        onChange={e => setFormData({ ...formData, username: e.target.value })}
                                        required
                                        style={inputStyle}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.4rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem' }}>
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="admin@example.com"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        style={inputStyle}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.4rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem' }}>
                                        Contraseña *
                                    </label>
                                    <input
                                        type="password"
                                        placeholder="Contraseña segura"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        required
                                        style={inputStyle}
                                    />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        style={{
                                            width: '100%',
                                            padding: '0.9rem',
                                            background: saving ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                                            border: 'none',
                                            borderRadius: '8px',
                                            color: '#fff',
                                            fontFamily: 'var(--font-display)',
                                            fontSize: '0.9rem',
                                            cursor: saving ? 'not-allowed' : 'pointer',
                                        }}
                                    >
                                        {saving ? 'Creando...' : 'Crear Admin'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Search */}
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
                className="glass-panel"
                style={{ padding: '1rem 1.5rem', marginBottom: '1.25rem' }}
            >
                <div style={{ position: 'relative', maxWidth: '380px' }}>
                    <span style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', display: 'flex' }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                    </span>
                    <input
                        type="text"
                        placeholder="Buscar usuario..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="search-bar"
                        style={{ paddingLeft: '2.4rem' }}
                    />
                </div>
            </motion.div>

            {/* Users list */}
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }}
                className="glass-panel"
                style={{ padding: '2rem' }}
            >
                <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontFamily: 'var(--font-display)', color: 'var(--color-primary)', fontSize: '1.3rem' }}>
                    Usuarios ({filtered.length})
                </h3>

                {loading ? (
                    <div className="loading-spinner" style={{ margin: '3rem auto' }} />
                ) : filtered.length === 0 ? (
                    <p style={{ color: 'rgba(255,255,255,0.35)', textAlign: 'center', padding: '2rem' }}>
                        {searchTerm ? `Sin resultados para "${searchTerm}"` : 'No hay usuarios registrados.'}
                    </p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        {/* Column headers */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1.4fr 100px 80px 110px auto',
                            gap: '1rem',
                            padding: '0.4rem 1rem',
                            color: 'rgba(255,255,255,0.3)',
                            fontSize: '0.72rem',
                            letterSpacing: '1px',
                            textTransform: 'uppercase',
                            fontFamily: 'var(--font-display)',
                        }}>
                            <span>Usuario</span>
                            <span>Email</span>
                            <span>Rol</span>
                            <span>Premium</span>
                            <span>Registro</span>
                            <span>Acciones</span>
                        </div>

                        {filtered.map((u, index) => {
                            const role = getRoleBadge(u);
                            const isMe = u.username === username;
                            return (
                                <motion.div
                                    key={u.id}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.04 }}
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 1.4fr 100px 80px 110px auto',
                                        gap: '1rem',
                                        alignItems: 'center',
                                        padding: '0.85rem 1rem',
                                        background: u.isActive ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.08)',
                                        borderRadius: '10px',
                                        border: isMe
                                            ? '1px solid rgba(0,212,255,0.2)'
                                            : '1px solid rgba(255,255,255,0.05)',
                                        opacity: u.isActive ? 1 : 0.55,
                                        transition: 'opacity 0.3s',
                                    }}
                                >
                                    {/* Username + avatar */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0 }}>
                                        <div style={{
                                            width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                                            background: (u.isAdmin || u.isStaff)
                                                ? 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))'
                                                : u.isLeader
                                                ? 'linear-gradient(135deg, #50c878, #2d9b57)'
                                                : 'rgba(255,255,255,0.1)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '0.8rem', fontFamily: 'var(--font-display)',
                                            color: (u.isAdmin || u.isStaff || u.isLeader) ? '#000' : 'rgba(255,255,255,0.4)',
                                        }}>
                                            {u.username.charAt(0).toUpperCase()}
                                        </div>
                                        <div style={{ minWidth: 0 }}>
                                            <div style={{ color: 'var(--color-light)', fontSize: '0.92rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                {u.username}
                                                {isMe && <span style={{ color: 'var(--color-primary)', fontSize: '0.7rem' }}>(tú)</span>}
                                                {u.isLeader && (
                                                    <span style={{
                                                        padding: '1px 6px',
                                                        borderRadius: '20px',
                                                        fontSize: '0.62rem',
                                                        fontFamily: 'var(--font-display)',
                                                        letterSpacing: '0.5px',
                                                        color: '#50c878',
                                                        background: 'rgba(80,200,120,0.1)',
                                                        border: '1px solid rgba(80,200,120,0.3)',
                                                        flexShrink: 0,
                                                    }}>
                                                        LÍDER
                                                    </span>
                                                )}
                                                {u.isPremium && (
                                                    <span style={{
                                                        padding: '1px 6px',
                                                        borderRadius: '20px',
                                                        fontSize: '0.62rem',
                                                        fontFamily: 'var(--font-display)',
                                                        letterSpacing: '0.5px',
                                                        color: '#f59e0b',
                                                        background: 'rgba(245,158,11,0.12)',
                                                        border: '1px solid rgba(245,158,11,0.3)',
                                                        flexShrink: 0,
                                                    }}>
                                                        PREMIUM
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {u.email || '—'}
                                    </span>

                                    {/* Role badge */}
                                    <span style={{
                                        display: 'inline-flex', alignItems: 'center',
                                        padding: '3px 10px', borderRadius: '20px', fontSize: '0.7rem',
                                        fontFamily: 'var(--font-display)', letterSpacing: '0.5px', whiteSpace: 'nowrap',
                                        color: role.color, background: role.bg, border: `1px solid ${role.border}`,
                                    }}>
                                        {role.label}
                                    </span>

                                    {/* Premium indicator */}
                                    <span style={{ color: u.isPremium ? '#f59e0b' : 'rgba(255,255,255,0.15)', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                                        {u.isPremium ? 'Premium' : '—'}
                                    </span>

                                    {/* Date joined */}
                                    <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                                        {new Date(u.dateJoined).toLocaleDateString('es-ES')}
                                    </span>

                                    {/* Actions — only admin can use these */}
                                    <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                        {isAdmin && !isMe && !u.isSuperuser && (
                                            <>
                                                <button
                                                    onClick={() => handleToggleLeader(u)}
                                                    title={u.isLeader ? 'Quitar rol de Líder' : 'Asignar rol de Líder'}
                                                    style={{
                                                        padding: '0.35rem 0.8rem',
                                                        borderRadius: '7px',
                                                        border: '1px solid',
                                                        fontSize: '0.78rem',
                                                        cursor: 'pointer',
                                                        whiteSpace: 'nowrap',
                                                        transition: 'all 0.2s',
                                                        ...(u.isLeader
                                                            ? { background: 'rgba(80,200,120,0.08)', borderColor: 'rgba(80,200,120,0.3)', color: '#50c878' }
                                                            : { background: 'rgba(80,200,120,0.04)', borderColor: 'rgba(80,200,120,0.15)', color: 'rgba(80,200,120,0.5)' }
                                                        ),
                                                    }}
                                                >
                                                    {u.isLeader ? 'Líder ✓' : 'Líder'}
                                                </button>
                                                <button
                                                    onClick={() => handleTogglePremium(u)}
                                                    title={u.isPremium ? 'Quitar Premium' : 'Asignar Premium'}
                                                    style={{
                                                        padding: '0.35rem 0.8rem',
                                                        borderRadius: '7px',
                                                        border: '1px solid',
                                                        fontSize: '0.78rem',
                                                        cursor: 'pointer',
                                                        whiteSpace: 'nowrap',
                                                        transition: 'all 0.2s',
                                                        ...(u.isPremium
                                                            ? { background: 'rgba(245,158,11,0.08)', borderColor: 'rgba(245,158,11,0.3)', color: '#f59e0b' }
                                                            : { background: 'rgba(245,158,11,0.04)', borderColor: 'rgba(245,158,11,0.15)', color: 'rgba(245,158,11,0.5)' }
                                                        ),
                                                    }}
                                                >
                                                    {u.isPremium ? 'Premium ✓' : 'Premium'}
                                                </button>
                                                <button
                                                    onClick={() => handleToggleActive(u)}
                                                    title={u.isActive ? 'Desactivar acceso' : 'Activar acceso'}
                                                    style={{
                                                        padding: '0.35rem 0.8rem',
                                                        borderRadius: '7px',
                                                        border: '1px solid',
                                                        fontSize: '0.78rem',
                                                        cursor: 'pointer',
                                                        whiteSpace: 'nowrap',
                                                        transition: 'all 0.2s',
                                                        ...(u.isActive
                                                            ? { background: 'rgba(255,100,100,0.08)', borderColor: 'rgba(255,100,100,0.25)', color: '#ff8080' }
                                                            : { background: 'rgba(0,212,255,0.08)', borderColor: 'rgba(0,212,255,0.25)', color: 'var(--color-primary)' }
                                                        ),
                                                    }}
                                                >
                                                    {u.isActive ? 'Desactivar' : 'Activar'}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(u)}
                                                    title="Eliminar usuario"
                                                    style={{
                                                        padding: '0.35rem 0.8rem',
                                                        borderRadius: '7px',
                                                        border: '1px solid rgba(255,50,50,0.25)',
                                                        fontSize: '0.78rem',
                                                        cursor: 'pointer',
                                                        background: 'rgba(255,50,50,0.08)',
                                                        color: '#ff6464',
                                                        whiteSpace: 'nowrap',
                                                        transition: 'all 0.2s',
                                                    }}
                                                >
                                                    Eliminar
                                                </button>
                                            </>
                                        )}
                                        {(!isAdmin || isMe || u.isSuperuser) && (
                                            <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: '0.78rem', padding: '0.35rem 0' }}>
                                                {isMe ? '(tu cuenta)' : u.isSuperuser ? '(superadmin)' : '—'}
                                            </span>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default UserManager;
