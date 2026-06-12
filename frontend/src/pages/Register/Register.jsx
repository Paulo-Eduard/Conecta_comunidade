import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function Register() {
  const [form, setForm] = useState({ nome: '', email: '', senha: '', role: 'aluno', admin_code: '' });
  const [showSenha, setShowSenha] = useState(false);
  const [showCode,  setShowCode]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [erro,      setErro]      = useState('');
  const [sucesso,   setSucesso]   = useState('');
  const navigate = useNavigate();

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleRegister = async (e) => {
    e.preventDefault();
    setErro(''); setSucesso('');

    if (form.senha.length < 6) { setErro('A senha deve ter pelo menos 6 caracteres.'); return; }

    setLoading(true);
    try {
      await api.post('/auth/register', {
        nome:       form.nome,
        email:      form.email,
        senha:      form.senha,
        admin_code: form.role === 'professor' ? form.admin_code : undefined,
      });
      setSucesso('Conta criada! Redirecionando para o login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setErro(err.response?.data?.detail || 'Erro ao cadastrar.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <video className="auth-video" autoPlay loop muted playsInline>
        <source src="/background.mp4" type="video/mp4" />
      </video>

      <div className="auth-card">
        <div className="auth-logo">
          <img src="/logo.png" alt="Conecta" onError={e => { e.target.style.display='none'; }} />
        </div>
        <h1>Criar conta</h1>
        <p className="subtitle">Junte-se à comunidade</p>

        <form onSubmit={handleRegister} autoComplete="off">
          <div className="auth-field">
            <label>Perfil</label>
            <select value={form.role} onChange={set('role')}>
              <option value="aluno">🎓 Sou Aluno</option>
              <option value="professor">👨‍🏫 Sou Professor</option>
            </select>
          </div>

          <div className="auth-field">
            <label>Nome completo</label>
            <input type="text" value={form.nome} required onChange={set('nome')}
              placeholder="Seu nome" autoComplete="off" />
          </div>

          <div className="auth-field">
            <label>E-mail</label>
            <input type="email" value={form.email} required onChange={set('email')}
              placeholder="seu@email.com" autoComplete="off" name="cc_reg_email" />
          </div>

          <div className="auth-field">
            <label>Senha</label>
            <div className="input-pw-wrap">
              <input type={showSenha ? 'text' : 'password'} value={form.senha} required
                onChange={set('senha')} placeholder="Mínimo 6 caracteres"
                autoComplete="new-password" name="cc_reg_senha" />
              <button type="button" className="pw-toggle" onClick={() => setShowSenha(s => !s)}
                tabIndex={-1}>{showSenha ? '🙈' : '👁️'}</button>
            </div>
          </div>

          {form.role === 'professor' && (
            <div className="auth-field">
              <label>Código de Professor</label>
              <div className="input-pw-wrap">
                <input type={showCode ? 'text' : 'password'} value={form.admin_code}
                  required={form.role === 'professor'} onChange={set('admin_code')}
                  placeholder="Código fornecido pela instituição" autoComplete="off" />
                <button type="button" className="pw-toggle" onClick={() => setShowCode(s => !s)}
                  tabIndex={-1}>{showCode ? '🙈' : '👁️'}</button>
              </div>
            </div>
          )}

          {erro    && <div className="alert alert-error">{erro}</div>}
          {sucesso && <div className="alert alert-success">{sucesso}</div>}

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'Cadastrando...' : 'Criar conta'}
          </button>
        </form>

        <div className="auth-footer">
          Já tem conta? <Link to="/login">Entrar</Link>
        </div>
      </div>
    </div>
  );
}
