const axios = require('axios');

async function testarWebhookURL() {
  console.log('🔍 TESTANDO URL DO WEBHOOK');
  console.log('==========================');
  
  const webhookURL = 'https://siteigreja-1.onrender.com/api/payments/webhook';
  
  try {
    console.log('📡 Testando URL:', webhookURL);
    
    // Teste 1: GET request
    console.log('\n📋 Teste 1: GET request...');
    try {
      const getResponse = await axios.get(webhookURL);
      console.log('✅ GET funcionou:', getResponse.status);
    } catch (error) {
      console.log('❌ GET falhou:', error.response?.status || error.message);
    }
    
    // Teste 2: POST request
    console.log('\n📋 Teste 2: POST request...');
    try {
      const postResponse = await axios.post(webhookURL, {
        test: true,
        type: 'payment',
        data: { id: 'TEST-123' }
      }, {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'MercadoPago-Webhook/1.0'
        }
      });
      console.log('✅ POST funcionou:', postResponse.status);
      console.log('📦 Resposta:', postResponse.data);
    } catch (error) {
      console.log('❌ POST falhou:', error.response?.status || error.message);
      if (error.response) {
        console.log('📋 Status:', error.response.status);
        console.log('📄 Resposta:', error.response.data);
      }
    }
    
    // Teste 3: Verificar se o servidor está online
    console.log('\n📋 Teste 3: Verificar servidor...');
    try {
      const serverResponse = await axios.get('https://siteigreja-1.onrender.com/');
      console.log('✅ Servidor online:', serverResponse.status);
    } catch (error) {
      console.log('❌ Servidor offline:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testarWebhookURL(); 