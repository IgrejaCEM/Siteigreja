const axios = require('axios');

const API_BASE_URL = 'https://siteigreja-1.onrender.com';

async function testLogin() {
  console.log('🔐 TESTANDO LOGIN');
  console.log('==================');
  
  try {
    // 1. Testar login com admin
    console.log('📋 [1/2] Testando login com admin...');
    const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      emailOrUsername: 'admin@admin.com',
      password: 'admin123'
    });
    
    console.log('✅ Login realizado com sucesso');
    console.log('📊 Token:', loginResponse.data.token ? 'Presente' : 'Ausente');
    console.log('📊 User:', loginResponse.data.user ? 'Presente' : 'Ausente');
    
    // 2. Testar outras credenciais
    console.log('📋 [2/2] Testando outras credenciais...');
    
    const testCredentials = [
      { emailOrUsername: 'admin@admin.com', password: 'admin123' },
      { emailOrUsername: 'admin', password: 'admin' },
      { emailOrUsername: 'admin@admin.com', password: 'admin' }
    ];
    
    for (const cred of testCredentials) {
      try {
        const response = await axios.post(`${API_BASE_URL}/api/auth/login`, cred);
        console.log(`✅ Login com ${cred.emailOrUsername} funcionou`);
        break;
      } catch (error) {
        console.log(`❌ Login com ${cred.emailOrUsername} falhou: ${error.response?.status}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.response?.status, error.response?.data?.error || error.message);
  }
}

testLogin(); 