import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const MEDALHAS = ['🥇', '🥈', '🥉'];
const POS_CLASS = ['gold', 'silver', 'bronze'];

export default function Ranking() {
  const { user } = useAuth();
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/ranking')
      .then(r => setLista(r.data || []))
      .catch(() => setLista([]))
      .finally(() => setLoading(false));
  }, []);

  const minhaPos = lista.findIndex(u => u.nome === user?.nome);

  return (
    <div>
      <div className="page-header">
        <h1>🏆 Ranking da Turma</h1>
        <p>Acumule pontos respondendo quizzes e completando módulos.</p>
      </div>

      {/* Minha posição */}
      {minhaPos !== -1 && (
        <div className="stat-card" style={{ marginBottom: '1.5rem', background: 'rgba(37,99,235,0.08)', borderColor: 'rgba(59,130,246,0.25)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ fontSize: '2rem' }}>{minhaPos < 3 ? MEDALHAS[minhaPos] : `#${minhaPos + 1}`}</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>Sua posição atual</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{lista[minhaPos]?.pontos ?? 0} pontos acumulados</div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : lista.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏆</div>
          <h3>Ranking ainda vazio</h3>
          <p>Complete quizzes para aparecer no ranking.</p>
        </div>
      ) : (
        <div className="ranking-list">
          {lista.map((u, i) => (
            <div
              key={u.id ?? i}
              className="ranking-item"
              style={u.nome === user?.nome ? { borderColor: 'rgba(59,130,246,0.4)', background: 'rgba(37,99,235,0.08)' } : {}}
            >
              <div className={`ranking-pos ${POS_CLASS[i] || ''}`}>
                {i < 3 ? MEDALHAS[i] : `#${i + 1}`}
              </div>
              <div className="ranking-name">
                {u.nome}
                {u.nome === user?.nome && (
                  <span style={{ fontSize: '0.7rem', color: '#60a5fa', fontWeight: 600, marginLeft: '0.5rem' }}>← você</span>
                )}
              </div>
              <div className="ranking-pts">{u.pontos ?? 0} pts</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
