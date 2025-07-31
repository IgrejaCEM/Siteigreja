const axios = require('axios');

async function testProductionGatewayDebug() {
  try {
    console.log('🧪 Testando debug do PaymentGateway em produção...');
    
    // Testar se o PaymentGateway está sendo inicializado corretamente
    console.log('🔧 Testando import do PaymentGateway...');
    
    try {
      const PaymentGateway = require('./src/services/PaymentGateway');
      console.log('✅ PaymentGateway importado com sucesso');
      console.log('🔧 PaymentGateway disponível:', !!PaymentGateway);
      console.log('🔧 Métodos do PaymentGateway:', Object.keys(PaymentGateway));
      
      if (PaymentGateway && PaymentGateway.createPayment) {
        console.log('✅ PaymentGateway.createPayment disponível');
        
        // Testar criação de pagamento
        const testPaymentData = {
          amount: 100,
          description: 'Teste Produção Gateway Debug',
          customer: {
            name: 'Teste Produção Gateway Debug',
            email: 'teste@teste.com',
            phone: '11999999999',
            registration_code: 'TEST-PROD-GATEWAY-DEBUG',
            id: 1,
            event_id: 14
          }
        };
        
        console.log('📦 Testando createPayment com dados:', JSON.stringify(testPaymentData, null, 2));
        
        const result = await PaymentGateway.createPayment(testPaymentData);
        console.log('✅ Resultado do createPayment:', JSON.stringify(result, null, 2));
        
        if (result.payment_url) {
          console.log('🎉 SUCCESS: Payment URL gerada:', result.payment_url);
        } else {
          console.log('❌ FAIL: Payment URL não foi gerada');
        }
        
      } else {
        console.log('❌ PaymentGateway.createPayment não está disponível');
      }
      
    } catch (importError) {
      console.error('❌ Erro ao importar PaymentGateway:', importError.message);
      console.error('❌ Stack trace:', importError.stack);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
    console.error('❌ Stack trace:', error.stack);
  }
}

testProductionGatewayDebug(); 