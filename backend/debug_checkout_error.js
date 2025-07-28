const axios = require('axios');

const ACCESS_TOKEN = 'APP_USR-7906695833613236-072622-a7c53bcaf7bc8b8289f1961ce3937843-2568627728';

console.log('🔍 DEBUGANDO ERRO DE CHECKOUT');
console.log('=============================');

async function debugCheckoutError() {
  try {
    console.log('\n🧪 TESTANDO CRIAÇÃO DE PREFERÊNCIA SIMPLES');
    
    // Teste 1: Preferência mínima
    console.log('\n📋 Teste 1: Preferência mínima...');
    const preferenceMinima = {
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
    
    console.log('📦 Dados mínimos:', JSON.stringify(preferenceMinima, null, 2));
    
    const response1 = await axios.post('https://api.mercadopago.com/v1/preferences', preferenceMinima, {
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });
    
    console.log('✅ Preferência mínima criada!');
    console.log('🔗 URL:', response1.data.init_point);
    
    // Teste 2: Preferência completa (como no código atual)
    console.log('\n📋 Teste 2: Preferência completa...');
    const preferenceCompleta = {
      items: [
        {
          id: `item-${Date.now()}`,
          title: "Inscrição Evento",
          description: "Inscrição no evento da igreja",
          category_id: "eventos",
          quantity: 1,
          unit_price: 60.00
        }
      ],
      payer: {
        name: "João",
        email: "joao@teste.com",
        phone: {
          area_code: "11",
          number: "99999999"
        }
      },
      back_urls: {
        success: "https://igrejacemchurch.org/inscricao/sucesso",
        failure: "https://igrejacemchurch.org/inscricao/erro",
        pending: "https://igrejacemchurch.org/inscricao/pendente"
      },
      auto_return: "approved",
      external_reference: "COMPLETE-" + Date.now(),
      notification_url: "https://siteigreja-1.onrender.com/api/payments/webhook",
      statement_descriptor: "INSCRICAO",
      binary_mode: true,
      expires: true,
      expiration_date_from: new Date().toISOString(),
      expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      payment_methods: {
        installments: 1,
        default_installments: 1,
        excluded_payment_types: [
          { id: "ticket" }
        ],
        excluded_payment_methods: [
          { id: "amex" }
        ]
      }
    };
    
    console.log('📦 Dados completos:', JSON.stringify(preferenceCompleta, null, 2));
    
    const response2 = await axios.post('https://api.mercadopago.com/v1/preferences', preferenceCompleta, {
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });
    
    console.log('✅ Preferência completa criada!');
    console.log('🔗 URL:', response2.data.init_point);
    
    // Teste 3: Verificar se o token está válido
    console.log('\n📋 Teste 3: Verificando token...');
    const response3 = await axios.get('https://api.mercadopago.com/v1/payment_methods', {
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ Token válido!');
    console.log('📦 Métodos disponíveis:', response3.data.length);
    
  } catch (error) {
    console.error('❌ Erro no debug:', error.response?.data || error.message);
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

debugCheckoutError(); 