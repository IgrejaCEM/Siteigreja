const paymentGateway = require('./src/services/PaymentGateway');

async function testPaymentSimulation() {
  try {
    console.log('🧪 Simulando o que acontece no RegistrationController...');
    
    // Simular os dados que chegam do frontend
    const items = [
      {
        type: 'EVENT_TICKET',
        name: 'Ingresso Teste',
        price: 50,
        quantity: 1
      }
    ];
    
    // Simular o cálculo do totalAmount
    let totalAmount = 0;
    
    for (const item of items) {
      if (item.type === 'EVENT_TICKET') {
        // Se não tem lot_id, usar o preço do item
        totalAmount += item.price * item.quantity;
        console.log(`✅ Ingresso adicionado - R$ ${item.price}`);
      }
    }
    
    console.log('💰 Valor total calculado:', totalAmount);
    
    if (totalAmount > 0) {
      console.log('💳 Criando pagamento no MercadoPago...');
      
      const paymentData = {
        amount: totalAmount,
        description: `Inscrição TEST-001`,
        customer: {
          name: 'Teste Simulação',
          email: 'teste@teste.com',
          phone: '11999999999',
          registration_code: 'TEST-001',
          id: 1,
          event_id: 14
        }
      };

      console.log('📦 Dados do pagamento:', JSON.stringify(paymentData, null, 2));
      
      const paymentResult = await paymentGateway.createPayment(paymentData);
      
      console.log('✅ Resultado do PaymentGateway:', JSON.stringify(paymentResult, null, 2));
      
      if (paymentResult.payment_url) {
        console.log('✅ Payment URL gerada com sucesso!');
      } else {
        console.log('❌ Payment URL não foi gerada');
      }
    } else {
      console.log('⚠️ TotalAmount é 0, não criando pagamento');
    }
    
  } catch (error) {
    console.error('❌ Erro na simulação:', error);
    console.error('❌ Stack trace:', error.stack);
  }
}

testPaymentSimulation(); 