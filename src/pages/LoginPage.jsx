import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useStore } from '../stores/useStore';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const setToken = useStore((state) => state.setToken);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const data = await api.login(username, password);
            setToken(data.token);
            navigate('/admin');
        } catch (err) {
            setError('Credenciales incorrectas');
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            background: '#0a0a0a',
            color: 'white'
        }}>
            <form onSubmit={handleLogin} style={{
                padding: '2rem',
                border: '1px solid #333',
                borderRadius: '8px',
                width: '300px',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
            }}>
                <h2 style={{ textAlign: 'center', fontFamily: 'Orbitron' }}>ADMIN LOGIN</h2>
                {error && <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>}

                <input
                    type="text"
                    placeholder="Usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{ padding: '0.5rem', background: '#222', border: '1px solid #444', color: 'white' }}
                />

                <input
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ padding: '0.5rem', background: '#222', border: '1px solid #444', color: 'white' }}
                />

                <button type="submit" style={{
                    padding: '0.75rem',
                    background: '#00d4ff',
                    border: 'none',
                    borderRadius: '4px',
                    color: 'black',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                }}>
                    ENTRAR
                </button>
            </form>
        </div>
    );
};

export default LoginPage;
