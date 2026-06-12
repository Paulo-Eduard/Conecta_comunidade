import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function Comunidade() {
  const { user } = useAuth();
  const [posts,   setPosts]   = useState([]);
  const [texto,   setTexto]   = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [erro,    setErro]    = useState('');
  const listRef = useRef(null);

  const carregar = async () => {
    try {
      const r = await api.get('/posts/');
      setPosts(r.data);
    } catch { /* silencia */ }
    finally { setLoading(false); }
  };

  useEffect(() => { carregar(); }, []);

  const publicar = async (e) => {
    e.preventDefault();
    if (!texto.trim() || sending) return;
    setSending(true); setErro('');
    try {
      const r = await api.post('/posts/', { usuario: user.nome, texto });
      setPosts(prev => [r.data, ...prev]);
      setTexto('');
    } catch (err) {
      setErro(err.response?.data?.detail || 'Erro ao publicar.');
    } finally { setSending(false); }
  };

  const deletar = async (id) => {
    if (!window.confirm('Remover este post?')) return;
    try {
      await api.delete(`/posts/${id}`);
      setPosts(prev => prev.filter(p => p.id !== id));
    } catch { alert('Erro ao remover post.'); }
  };

  const formatarData = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div>
      <div className="page-header">
        <h1>💬 Comunidade</h1>
        <p>Compartilhe dúvidas, dicas e conquistas com a turma.</p>
      </div>

      {/* Formulário de post */}
      <div className="table-wrap" style={{ marginBottom: '1.5rem' }}>
        <div className="table-header">
          <span className="table-title">✏️ Nova publicação</span>
        </div>
        <form onSubmit={publicar} style={{ padding: '1.25rem 1.5rem' }}>
          <textarea
            value={texto} onChange={e => setTexto(e.target.value)}
            placeholder="Escreva algo para a comunidade..."
            maxLength={500}
            style={{
              width: '100%', minHeight: 90, resize: 'vertical',
              background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
              borderRadius: 12, padding: '0.75rem 1rem', color: 'var(--text)',
              fontSize: '0.9rem', fontFamily: 'inherit',
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{texto.length}/500</span>
            <button className="btn-primary" type="submit" disabled={!texto.trim() || sending}
              style={{ width: 'auto', padding: '0.55rem 1.25rem', fontSize: '0.875rem' }}>
              {sending ? 'Publicando...' : '📢 Publicar'}
            </button>
          </div>
          {erro && <div className="alert alert-error" style={{ marginTop: '0.5rem' }}>{erro}</div>}
        </form>
      </div>

      {/* Lista de posts */}
      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : posts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">💬</div>
          <h3>Nenhuma publicação ainda</h3>
          <p>Seja o primeiro a compartilhar algo com a comunidade!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }} ref={listRef}>
          {posts.map(p => (
            <div key={p.id} className="stat-card" style={{ padding: '1.25rem 1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 10,
                    background: 'linear-gradient(135deg, #2563eb, #8b5cf6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: '0.85rem', flexShrink: 0,
                  }}>
                    {(p.usuario || '?')[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{p.usuario}</div>
                    {p.criado_em && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{formatarData(p.criado_em)}</div>
                    )}
                  </div>
                </div>
                {(user?.nome === p.usuario || user?.role === 'professor') && (
                  <button className="btn-sm btn-danger" onClick={() => deletar(p.id)}>Remover</button>
                )}
              </div>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text)', whiteSpace: 'pre-wrap' }}>
                {p.texto}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
