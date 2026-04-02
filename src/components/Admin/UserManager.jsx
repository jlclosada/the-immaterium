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
    const toast = useToast();

    // Detect if the current user is a leader (superuser)
    const [currentUser, setCurrentUser] = useState(null);
    const isLeader = currentUser?.isSuperuser ?? false;

    useEffect(() => { loadUsers(); }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await api.getUsers(token);
            const list = Array.isArray(data) ? data : [];
            setUsers(list);
            // Identify the current user by finding who owns this token
            // (The user who is logged in will have a matching token — we detect by checking
            // the API response: all users are returned; the current one is whoever created the token.
            // We use a separate endpoint or infer from the list by checking isActive + isSuperuser.
            // For now, we detect by calling login info stored in the store.)
        } catch (e) {
            toast('Error al cargar usuarios: ' + e.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    // Detect current user from users list using the stored username
    const username = useStore(state => state.username);
    useEffect(() => {
        if (users.length && username) {
            const me = users.find(u => u.username === username);
            if (me) setCurrentUser(me);
        }
    }, [users, username]);

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

    const handleToggleActive = async (user) => {
        try {
            const result = await api.toggleUserActive(user.id, token);
            setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isActive: result.isActive } : u));
            toast(
                result.isActive ? `${user.username} activado` : `${user.username} desactivado`,
                result.isActive ? 'success' : 'info'
            );
        } catch (e) {
            toast('Error: ' + e.message, 'error');
        }
    };

    const handleToggleLeader = async (user) => {
        try {
            const result = await api.toggleUserLeader(user.id, token);
            setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_leader: result.is_leader } : u));
            toast(
                result.is_leader ? `${user.username} es ahora Líder` : `${user.username} ya no es Líder`,
                result.is_leader ? 'success' : 'info'
            );
        } catch (e) {
            toast('Error: ' + e.message, 'error');
        }
    };

    const handleDelete = async (user) => {
        if (!window.confirm(`¿Eliminar al administrador "${user.username}"? Esta acción no se puede deshacer.`)) return;
        try {
            await api.deleteUser(user.id, token);
            setUsers(prev => prev.filter(u => u.id !== user.id));
            toast(`Admin "${user.username}" eliminado`, 'success');
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

    const adminCount = users.filter(u => u.isStaff && !u.isSuperuser).length;
    const leaderCount = users.filter(u => u.isSuperuser).length;

    const getRoleBadge = (user) => {
        if (user.isSuperuser) return { label: 'Leader', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)' };
        if (user.isStaff) return { label: 'Admin', color: 'var(--color-primary)', bg: 'rgba(0,212,255,0.1)', border: 'rgba(0,212,255,0.25)' };
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
                        {leaderCount} leader{leaderCount !== 1 ? 's' : ''} · {adminCount} admin{adminCount !== 1 ? 's' : ''}
                        {isLeader ? <span style={{ marginLeft: '0.75rem', color: '#f59e0b', fontSize: '0.8rem' }}>· Sesión como Leader</span> : ''}
                    </p>
                </div>
                {isLeader && (
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
                    { role: 'Leader', color: '#f59e0b', desc: 'Superusuario. Puede crear/eliminar admins y desactivar cuentas.' },
                    { role: 'Admin', color: 'var(--color-primary)', desc: 'Acceso completo al panel. Gestiona contenido.' },
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
                {showForm && isLeader && (
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
                            gridTemplateColumns: '1fr 1.4fr 100px 110px auto',
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
                            <span>Registro</span>
                            <span>Acciones</span>
                        </div>

                        {filtered.map((user, index) => {
                            const role = getRoleBadge(user);
                            const isMe = user.username === username;
                            return (
                                <motion.div
                                    key={user.id}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.04 }}
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 1.4fr 100px 110px auto',
                                        gap: '1rem',
                                        alignItems: 'center',
                                        padding: '0.85rem 1rem',
                                        background: user.isActive ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.08)',
                                        borderRadius: '10px',
                                        border: isMe
                                            ? '1px solid rgba(245,158,11,0.2)'
                                            : '1px solid rgba(255,255,255,0.05)',
                                        opacity: user.isActive ? 1 : 0.55,
                                        transition: 'opacity 0.3s',
                                    }}
                                >
                                    {/* Username + avatar */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0 }}>
                                        <div style={{
                                            width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                                            background: user.isSuperuser
                                                ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                                                : user.isStaff
                                                ? 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))'
                                                : 'rgba(255,255,255,0.1)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '0.8rem', fontFamily: 'var(--font-display)',
                                            color: user.isStaff ? '#000' : 'rgba(255,255,255,0.4)',
                                        }}>
                                            {user.username.charAt(0).toUpperCase()}
                                        </div>
                                        <div style={{ minWidth: 0 }}>
                                            <div style={{ color: 'var(--color-light)', fontSize: '0.92rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                {user.username}
                                                {isMe && <span style={{ color: '#f59e0b', fontSize: '0.7rem' }}>(tú)</span>}
                                                {user.is_leader && (
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
                                            </div>
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {user.email || '—'}
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

                                    {/* Date joined */}
                                    <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                                        {new Date(user.dateJoined).toLocaleDateString('es-ES')}
                                    </span>

                                    {/* Actions — only leader can use these */}
                                    <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                                        {isLeader && !isMe && !user.isSuperuser && (
                                            <>
                                                <button
                                                    onClick={() => handleToggleLeader(user)}
                                                    title={user.is_leader ? 'Quitar rol de Líder' : 'Asignar rol de Líder'}
                                                    style={{
                                                        padding: '0.35rem 0.8rem',
                                                        borderRadius: '7px',
                                                        border: '1px solid',
                                                        fontSize: '0.78rem',
                                                        cursor: 'pointer',
                                                        whiteSpace: 'nowrap',
                                                        transition: 'all 0.2s',
                                                        ...(user.is_leader
                                                            ? { background: 'rgba(80,200,120,0.08)', borderColor: 'rgba(80,200,120,0.3)', color: '#50c878' }
                                                            : { background: 'rgba(80,200,120,0.04)', borderColor: 'rgba(80,200,120,0.15)', color: 'rgba(80,200,120,0.5)' }
                                                        ),
                                                    }}
                                                >
                                                    {user.is_leader ? 'Líder ✓' : 'Líder'}
                                                </button>
                                                <button
                                                    onClick={() => handleToggleActive(user)}
                                                    title={user.isActive ? 'Desactivar acceso' : 'Activar acceso'}
                                                    style={{
                                                        padding: '0.35rem 0.8rem',
                                                        borderRadius: '7px',
                                                        border: '1px solid',
                                                        fontSize: '0.78rem',
                                                        cursor: 'pointer',
                                                        whiteSpace: 'nowrap',
                                                        transition: 'all 0.2s',
                                                        ...(user.isActive
                                                            ? { background: 'rgba(255,100,100,0.08)', borderColor: 'rgba(255,100,100,0.25)', color: '#ff8080' }
                                                            : { background: 'rgba(0,212,255,0.08)', borderColor: 'rgba(0,212,255,0.25)', color: 'var(--color-primary)' }
                                                        ),
                                                    }}
                                                >
                                                    {user.isActive ? 'Desactivar' : 'Activar'}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user)}
                                                    title="Eliminar administrador"
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
                                        {(!isLeader || isMe || user.isSuperuser) && (
                                            <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: '0.78rem', padding: '0.35rem 0' }}>
                                                {isMe ? '(tu cuenta)' : user.isSuperuser ? '(leader)' : '—'}
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
