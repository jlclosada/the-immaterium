import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../../services/api';
import { useStore } from '../../stores/useStore';
import { useToast } from './Toast';

const UserManager = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const token = useStore(state => state.token);
    const toast = useToast();

    useEffect(() => { loadUsers(); }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await api.getUsers(token);
            setUsers(Array.isArray(data) ? data : []);
        } catch (e) {
            toast('Error al cargar usuarios: ' + e.message, 'error');
        } finally {
            setLoading(false);
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

    const filtered = users.filter(u => {
        const term = searchTerm.toLowerCase();
        return (
            u.username.toLowerCase().includes(term) ||
            (u.email || '').toLowerCase().includes(term)
        );
    });

    const activeCount = users.filter(u => u.isActive).length;
    const staffCount = users.filter(u => u.isStaff).length;

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                <h2 style={{
                    fontFamily: 'var(--font-display)',
                    color: 'var(--color-primary)',
                    marginBottom: '0.5rem',
                    fontSize: '2.5rem',
                }}>
                    Gestión de Usuarios
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '2rem', fontSize: '0.9rem' }}>
                    {users.length} usuarios · {activeCount} activos · {staffCount} administradores
                </p>
            </motion.div>

            {/* Search */}
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
                className="glass-panel"
                style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}
            >
                <div style={{ position: 'relative', maxWidth: '400px' }}>
                    <span style={{
                        position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)',
                        color: 'rgba(255,255,255,0.3)', display: 'flex',
                    }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                    </span>
                    <input
                        type="text"
                        placeholder="Buscar por nombre o email..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="search-bar"
                        style={{ paddingLeft: '2.5rem' }}
                    />
                </div>
            </motion.div>

            {/* Users list */}
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }}
                className="glass-panel"
                style={{ padding: '2rem' }}
            >
                <h3 style={{
                    marginTop: 0, marginBottom: '1.5rem',
                    fontFamily: 'var(--font-display)',
                    color: 'var(--color-primary)',
                    fontSize: '1.4rem',
                }}>
                    Usuarios ({filtered.length})
                </h3>

                {loading ? (
                    <div className="loading-spinner" style={{ margin: '3rem auto' }} />
                ) : filtered.length === 0 ? (
                    <p style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '2rem' }}>
                        {searchTerm ? `Sin resultados para "${searchTerm}"` : 'No hay usuarios registrados.'}
                    </p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {/* Header row */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1.5fr auto auto auto',
                            gap: '1rem',
                            padding: '0.5rem 1.25rem',
                            color: 'rgba(255,255,255,0.35)',
                            fontSize: '0.75rem',
                            letterSpacing: '1px',
                            textTransform: 'uppercase',
                            fontFamily: 'var(--font-display)',
                        }}>
                            <span>Usuario</span>
                            <span>Email</span>
                            <span>Rol</span>
                            <span>Registro</span>
                            <span>Acción</span>
                        </div>

                        {filtered.map((user, index) => (
                            <motion.div
                                key={user.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.04 }}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1.5fr auto auto auto',
                                    gap: '1rem',
                                    alignItems: 'center',
                                    padding: '0.9rem 1.25rem',
                                    background: user.isActive ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.1)',
                                    borderRadius: '10px',
                                    border: '1px solid rgba(255,255,255,0.06)',
                                    opacity: user.isActive ? 1 : 0.5,
                                    transition: 'opacity 0.3s',
                                }}
                            >
                                {/* Username */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0 }}>
                                    <div style={{
                                        width: '34px', height: '34px',
                                        borderRadius: '50%',
                                        background: user.isStaff
                                            ? 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))'
                                            : 'rgba(255,255,255,0.1)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.85rem',
                                        fontFamily: 'var(--font-display)',
                                        color: user.isStaff ? 'white' : 'rgba(255,255,255,0.5)',
                                        flexShrink: 0,
                                    }}>
                                        {user.username.charAt(0).toUpperCase()}
                                    </div>
                                    <span style={{
                                        color: 'var(--color-light)',
                                        fontSize: '0.95rem',
                                        fontWeight: 500,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}>
                                        {user.username}
                                    </span>
                                </div>

                                {/* Email */}
                                <span style={{
                                    color: 'rgba(255,255,255,0.45)',
                                    fontSize: '0.85rem',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }}>
                                    {user.email || '—'}
                                </span>

                                {/* Role badge */}
                                <span style={{
                                    padding: '3px 10px',
                                    borderRadius: '20px',
                                    fontSize: '0.72rem',
                                    fontFamily: 'var(--font-display)',
                                    letterSpacing: '0.5px',
                                    whiteSpace: 'nowrap',
                                    ...(user.isStaff
                                        ? {
                                            background: 'rgba(0,212,255,0.15)',
                                            border: '1px solid rgba(0,212,255,0.3)',
                                            color: 'var(--color-primary)',
                                        }
                                        : {
                                            background: 'rgba(255,255,255,0.06)',
                                            border: '1px solid rgba(255,255,255,0.12)',
                                            color: 'rgba(255,255,255,0.4)',
                                        }
                                    ),
                                }}>
                                    {user.isStaff ? 'Admin' : 'Usuario'}
                                </span>

                                {/* Date joined */}
                                <span style={{
                                    color: 'rgba(255,255,255,0.3)',
                                    fontSize: '0.8rem',
                                    whiteSpace: 'nowrap',
                                }}>
                                    {new Date(user.dateJoined).toLocaleDateString('es-ES')}
                                </span>

                                {/* Toggle active */}
                                <button
                                    onClick={() => handleToggleActive(user)}
                                    disabled={user.isStaff}
                                    title={user.isStaff ? 'No se puede desactivar a un admin' : user.isActive ? 'Desactivar usuario' : 'Activar usuario'}
                                    style={{
                                        padding: '0.4rem 0.9rem',
                                        borderRadius: '8px',
                                        border: '1px solid',
                                        fontSize: '0.8rem',
                                        cursor: user.isStaff ? 'not-allowed' : 'pointer',
                                        transition: 'all 0.2s',
                                        whiteSpace: 'nowrap',
                                        ...(user.isStaff
                                            ? {
                                                background: 'transparent',
                                                borderColor: 'rgba(255,255,255,0.08)',
                                                color: 'rgba(255,255,255,0.2)',
                                            }
                                            : user.isActive
                                            ? {
                                                background: 'rgba(255,100,100,0.1)',
                                                borderColor: 'rgba(255,100,100,0.3)',
                                                color: '#ff8080',
                                            }
                                            : {
                                                background: 'rgba(0,212,255,0.1)',
                                                borderColor: 'rgba(0,212,255,0.3)',
                                                color: 'var(--color-primary)',
                                            }
                                        ),
                                    }}
                                >
                                    {user.isActive ? 'Desactivar' : 'Activar'}
                                </button>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default UserManager;
