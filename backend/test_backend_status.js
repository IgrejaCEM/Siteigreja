const axios = require('axios');

const API_BASE_URL = 'https://siteigreja-1.onrender.com/api';

async function testBackendStatus() {
  console.log('🔍 VERIFICANDO STATUS DO BACKEND');
  console.log('=================================');
  
  try {
    // 1. Testar rota raiz
    console.log('📋 [1/3] Testando rota raiz...');
    const rootResponse = await axios.get(`${API_BASE_URL}/`);
    console.log('✅ Backend online:', rootResponse.data);
    
    // 2. Testar login
    console.log('📋 [2/3] Testando login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      emailOrUsername: 'admin',
      password: 'admin123'
    });
    
    console.log('✅ Login funcionando');
    const token = loginResponse.data.token;
    
    // 3. Testar rota de produtos
    console.log('📋 [3/3] Testando rota de produtos...');
    const productsResponse = await axios.get(`${API_BASE_URL}/admin/event-products`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`✅ Produtos encontrados: ${productsResponse.data.length}`);
    
  } catch (error) {
    console.error('❌ Erro:', error.response?.status, error.response?.data?.error || error.message);
    
    if (error.response?.status === 404) {
      console.log('🔍 Verificando se a URL está correta...');
      console.log('URL testada:', API_BASE_URL);
    }
  }
}

testBackendStatus(); 