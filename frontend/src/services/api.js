import axios from 'axios';
import { APP_CONFIG } from '../config';

const api = axios.create({
  baseURL: APP_CONFIG.api.baseURL,
  timeout: APP_CONFIG.api.timeout
});

// Adiciona o token em todas as requisições
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// Interceptor para tratamento de erros
api.interceptors.response.use(
  response => response,
  error => {
    // Não redireciona automaticamente se estiver na página de inscrição
    const currentPath = window.location.pathname;
    const isInscricaoPage = currentPath.includes('/inscricao') || currentPath.includes('/evento');
    
    if (error.response?.status === 401 && !isInscricaoPage) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = APP_CONFIG.routes.login;
    }
    return Promise.reject(error);
  }
);

export const paymentApi = {
  getEventSettings: (eventId) => api.get(`/events/${eventId}/payment-settings`),
  updateEventSettings: (eventId, settings) => api.put(`/events/${eventId}/payment-settings`, settings),
  getPaymentMethods: () => api.get('/payment-methods'),
  getPaymentSummary: (eventId) => api.get(`/events/${eventId}/payment-summary`),
  createPayment: (data) => api.post('/payments/create', data),
  confirmPayment: (paymentId) => api.post(`/payments/${paymentId}/confirm`),
  getPaymentStatus: (paymentId) => api.get(`/payments/${paymentId}/status`)
};

export default api; 