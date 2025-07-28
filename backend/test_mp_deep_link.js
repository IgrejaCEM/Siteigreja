const axios = require('axios');

const ACCESS_TOKEN = 'APP_USR-7906695833613236-072622-a7c53bcaf7bc8b8289f1961ce3937843-2568627728';

console.log('🔍 INVESTIGANDO DEEP LINKS DO MERCADO PAGO');
console.log('==========================================');

async function investigarDeepLinks() {
  try {
    console.log('📋 Teste 1: Criando preferência com configurações anti-deep-link...');
    
    const preferenceData = {
      items: [
        {
          title: "Teste Anti Deep Link",
          quantity: 1,
          unit_price: 50.00
        }
      ],
      payer: {
        name: "João Silva",
        email: "joao.silva@teste.com",
        phone: {
          area_code: "11",
          number: "999999999"
        },
        identification: {
          type: "CPF",
          number: "12345678901"
        }
      },
      back_urls: {
        success: "https://igrejacemchurch.org/inscricao/sucesso",
        failure: "https://igrejacemchurch.org/inscricao/erro",
        pending: "https://igrejacemchurch.org/inscricao/pendente"
      },
      external_reference: "TEST-DEEP-LINK-" + Date.now(),
      notification_url: "https://siteigreja-1.onrender.com/api/payments/webhook",
      statement_descriptor: "INSCRICAO",
      binary_mode: true,
      installments: 1,
      payment_methods: {
        installments: 1,
        default_installments: 1,
        excluded_payment_types: [
          { id: "ticket" },
          { id: "atm" }
        ],
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
        force_web_checkout: true,
        platform: 'web',
        user_agent: 'desktop',
        prevent_deep_link: true,
        web_only: true
      }
    };
    
    console.log('📦 Payload com configurações anti-deep-link:');
    console.log(JSON.stringify(preferenceData, null, 2));
    
    const response = await axios.post('https://api.mercadopago.com/checkout/preferences', preferenceData, {
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'cross-site',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });
    
    console.log('\n✅ Preferência criada!');
    console.log('🔗 ID:', response.data.id);
    console.log('🔗 URL do checkout:', response.data.init_point);
    
    // Verificar se a URL contém deep links
    const checkoutUrl = response.data.init_point;
    console.log('\n📋 Análise da URL do checkout:');
    console.log('🔗 URL completa:', checkoutUrl);
    
    if (checkoutUrl.includes('mercadopago://') || checkoutUrl.includes('meli://')) {
      console.log('🚫 DEEP LINK DETECTADO!');
      console.log('❌ O Mercado Pago ainda está gerando deep links');
    } else if (checkoutUrl.includes('mercadopago.com.br/checkout')) {
      console.log('✅ URL WEB DETECTADA!');
      console.log('✅ Configurações funcionaram');
    } else {
      console.log('⚠️ URL não reconhecida:', checkoutUrl);
    }
    
    // Testar acessibilidade da URL
    console.log('\n📋 Teste 2: Verificando acessibilidade...');
    try {
      const urlResponse = await axios.get(checkoutUrl, {
        timeout: 10000,
        maxRedirects: 5,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        },
        validateStatus: function (status) {
          return status < 500;
        }
      });
      
      console.log('✅ URL acessível!');
      console.log('📊 Status:', urlResponse.status);
      console.log('📊 Content-Type:', urlResponse.headers['content-type']);
      
      // Verificar se é HTML
      if (urlResponse.headers['content-type']?.includes('text/html')) {
        console.log('✅ É uma página HTML válida');
        
        // Verificar se contém elementos de checkout
        const html = urlResponse.data;
        if (html.includes('checkout') || html.includes('payment') || html.includes('mercadopago')) {
          console.log('✅ Contém elementos de checkout');
        } else {
          console.log('⚠️ Não contém elementos de checkout');
        }
      }
      
    } catch (urlError) {
      console.log('❌ URL não acessível:', urlError.message);
      console.log('📊 Status:', urlError.response?.status);
    }
    
    console.log('\n🎯 CONCLUSÃO:');
    console.log('🔗 URL para teste manual:', checkoutUrl);
    console.log('💰 Valor: R$ 50,00');
    console.log('🔍 Verifique se a URL abre corretamente no navegador');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
    console.error('📊 Status:', error.response?.status);
    
    if (error.response?.data) {
      console.error('📦 Data do erro:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

investigarDeepLinks(); 