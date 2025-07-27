const axios = require('axios');

// URLs para testar
const urls = [
  'http://localhost:3005',
  'https://siteigreja-1.onrender.com'
];

async function testApiLogin() {
  console.log('🔍 Testando API de login...');
  
  for (const baseUrl of urls) {
    console.log(`\n📡 Testando: ${baseUrl}`);
    
    try {
      // Teste 1: Verificar se a API está respondendo
      console.log('  1️⃣ Testando conectividade...');
      const healthResponse = await axios.get(`${baseUrl}/api/health`, { timeout: 5000 });
      console.log('     ✅ API está respondendo');
      
      // Teste 2: Tentar login
      console.log('  2️⃣ Testando login...');
      const loginResponse = await axios.post(`${baseUrl}/api/auth/login`, {
        emailOrUsername: 'admin@admin.com',
        password: 'admin123'
      }, { timeout: 10000 });
      
      if (loginResponse.data && loginResponse.data.token) {
        console.log('     ✅ Login bem-sucedido!');
        console.log(`     Token: ${loginResponse.data.token.substring(0, 20)}...`);
        console.log(`     Usuário: ${loginResponse.data.user.name}`);
        console.log(`     É admin: ${loginResponse.data.user.is_admin}`);
        
        // Teste 3: Verificar se o token funciona
        console.log('  3️⃣ Testando token...');
        const profileResponse = await axios.get(`${baseUrl}/api/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${loginResponse.data.token}`
          },
          timeout: 5000
        });
        
        if (profileResponse.data) {
          console.log('     ✅ Token válido!');
          console.log(`     Perfil: ${profileResponse.data.name}`);
        }
        
      } else {
        console.log('     ❌ Login falhou - resposta inválida');
      }
      
    } catch (error) {
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        console.log('     ❌ API não está acessível');
      } else if (error.response) {
        console.log(`     ❌ Erro ${error.response.status}: ${error.response.data?.message || error.response.statusText}`);
      } else if (error.request) {
        console.log('     ❌ Timeout ou erro de rede');
      } else {
        console.log(`     ❌ Erro: ${error.message}`);
      }
    }
  }
  
  console.log('\n📝 Resumo:');
  console.log('Se o login local funcionou mas o do Render não, pode ser:');
  console.log('1. Backend não está rodando no Render');
  console.log('2. Problema de CORS');
  console.log('3. Banco de dados não inicializado no Render');
  console.log('4. Variáveis de ambiente não configuradas');
}

testApiLogin(); 