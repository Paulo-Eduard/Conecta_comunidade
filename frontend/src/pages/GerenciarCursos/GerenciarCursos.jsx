import React, { useEffect, useState } from 'react';
import api from '../../services/api';

export default function GerenciarCursos() {
  const [cursos, setCursos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ titulo: '', descricao: '', tag: 'Geral', modulos: 1, cor: '#2563eb' });
  const [loading, setLoading] = useState(true);

  const carregar = async () => {
    try {
      const r = await api.get('/cursos/admin/todos');
      setCursos(r.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { carregar(); }, []);

  const salvar = async (e) => {
    e.preventDefault();
    try {
      await api.post('/cursos', form);
      setForm({ titulo: '', descricao: '', tag: 'Geral', modulos: 1, cor: '#2563eb' });
      setShowForm(false);
      carregar();
    } catch (e) { alert('Erro ao criar curso'); }
  };

  const deletar = async (id) => {
    if (!window.confirm('Tem certeza?')) return;
    try {
      await api.delete(`/cursos/${id}`);
      carregar();
    } catch (e) { alert('Erro ao deletar'); }
  };

  return (
    <div>
      <div className="page-header">
        <h1>📚 Gerenciar Cursos</h1>
        <p>Crie e gerencie os cursos da plataforma</p>
      </div>

      <button className="btn-primary" onClick={() => setShowForm(!showForm)}
        style={{ width: 'auto', padding: '0.6rem 1.5rem', marginBottom: '1.5rem' }}>
        {showForm ? '❌ Cancelar' : '➕ Novo Curso'}
      </button>

      {showForm && (
        <form onSubmit={salvar} className="table-wrap" style={{ marginBottom: '1.5rem' }}>
          <div className="table-header"><span className="table-title">Criar novo curso</span></div>
          <div style={{ padding: '1.5rem', display: 'grid', gap: '0.75rem' }}>
            <input type="text" placeholder="Título" value={form.titulo} required
              onChange={e => setForm({ ...form, titulo: e.target.value })}
              style={{ padding: '0.6rem', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)' }} />
            <textarea placeholder="Descrição" value={form.descricao} required
              onChange={e => setForm({ ...form, descricao: e.target.value })}
              style={{ padding: '0.6rem', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', minHeight: 60 }} />
            <input type="text" placeholder="Tag" value={form.tag}
              onChange={e => setForm({ ...form, tag: e.target.value })}
              style={{ padding: '0.6rem', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)' }} />
            <input type="number" placeholder="Módulos" value={form.modulos} min="1"
              onChange={e => setForm({ ...form, modulos: parseInt(e.target.value) })}
              style={{ padding: '0.6rem', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)' }} />
            <input type="color" value={form.cor}
              onChange={e => setForm({ ...form, cor: e.target.value })}
              style={{ padding: '0.4rem', borderRadius: 8, border: '1px solid var(--border)', height: 42 }} />
            <button type="submit" className="btn-primary" style={{ padding: '0.7rem' }}>💾 Salvar Curso</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {cursos.map(c => (
            <div key={c.id} className="stat-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <div style={{ color: c.cor, fontWeight: 700, fontSize: '0.85rem' }}>{c.tag}</div>
                <span style={{ fontSize: '0.7rem', background: c.ativo ? 'rgba(16,185,129,0.15)' : 'rgba(107,114,128,0.15)', color: c.ativo ? '#34d399' : '#9ca3af', padding: '0.25rem 0.6rem', borderRadius: 6 }}>
                  {c.ativo ? '✅ Ativo' : '⛔ Inativo'}
                </span>
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{c.titulo}</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1rem' }}>{c.descricao}</p>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                📊 {c.modulos} módulos • 👥 {c.alunos_inscritos} alunos
              </div>
              <button className="btn-sm btn-danger" onClick={() => deletar(c.id)} style={{ width: '100%' }}>
                🗑️ Desativar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
