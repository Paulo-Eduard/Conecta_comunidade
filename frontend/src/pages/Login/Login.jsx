import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const [email, setEmail]   = useState('');
  const [senha, setSenha]   = useState('');
  const [show, setShow]     = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro]     = useState('');
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro(''); setLoading(true);
    try {
      const r = await api.post('/auth/login', { email, senha });
      login(r.data);
      navigate('/dashboard/home');
    } catch (err) {
      setErro(err.response?.data?.detail || 'E-mail ou senha incorretos.');
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
        <h1>Bem-vindo ao Conecta</h1>
        <p className="subtitle">Plataforma de inclusão digital</p>

        <form onSubmit={handleLogin} autoComplete="off">
          <div className="auth-field">
            <label>E-mail</label>
            <input type="email" value={email} required
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com" autoComplete="off" name="cc_email" />
          </div>
          <div className="auth-field">
            <label>Senha</label>
            <div className="input-pw-wrap">
              <input type={show ? 'text' : 'password'} value={senha} required
                onChange={e => setSenha(e.target.value)}
                placeholder="••••••••" autoComplete="new-password" name="cc_senha" />
              <button type="button" className="pw-toggle" onClick={() => setShow(s => !s)}
                tabIndex={-1} aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}>
                {show ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {erro && <div className="alert alert-error">{erro}</div>}

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? <span className="btn-spinner" /> : null}
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="auth-footer">
          Ainda não tem conta? <Link to="/register">Cadastre-se</Link>
        </div>
      </div>
    </div>
  );
}
