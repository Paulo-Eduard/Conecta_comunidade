import React, { useEffect, useState } from 'react';
import api from '../../services/api';

export default function Alunos() {
  const [alunos, setAlunos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');

  const carregar = async () => {
    setLoading(true);
    try {
      const r = await api.get('/alunos/');
      setAlunos(r.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const deletar = async (id, nome) => {
    if (!confirm(`Remover ${nome} da plataforma?`)) return;
    try {
      await api.delete(`/alunos/${id}`);
      setAlunos(prev => prev.filter(a => a.id !== id));
    } catch (e) {
      alert('Erro ao remover aluno.');
    }
  };

  const filtrados = alunos.filter(a =>
    a.nome.toLowerCase().includes(busca.toLowerCase()) ||
    a.email.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <h1>Gerenciar Alunos</h1>
        <p>Visualize, busque e gerencie todos os alunos cadastrados na plataforma.</p>
      </div>

      <div className="table-wrap">
        <div className="table-header">
          <span className="table-title">
            👥 {alunos.length} aluno{alunos.length !== 1 ? 's' : ''} cadastrado{alunos.length !== 1 ? 's' : ''}
          </span>
          <input
            type="text"
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar por nome ou e-mail..."
            style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)',
              borderRadius: 10, padding: '0.5rem 0.9rem', color: 'var(--text)',
              fontSize: '0.85rem', fontFamily: 'inherit', width: 240,
            }}
          />
        </div>

        {loading ? (
          <div className="loading"><div className="spinner" /></div>
        ) : filtrados.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <h3>{busca ? 'Nenhum resultado' : 'Nenhum aluno ainda'}</h3>
            <p>{busca ? 'Tente outra busca.' : 'Quando alunos se cadastrarem, aparecerão aqui.'}</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Pontos</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((a, i) => (
                <tr key={a.id}>
                  <td style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{i + 1}</td>
                  <td style={{ fontWeight: 600 }}>{a.nome}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{a.email}</td>
                  <td style={{ color: '#fbbf24', fontWeight: 700 }}>{a.pontos ?? 0} pts</td>
                  <td>
                    <span className="badge badge-green">
                      <span className="badge-dot" />Ativo
                    </span>
                  </td>
                  <td>
                    <button className="btn-sm btn-danger" onClick={() => deletar(a.id, a.nome)}>
                      Remover
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
