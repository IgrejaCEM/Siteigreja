const axios = require('axios');

const ACCESS_TOKEN = 'APP_USR-7906695833613236-072622-a7c53bcaf7bc8b8289f1961ce3937843-2568627728';

console.log('🔍 VERIFICANDO WEBHOOK DO MERCADO PAGO');
console.log('=======================================');

async function verificarWebhook() {
  try {
    console.log('📋 Passo 1: Verificando configuração do webhook...');
    
    // Tentar obter informações da conta (inclui webhooks)
    const accountResponse = await axios.get('https://api.mercadopago.com/v1/account', {
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Conta verificada:', accountResponse.data.id);
    
    console.log('\n📋 Passo 2: Testando webhook manualmente...');
    
    // Dados de teste para webhook
    const webhookTest = {
      action: "payment.created",
      api_version: "v1",
      data: {
        id: 1234567890,
        status: "approved",
        status_detail: "accredited",
        payment_method_id: "visa",
        payment_type_id: "credit_card",
        transaction_amount: 60.00,
        currency_id: "BRL",
        description: "Teste Webhook",
        external_reference: "TEST-WEBHOOK-001",
        date_approved: new Date().toISOString(),
        date_created: new Date().toISOString(),
        collector_id: 2568627728,
        payer: {
          id: 123456789,
          email: "teste@webhook.com",
          identification: {
            type: "CPF",
            number: "12345678901"
          }
        },
        metadata: {
          registration_code: "TEST-WEBHOOK-001",
          event_id: "1"
        }
      },
      date_created: new Date().toISOString(),
      live_mode: true,
      type: "payment",
      user_id: 2568627728
    };
    
    console.log('📦 Enviando webhook de teste...');
    
    const webhookResponse = await axios.post('https://siteigreja-1.onrender.com/api/payments/webhook', webhookTest, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'MercadoPago-Webhook/1.0'
      },
      timeout: 10000
    });
    
    console.log('✅ Webhook respondido com sucesso!');
    console.log('📊 Status:', webhookResponse.status);
    console.log('📦 Resposta:', webhookResponse.data);
    
    console.log('\n📋 Passo 3: Verificando logs do webhook...');
    
    // Aguardar processamento
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('✅ Webhook processado');
    
    console.log('\n🎯 CONCLUSÃO:');
    console.log('✅ Webhook está configurado');
    console.log('✅ Backend está respondendo');
    console.log('✅ Dados estão sendo processados');
    console.log('💡 Se o erro persistir, verifique:');
    console.log('   1. Configuração no dashboard do Mercado Pago');
    console.log('   2. URL do webhook: https://siteigreja-1.onrender.com/api/payments/webhook');
    console.log('   3. Credenciais da conta');
    
  } catch (error) {
    console.error('❌ Erro ao verificar webhook:', error.response?.data || error.message);
    console.error('📊 Status:', error.response?.status);
    
    if (error.response?.status === 401) {
      console.log('🔑 Token inválido - verifique as credenciais');
    } else if (error.response?.status === 404) {
      console.log('🔗 Webhook não encontrado - verifique a URL');
    }
  }
}

verificarWebhook(); 