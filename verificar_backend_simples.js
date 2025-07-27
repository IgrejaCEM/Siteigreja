const axios = require('axios');

async function verificarBackend() {
  console.log('🔍 Verificando status do backend...');
  
  const baseUrl = 'https://siteigreja-1.onrender.com';
  
  try {
    // Teste 1: Health check
    console.log('\n1️⃣ Testando health check...');
    const healthResponse = await axios.get(`${baseUrl}/api/auth/health`, { timeout: 10000 });
    console.log('✅ Health check OK:', healthResponse.data);
    
    // Teste 2: Login
    console.log('\n2️⃣ Testando login...');
    const loginResponse = await axios.post(`${baseUrl}/api/auth/login`, {
      emailOrUsername: 'admin@admin.com',
      password: 'admin123'
    }, { timeout: 10000 });
    
    if (loginResponse.data && loginResponse.data.token) {
      console.log('✅ Login OK');
      const token = loginResponse.data.token;
      
      // Teste 3: Rotas admin com token
      console.log('\n3️⃣ Testando rotas admin...');
      
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      // Teste eventos
      try {
        const eventsResponse = await axios.get(`${baseUrl}/api/admin/events`, { headers, timeout: 10000 });
        console.log('✅ /admin/events OK:', eventsResponse.data.length, 'eventos');
      } catch (error) {
        console.log('❌ /admin/events FALHOU:', error.response?.status, error.response?.data);
      }
      
      // Teste inscrições recentes
      try {
        const recentResponse = await axios.get(`${baseUrl}/api/admin/registrations/recent`, { headers, timeout: 10000 });
        console.log('✅ /admin/registrations/recent OK:', recentResponse.data.length, 'inscrições');
      } catch (error) {
        console.log('❌ /admin/registrations/recent FALHOU:', error.response?.status, error.response?.data);
      }
      
      // Teste estatísticas
      try {
        const statsResponse = await axios.get(`${baseUrl}/api/admin/stats`, { headers, timeout: 10000 });
        console.log('✅ /admin/stats OK:', statsResponse.data);
      } catch (error) {
        console.log('❌ /admin/stats FALHOU:', error.response?.status, error.response?.data);
      }
      
    } else {
      console.log('❌ Login falhou - resposta inválida');
    }
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      console.log('❌ Backend não está acessível');
    } else if (error.response) {
      console.log(`❌ Erro ${error.response.status}:`, error.response.data);
    } else {
      console.log('❌ Erro de rede:', error.message);
    }
  }
}

verificarBackend(); 