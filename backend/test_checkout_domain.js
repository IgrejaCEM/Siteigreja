const axios = require('axios');

// Credenciais de produção
const ACCESS_TOKEN = 'APP_USR-7906695833613236-072622-a7c53bcaf7bc8b8289f1961ce3937843-2568627728';
const PUBLIC_KEY = 'APP_USR-c478c542-b18d-4ab1-acba-9539754cb167';

console.log('🔑 Testando configuração do Mercado Pago...');
console.log('🔑 Tipo de credencial:', ACCESS_TOKEN.startsWith('APP_USR') ? 'PRODUÇÃO' : 'SANDBOX');

const api = axios.create({
  baseURL: 'https://api.mercadopago.com',
  headers: {
    'Authorization': `Bearer ${ACCESS_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

async function testCheckoutCreation() {
  try {
    console.log('🔗 Criando preferência de teste...');
    
    const payload = {
      items: [
        {
          id: 'TEST-001',
          title: 'Teste de Checkout',
          description: 'Teste para verificar configuração',
          category_id: 'events',
          quantity: 1,
          unit_price: 10.00
        }
      ],
      payer: {
        name: 'Teste',
        surname: 'Usuário',
        email: 'teste@teste.com',
        phone: {
          area_code: '11',
          number: '999999999'
        },
        identification: {
          type: 'CPF',
          number: '12345678901'
        }
      },
      back_urls: {
        success: 'https://siteigreja-1.onrender.com/sucesso',
        failure: 'https://siteigreja-1.onrender.com/erro',
        pending: 'https://siteigreja-1.onrender.com/pendente'
      },
      auto_return: 'approved',
      external_reference: 'TEST-REF-001',
      notification_url: 'https://siteigreja-1.onrender.com/api/payments/webhook',
      statement_descriptor: 'TESTE',
      binary_mode: true,
      installments: 1,
      payment_methods: {
        installments: 1,
        default_installments: 1,
        excluded_payment_methods: [
          { id: "amex" },
          { id: "naranja" },
          { id: "nativa" },
          { id: "shopping" },
          { id: "cencosud" },
          { id: "argencard" },
          { id: "cabal" },
          { id: "diners" }
        ]
      },
      expires: true,
      expiration_date_from: new Date().toISOString(),
      expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      metadata: {
        test: true,
        platform: 'web',
        user_agent: 'desktop'
      }
    };

    console.log('📦 Payload:', JSON.stringify(payload, null, 2));
    
    const response = await api.post('/checkout/preferences', payload);
    
    console.log('✅ Preferência criada com sucesso!');
    console.log('🔗 ID da preferência:', response.data.id);
    console.log('🔗 URL do checkout:', response.data.init_point);
    console.log('🔗 URL do sandbox:', response.data.sandbox_init_point);
    
    return {
      success: true,
      preference_id: response.data.id,
      checkout_url: response.data.init_point,
      sandbox_url: response.data.sandbox_init_point
    };
    
  } catch (error) {
    console.error('❌ Erro ao criar preferência:', error.response?.data || error.message);
    console.error('📋 Status:', error.response?.status);
    console.error('📋 Headers:', error.response?.headers);
    
    if (error.response?.data?.error) {
      console.error('🔍 Erro específico do Mercado Pago:', error.response.data.error);
    }
    
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
}

// Executar teste
testCheckoutCreation().then(result => {
  if (result.success) {
    console.log('🎉 Teste passou! Checkout pode ser criado.');
    console.log('🔗 URL para testar:', result.checkout_url);
  } else {
    console.log('❌ Teste falhou! Verifique as configurações.');
  }
}); 