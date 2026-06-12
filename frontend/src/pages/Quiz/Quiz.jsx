import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function Quiz() {
  const { user, refreshPontos } = useAuth();
  const [searchParams] = useSearchParams();
  const cursoId = searchParams.get('curso');

  const [cursos,    setCursos]    = useState([]);
  const [questoes,  setQuestoes]  = useState([]);
  const [cursoAtual, setCursoAtual] = useState(null);
  const [idx,       setIdx]       = useState(0);
  const [escolha,   setEscolha]   = useState(null);   // "a"|"b"|"c"|"d"
  const [correta,   setCorreta]   = useState(null);
  const [respondeu, setRespondeu] = useState(false);
  const [feedback,  setFeedback]  = useState(null);   // {acertou, pontos}
  const [fim,       setFim]       = useState(false);
  const [score,     setScore]     = useState({ acertos: 0, total: 0 });
  const [loading,   setLoading]   = useState(true);
  const [sending,   setSending]   = useState(false);

  // Carrega lista de cursos (para escolher)
  useEffect(() => {
    api.get('/cursos').then(r => setCursos(r.data)).catch(() => {});
  }, []);

  // Carrega questões do curso selecionado
  const carregarQuestoes = useCallback(async (id) => {
    setLoading(true); setFim(false); setIdx(0);
    setEscolha(null); setCorreta(null); setRespondeu(false); setFeedback(null);
    setScore({ acertos: 0, total: 0 });
    try {
      const r = await api.get(`/quiz/cursos/${id}`);
      setQuestoes(r.data);
      setCursoAtual(id);
    } catch { setQuestoes([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (cursoId) carregarQuestoes(cursoId);
    else setLoading(false);
  }, [cursoId]);

  const questao = questoes[idx];

  const responder = async () => {
    if (!escolha || respondeu || sending) return;
    setSending(true);
    try {
      const r = await api.post('/quiz/responder', {
        user_id:    user.id,
        questao_id: questao.id,
        acertou:    escolha === correta,
      });
      const acertou = escolha === r.data.correta;
      setCorreta(r.data.correta);
      setRespondeu(true);
      setFeedback({ acertou, pontos: r.data.pontos_ganhos });
      setScore(prev => ({
        acertos: prev.acertos + (acertou ? 1 : 0),
        total:   prev.total + 1,
      }));
      if (acertou) refreshPontos();
    } catch { /* silencia */ }
    finally { setSending(false); }
  };

  const proxima = () => {
    if (idx + 1 >= questoes.length) { setFim(true); return; }
    setIdx(i => i + 1);
    setEscolha(null); setCorreta(null); setRespondeu(false); setFeedback(null);
  };

  const reiniciar = () => carregarQuestoes(cursoAtual);

  const OPCOES = ['a', 'b', 'c', 'd'];
  const LABELS = { a: 'A', b: 'B', c: 'C', d: 'D' };
  const getText = (q, op) => q[`opcao_${op}`];

  // ── Sem curso selecionado: escolher ──────────────────────────────────────
  if (!cursoAtual) {
    return (
      <div>
        <div className="page-header">
          <h1>🎮 Quiz</h1>
          <p>Escolha um curso para começar. Cada acerto vale 10 pontos!</p>
        </div>
        {loading ? <div className="loading"><div className="spinner" /></div> : (
          <div className="cursos-grid">
            {cursos.map(c => (
              <div key={c.id} className="curso-card" style={{ cursor: 'pointer' }}
                onClick={() => carregarQuestoes(c.id)}>
                <div className="curso-tag" style={{ color: c.cor }}>{c.tag}</div>
                <div className="curso-nome">{c.titulo}</div>
                <div className="curso-desc">{c.descricao}</div>
                <button className="btn-primary" style={{ marginTop: '0.75rem', padding: '0.55rem', background: c.cor, fontSize: '0.85rem' }}>
                  Iniciar Quiz →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Carregando questões ───────────────────────────────────────────────────
  if (loading) return <div className="loading"><div className="spinner" /></div>;

  // ── Sem questões ─────────────────────────────────────────────────────────
  if (!loading && questoes.length === 0) return (
    <div>
      <div className="page-header"><h1>🎮 Quiz</h1></div>
      <div className="empty-state">
        <div className="empty-state-icon">📝</div>
        <h3>Nenhuma questão disponível</h3>
        <p>Este curso ainda não tem questões de quiz.</p>
        <button className="btn-primary" style={{ marginTop: '1rem', width: 'auto', padding: '0.6rem 1.5rem' }}
          onClick={() => { setCursoAtual(null); setQuestoes([]); }}>
          Escolher outro curso
        </button>
      </div>
    </div>
  );

  // ── Fim do quiz ───────────────────────────────────────────────────────────
  if (fim) {
    const pct = Math.round(score.acertos / score.total * 100);
    return (
      <div>
        <div className="page-header"><h1>🎮 Quiz finalizado!</h1></div>
        <div className="stat-card" style={{ maxWidth: 480, textAlign: 'center', padding: '2.5rem', margin: '0 auto' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
            {pct >= 80 ? '🏆' : pct >= 50 ? '⭐' : '📚'}
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            {score.acertos}/{score.total} acertos
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: pct >= 80 ? '#34d399' : pct >= 50 ? '#fbbf24' : '#f87171', marginBottom: '1rem' }}>
            {pct}%
          </div>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            {pct >= 80 ? 'Excelente! Você domina o assunto! 🎉' : pct >= 50 ? 'Bom trabalho! Continue praticando.' : 'Continue estudando, você vai melhorar!'}
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-primary" style={{ width: 'auto', padding: '0.6rem 1.5rem' }} onClick={reiniciar}>
              🔄 Tentar novamente
            </button>
            <button className="btn-primary" style={{ width: 'auto', padding: '0.6rem 1.5rem', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text)' }}
              onClick={() => { setCursoAtual(null); setQuestoes([]); }}>
              Outro curso
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Questão atual ─────────────────────────────────────────────────────────
  return (
    <div>
      <div className="page-header">
        <h1>🎮 Quiz</h1>
        <p>Questão {idx + 1} de {questoes.length}</p>
      </div>

      {/* Progress bar */}
      <div className="progress-bar" style={{ marginBottom: '1.5rem', height: 8 }}>
        <div className="progress-fill" style={{ width: `${((idx + 1) / questoes.length) * 100}%` }} />
      </div>

      <div className="stat-card" style={{ maxWidth: 640, padding: '2rem' }}>
        <p style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '1.5rem', lineHeight: 1.5 }}>
          {questao.enunciado}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.25rem' }}>
          {OPCOES.map(op => {
            let bg = 'rgba(255,255,255,0.05)';
            let border = 'var(--border)';
            let color = 'var(--text)';
            if (respondeu) {
              if (op === correta)         { bg = 'rgba(16,185,129,0.15)'; border = 'rgba(16,185,129,0.5)'; color = '#34d399'; }
              else if (op === escolha)    { bg = 'rgba(239,68,68,0.12)'; border = 'rgba(239,68,68,0.4)'; color = '#f87171'; }
            } else if (op === escolha)    { bg = 'rgba(59,130,246,0.12)'; border = 'rgba(59,130,246,0.5)'; color = '#60a5fa'; }

            return (
              <button key={op}
                disabled={respondeu}
                onClick={() => setEscolha(op)}
                style={{
                  background: bg, border: `1px solid ${border}`, borderRadius: 12,
                  padding: '0.75rem 1rem', textAlign: 'left', cursor: respondeu ? 'default' : 'pointer',
                  color, fontWeight: 500, fontSize: '0.9rem', fontFamily: 'inherit', transition: 'all 0.15s',
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                }}>
                <span style={{ fontWeight: 700, fontSize: '0.85rem', opacity: 0.7 }}>{LABELS[op]}</span>
                {getText(questao, op)}
                {respondeu && op === correta && <span style={{ marginLeft: 'auto' }}>✅</span>}
                {respondeu && op === escolha && op !== correta && <span style={{ marginLeft: 'auto' }}>❌</span>}
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {feedback && (
          <div className={`alert ${feedback.acertou ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: '1rem' }}>
            {feedback.acertou
              ? `✅ Correto! +${feedback.pontos} pontos`
              : '❌ Resposta incorreta. Veja a opção correta destacada.'}
          </div>
        )}

        {/* Ações */}
        {!respondeu ? (
          <button className="btn-primary" disabled={!escolha || sending}
            onClick={responder} style={{ padding: '0.7rem' }}>
            {sending ? 'Enviando...' : 'Confirmar resposta'}
          </button>
        ) : (
          <button className="btn-primary" onClick={proxima} style={{ padding: '0.7rem' }}>
            {idx + 1 >= questoes.length ? 'Ver resultado 🏁' : 'Próxima questão →'}
          </button>
        )}
      </div>
    </div>
  );
}
