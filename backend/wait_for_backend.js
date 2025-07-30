const axios = require('axios');

const API_BASE_URL = 'https://igreja-backend.onrender.com';

async function waitForBackend() {
  console.log('⏳ AGUARDANDO BACKEND FICAR ONLINE...');
  console.log('=====================================');
  
  let attempts = 0;
  const maxAttempts = 30; // 5 minutos (10 segundos por tentativa)
  
  while (attempts < maxAttempts) {
    attempts++;
    console.log(`\n📋 Tentativa ${attempts}/${maxAttempts}...`);
    
    try {
      const response = await axios.get(`${API_BASE_URL}/`, { timeout: 5000 });
      console.log('✅ Backend está online!');
      console.log('📊 Resposta:', response.data);
      
      // Testar login
      console.log('\n📋 Testando login...');
      const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        emailOrUsername: 'admin',
        password: 'admin123'
      });
      
      console.log('✅ Login funcionando!');
      
      // Testar produtos
      console.log('\n📋 Testando produtos...');
      const token = loginResponse.data.token;
      const productsResponse = await axios.get(`${API_BASE_URL}/admin/event-products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log(`✅ Produtos encontrados: ${productsResponse.data.length}`);
      
      console.log('\n🎉 Backend está funcionando corretamente!');
      console.log('💡 Agora você pode testar a home page.');
      
      return true;
      
    } catch (error) {
      console.log(`❌ Backend ainda offline (${error.response?.status || 'timeout'})`);
      
      if (attempts < maxAttempts) {
        console.log('⏳ Aguardando 10 segundos...');
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
    }
  }
  
  console.log('\n❌ Backend não ficou online após 5 minutos.');
  console.log('💡 Verifique se o deploy foi concluído.');
  
  return false;
}

waitForBackend(); 