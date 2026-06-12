import { createContext, useState, useContext, useCallback } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('cc_user');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  });

  const login = useCallback((data) => {
    // FIX: garante que o role vem do servidor, substituindo qualquer sessão anterior
    const u = {
      token:  data.access_token,
      role:   data.user.role,   // "professor" ou "aluno" — definido pelo backend
      nome:   data.user.nome,
      email:  data.user.email,
      id:     data.user.id,
      pontos: data.user.pontos,
    };
    // Limpa sessão anterior antes de salvar a nova
    localStorage.removeItem('cc_user');
    localStorage.removeItem('token');
    localStorage.setItem('cc_user', JSON.stringify(u));
    localStorage.setItem('token', data.access_token);
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('cc_user');
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  const refreshPontos = useCallback(async () => {
    try {
      const r = await api.get('/auth/me');
      setUser(prev => {
        if (!prev) return prev;
        const updated = { ...prev, pontos: r.data.pontos };
        localStorage.setItem('cc_user', JSON.stringify(updated));
        return updated;
      });
    } catch { /* silencia */ }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshPontos }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
