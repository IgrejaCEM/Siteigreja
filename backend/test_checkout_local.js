const config = require('./src/config');
const PaymentGateway = require('./src/services/PaymentGateway');

async function testarCheckoutLocal() {
  try {
    console.log('🧪 TESTANDO CHECKOUT LOCAL');
    console.log('🎭 PAYMENT_FAKE_MODE:', config.PAYMENT_FAKE_MODE);
    
    const paymentData = {
      amount: 60,
      description: 'Teste Local - Inscrição Evento',
      customer: {
        name: 'Teste Local',
        email: 'teste@local.com',
        phone: '11999999999',
        registration_code: 'TEST-' + Date.now()
      },
      method: 'CHECKOUT_PRO'
    };
    
    console.log('📦 Dados do pagamento:', JSON.stringify(paymentData, null, 2));
    
    const result = await PaymentGateway.createPayment(paymentData);
    
    console.log('✅ Resultado do PaymentGateway:');
    console.log('📊 Status:', result.status);
    console.log('🔗 URL:', result.payment_url);
    console.log('🎭 É URL fake?', result.payment_url?.includes('checkout-fake'));
    console.log('🔗 É URL Mercado Pago?', result.payment_url?.includes('mercadopago'));
    
    if (result.payment_url) {
      console.log('🔗 URL completa:', result.payment_url);
    }
    
  } catch (error) {
    console.error('❌ Erro no teste local:', error.message);
    console.error('📋 Stack:', error.stack);
  }
}

testarCheckoutLocal(); 