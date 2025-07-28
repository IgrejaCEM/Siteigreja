const axios = require('axios');

const ACCESS_TOKEN = 'APP_USR-7906695833613236-072622-a7c53bcaf7bc8b8289f1961ce3937843-2568627728';

async function testarPreferenciaWeb() {
  try {
    console.log('🧪 TESTANDO PREFERÊNCIA WEB');
    
    const preferenceData = {
      items: [
        {
          title: 'Teste Web - Inscrição Evento',
          quantity: 1,
          unit_price: 60.00
        }
      ],
      payer: {
        name: 'Teste Web',
        email: 'teste@web.com'
      },
      back_urls: {
        success: 'https://igrejacemchurch.org/inscricao/sucesso',
        failure: 'https://igrejacemchurch.org/inscricao/erro',
        pending: 'https://igrejacemchurch.org/inscricao/pendente'
      },
      auto_return: 'approved',
      external_reference: 'WEB-TEST-' + Date.now(),
      notification_url: 'https://siteigreja-1.onrender.com/api/payments/webhook',
      statement_descriptor: 'INSCRICAO',
      // Forçar checkout web
      binary_mode: true,
      installments: 1,
      payment_methods: {
        excluded_payment_types: [
          { id: "ticket" }
        ]
      }
    };
    
    console.log('📦 Dados da preferência:', JSON.stringify(preferenceData, null, 2));
    
    const response = await axios.post('https://api.mercadopago.com/v1/preferences', preferenceData, {
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 15000
    });
    
    console.log('✅ Preferência criada com sucesso!');
    console.log('📊 Status:', response.status);
    console.log('🔗 ID da preferência:', response.data.id);
    console.log('🔗 URL do checkout:', response.data.init_point);
    console.log('🔗 URL do checkout sandbox:', response.data.sandbox_init_point);
    
    // Verificar se a URL é web
    const checkoutUrl = response.data.init_point;
    console.log('\n🔍 Análise da URL:');
    console.log('🔗 URL completa:', checkoutUrl);
    console.log('🔗 Contém "mercadopago.com.br"?', checkoutUrl.includes('mercadopago.com.br'));
    console.log('🔗 Contém "checkout"?', checkoutUrl.includes('checkout'));
    console.log('🔗 Contém "web"?', checkoutUrl.includes('web'));
    console.log('🔗 Contém "mobile"?', checkoutUrl.includes('mobile'));
    console.log('🔗 Contém "app"?', checkoutUrl.includes('app'));
    
    console.log('\n📦 Resposta completa:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('📦 Data do erro:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testarPreferenciaWeb(); 