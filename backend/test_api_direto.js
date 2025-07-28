const axios = require('axios');

const ACCESS_TOKEN = 'APP_USR-7906695833613236-072622-a7c53bcaf7bc8b8289f1961ce3937843-2568627728';

console.log('🧪 TESTE DIRETO DA API MERCADO PAGO');
console.log('====================================');

async function testarAPIDireto() {
  try {
    console.log('\n📋 Teste 1: Verificar token...');
    
    const response1 = await axios.get('https://api.mercadopago.com/v1/payment_methods', {
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Token válido!');
    console.log('📦 Métodos disponíveis:', response1.data.length);
    
    console.log('\n📋 Teste 2: Criar preferência mínima...');
    
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
    
    console.log('📦 Dados enviados:', JSON.stringify(preferenceData, null, 2));
    
    const response2 = await axios.post('https://api.mercadopago.com/checkout/preferences', preferenceData, {
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
    console.log('🔗 URL do sandbox:', response2.data.sandbox_init_point);
    
    // Testar se a URL funciona
    console.log('\n📋 Teste 3: Verificar se a URL é acessível...');
    try {
      const response3 = await axios.get(response2.data.init_point, {
        timeout: 10000,
        maxRedirects: 5
      });
      console.log('✅ URL do checkout é acessível!');
      console.log('📊 Status:', response3.status);
    } catch (urlError) {
      console.log('⚠️ URL do checkout não é acessível:', urlError.message);
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
    console.error('📊 Status:', error.response?.status);
    console.error('📊 Status Text:', error.response?.statusText);
    
    if (error.response?.data) {
      console.error('📦 Data do erro:', JSON.stringify(error.response.data, null, 2));
      
      if (error.response.data.cause) {
        console.error('🔍 Causas do erro:');
        error.response.data.cause.forEach((cause, index) => {
          console.error(`  ${index + 1}. ${cause.code}: ${cause.description}`);
        });
      }
    }
  }
}

testarAPIDireto(); 