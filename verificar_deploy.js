// Script para verificar se o deploy foi bem-sucedido
// Execute: node verificar_deploy.js

const axios = require('axios');

async function verificarDeploy() {
  const urls = [
    'https://siteigreja-1.onrender.com/api/admin/participants',
    'https://siteigreja-1.onrender.com/api/admin/participants/clear',
    'https://siteigreja-1.onrender.com/api/events'
  ];

  console.log('🔍 Verificando deploy no Render.com...\n');

  for (const url of urls) {
    try {
      console.log(`📡 Testando: ${url}`);
      
      if (url.includes('/clear')) {
        // Testa a rota DELETE
        const response = await axios.delete(url, { timeout: 10000 });
        console.log(`✅ Status: ${response.status} - Rota DELETE funcionando!\n`);
      } else {
        // Testa a rota GET
        const response = await axios.get(url, { timeout: 10000 });
        console.log(`✅ Status: ${response.status} - OK\n`);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        console.log(`❌ Erro: Rota não encontrada (404)\n`);
      } else if (error.code === 'ECONNREFUSED') {
        console.log(`❌ Erro: Servidor não está respondendo\n`);
      } else if (error.code === 'ENOTFOUND') {
        console.log(`❌ Erro: Não foi possível conectar ao servidor\n`);
      } else {
        console.log(`❌ Erro: ${error.message}\n`);
      }
    }
  }

  console.log('💡 Dicas:');
  console.log('1. Se as rotas não funcionarem, aguarde alguns minutos');
  console.log('2. O Render.com pode demorar para fazer o deploy');
  console.log('3. Verifique os logs no painel do Render.com');
}

verificarDeploy(); 