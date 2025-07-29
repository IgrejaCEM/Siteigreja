const axios = require('axios');

async function verificarStatusRender() {
  console.log('🔍 VERIFICANDO STATUS DO RENDER');
  console.log('===============================');
  
  try {
    // Teste 1: Verificar se o servidor responde
    console.log('📋 Teste 1: Verificar servidor...');
    try {
      const response = await axios.get('https://siteigreja-1.onrender.com/', {
        timeout: 10000
      });
      console.log('✅ Servidor online:', response.status);
    } catch (error) {
      console.log('❌ Servidor offline:', error.response?.status || error.message);
    }
    
    // Teste 2: Verificar rota de health check
    console.log('\n📋 Teste 2: Verificar health check...');
    try {
      const healthResponse = await axios.get('https://siteigreja-1.onrender.com/api/health', {
        timeout: 10000
      });
      console.log('✅ Health check OK:', healthResponse.status);
    } catch (error) {
      console.log('❌ Health check falhou:', error.response?.status || error.message);
    }
    
    // Teste 3: Verificar se as rotas estão carregadas
    console.log('\n📋 Teste 3: Verificar rotas...');
    try {
      const routesResponse = await axios.get('https://siteigreja-1.onrender.com/api/events', {
        timeout: 10000
      });
      console.log('✅ Rotas carregadas:', routesResponse.status);
    } catch (error) {
      console.log('❌ Rotas não carregadas:', error.response?.status || error.message);
    }
    
    // Teste 4: Verificar logs do Render
    console.log('\n📋 Teste 4: Verificar se há erro no deploy...');
    console.log('💡 Verifique os logs no painel do Render:');
    console.log('   https://dashboard.render.com/web/siteigreja-1');
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

verificarStatusRender(); 