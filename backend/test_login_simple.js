const axios = require('axios');

const API_BASE_URL = 'https://siteigreja-1.onrender.com/api';

console.log('🔐 Testando login...');

async function testarLogin() {
  try {
    console.log('📋 Fazendo login...');
    
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@admin.com',
      password: 'admin123'
    });
    
    console.log('✅ Login realizado com sucesso!');
    console.log('📋 Token recebido:', loginResponse.data.token ? 'SIM' : 'NÃO');
    console.log('📋 Dados do usuário:', loginResponse.data.user?.name);
    
    return loginResponse.data.token;
    
  } catch (error) {
    console.error('❌ Erro no login:', error.response?.data || error.message);
    return null;
  }
}

testarLogin(); 