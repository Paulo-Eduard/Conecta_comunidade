import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function ProfessorDashboard() {
  const { user } = useAuth();
  const [stats,   setStats]   = useState({ total_alunos: 0, total_professores: 0 });
  const [alunos,  setAlunos]  = useState([]);
  const [cursos,  setCursos]  = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      try {
        const [statsRes, alunosRes, cursosRes] = await Promise.all([
          api.get('/alunos/stats'),
          api.get('/alunos/'),
          api.get('/cursos'),
        ]);
        setStats(statsRes.data);
        setAlunos(alunosRes.data.slice(0, 5));
        setCursos(cursosRes.data.length);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    carregar();
  }, []);

  const hora = new Date().getHours();
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';

  return (
    <div>
      <div className="page-header">
        <h1>{saudacao}, Prof. {user?.nome?.split(' ')[0]} 👨‍🏫</h1>
        <p>Painel do professor — acompanhe sua turma em tempo real.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-icon">👥</div>
          <div className="stat-card-value" style={{ color: '#60a5fa' }}>
            {loading ? <span className="skeleton-val" /> : stats.total_alunos}
          </div>
          <div className="stat-card-label">Alunos cadastrados</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">📚</div>
          <div className="stat-card-value" style={{ color: '#34d399' }}>
            {loading ? <span className="skeleton-val" /> : cursos}
          </div>
          <div className="stat-card-label">Cursos ativos</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">🏫</div>
          <div className="stat-card-value" style={{ color: '#fbbf24' }}>
            {loading ? <span className="skeleton-val" /> : stats.total_professores}
          </div>
          <div className="stat-card-label">Professores</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">📈</div>
          <div className="stat-card-value" style={{ color: '#a78bfa' }}>
            {loading ? <span className="skeleton-val" /> : `${cursos > 0 && stats.total_alunos > 0 ? Math.min(100, Math.round((stats.total_alunos / (cursos * 10)) * 100)) : 0}%`}
          </div>
          <div className="stat-card-label">Engajamento estimado</div>
        </div>
      </div>

      {/* Alunos recentes */}
      <div className="table-wrap" style={{ marginBottom: '1.5rem' }}>
        <div className="table-header">
          <span className="table-title">👥 Alunos recentes</span>
          <Link to="/dashboard/alunos" style={{ color: '#60a5fa', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' }}>
            Ver todos →
          </Link>
        </div>
        {loading ? (
          <div className="loading"><div className="spinner" /></div>
        ) : alunos.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👤</div>
            <h3>Nenhum aluno ainda</h3>
            <p>Quando alunos se cadastrarem, eles aparecerão aqui.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr><th>Nome</th><th>E-mail</th><th>Pontos</th><th>Status</th></tr>
            </thead>
            <tbody>
              {alunos.map(a => (
                <tr key={a.id}>
                  <td style={{ fontWeight: 600 }}>{a.nome}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{a.email}</td>
                  <td style={{ color: '#fbbf24', fontWeight: 700 }}>{a.pontos ?? 0} pts</td>
                  <td><span className="badge badge-green"><span className="badge-dot" />Ativo</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Ações rápidas */}
      <div>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>⚡ Ações rápidas</h2>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {[
            { to: '/dashboard/alunos',    label: '👥 Gerenciar alunos' },
            { to: '/dashboard/ranking',   label: '🏆 Ver ranking' },
            { to: '/dashboard/cursos',    label: '📚 Cursos' },
            { to: '/dashboard/comunidade', label: '💬 Comunidade' },
          ].map(({ to, label }) => (
            <Link key={to} to={to} style={{ textDecoration: 'none' }}>
              <button className="btn-sm btn-info" style={{ padding: '0.6rem 1.2rem', fontSize: '0.875rem' }}>
                {label}
              </button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
