const axios = require('axios');

const API_BASE_URL = 'https://siteigreja-1.onrender.com/api';

console.log('🧪 TESTANDO LOGIN SIMPLES');
console.log('==========================');

const testLogin = async () => {
  try {
    console.log('📋 Fazendo login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      emailOrUsername: 'admin@admin.com',
      password: 'admin123'
    });
    
    console.log('✅ Login realizado com sucesso');
    console.log('📋 Token recebido:', loginResponse.data.token ? 'Sim' : 'Não');
    console.log('📋 Dados do usuário:', loginResponse.data.user);
    
  } catch (error) {
    console.log('❌ Erro no login:');
    console.log('📋 Status:', error.response?.status);
    console.log('📋 Mensagem:', error.response?.data?.message || error.message);
    console.log('📋 Dados completos:', JSON.stringify(error.response?.data, null, 2));
  }
};

testLogin(); 