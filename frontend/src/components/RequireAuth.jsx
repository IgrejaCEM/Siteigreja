import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redireciona para o login, salvando a localização atual
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
} 