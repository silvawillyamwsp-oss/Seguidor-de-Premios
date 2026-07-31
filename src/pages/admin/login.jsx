import { useState } from 'react';
import { useRouter } from 'next/router';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      router.push('/admin/dashboard');
    } else {
      setError('Usuário ou senha incorretos.');
    }
  };

  return (
    <div style={{ background: '#020617', color: '#fff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <form onSubmit={handleLogin} style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        <span style={{ fontSize: '3rem', display: 'block', marginBottom: '10px' }}>🔒</span>
        <h2 style={{ margin: '0 0 8px', fontSize: '1.5rem', fontWeight: '900' }}>Acesso Restrito</h2>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '24px' }}>Digite suas credenciais de administrador.</p>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#f87171', padding: '10px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: '12px', textAlign: 'left' }}>
          <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>USUÁRIO</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Digite o usuário"
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #334155', background: '#020617', color: '#fff', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
            required
          />
        </div>

        <div style={{ marginBottom: '20px', textAlign: 'left' }}>
          <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>SENHA</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Digite a senha"
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #334155', background: '#020617', color: '#fff', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
            required
          />
        </div>

        <button type="submit" style={{ width: '100%', background: '#0284c7', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>
          Entrar no Painel ›
        </button>
      </form>
    </div>
  );
}