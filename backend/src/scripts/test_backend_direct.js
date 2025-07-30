const axios = require('axios');

const BACKEND_URL = 'https://igreja-backend.onrender.com';

async function testBackend() {
  try {
    console.log('🔍 Testando backend diretamente...');
    
    // Testar rota raiz
    console.log('📡 Testando rota raiz...');
    const rootResponse = await axios.get(`${BACKEND_URL}/`, {
      timeout: 30000
    });
    console.log('✅ Rota raiz:', rootResponse.data);
    
    // Testar rota de settings
    console.log('📡 Testando rota settings...');
    const settingsResponse = await axios.get(`${BACKEND_URL}/api/settings/home-content`, {
      timeout: 30000
    });
    console.log('✅ Settings:', settingsResponse.data);
    
    // Testar rota de eventos
    console.log('📡 Testando rota eventos...');
    const eventsResponse = await axios.get(`${BACKEND_URL}/api/events`, {
      timeout: 30000
    });
    console.log('✅ Eventos:', eventsResponse.data);
    
  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
    console.error('📊 Status:', error.response?.status);
    console.error('🔗 URL:', error.config?.url);
  }
}

testBackend(); 