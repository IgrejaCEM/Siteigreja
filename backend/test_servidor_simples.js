const axios = require('axios');

const API_BASE_URL = 'https://siteigreja-1.onrender.com/api';

async function testarServidor() {
  try {
    console.log('🧪 TESTANDO SE O SERVIDOR ESTÁ FUNCIONANDO');
    
    // Testar uma rota simples
    const response = await axios.get(`${API_BASE_URL}/events`);
    
    console.log('✅ Servidor está funcionando');
    console.log('📋 Status:', response.status);
    console.log('📋 Dados recebidos:', response.data.length, 'eventos');
    
  } catch (error) {
    console.error('❌ Erro ao conectar com o servidor:', error.response?.data || error.message);
    console.error('📋 Status:', error.response?.status);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 O servidor pode estar em deploy ainda');
    }
  }
}

testarServidor(); 