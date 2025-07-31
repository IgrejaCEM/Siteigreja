const axios = require('axios');

async function testRegistrationController() {
  try {
    console.log('🧪 Testando RegistrationController...');
    
    // Testar se o RegistrationController está sendo inicializado corretamente
    console.log('🔧 Testando import do RegistrationController...');
    
    try {
      const RegistrationController = require('./src/controllers/RegistrationController');
      console.log('✅ RegistrationController importado com sucesso');
      console.log('🔧 RegistrationController disponível:', !!RegistrationController);
      console.log('🔧 Métodos do RegistrationController:', Object.keys(RegistrationController));
      
      if (RegistrationController && RegistrationController.paymentGateway) {
        console.log('✅ RegistrationController.paymentGateway disponível');
        console.log('🔧 PaymentGateway disponível:', !!RegistrationController.paymentGateway);
        console.log('🔧 Métodos do PaymentGateway:', Object.keys(RegistrationController.paymentGateway));
        
        // Testar se o PaymentGateway está funcionando
        if (RegistrationController.paymentGateway.createPayment) {
          console.log('✅ PaymentGateway.createPayment disponível');
          
          // Testar criação de pagamento
          const testPaymentData = {
            amount: 100,
            description: 'Teste RegistrationController',
            customer: {
              name: 'Teste RegistrationController',
              email: 'teste@teste.com',
              phone: '11999999999',
              registration_code: 'TEST-REG-CONTROLLER',
              id: 1,
              event_id: 14
            }
          };
          
          console.log('📦 Testando createPayment com dados:', JSON.stringify(testPaymentData, null, 2));
          
          const result = await RegistrationController.paymentGateway.createPayment(testPaymentData);
          console.log('✅ Resultado do createPayment:', JSON.stringify(result, null, 2));
          
          if (result.payment_url) {
            console.log('🎉 SUCCESS: Payment URL gerada:', result.payment_url);
          } else {
            console.log('❌ FAIL: Payment URL não foi gerada');
          }
          
        } else {
          console.log('❌ PaymentGateway.createPayment não está disponível');
        }
        
      } else {
        console.log('❌ RegistrationController.paymentGateway não está disponível');
      }
      
    } catch (importError) {
      console.error('❌ Erro ao importar RegistrationController:', importError.message);
      console.error('❌ Stack trace:', importError.stack);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
    console.error('❌ Stack trace:', error.stack);
  }
}

testRegistrationController(); 