// Script para verificar as variáveis de ambiente no backend de produção
const axios = require('axios');

async function checkProductionEnvironment() {
  try {
    console.log('🔍 VERIFICANDO VARIÁVEIS DE AMBIENTE EM PRODUÇÃO...');
    
    // Testar health check detalhado que pode mostrar configurações
    console.log('🏥 Testando health check detalhado...');
    const detailedResponse = await axios.get('https://siteigreja.onrender.com/api/health/detailed');
    console.log('✅ Health check detalhado:', detailedResponse.data);
    
    // Testar endpoint raiz que pode mostrar configurações
    console.log('\n🏠 Testando endpoint raiz...');
    const rootResponse = await axios.get('https://siteigreja.onrender.com/');
    console.log('✅ Endpoint raiz:', rootResponse.data);
    
    // Testar se há algum endpoint de debug
    console.log('\n🔧 Testando se há endpoints de debug...');
    try {
      const debugResponse = await axios.get('https://siteigreja.onrender.com/api/debug');
      console.log('✅ Endpoint de debug:', debugResponse.data);
    } catch (error) {
      console.log('ℹ️ Endpoint de debug não disponível');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    if (error.response) {
      console.error('📋 Status:', error.response.status);
      console.error('📋 Data:', error.response.data);
    }
  }
}

checkProductionEnvironment(); 