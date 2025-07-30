const paymentGateway = require('./src/services/PaymentGateway');

async function testPaymentGateway() {
  try {
    console.log('🧪 Testando PaymentGateway diretamente...');
    
    const testData = {
      amount: 50,
      description: 'Teste PaymentGateway',
      customer: {
        name: 'Teste Direto',
        email: 'teste@teste.com',
        phone: '11999999999',
        registration_code: 'TEST-001',
        id: 1,
        event_id: 14
      }
    };

    console.log('📦 Dados de teste:', JSON.stringify(testData, null, 2));
    console.log('🔧 PaymentGateway disponível:', !!paymentGateway);
    console.log('🔧 Métodos do PaymentGateway:', Object.keys(paymentGateway));
    
    const result = await paymentGateway.createPayment(testData);
    
    console.log('✅ Resultado do PaymentGateway:', JSON.stringify(result, null, 2));
    
    if (result.payment_url) {
      console.log('✅ Payment URL gerada com sucesso!');
    } else {
      console.log('❌ Payment URL não foi gerada');
    }
    
  } catch (error) {
    console.error('❌ Erro no PaymentGateway:', error);
    console.error('❌ Stack trace:', error.stack);
  }
}

testPaymentGateway(); 