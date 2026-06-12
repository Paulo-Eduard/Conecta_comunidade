import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const MENU_ALUNO = [
  { to: '/dashboard/home',       icon: '🏠', label: 'Início' },
  { to: '/dashboard/cursos',     icon: '📚', label: 'Meus Cursos' },
  { to: '/dashboard/quiz',       icon: '🎮', label: 'Quiz' },
  { to: '/dashboard/ranking',    icon: '🏆', label: 'Ranking' },
  { to: '/dashboard/comunidade', icon: '💬', label: 'Comunidade' },
];

const MENU_PROFESSOR = [
  { to: '/dashboard/home',           icon: '🏠', label: 'Visão Geral' },
  { to: '/dashboard/admin',          icon: '📊', label: 'Dashboard Admin' },
  { to: '/dashboard/gerenciar-cursos', icon: '📚', label: 'Gerenciar Cursos' },
  { to: '/dashboard/alunos',         icon: '👥', label: 'Gerenciar Alunos' },
  { to: '/dashboard/ranking',        icon: '🏆', label: 'Ranking' },
  { to: '/dashboard/comunidade',     icon: '💬', label: 'Comunidade' },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menu    = user?.role === 'professor' ? MENU_PROFESSOR : MENU_ALUNO;
  const inicial = (user?.nome || 'U')[0].toUpperCase();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="dash-wrap">
      <video className="dash-video" autoPlay loop muted playsInline>
        <source src="/background.mp4" type="video/mp4" />
      </video>

      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <button className="hamburger" onClick={() => setSidebarOpen(s => !s)} aria-label="Menu">
        <span /><span /><span />
      </button>

      <aside className={`sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="sidebar-logo">
          <img src="/logo.png" alt="Conecta" style={{ borderRadius: 10 }}
            onError={e => { e.target.style.display='none'; }} />
          <div className="sidebar-logo-text">
            <h2>Conecta</h2>
            <span>Comunidade</span>
          </div>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-section-title">Menu</div>
          {menu.map(item => (
            <NavLink key={item.to} to={item.to}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
              onClick={() => setSidebarOpen(false)}>
              <span className="sidebar-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="sidebar-bottom">
          {user?.role === 'aluno' && (
            <div className="sidebar-points">
              💎 <strong>{user?.pontos ?? 0}</strong> pontos
            </div>
          )}
          <div className="sidebar-user">
            <div className="sidebar-avatar">{inicial}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.nome || 'Usuário'}</div>
              <div className={`sidebar-user-role ${user?.role}`}>
                {user?.role === 'professor' ? '👨‍🏫 Professor' : '🎓 Aluno'}
              </div>
            </div>
          </div>
          <button className="btn-logout" onClick={handleLogout}>🚪 Sair</button>
        </div>
      </aside>

      <main className="dash-main">
        <Outlet />
      </main>
    </div>
  );
}
