const axios = require('axios');

async function verificarPaymentIdProdutivo(paymentId) {
  try {
    console.log(`🔍 Verificando Payment ID Produtivo: ${paymentId}`);
    
    // Credenciais de produção
    const accessToken = 'APP_USR-7906695833613236-072622-a7c53bcaf7bc8b8289f1961ce3937843-2568627728';
    const publicKey = 'APP_USR-c478c542-b18d-4ab1-acba-9539754cb167';
    
    console.log('🔑 Usando credenciais de produção');
    console.log('   Access Token:', accessToken.substring(0, 20) + '...');
    console.log('   Public Key:', publicKey.substring(0, 20) + '...');

    const api = axios.create({
      baseURL: 'https://api.mercadopago.com',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    // Primeiro, tentar como preferência
    console.log('\n📋 Tentando como Preferência...');
    try {
      const preferenceResponse = await api.get(`/checkout/preferences/${paymentId}`);
      
      console.log('✅ ENCONTRADO COMO PREFERÊNCIA!');
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

    } catch (preferenceError) {
      console.log('❌ Não é uma preferência, tentando como pagamento...');
      
      // Tentar como pagamento
      try {
        const paymentResponse = await api.get(`/v1/payments/${paymentId}`);
        
        console.log('✅ ENCONTRADO COMO PAGAMENTO!');
        console.log('   ID:', paymentResponse.data.id);
        console.log('   Status:', paymentResponse.data.status);
        console.log('   Status Detail:', paymentResponse.data.status_detail);
        console.log('   Payment Method:', paymentResponse.data.payment_method_id);
        console.log('   Payment Type:', paymentResponse.data.payment_type_id);
        console.log('   Transaction Amount:', paymentResponse.data.transaction_amount);
        console.log('   Currency:', paymentResponse.data.currency_id);
        console.log('   Date Created:', paymentResponse.data.date_created);
        console.log('   Date Approved:', paymentResponse.data.date_approved);
        console.log('   External Reference:', paymentResponse.data.external_reference);
        
        console.log('\n👤 Payer:');
        console.log('   ID:', paymentResponse.data.payer.id);
        console.log('   Email:', paymentResponse.data.payer.email);
        
        console.log('\n📦 Items:');
        paymentResponse.data.additional_info?.items?.forEach((item, index) => {
          console.log(`   Item ${index + 1}:`);
          console.log('     ID:', item.id);
          console.log('     Título:', item.title);
          console.log('     Quantidade:', item.quantity);
          console.log('     Preço Unitário:', item.unit_price);
        });

      } catch (paymentError) {
        console.log('❌ Não é um pagamento válido');
        console.log('   Erro:', paymentError.response?.data || paymentError.message);
      }
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.response?.data || error.message);
  }
}

// Executar verificação
const paymentId = '119598818889';
verificarPaymentIdProdutivo(paymentId); 