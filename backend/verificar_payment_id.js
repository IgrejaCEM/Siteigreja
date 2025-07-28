const axios = require('axios');

async function verificarPaymentId(paymentId) {
  try {
    console.log(`🔍 Verificando Payment ID: ${paymentId}`);
    
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || 'APP_USR-7906695833613236-072622-a7c53bcaf7bc8b8289f1961ce3937843-2568627728';
    if (!accessToken) {
      console.error('❌ MERCADOPAGO_ACCESS_TOKEN não encontrado');
      return;
    }

    const api = axios.create({
      baseURL: 'https://api.mercadopago.com',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    // Verificar preferência de pagamento
    console.log('📋 Buscando detalhes da preferência...');
    const preferenceResponse = await api.get(`/checkout/preferences/${paymentId}`);
    
    console.log('✅ Dados da Preferência:');
    console.log('   ID:', preferenceResponse.data.id);
    console.log('   Status:', preferenceResponse.data.status);
    console.log('   Data de Criação:', preferenceResponse.data.date_created);
    console.log('   Data de Expiração:', preferenceResponse.data.expiration_date_from);
    console.log('   Data de Expiração Para:', preferenceResponse.data.expiration_date_to);
    
    console.log('\n📦 Items:');
    preferenceResponse.data.items.forEach((item, index) => {
      console.log(`   Item ${index + 1}:`);
      console.log('     ID:', item.id);
      console.log('     Título:', item.title);
      console.log('     Descrição:', item.description);
      console.log('     Categoria:', item.category_id);
      console.log('     Quantidade:', item.quantity);
      console.log('     Preço Unitário:', item.unit_price);
    });

    console.log('\n👤 Payer:');
    console.log('   Nome:', preferenceResponse.data.payer.name);
    console.log('   Sobrenome:', preferenceResponse.data.payer.surname);
    console.log('   Email:', preferenceResponse.data.payer.email);

    console.log('\n🔗 URLs:');
    console.log('   Success:', preferenceResponse.data.back_urls.success);
    console.log('   Failure:', preferenceResponse.data.back_urls.failure);
    console.log('   Pending:', preferenceResponse.data.back_urls.pending);

    console.log('\n📊 Metadata:');
    console.log('   Registration Code:', preferenceResponse.data.metadata?.registration_code);
    console.log('   Customer ID:', preferenceResponse.data.metadata?.customer_id);
    console.log('   Event ID:', preferenceResponse.data.metadata?.event_id);
    console.log('   Payment Type:', preferenceResponse.data.metadata?.payment_type);
    console.log('   Strategy:', preferenceResponse.data.metadata?.strategy);

    // Verificar pagamentos relacionados
    console.log('\n💳 Buscando pagamentos relacionados...');
    try {
      const paymentsResponse = await api.get(`/v1/payments/search`, {
        params: {
          external_reference: preferenceResponse.data.external_reference
        }
      });

      if (paymentsResponse.data.results.length > 0) {
        console.log('✅ Pagamentos encontrados:');
        paymentsResponse.data.results.forEach((payment, index) => {
          console.log(`\n   Pagamento ${index + 1}:`);
          console.log('     ID:', payment.id);
          console.log('     Status:', payment.status);
          console.log('     Status Detail:', payment.status_detail);
          console.log('     Payment Method:', payment.payment_method_id);
          console.log('     Payment Type:', payment.payment_type_id);
          console.log('     Transaction Amount:', payment.transaction_amount);
          console.log('     Currency:', payment.currency_id);
          console.log('     Date Created:', payment.date_created);
          console.log('     Date Approved:', payment.date_approved);
          console.log('     External Reference:', payment.external_reference);
        });
      } else {
        console.log('⚠️ Nenhum pagamento encontrado para esta preferência');
      }
    } catch (paymentError) {
      console.log('⚠️ Erro ao buscar pagamentos:', paymentError.message);
    }

  } catch (error) {
    console.error('❌ Erro ao verificar payment ID:', error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      console.log('❌ Payment ID não encontrado ou inválido');
    } else if (error.response?.status === 401) {
      console.log('❌ Token de acesso inválido');
    }
  }
}

// Executar verificação
const paymentId = '119598818889';
verificarPaymentId(paymentId); 