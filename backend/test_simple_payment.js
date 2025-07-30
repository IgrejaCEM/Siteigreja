const axios = require('axios');

async function testSimplePayment() {
  try {
    console.log('🧪 Teste simples de pagamento...');
    
    // Testar com dados mais simples
    const testData = {
      event_id: 14,
      customer: {
        name: 'Teste Simples',
        email: 'teste@teste.com',
        phone: '11999999999'
      },
      items: [
        {
          type: 'EVENT_TICKET',
          name: 'Ingresso Teste',
          price: 100, // Preço mais alto para garantir
          quantity: 1
        }
      ]
    };

    console.log('📦 Dados de teste:', JSON.stringify(testData, null, 2));

    const response = await axios.post('https://siteigreja.onrender.com/api/registrations', testData, {
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Resposta completa do backend:', JSON.stringify(response.data, null, 2));
    
    if (response.data.payment_url) {
      console.log('🎉 SUCCESS: Payment URL gerada:', response.data.payment_url);
    } else {
      console.log('❌ FAIL: Payment URL não foi gerada');
      
      // Verificar se há algum problema com o totalAmount
      console.log('🔍 Verificando se há problema com totalAmount...');
      
      // Calcular o totalAmount manualmente
      let totalAmount = 0;
      for (const item of testData.items) {
        if (item.type === 'EVENT_TICKET') {
          totalAmount += item.price * item.quantity;
        }
      }
      
      console.log('💰 TotalAmount calculado:', totalAmount);
      console.log('🔍 Verificando se totalAmount > 0:', totalAmount > 0);
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📦 Dados:', error.response.data);
    }
  }
}

testSimplePayment(); 