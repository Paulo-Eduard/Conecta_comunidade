import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [alunos, setAlunos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      try {
        const [statsRes, alunosRes] = await Promise.all([
          api.get('/admin/dashboard'),
          api.get('/admin/alunos/detalhado'),
        ]);
        setStats(statsRes.data);
        setAlunos(alunosRes.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    carregar();
  }, []);

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  const s = stats?.estatisticas || {};
  const a = stats?.atividade || {};
  const q = stats?.quiz || {};

  return (
    <div>
      <div className="page-header">
        <h1>📊 Painel Administrativo</h1>
        <p>Controle completo da plataforma</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-icon">👥</div>
          <div className="stat-card-value" style={{ color: '#60a5fa' }}>{s.total_alunos}</div>
          <div className="stat-card-label">Alunos</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">📚</div>
          <div className="stat-card-value" style={{ color: '#34d399' }}>{s.total_cursos}</div>
          <div className="stat-card-label">Cursos</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">❓</div>
          <div className="stat-card-value" style={{ color: '#f59e0b' }}>{s.total_questoes}</div>
          <div className="stat-card-label">Questões</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">💬</div>
          <div className="stat-card-value" style={{ color: '#8b5cf6' }}>{s.total_posts}</div>
          <div className="stat-card-label">Posts</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="stat-card">
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>🟢 Online agora</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#34d399', marginTop: '0.5rem' }}>{a.online_agora}</div>
        </div>
        <div className="stat-card">
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>📈 Ativos hoje</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#60a5fa', marginTop: '0.5rem' }}>{a.ativos_hoje}</div>
        </div>
        <div className="stat-card">
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>🎯 Taxa acerto quiz</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fbbf24', marginTop: '0.5rem' }}>{q.taxa_acerto}%</div>
        </div>
      </div>

      <div className="table-wrap">
        <div className="table-header">
          <span className="table-title">👥 Alunos (Detalhado)</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Pontos</th>
              <th>Quiz</th>
              <th>Cursos</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {alunos.map(a => (
              <tr key={a.id}>
                <td style={{ fontWeight: 600 }}>{a.nome}</td>
                <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{a.email}</td>
                <td style={{ color: '#fbbf24', fontWeight: 700 }}>{a.pontos}</td>
                <td>{a.quiz_respondidas > 0 ? `${a.quiz_acertos}/${a.quiz_respondidas}` : '-'}</td>
                <td>{a.cursos_inscritos}</td>
                <td>
                  <span className={`badge ${a.status === 'online' ? 'badge-green' : 'badge-gray'}`}>
                    <span className="badge-dot" />{a.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
