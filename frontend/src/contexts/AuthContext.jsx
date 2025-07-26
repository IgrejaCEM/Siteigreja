import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext({});

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Função para verificar se o token é válido
  const checkToken = async (token) => {
    try {
      console.log('🔍 Verificando token...');
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await api.get('/auth/profile');
      console.log('✅ Token válido:', response.data);
      return response.data && response.data.id;
    } catch (error) {
      console.error('❌ Token inválido:', error);
      return false;
    }
  };

  // Função para restaurar a sessão
  const restoreSession = async () => {
    try {
      console.log('🔄 Restaurando sessão...');
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      console.log('📦 Token encontrado:', !!token);
      console.log('👤 Usuário salvo:', !!savedUser);
      
      if (token && savedUser) {
        const isValidToken = await checkToken(token);
        if (isValidToken) {
          console.log('✅ Sessão restaurada com sucesso');
          setUser(JSON.parse(savedUser));
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
          console.log('❌ Token inválido, limpando localStorage');
          // Se o token não for válido, limpa o localStorage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } else {
        console.log('ℹ️ Nenhuma sessão encontrada');
      }
    } catch (error) {
      console.error('❌ Erro ao restaurar sessão:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    restoreSession();
  }, []);

  const login = async (emailOrUsername, password) => {
    try {
      const res = await api.post('/auth/login', { emailOrUsername, password });
      const { token, user } = res.data;
      
      if (!token || !user) {
        throw new Error('Resposta inválida do servidor');
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setUser(user);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return { success: true };
    } catch (error) {
      console.error('Erro no login:', error);
      throw error.response?.data?.error || 'Erro ao fazer login';
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.is_admin || false
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 