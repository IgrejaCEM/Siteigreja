const axios = require('axios');

async function testProductionPaymentGateway() {
  try {
    console.log('🧪 Testando PaymentGateway em produção...');
    
    // Testar criação de inscrição com dados mínimos
    const testData = {
      event_id: 14,
      customer: {
        name: 'Teste PaymentGateway',
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
      
      // Verificar se há logs de erro no backend
      console.log('🔍 Verificando se há logs de erro...');
      
      // Fazer uma requisição para verificar os logs
      try {
        const logsResponse = await axios.get('https://siteigreja.onrender.com/api/events', {
          timeout: 10000
        });
        console.log('✅ Backend está respondendo normalmente');
        
        // Verificar se há algum problema com as credenciais
        console.log('🔍 Verificando se há problema com credenciais...');
        
        // Fazer uma requisição para verificar se as credenciais estão sendo carregadas
        try {
          const envResponse = await axios.get('https://siteigreja.onrender.com/api/test/env-check', {
            timeout: 10000
          });
          console.log('✅ Rota de teste funciona:', envResponse.data);
        } catch (envError) {
          console.log('❌ Rota de teste não funciona:', envError.message);
        }
        
      } catch (logsError) {
        console.log('❌ Backend não está respondendo:', logsError.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📦 Dados:', error.response.data);
    }
  }
}

testProductionPaymentGateway(); 