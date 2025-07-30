const paymentGateway = require('./src/services/PaymentGateway');

async function testPaymentGatewaySimulation() {
  try {
    console.log('🧪 Simulando exatamente o que acontece no RegistrationController...');
    
    // Simular os dados que chegam do frontend
    const items = [
      {
        type: 'EVENT_TICKET',
        name: 'Ingresso Teste',
        price: 100,
        quantity: 1
      }
    ];
    
    // Simular o cálculo do totalAmount
    let totalAmount = 0;
    
    for (const item of items) {
      if (item.type === 'EVENT_TICKET') {
        totalAmount += item.price * item.quantity;
        console.log(`✅ Ingresso adicionado - R$ ${item.price}`);
      }
    }
    
    console.log('💰 Valor total calculado:', totalAmount);
    
    // Forçar totalAmount a ser pelo menos 1 se for 0
    if (totalAmount === 0) {
      console.log('⚠️ TotalAmount é 0, forçando para 1');
      totalAmount = 1;
    }
    
    if (totalAmount > 0) {
      console.log('✅ TotalAmount > 0, criando pagamento...');
      
      const paymentData = {
        amount: totalAmount,
        description: 'Inscrição TEST-001',
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
      console.log('🔧 PaymentGateway disponível:', !!paymentGateway);
      console.log('🔧 Métodos do PaymentGateway:', Object.keys(paymentGateway));
      
      try {
        const paymentResult = await paymentGateway.createPayment(paymentData);
        
        console.log('✅ Resultado do PaymentGateway:', JSON.stringify(paymentResult, null, 2));
        
        if (paymentResult.payment_url) {
          console.log('🎉 SUCCESS: Payment URL gerada:', paymentResult.payment_url);
        } else {
          console.log('❌ FAIL: Payment URL não foi gerada');
        }
        
      } catch (paymentError) {
        console.error('❌ Erro ao criar pagamento:', paymentError);
        console.error('❌ Stack trace:', paymentError.stack);
      }
    } else {
      console.log('❌ TotalAmount <= 0, não criando pagamento');
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testPaymentGatewaySimulation(); 