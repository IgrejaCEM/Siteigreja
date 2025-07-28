const axios = require('axios');

const ACCESS_TOKEN = 'APP_USR-7906695833613236-072622-a7c53bcaf7bc8b8289f1961ce3937843-2568627728';
const BASE_URL = 'https://siteigreja-1.onrender.com';

console.log('🔍 INVESTIGANDO ERRO DE PREFERÊNCIA');
console.log('====================================');

async function testarPreferencia() {
  try {
    console.log('📋 Passo 1: Testando criação de preferência direta...');
    
    const preferenceData = {
      items: [
        {
          title: 'Teste de Preferência',
          quantity: 1,
          unit_price: 50.00
        }
      ],
      payer: {
        name: 'João Silva',
        email: 'joao.teste@email.com',
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
        success: 'https://igrejacemchurch.org/inscricao/sucesso',
        failure: 'https://igrejacemchurch.org/inscricao/erro',
        pending: 'https://igrejacemchurch.org/inscricao/pendente'
      },
      auto_return: 'approved',
      external_reference: `TEST-${Date.now()}`,
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

    console.log('📦 Dados da preferência:', JSON.stringify(preferenceData, null, 2));

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

    console.log('✅ Preferência criada com sucesso!');
    console.log('📊 Status:', response.status);
    console.log('🆔 Preference ID:', response.data.id);
    console.log('🔗 Init Point:', response.data.init_point);
    console.log('🔗 Sandbox Init Point:', response.data.sandbox_init_point);

    // Testar acessibilidade da URL
    const checkoutUrl = response.data.init_point;
    console.log('\n📋 Passo 2: Testando acessibilidade da URL...');
    
    try {
      const urlResponse = await axios.get(checkoutUrl, {
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

    console.log('\n📋 Passo 3: Testando via API do backend...');
    
    const inscricaoData = {
      lot_id: 2,
      participantes: [
        {
          name: 'João Silva Teste',
          email: 'joao.teste@email.com',
          phone: '11999999999',
          cpf: '12345678901',
          address: 'Rua Teste, 123',
          form_data: {
            nome: 'João Silva Teste',
            email: 'joao.teste@email.com',
            telefone: '11999999999',
            cpf: '12345678901',
            endereco: 'Rua Teste, 123'
          }
        }
      ],
      products: []
    };

    const backendResponse = await axios.post(`${BASE_URL}/api/events/4/inscricao-unificada`, inscricaoData);
    
    console.log('✅ Inscrição via backend criada!');
    console.log('📊 Status:', backendResponse.status);
    console.log('🔗 Payment URL:', backendResponse.data.payment_info?.payment_url);
    
    if (backendResponse.data.payment_info?.payment_url) {
      const backendUrl = backendResponse.data.payment_info.payment_url;
      
      // Verificar se é deep link
      if (backendUrl.includes('mercadopago://') || backendUrl.includes('meli://')) {
        console.log('🚫 DEEP LINK DETECTADO NO BACKEND!');
        
        // Extrair preference ID
        const prefIdMatch = backendUrl.match(/pref_id=([^&]+)/);
        if (prefIdMatch) {
          const prefId = prefIdMatch[1];
          const webUrl = `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=${prefId}`;
          console.log('✅ URL convertida para web:', webUrl);
          
          // Testar acessibilidade
          try {
            const webUrlResponse = await axios.get(webUrl, {
              timeout: 10000,
              maxRedirects: 5,
              validateStatus: function (status) {
                return status < 500;
              }
            });
            
            console.log('✅ URL web acessível!');
            console.log('📊 Status:', webUrlResponse.status);
            
          } catch (webUrlError) {
            console.log('❌ URL web não acessível:', webUrlError.message);
          }
        }
      } else {
        console.log('✅ Backend gerando URL web corretamente!');
      }
    }

    console.log('\n🎯 CONCLUSÃO:');
    console.log('🔗 URL para teste manual:', backendResponse.data.payment_info?.payment_url);
    console.log('💰 Valor: R$ 50,00');
    console.log('🔍 Verifique se consegue fazer o pagamento manualmente');

  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
    console.error('📊 Status:', error.response?.status);
    
    if (error.response?.data) {
      console.error('📦 Data do erro:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testarPreferencia(); 