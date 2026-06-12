import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function AlunoDashboard() {
  const { user, refreshPontos } = useAuth();
  const [rankPos,   setRankPos]  = useState(null);
  const [quizStats, setQuizStats] = useState(null);
  const [cursos,    setCursos]   = useState([]);
  const [loading,   setLoading]  = useState(true);

  useEffect(() => {
    const carregar = async () => {
      setLoading(true);
      try {
        const [rankRes, quizRes, cursosRes] = await Promise.all([
          api.get('/ranking'),
          api.get('/quiz/meus-resultados'),
          api.get('/cursos'),
        ]);

        const idx = rankRes.data.findIndex(u => u.id === user?.id);
        setRankPos(idx !== -1 ? idx + 1 : null);
        setQuizStats(quizRes.data);
        setCursos(cursosRes.data.slice(0, 2));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
        refreshPontos();
      }
    };
    carregar();
  }, [user?.id]);

  const hora = new Date().getHours();
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';

  return (
    <div>
      <div className="page-header">
        <h1>{saudacao}, {user?.nome?.split(' ')[0]} 👋</h1>
        <p>Continue de onde parou. Você está indo bem!</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-icon">💎</div>
          <div className="stat-card-value" style={{ color: '#fbbf24' }}>
            {loading ? <span className="skeleton-val" /> : (user?.pontos ?? 0)}
          </div>
          <div className="stat-card-label">Seus pontos</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">✅</div>
          <div className="stat-card-value" style={{ color: '#34d399' }}>
            {loading ? <span className="skeleton-val" /> : (quizStats?.total_respondidas ?? 0)}
          </div>
          <div className="stat-card-label">Quizzes respondidos</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">🎯</div>
          <div className="stat-card-value" style={{ color: '#60a5fa' }}>
            {loading ? <span className="skeleton-val" /> : (quizStats ? `${quizStats.percentual}%` : '—')}
          </div>
          <div className="stat-card-label">Taxa de acerto</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">🏆</div>
          <div className="stat-card-value" style={{ color: '#f59e0b' }}>
            {loading ? <span className="skeleton-val" /> : (rankPos ? `#${rankPos}` : '—')}
          </div>
          <div className="stat-card-label">Posição no ranking</div>
        </div>
      </div>

      {/* Cursos */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Cursos disponíveis</h2>
          <Link to="/dashboard/cursos" style={{ color: '#60a5fa', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' }}>
            Ver todos →
          </Link>
        </div>

        {loading ? (
          <div className="cursos-grid">
            {[1,2].map(i => <div key={i} className="curso-card skeleton-card" />)}
          </div>
        ) : (
          <div className="cursos-grid">
            {cursos.map(c => (
              <div key={c.id} className="curso-card">
                <div className="curso-tag" style={{ color: c.cor }}>{c.tag}</div>
                <div className="curso-nome">{c.titulo}</div>
                <div className="curso-desc">{c.descricao}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  {c.modulos} módulos
                </div>
                <Link to="/dashboard/cursos">
                  <button className="btn-primary" style={{ padding: '0.5rem', background: c.cor }}>
                    Ver curso →
                  </button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quiz CTA */}
      <div className="table-wrap">
        <div className="table-header">
          <span className="table-title">🎮 Ganhe pontos com Quizzes</span>
          <Link to="/dashboard/quiz" style={{ color: '#60a5fa', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' }}>
            Jogar agora →
          </Link>
        </div>
        <div style={{ padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
          Responda perguntas sobre os cursos e suba no ranking!
          Cada resposta certa vale <strong style={{ color: '#fbbf24' }}>10 pontos</strong>.
          {quizStats?.total_respondidas > 0 && (
            <span style={{ display: 'block', marginTop: '0.5rem', color: '#34d399' }}>
              Você já respondeu {quizStats.total_respondidas} {quizStats.total_respondidas === 1 ? 'questão' : 'questões'} com {quizStats.percentual}% de acerto. Continue!
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
