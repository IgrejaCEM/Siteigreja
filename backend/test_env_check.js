const axios = require('axios');

async function testEnvCheck() {
  try {
    console.log('🧪 Testando verificação de variáveis de ambiente...');
    
    const response = await axios.get('https://siteigreja.onrender.com/api/test/env-check', {
      timeout: 10000
    });
    
    console.log('✅ Resposta da verificação:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success) {
      console.log('📊 Variáveis de ambiente no servidor:');
      Object.entries(response.data.env).forEach(([key, value]) => {
        console.log(`   ${key}: ${value}`);
      });
      
      // Verificar se as credenciais do MercadoPago estão configuradas
      const mpVars = ['MERCADOPAGO_ACCESS_TOKEN', 'MERCADOPAGO_PUBLIC_KEY', 'MERCADOPAGO_CLIENT_ID', 'MERCADOPAGO_CLIENT_SECRET'];
      const missingVars = mpVars.filter(varName => response.data.env[varName] === 'NOT SET');
      
      if (missingVars.length > 0) {
        console.log('❌ Variáveis do MercadoPago não configuradas:', missingVars);
      } else {
        console.log('✅ Todas as variáveis do MercadoPago estão configuradas');
      }
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📦 Dados:', error.response.data);
    }
  }
}

testEnvCheck(); 