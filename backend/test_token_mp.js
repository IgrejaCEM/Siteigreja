const axios = require('axios');

const ACCESS_TOKEN = 'APP_USR-7906695833613236-072622-a7c53bcaf7bc8b8289f1961ce3937843-2568627728';

console.log('🔑 TESTE DO TOKEN MERCADO PAGO');
console.log('===============================');

async function testarToken() {
  try {
    console.log('🔑 Token:', ACCESS_TOKEN.substring(0, 20) + '...');
    console.log('🔑 Tipo:', ACCESS_TOKEN.startsWith('APP_USR') ? 'PRODUÇÃO' : 'SANDBOX');
    
    // Teste 1: Verificar se o token é válido
    console.log('\n📋 Teste 1: Verificando token...');
    
    const response1 = await axios.get('https://api.mercadopago.com/v1/payment_methods', {
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Token válido!');
    console.log('📦 Métodos disponíveis:', response1.data.length);
    
    // Teste 2: Verificar informações da conta
    console.log('\n📋 Teste 2: Verificando informações da conta...');
    
    const response2 = await axios.get('https://api.mercadopago.com/v1/account', {
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Informações da conta:');
    console.log('📦 ID:', response2.data.id);
    console.log('📦 Nome:', response2.data.name);
    console.log('📦 Email:', response2.data.email);
    console.log('📦 Tipo:', response2.data.type);
    console.log('📦 País:', response2.data.country_id);
    
    // Teste 3: Tentar criar preferência com diferentes endpoints
    console.log('\n📋 Teste 3: Testando diferentes endpoints...');
    
    const preferenceData = {
      items: [
        {
          title: "Teste",
          quantity: 1,
          unit_price: 10.00
        }
      ],
      back_urls: {
        success: "https://igrejacemchurch.org/inscricao/sucesso",
        failure: "https://igrejacemchurch.org/inscricao/erro",
        pending: "https://igrejacemchurch.org/inscricao/pendente"
      },
      external_reference: "TEST-" + Date.now()
    };
    
    // Tentar endpoint /v1/preferences
    try {
      console.log('\n🔗 Tentando /v1/preferences...');
      const response3a = await axios.post('https://api.mercadopago.com/v1/preferences', preferenceData, {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ /v1/preferences funcionou!');
      console.log('🔗 URL:', response3a.data.init_point);
    } catch (error) {
      console.log('❌ /v1/preferences falhou:', error.response?.status, error.response?.data?.error);
    }
    
    // Tentar endpoint /checkout/preferences
    try {
      console.log('\n🔗 Tentando /checkout/preferences...');
      const response3b = await axios.post('https://api.mercadopago.com/checkout/preferences', preferenceData, {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ /checkout/preferences funcionou!');
      console.log('🔗 URL:', response3b.data.init_point);
    } catch (error) {
      console.log('❌ /checkout/preferences falhou:', error.response?.status, error.response?.data?.error);
    }
    
    // Tentar endpoint /preferences (sem v1)
    try {
      console.log('\n🔗 Tentando /preferences...');
      const response3c = await axios.post('https://api.mercadopago.com/preferences', preferenceData, {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ /preferences funcionou!');
      console.log('🔗 URL:', response3c.data.init_point);
    } catch (error) {
      console.log('❌ /preferences falhou:', error.response?.status, error.response?.data?.error);
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
    console.error('📊 Status:', error.response?.status);
    console.error('📊 Status Text:', error.response?.statusText);
    
    if (error.response?.data) {
      console.error('📦 Data do erro:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testarToken(); 