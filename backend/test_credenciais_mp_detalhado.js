const axios = require('axios');

const ACCESS_TOKEN = 'APP_USR-7906695833613236-072622-a7c53bcaf7bc8b8289f1961ce3937843-2568627728';
const PUBLIC_KEY = 'APP_USR-c478c542-b18d-4ab1-acba-9539754cb167';

console.log('🔍 TESTE DETALHADO DAS CREDENCIAIS DO MERCADO PAGO');
console.log('==================================================');

console.log('🔑 Access Token:', ACCESS_TOKEN ? 'CONFIGURADO' : 'NÃO CONFIGURADO');
console.log('🔑 Public Key:', PUBLIC_KEY ? 'CONFIGURADO' : 'NÃO CONFIGURADO');

if (ACCESS_TOKEN) {
  console.log('🔑 Token prefixo:', ACCESS_TOKEN.substring(0, 10) + '...');
  console.log('🔑 Tipo de credencial:', ACCESS_TOKEN.startsWith('APP_USR') ? 'PRODUÇÃO' : 'SANDBOX');
}

async function testarCredenciais() {
  try {
    console.log('\n🧪 TESTANDO CONEXÃO COM MERCADO PAGO...');
    
    // Teste 1: Verificar métodos de pagamento
    console.log('\n📋 Teste 1: Verificando métodos de pagamento...');
    const response1 = await axios.get('https://api.mercadopago.com/v1/payment_methods', {
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ Métodos de pagamento OK');
    console.log('📊 Status:', response1.status);
    console.log('📦 Quantidade de métodos:', response1.data.length);
    
    // Teste 2: Criar preferência de pagamento
    console.log('\n📋 Teste 2: Criando preferência de pagamento...');
    const preferenceData = {
      items: [
        {
          title: 'Teste de Pagamento',
          quantity: 1,
          unit_price: 10.00
        }
      ],
      payer: {
        name: 'Teste',
        email: 'teste@teste.com'
      },
      back_urls: {
        success: 'https://igrejacemchurch.org/inscricao/sucesso',
        failure: 'https://igrejacemchurch.org/inscricao/erro',
        pending: 'https://igrejacemchurch.org/inscricao/pendente'
      },
      auto_return: 'approved',
      external_reference: 'TEST-' + Date.now(),
      notification_url: 'https://siteigreja-1.onrender.com/api/payments/webhook',
      statement_descriptor: 'INSCRICAO'
    };
    
    console.log('📦 Dados da preferência:', JSON.stringify(preferenceData, null, 2));
    
    const response2 = await axios.post('https://api.mercadopago.com/v1/preferences', preferenceData, {
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });
    
    console.log('✅ Preferência criada com sucesso!');
    console.log('📊 Status:', response2.status);
    console.log('🔗 ID da preferência:', response2.data.id);
    console.log('🔗 URL do checkout:', response2.data.init_point);
    console.log('📦 Resposta completa:', JSON.stringify(response2.data, null, 2));
    
    // Teste 3: Verificar se a URL é válida
    console.log('\n📋 Teste 3: Verificando URL do checkout...');
    const checkoutUrl = response2.data.init_point;
    console.log('🔗 URL do checkout:', checkoutUrl);
    console.log('🔗 É URL do Mercado Pago?', checkoutUrl.includes('mercadopago'));
    console.log('🔗 É URL de produção?', checkoutUrl.includes('mercadopago.com.br'));
    
  } catch (error) {
    console.error('❌ Erro nos testes:');
    console.error('📊 Status:', error.response?.status);
    console.error('📊 Status Text:', error.response?.statusText);
    console.error('📋 Message:', error.message);
    
    if (error.response?.data) {
      console.error('📦 Data do erro:', JSON.stringify(error.response.data, null, 2));
      
      // Verificar se é erro de credenciais
      if (error.response.data.error) {
        console.error('🔑 Erro de credenciais:', error.response.data.error);
        console.error('🔑 Código:', error.response.data.error_code);
        console.error('🔑 Mensagem:', error.response.data.message);
      }
    }
  }
}

testarCredenciais(); 