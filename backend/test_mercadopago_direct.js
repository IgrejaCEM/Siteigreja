const axios = require('axios');

async function testMercadoPagoDirect() {
  try {
    console.log('🧪 Testando MercadoPago diretamente em produção...');
    
    // Testar se o MercadoPago está respondendo
    const testData = {
      items: [
        {
          id: 'TEST-001',
          title: 'Teste MercadoPago',
          description: 'Teste direto do MercadoPago',
          quantity: 1,
          unit_price: 100
        }
      ],
      payer: {
        name: 'Teste',
        surname: 'MercadoPago',
        email: 'teste@teste.com',
        phone: {
          area_code: '11',
          number: '999999999'
        }
      },
      back_urls: {
        success: 'https://igrejacemchurch.org',
        failure: 'https://igrejacemchurch.org',
        pending: 'https://igrejacemchurch.org'
      },
      auto_return: 'approved',
      external_reference: 'TEST-001',
      notification_url: 'https://siteigreja-1.onrender.com/api/payments/webhook',
      statement_descriptor: 'TESTE',
      binary_mode: true,
      expires: true,
      expiration_date_from: new Date().toISOString(),
      expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };

    console.log('📦 Dados de teste:', JSON.stringify(testData, null, 2));

    // Usar as credenciais de produção
    const accessToken = 'APP_USR-7906695833613236-072622-a7c53bcaf7bc8b8289f1961ce3937843-2568627728';
    
    const response = await axios.post('https://api.mercadopago.com/checkout/preferences', testData, {
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });

    console.log('✅ Resposta do MercadoPago:', JSON.stringify(response.data, null, 2));
    
    if (response.data.init_point) {
      console.log('🎉 SUCCESS: URL do MercadoPago gerada:', response.data.init_point);
    } else {
      console.log('❌ FAIL: URL do MercadoPago não foi gerada');
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📦 Dados:', error.response.data);
    }
  }
}

testMercadoPagoDirect(); 