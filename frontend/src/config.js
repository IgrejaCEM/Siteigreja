export const API_BASE_URL = 'http://localhost:3005/api';

export const APP_CONFIG = {
  name: 'Sistema de Eventos',
  version: '1.0.0',
  api: {
    baseURL: API_BASE_URL,
    timeout: 10000,
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