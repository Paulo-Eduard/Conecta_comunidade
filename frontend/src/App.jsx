import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login          from './pages/Login/Login';
import Register       from './pages/Register/Register';
import Debug          from './pages/Debug/Debug';
import DashboardLayout from './components/DashboardLayout/DashboardLayout';
import AlunoDashboard  from './pages/AlunoDashboard/AlunoDashboard';
import ProfessorDashboard from './pages/ProfessorDashboard/ProfessorDashboard';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import GerenciarCursos from './pages/GerenciarCursos/GerenciarCursos';
import Alunos         from './pages/Alunos/Alunos';
import Cursos         from './pages/Cursos/Cursos';
import Ranking        from './pages/Ranking/Ranking';
import Quiz           from './pages/Quiz/Quiz';
import Comunidade     from './pages/Comunidade/Comunidade';

// Rota privada com verificação de role
const PrivateRoute = ({ children, allowedRole }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRole && user.role !== allowedRole) {
    // Professor tentando acessar rota de aluno ou vice-versa → manda para home correta
    return <Navigate to="/dashboard/home" replace />;
  }
  return children;
};

function AppRoutes() {
  const { user } = useAuth();

  // Redireciona para home diferente por role
  const homeRedirect = () => {
    if (!user) return '/login';
    return '/dashboard/home';
  };

  return (
    <Routes>
      <Route path="/"        element={<Navigate to={homeRedirect()} replace />} />
      <Route path="/login"   element={user ? <Navigate to="/dashboard/home" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard/home" replace /> : <Register />} />
      <Route path="/debug"   element={<Debug />} />

      <Route path="/dashboard" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
        {/* FIX: home mostra dashboard correto conforme role */}
        <Route
          path="home"
          element={
            user?.role === 'professor'
              ? <ProfessorDashboard />
              : <AlunoDashboard />
          }
        />
        {/* Rotas exclusivas de professor */}
        <Route path="admin"
          element={<PrivateRoute allowedRole="professor"><AdminDashboard /></PrivateRoute>} />
        <Route path="gerenciar-cursos"
          element={<PrivateRoute allowedRole="professor"><GerenciarCursos /></PrivateRoute>} />
        <Route path="alunos"
          element={<PrivateRoute allowedRole="professor"><Alunos /></PrivateRoute>} />
        {/* Rotas comuns */}
        <Route path="cursos"     element={<Cursos />} />
        <Route path="ranking"    element={<Ranking />} />
        <Route path="quiz"       element={<Quiz />} />
        <Route path="comunidade" element={<Comunidade />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
