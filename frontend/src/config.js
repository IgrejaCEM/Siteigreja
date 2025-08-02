// Cache busting: 2025-08-02T18:25:00Z
// Forçar URL correta do backend
export const API_BASE_URL = 'https://siteigreja.onrender.com/api';

export const APP_CONFIG = {
  name: 'Sistema de Eventos',
  version: '1.0.0',
  api: {
    baseURL: API_BASE_URL,
    timeout: 30000, // Aumentar timeout para 30s
  },
  theme: {
    primary: '#1976d2',
    secondary: '#4CAF50',
  },
  routes: {
    home: '/',
    login: '/login',
    admin: '/admin',
    eventos: '/admin/eventos',
    criarEvento: '/criar-evento',
    editarEvento: '/editar-evento',
  }
}; 