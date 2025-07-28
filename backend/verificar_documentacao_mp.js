const axios = require('axios');

const ACCESS_TOKEN = 'APP_USR-7906695833613236-072622-a7c53bcaf7bc8b8289f1961ce3937843-2568627728';

console.log('📚 VERIFICANDO CONFIGURAÇÕES CONFORME DOCUMENTAÇÃO MP');
console.log('====================================================');

// Baseado na documentação oficial: https://www.mercadopago.com.br/developers/pt/docs/checkout-api/integrate-checkout

async function verificarConfiguracoes() {
  try {
    console.log('\n🧪 TESTANDO CONFIGURAÇÃO OFICIAL DO MERCADO PAGO');
    
    // Configuração conforme documentação oficial
    const preferenceData = {
      items: [
        {
          id: "item-ID-1234",
          title: "Inscrição Evento",
          description: "Inscrição no evento da igreja",
          picture_url: "https://www.mercadopago.com/org-img/MP3/home/logomp3.gif",
          category_id: "eventos",
          quantity: 1,
          unit_price: 60.00
        }
      ],
      payer: {
        name: "João",
        surname: "Silva",
        email: "joao.silva@email.com",
        date_created: "2015-06-02T12:58:41.425-04:00",
        phone: {
          area_code: "11",
          number: "4444-4444"
        },
        identification: {
          type: "CPF",
          number: "19119119100"
        },
        address: {
          street_name: "Street",
          street_number: 123,
          zip_code: "06233200"
        }
      },
      back_urls: {
        success: "https://igrejacemchurch.org/inscricao/sucesso",
        failure: "https://igrejacemchurch.org/inscricao/erro",
        pending: "https://igrejacemchurch.org/inscricao/pendente"
      },
      auto_return: "approved",
      external_reference: "REF-" + Date.now(),
      notification_url: "https://siteigreja-1.onrender.com/api/payments/webhook",
      statement_descriptor: "INSCRICAO",
      expires: true,
      expiration_date_from: new Date().toISOString(),
      expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 horas
      // Configurações para forçar web
      binary_mode: true,
      // Configurações de pagamento
      payment_methods: {
        installments: 1,
        default_installments: 1,
        excluded_payment_types: [
          { id: "ticket" }
        ],
        excluded_payment_methods: [
          { id: "amex" }
        ]
      },
      // Configurações de experiência
      differential_pricing: {
        id: 1
      },
      // Configurações de mercado
      marketplace: "INSCRICAO",
      marketplace_fee: 0
    };
    
    console.log('📦 Dados da preferência (conforme documentação):');
    console.log(JSON.stringify(preferenceData, null, 2));
    
    const response = await axios.post('https://api.mercadopago.com/v1/preferences', preferenceData, {
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });
    
    console.log('\n✅ Preferência criada com sucesso!');
    console.log('📊 Status:', response.status);
    console.log('🔗 ID da preferência:', response.data.id);
    console.log('🔗 URL do checkout:', response.data.init_point);
    console.log('🔗 URL do checkout sandbox:', response.data.sandbox_init_point);
    
    // Verificar campos obrigatórios conforme documentação
    console.log('\n🔍 VERIFICAÇÃO DE CAMPOS OBRIGATÓRIOS:');
    console.log('✅ items:', response.data.items ? 'PRESENTE' : 'AUSENTE');
    console.log('✅ back_urls:', response.data.back_urls ? 'PRESENTE' : 'AUSENTE');
    console.log('✅ external_reference:', response.data.external_reference ? 'PRESENTE' : 'AUSENTE');
    console.log('✅ notification_url:', response.data.notification_url ? 'PRESENTE' : 'AUSENTE');
    console.log('✅ binary_mode:', response.data.binary_mode ? 'ATIVO' : 'INATIVO');
    
    // Verificar se a URL é web
    const checkoutUrl = response.data.init_point;
    console.log('\n🔍 ANÁLISE DA URL DE CHECKOUT:');
    console.log('🔗 URL completa:', checkoutUrl);
    console.log('🔗 É URL web?', !checkoutUrl.includes('mercadopago://') && !checkoutUrl.includes('meli://'));
    console.log('🔗 Contém "mercadopago.com.br"?', checkoutUrl.includes('mercadopago.com.br'));
    console.log('🔗 Contém "checkout"?', checkoutUrl.includes('checkout'));
    
    console.log('\n📦 Resposta completa:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Erro na verificação:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('📦 Data do erro:', JSON.stringify(error.response.data, null, 2));
      
      // Verificar se é erro de validação
      if (error.response.data.cause) {
        console.error('🔍 Causas do erro:');
        error.response.data.cause.forEach((cause, index) => {
          console.error(`  ${index + 1}. ${cause.code}: ${cause.description}`);
        });
      }
    }
  }
}

verificarConfiguracoes(); 