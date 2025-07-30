const axios = require('axios');

async function testPaymentGatewayError() {
  try {
    console.log('🧪 Testando PaymentGateway com foco em erros...');
    
    // Testar criação de inscrição com dados mínimos
    const testData = {
      event_id: 14,
      customer: {
        name: 'Teste Error',
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
      
      // Verificar se há algum problema com as credenciais
      console.log('🔍 Verificando se há problema com credenciais...');
      
      // Fazer uma requisição para verificar se as credenciais estão sendo carregadas
      try {
        const envResponse = await axios.get('https://siteigreja.onrender.com/api/test/env-check', {
          timeout: 10000
        });
        console.log('✅ Rota de teste funciona:', envResponse.data);
        
        // Verificar se as credenciais estão configuradas
        if (envResponse.data.env) {
          console.log('📊 Variáveis de ambiente:');
          Object.entries(envResponse.data.env).forEach(([key, value]) => {
            console.log(`   ${key}: ${value}`);
          });
        }
        
      } catch (envError) {
        console.log('❌ Rota de teste não funciona:', envError.message);
        
        // Tentar uma abordagem diferente
        console.log('🔍 Tentando verificar se há problema com o PaymentGateway...');
        
        // Fazer uma requisição para verificar se há logs de erro
        try {
          const logsResponse = await axios.get('https://siteigreja.onrender.com/api/events', {
            timeout: 10000
          });
          console.log('✅ Backend está respondendo normalmente');
          
          // Verificar se há algum problema com o PaymentGateway
          console.log('🔍 Verificando se há problema com o PaymentGateway...');
          
          // Fazer uma requisição para verificar se há logs de erro
          try {
            const errorResponse = await axios.get('https://siteigreja.onrender.com/api/test/env-check', {
              timeout: 10000
            });
            console.log('✅ Rota de teste funciona:', errorResponse.data);
          } catch (errorError) {
            console.log('❌ Rota de teste não funciona:', errorError.message);
          }
          
        } catch (logsError) {
          console.log('❌ Backend não está respondendo:', logsError.message);
        }
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

testPaymentGatewayError(); 