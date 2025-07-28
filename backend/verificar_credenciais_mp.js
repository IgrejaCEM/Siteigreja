const config = require('./src/config');

console.log('🔍 VERIFICANDO CREDENCIAIS DO MERCADO PAGO');
console.log('==========================================');

console.log('🎭 PAYMENT_FAKE_MODE:', config.PAYMENT_FAKE_MODE);
console.log('🔑 MERCADOPAGO_ACCESS_TOKEN:', process.env.MERCADOPAGO_ACCESS_TOKEN ? 'CONFIGURADO' : 'NÃO CONFIGURADO');
console.log('🔑 MERCADOPAGO_PUBLIC_KEY:', process.env.MERCADOPAGO_PUBLIC_KEY ? 'CONFIGURADO' : 'NÃO CONFIGURADO');

console.log('\n📋 Configurações do Payment Gateway:');
console.log('🔑 Access Token:', config.payment.mercadopago.accessToken ? 'CONFIGURADO' : 'NÃO CONFIGURADO');
console.log('🔑 Public Key:', config.payment.mercadopago.publicKey ? 'CONFIGURADO' : 'NÃO CONFIGURADO');

if (config.payment.mercadopago.accessToken) {
  console.log('🔑 Token prefixo:', config.payment.mercadopago.accessToken.substring(0, 10) + '...');
  console.log('🔑 Tipo de credencial:', config.payment.mercadopago.accessToken.startsWith('APP_USR') ? 'PRODUÇÃO' : 'SANDBOX');
}

console.log('\n🌍 Ambiente:', process.env.NODE_ENV || 'development');
console.log('🔗 Webhook URL:', config.payment.mercadopago.webhookUrl);

// Testar se consegue fazer uma requisição simples para o Mercado Pago
const axios = require('axios');

async function testarConexaoMP() {
  try {
    console.log('\n🧪 TESTANDO CONEXÃO COM MERCADO PAGO...');
    
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || config.payment.mercadopago.accessToken;
    
    if (!accessToken) {
      console.log('❌ Nenhum token configurado');
      return;
    }
    
    const response = await axios.get('https://api.mercadopago.com/v1/payment_methods', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ Conexão com Mercado Pago OK');
    console.log('📊 Status:', response.status);
    console.log('📦 Métodos de pagamento disponíveis:', response.data.length);
    
  } catch (error) {
    console.error('❌ Erro na conexão com Mercado Pago:');
    console.error('📊 Status:', error.response?.status);
    console.error('📊 Status Text:', error.response?.statusText);
    console.error('📋 Message:', error.message);
    
    if (error.response?.data) {
      console.error('📦 Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testarConexaoMP(); 