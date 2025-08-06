const axios = require('axios');

const API_BASE_URL = 'https://siteigreja.onrender.com/api';

async function testEventsEndpoint() {
  try {
    console.log('🧪 Testando endpoint /events...');
    console.log('🌐 URL:', `${API_BASE_URL}/events`);
    
    const response = await axios.get(`${API_BASE_URL}/events`);
    
    console.log('✅ Status:', response.status);
    console.log('📊 Dados recebidos:', response.data);
    console.log('📈 Quantidade de eventos:', response.data.length);
    
    if (response.data.length > 0) {
      console.log('🎯 Primeiro evento:', response.data[0]);
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar /events:');
    console.error('   Status:', error.response?.status);
    console.error('   Mensagem:', error.response?.data);
    console.error('   Erro completo:', error.message);
  }
}

testEventsEndpoint(); 