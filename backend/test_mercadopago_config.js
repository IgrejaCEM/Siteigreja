const axios = require('axios');

const ACCESS_TOKEN = 'APP_USR-7906695833613236-072622-a7c53bcaf7bc8b8289f1961ce3937843-2568627728';

console.log('🔍 VERIFICANDO CONFIGURAÇÃO DO MERCADO PAGO');
console.log('============================================');

async function testarConfiguracao() {
  try {
    console.log('📋 Passo 1: Verificando token de acesso...');
    
    // Testar se o token é válido
    const tokenResponse = await axios.get('https://api.mercadopago.com/v1/account', {
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Token válido!');
    console.log('📊 Status:', tokenResponse.status);
    console.log('📦 Dados da conta:', tokenResponse.data);
    
    console.log('\n📋 Passo 2: Verificando métodos de pagamento...');
    
    const methodsResponse = await axios.get('https://api.mercadopago.com/v1/payment_methods', {
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Métodos de pagamento disponíveis!');
    console.log('📊 Status:', methodsResponse.status);
    console.log('📦 Quantidade de métodos:', methodsResponse.data.length);
    
    // Mostrar alguns métodos
    methodsResponse.data.slice(0, 5).forEach(method => {
      console.log(`   - ${method.name} (${method.id})`);
    });
    
    console.log('\n📋 Passo 3: Testando criação de preferência...');
    
    const preferenceData = {
      items: [
        {
          title: 'Teste de Configuração',
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
      external_reference: `TEST-CONFIG-${Date.now()}`,
      notification_url: 'https://siteigreja-1.onrender.com/api/payments/webhook',
      statement_descriptor: 'INSCRICAO',
      binary_mode: true,
      expires: true,
      expiration_date_from: new Date().toISOString(),
      expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
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
      metadata: {
        force_web_checkout: true,
        platform: 'web',
        user_agent: 'desktop',
        prevent_deep_link: true,
        web_only: true
      }
    };

    const preferenceResponse = await axios.post('https://api.mercadopago.com/checkout/preferences', preferenceData, {
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
    
    console.log('✅ Preferência criada com sucesso!');
    console.log('📊 Status:', preferenceResponse.status);
    console.log('🆔 Preference ID:', preferenceResponse.data.id);
    console.log('🔗 Init Point:', preferenceResponse.data.init_point);
    
    // Testar acessibilidade da URL
    console.log('\n📋 Passo 4: Testando acessibilidade da URL...');
    
    try {
      const urlResponse = await axios.get(preferenceResponse.data.init_point, {
        timeout: 10000,
        maxRedirects: 5,
        validateStatus: function (status) {
          return status < 500;
        }
      });
      
      console.log('✅ URL acessível!');
      console.log('📊 Status:', urlResponse.status);
      console.log('📊 Content-Type:', urlResponse.headers['content-type']);
      
    } catch (urlError) {
      console.log('❌ URL não acessível:', urlError.message);
    }
    
    console.log('\n🎯 CONCLUSÃO:');
    console.log('🔗 URL para teste manual:', preferenceResponse.data.init_point);
    console.log('💰 Valor: R$ 10,00');
    console.log('🔍 Teste esta URL para ver se o erro persiste');
    
  } catch (error) {
    console.error('❌ Erro na configuração:', error.response?.data || error.message);
    console.error('📊 Status:', error.response?.status);
    
    if (error.response?.data) {
      console.error('📦 Data do erro:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testarConfiguracao(); 