import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function Cursos() {
  const { user } = useAuth();
  const [cursos,  setCursos]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro,    setErro]    = useState('');
  const isProf = user?.role === 'professor';

  useEffect(() => {
    api.get('/cursos')
      .then(r => setCursos(r.data))
      .catch(() => setErro('Erro ao carregar cursos.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1>📚 {isProf ? 'Gerenciar Cursos' : 'Meus Cursos'}</h1>
        <p>{isProf
          ? 'Cursos disponíveis na plataforma para os alunos.'
          : 'Explore os cursos e ganhe pontos respondendo quizzes.'}</p>
      </div>

      {loading ? (
        <div className="cursos-grid">
          {[1,2,3,4].map(i => <div key={i} className="curso-card skeleton-card" style={{ height: 200 }} />)}
        </div>
      ) : erro ? (
        <div className="alert alert-error">{erro}</div>
      ) : cursos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📚</div>
          <h3>Nenhum curso ainda</h3>
          <p>Os cursos aparecerão aqui quando forem cadastrados.</p>
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

              {isProf ? (
                <span className="badge badge-green"><span className="badge-dot" />Ativo</span>
              ) : (
                <Link to={`/dashboard/quiz?curso=${c.id}`}>
                  <button className="btn-primary" style={{ padding: '0.55rem', marginTop: '0.5rem', background: c.cor, fontSize: '0.85rem' }}>
                    🎮 Fazer Quiz
                  </button>
                </Link>
              )}
            </div>
          ))}
        </div>
      )}

      {!isProf && (
        <div className="table-wrap" style={{ marginTop: '2rem' }}>
          <div className="table-header">
            <span className="table-title">💡 Como ganhar pontos</span>
          </div>
          <div style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.8 }}>
            1. Escolha um curso acima<br />
            2. Clique em "Fazer Quiz"<br />
            3. Responda as perguntas — cada acerto vale <strong style={{ color: '#fbbf24' }}>10 pontos</strong><br />
            4. Suba no <Link to="/dashboard/ranking" style={{ color: '#60a5fa', fontWeight: 600, textDecoration: 'none' }}>ranking da turma</Link>!
          </div>
        </div>
      )}
    </div>
  );
}
