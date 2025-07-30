const axios = require('axios');

const API_BASE_URL = 'https://siteigreja-1.onrender.com/api';

console.log('🔍 Verificando status do backend...');

async function testarBackend() {
  try {
    console.log('📋 Testando rota de eventos...');
    
    const response = await axios.get(`${API_BASE_URL}/events`);
    console.log('✅ Backend está online!');
    console.log('📊 Eventos encontrados:', response.data.length);
    
    if (response.data.length > 0) {
      console.log('📋 Primeiro evento:', response.data[0].title);
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar backend:', error.response?.data || error.message);
  }
}

testarBackend(); 