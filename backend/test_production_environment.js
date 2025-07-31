const axios = require('axios');

async function testProductionEnvironment() {
  try {
    console.log('🧪 Testando ambiente de produção...');
    
    // Testar se o backend está respondendo
    console.log('🔧 Testando se o backend está respondendo...');
    
    try {
      const response = await axios.get('https://siteigreja-1.onrender.com/api/test/env-check', {
        timeout: 10000
      });
      console.log('✅ Backend está respondendo');
      console.log('📊 Variáveis de ambiente:', response.data.env);
    } catch (error) {
      console.error('❌ Backend não está respondendo:', error.message);
      return;
    }
    
    // Testar se o PaymentGateway está sendo inicializado
    console.log('🔧 Testando se o PaymentGateway está sendo inicializado...');
    
    try {
      const testData = {
        event_id: 14,
        customer: {
          name: 'Teste Ambiente Produção',
          email: 'teste@teste.com',
          phone: '11999999999'
        },
        items: [
          {
            type: 'EVENT_TICKET',
            name: 'Ingresso Teste',
            price: 100,
            quantity: 1
          }
        ]
      };
      
      console.log('📦 Enviando dados de teste:', JSON.stringify(testData, null, 2));
      
      const response = await axios.post('https://siteigreja-1.onrender.com/api/registrations', testData, {
        timeout: 60000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Resposta do backend:', JSON.stringify(response.data, null, 2));
      
      if (response.data.payment_url) {
        console.log('🎉 SUCCESS: Payment URL gerada:', response.data.payment_url);
      } else {
        console.log('❌ FAIL: Payment URL não foi gerada');
        console.log('📊 Dados da resposta:', response.data);
      }
      
    } catch (error) {
      console.error('❌ Erro ao testar PaymentGateway:', error.message);
      if (error.response) {
        console.error('📊 Status:', error.response.status);
        console.error('📦 Dados:', error.response.data);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testProductionEnvironment(); 