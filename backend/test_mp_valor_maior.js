const axios = require('axios');

const ACCESS_TOKEN = 'APP_USR-7906695833613236-072622-a7c53bcaf7bc8b8289f1961ce3937843-2568627728';

console.log('🧪 TESTE COM VALOR MAIOR E DADOS COMPLETOS');
console.log('============================================');

async function testarMPValorMaior() {
  try {
    console.log('📋 Criando preferência com valor maior...');
    
    const preferenceData = {
      items: [
        {
          title: "Inscrição - EVENTO TESTE",
          quantity: 1,
          unit_price: 50.00  // Valor maior
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
      external_reference: "TEST-VALOR-MAIOR-" + Date.now(),
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
    
    console.log('📦 Dados da preferência:', JSON.stringify(preferenceData, null, 2));
    
    const response = await axios.post('https://api.mercadopago.com/checkout/preferences', preferenceData, {
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Preferência criada com sucesso!');
    console.log('🔗 ID:', response.data.id);
    console.log('🔗 URL:', response.data.init_point);
    console.log('💰 Valor:', response.data.items[0].unit_price);
    
    // Testar se a URL funciona
    console.log('\n📋 Testando URL do checkout...');
    
    try {
      const urlResponse = await axios.get(response.data.init_point, {
        timeout: 10000,
        maxRedirects: 5,
        validateStatus: function (status) {
          return status < 500;
        }
      });
      
      console.log('✅ URL do checkout funciona!');
      console.log('📊 Status:', urlResponse.status);
      console.log('📊 Content-Type:', urlResponse.headers['content-type']);
      
    } catch (urlError) {
      console.log('❌ URL do checkout não funciona:', urlError.message);
      console.log('📊 Status:', urlError.response?.status);
    }
    
    console.log('\n🎯 TESTE CONCLUÍDO!');
    console.log('🔗 Teste manual: Acesse a URL acima no navegador');
    console.log('💰 Valor testado: R$ 50,00');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
    console.error('📊 Status:', error.response?.status);
    
    if (error.response?.data) {
      console.error('📦 Data do erro:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testarMPValorMaior(); 