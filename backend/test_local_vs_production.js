const paymentGateway = require('./src/services/PaymentGateway');

async function testLocalVsProduction() {
  try {
    console.log('🧪 Testando PaymentGateway local vs produção...');
    
    // Testar localmente
    console.log('\n🔧 Testando localmente...');
    
    const testData = {
      amount: 50,
      description: 'Teste Local vs Produção',
      customer: {
        name: 'Teste Local',
        email: 'teste@teste.com',
        phone: '11999999999',
        registration_code: 'TEST-LOCAL-001',
        id: 1,
        event_id: 14
      }
    };

    console.log('📦 Dados de teste:', JSON.stringify(testData, null, 2));
    
    try {
      const localResult = await paymentGateway.createPayment(testData);
      console.log('✅ Resultado local:', JSON.stringify(localResult, null, 2));
    } catch (localError) {
      console.log('❌ Erro local:', localError.message);
    }
    
    // Testar produção via API
    console.log('\n🌐 Testando produção via API...');
    
    const axios = require('axios');
    
    const productionData = {
      event_id: 14,
      customer: {
        name: 'Teste Produção',
        email: 'teste@teste.com',
        phone: '11999999999'
      },
      items: [
        {
          type: 'EVENT_TICKET',
          name: 'Ingresso Teste',
          price: 50,
          quantity: 1
        }
      ]
    };

    try {
      const productionResponse = await axios.post('https://siteigreja.onrender.com/api/registrations', productionData, {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Resultado produção:', JSON.stringify(productionResponse.data, null, 2));
      
      if (productionResponse.data.payment_url) {
        console.log('🎉 SUCCESS: Payment URL gerada em produção');
      } else {
        console.log('❌ FAIL: Payment URL não foi gerada em produção');
      }
      
    } catch (productionError) {
      console.log('❌ Erro produção:', productionError.message);
      if (productionError.response) {
        console.log('📊 Status:', productionError.response.status);
        console.log('📦 Dados:', productionError.response.data);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testLocalVsProduction(); 