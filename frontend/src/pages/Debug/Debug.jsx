import React from 'react';
import { useAuth } from '../../context/AuthContext';

export default function Debug() {
  const { user } = useAuth();

  const debug = {
    "Logado?": !!user,
    "Nome": user?.nome || 'N/A',
    "Email": user?.email || 'N/A',
    "Role (cargo)": user?.role || 'N/A (PROBLEMA!)',
    "Pontos": user?.pontos || 'N/A',
    "Token salvo": !!localStorage.getItem('token'),
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'monospace', background: 'var(--bg)' }}>
      <h1>🐛 DEBUG - Verifique seu login</h1>
      <pre style={{ background: '#1a1a2e', padding: '1rem', borderRadius: 8, color: '#00ff00', overflowX: 'auto' }}>
        {JSON.stringify(debug, null, 2)}
      </pre>
      <hr />
      <h3>localStorage cc_user:</h3>
      <pre style={{ background: '#1a1a2e', padding: '1rem', borderRadius: 8, color: '#60a5fa', overflowX: 'auto', maxHeight: 200 }}>
        {localStorage.getItem('cc_user') || 'Vazio'}
      </pre>
      <hr />
      <button onClick={() => {
        localStorage.clear();
        window.location.href = '/login';
      }} style={{ padding: '0.75rem 1.5rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: '1rem' }}>
        🧹 Limpar tudo e voltar ao login
      </button>
    </div>
  );
}
