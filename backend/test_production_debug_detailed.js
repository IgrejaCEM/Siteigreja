const axios = require('axios');

async function testProductionDebugDetailed() {
  console.log('🧪 Testando debug detalhado do ambiente de produção...');
  
  try {
    // Teste 1: Verificar se o problema é específico do RegistrationController
    console.log('🧪 Teste 1: Verificar se o problema é específico do RegistrationController');
    
    // Primeiro, vamos testar com dados mínimos
    const minimalData = {
      event_id: 999,
      customer: {
        name: "Teste",
        email: "teste@teste.com",
        phone: "11999999999"
      },
      items: [],
      products: [
        {
          product_id: 1,
          quantity: 1,
          unit_price: 25
        }
      ]
    };
    
    console.log('📤 Enviando dados mínimos:', JSON.stringify(minimalData, null, 2));
    
    try {
      const response1 = await axios.post('https://siteigreja.onrender.com/api/registrations', minimalData, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });
      
      console.log('✅ Sucesso com dados mínimos:', response1.status);
      console.log('✅ Dados da resposta:', response1.data);
      
    } catch (error1) {
      console.log('❌ Erro com dados mínimos:', error1.response?.status);
      console.log('❌ Dados do erro:', error1.response?.data);
    }
    
    // Teste 2: Verificar se o problema é com o product_id
    console.log('\n🧪 Teste 2: Verificar se o problema é com o product_id');
    
    const testProductId = {
      event_id: 999,
      customer: {
        name: "Teste",
        email: "teste@teste.com",
        phone: "11999999999"
      },
      items: [],
      products: [
        {
          product_id: "1", // String em vez de número
          quantity: 1,
          unit_price: 25
        }
      ]
    };
    
    console.log('📤 Enviando com product_id como string:', JSON.stringify(testProductId, null, 2));
    
    try {
      const response2 = await axios.post('https://siteigreja.onrender.com/api/registrations', testProductId, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });
      
      console.log('✅ Sucesso com product_id string:', response2.status);
      console.log('✅ Dados da resposta:', response2.data);
      
    } catch (error2) {
      console.log('❌ Erro com product_id string:', error2.response?.status);
      console.log('❌ Dados do erro:', error2.response?.data);
    }
    
    // Teste 3: Verificar se o problema é com o event_id
    console.log('\n🧪 Teste 3: Verificar se o problema é com o event_id');
    
    const testEventId = {
      event_id: 14, // Evento real em vez de 999
      customer: {
        name: "Teste",
        email: "teste@teste.com",
        phone: "11999999999"
      },
      items: [],
      products: [
        {
          product_id: 1,
          quantity: 1,
          unit_price: 25
        }
      ]
    };
    
    console.log('📤 Enviando com event_id 14:', JSON.stringify(testEventId, null, 2));
    
    try {
      const response3 = await axios.post('https://siteigreja.onrender.com/api/registrations', testEventId, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });
      
      console.log('✅ Sucesso com event_id 14:', response3.status);
      console.log('✅ Dados da resposta:', response3.data);
      
    } catch (error3) {
      console.log('❌ Erro com event_id 14:', error3.response?.status);
      console.log('❌ Dados do erro:', error3.response?.data);
    }
    
  } catch (error) {
    console.log('❌ Erro geral:', error.message);
  }
}

testProductionDebugDetailed(); 