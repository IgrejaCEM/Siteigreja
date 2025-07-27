// Script para verificar se o backend está funcionando
// Execute: node verificar_backend.js

const axios = require('axios');

async function verificarBackend() {
  const urls = [
    'http://localhost:3000/api/admin/participants',
    'http://localhost:3000/api/events',
    'http://localhost:3000/api/settings/home-content'
  ];

  console.log('🔍 Verificando se o backend está funcionando...\n');

  for (const url of urls) {
    try {
      console.log(`📡 Testando: ${url}`);
      const response = await axios.get(url, { timeout: 5000 });
      console.log(`✅ Status: ${response.status} - OK\n`);
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log(`❌ Erro: Backend não está rodando (conexão recusada)\n`);
      } else if (error.code === 'ENOTFOUND') {
        console.log(`❌ Erro: Não foi possível conectar ao servidor\n`);
      } else {
        console.log(`❌ Erro: ${error.message}\n`);
      }
    }
  }

  console.log('💡 Dicas:');
  console.log('1. Certifique-se de que o backend está rodando');
  console.log('2. Execute: cd backend && npm start');
  console.log('3. Verifique se a porta 3000 está livre');
  console.log('4. Verifique se não há erros no console do backend');
}

verificarBackend(); 