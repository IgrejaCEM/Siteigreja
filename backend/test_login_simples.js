const axios = require('axios');

const API_BASE_URL = 'https://siteigreja-1.onrender.com/api';

async function testarLogin() {
  try {
    console.log('🧪 TESTANDO LOGIN');
    
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@igreja.com',
      password: 'admin123'
    });
    
    console.log('✅ Login realizado com sucesso');
    console.log('📋 Token:', loginResponse.data.token ? 'Token recebido' : 'Sem token');
    console.log('📋 Dados:', loginResponse.data);
    
  } catch (error) {
    console.error('❌ Erro no login:', error.response?.data || error.message);
    console.error('📋 Status:', error.response?.status);
  }
}

testarLogin(); 