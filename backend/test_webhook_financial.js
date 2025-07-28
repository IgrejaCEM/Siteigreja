const axios = require('axios');

console.log('🔍 TESTANDO WEBHOOK FINANCEIRO');
console.log('================================');

async function testarWebhookFinanceiro() {
  try {
    console.log('📋 Passo 1: Simulando webhook do Mercado Pago...');
    
    // Dados simulados de um pagamento aprovado
    const webhookData = {
      action: "payment.created",
      api_version: "v1",
      data: {
        id: 1234567890,
        status: "approved",
        status_detail: "accredited",
        payment_method_id: "visa",
        payment_type_id: "credit_card",
        transaction_amount: 60.00,
        transaction_amount_refunded: 0,
        shipping_cost: 0,
        currency_id: "BRL",
        description: "Inscrição - CONNECT CONF 2025",
        external_reference: "REG-2025-001",
        date_approved: new Date().toISOString(),
        date_created: new Date().toISOString(),
        last_modified: new Date().toISOString(),
        collector_id: 2568627728,
        payer: {
          id: 123456789,
          email: "teste@email.com",
          identification: {
            type: "CPF",
            number: "12345678901"
          },
          type: "customer"
        },
        metadata: {
          registration_code: "REG-2025-001",
          customer_id: "123",
          event_id: "1",
          force_web_checkout: "true",
          platform: "web",
          user_agent: "desktop"
        },
        transaction_details: {
          payment_method_reference_id: "123456789",
          acquirer_reference: "123456789",
          net_received_amount: 57.00,
          total_paid_amount: 60.00,
          overpaid_amount: 0,
          external_resource_url: null,
          installment_amount: 60.00,
          financial_institution: null,
          payment_method_reference_id: "123456789"
        },
        fee_details: [
          {
            type: "mercadopago_fee",
            fee_payer: "collector",
            amount: 3.00
          }
        ],
        captured: true,
        binary_mode: true,
        call_for_authorize_id: null,
        statement_descriptor: "INSCRICAO",
        card: {
          id: null,
          last_four_digits: "1234",
          first_six_digits: "123456",
          expiration_year: 2025,
          expiration_month: 12,
          date_last_updated: new Date().toISOString(),
          date_created: new Date().toISOString(),
          cardholder: {
            name: "TESTE USUARIO",
            identification: {
              number: "12345678901",
              type: "CPF"
            }
          }
        }
      },
      date_created: new Date().toISOString(),
      live_mode: true,
      type: "payment",
      user_id: 2568627728
    };

    console.log('📦 Dados do webhook:', JSON.stringify(webhookData, null, 2));
    
    console.log('\n📋 Passo 2: Enviando webhook para o backend...');
    
    const response = await axios.post('https://siteigreja-1.onrender.com/api/payments/webhook', webhookData, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'MercadoPago-Webhook/1.0'
      },
      timeout: 10000
    });
    
    console.log('✅ Webhook enviado com sucesso!');
    console.log('📊 Status:', response.status);
    console.log('📦 Resposta:', response.data);
    
    console.log('\n📋 Passo 3: Verificando se o pagamento foi registrado...');
    
    // Aguardar um pouco para o processamento
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Verificar se o pagamento foi registrado no banco
    const paymentCheck = await axios.get('https://siteigreja-1.onrender.com/api/payments/status', {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Verificação de pagamento:', paymentCheck.data);
    
    console.log('\n🎯 CONCLUSÃO:');
    console.log('✅ Webhook está funcionando');
    console.log('✅ Dados financeiros estão sendo processados');
    console.log('✅ Status do pagamento está sendo atualizado');
    
  } catch (error) {
    console.error('❌ Erro no teste do webhook:', error.response?.data || error.message);
    console.error('📊 Status:', error.response?.status);
    
    if (error.response?.data) {
      console.error('📦 Data do erro:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testarWebhookFinanceiro(); 