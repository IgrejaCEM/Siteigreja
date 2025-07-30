const axios = require('axios');

const API_BASE_URL = 'https://siteigreja-1.onrender.com/api';

console.log('🧪 TESTANDO SE O SERVIDOR ESTÁ FUNCIONANDO');
console.log('==========================================');

const testServidor = async () => {
  try {
    console.log('📋 Testando rota de eventos públicos...');
    const response = await axios.get(`${API_BASE_URL}/events`);
    
    console.log('✅ Servidor está funcionando');
    console.log('📋 Status:', response.status);
    console.log('📋 Dados recebidos:', response.data.length, 'eventos');
    
  } catch (error) {
    console.log('❌ Erro no servidor:');
    console.log('📋 Status:', error.response?.status);
    console.log('📋 Mensagem:', error.response?.data?.message || error.message);
  }
};

testServidor(); 