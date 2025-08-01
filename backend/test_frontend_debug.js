const axios = require('axios');

async function testFrontendDebug() {
  try {
    console.log('🧪 Testando debug do frontend...');
    
    // Simular diferentes cenários que podem estar causando o erro 400
    
    // Cenário 1: Dados exatamente como o frontend pode estar enviando
    const scenario1 = {
      event_id: 14,
      customer: {
        name: 'Teste Usuário',
        email: 'teste@teste.com',
        phone: '11999999999'
      },
      items: [
        {
          type: 'EVENT_TICKET',
          name: 'Ingresso - FREE TESTE',
          price: 50,
          quantity: 1,
          lot_id: 1
        }
      ],
      products: []
    };
    
    console.log('📦 Cenário 1 - Dados básicos:', JSON.stringify(scenario1, null, 2));
    
    try {
      const response1 = await axios.post('https://siteigreja-1.onrender.com/api/registrations', scenario1, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Cenário 1 - Sucesso:', response1.data);
    } catch (error) {
      console.error('❌ Cenário 1 - Erro:', error.response?.status, error.response?.data);
    }
    
    // Cenário 2: Dados com campos extras que podem estar sendo enviados
    const scenario2 = {
      event_id: 14,
      customer: {
        name: 'Teste Usuário',
        email: 'teste@teste.com',
        phone: '11999999999'
      },
      items: [
        {
          type: 'EVENT_TICKET',
          name: 'Ingresso - FREE TESTE',
          price: 50,
          quantity: 1,
          lot_id: 1,
          id: 1, // Campo extra que pode estar sendo enviado
          eventId: 14, // Campo extra
          eventName: 'CONNECT CONF 2025 - INPROVÁVEIS' // Campo extra
        }
      ],
      products: []
    };
    
    console.log('\n📦 Cenário 2 - Dados com campos extras:', JSON.stringify(scenario2, null, 2));
    
    try {
      const response2 = await axios.post('https://siteigreja-1.onrender.com/api/registrations', scenario2, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Cenário 2 - Sucesso:', response2.data);
    } catch (error) {
      console.error('❌ Cenário 2 - Erro:', error.response?.status, error.response?.data);
    }
    
    // Cenário 3: Dados com valores undefined/null
    const scenario3 = {
      event_id: 14,
      customer: {
        name: 'Teste Usuário',
        email: 'teste@teste.com',
        phone: '11999999999'
      },
      items: [
        {
          type: 'EVENT_TICKET',
          name: 'Ingresso - FREE TESTE',
          price: 50,
          quantity: 1,
          lot_id: 1
        }
      ],
      products: [],
      name: undefined, // Campo que pode estar sendo enviado como undefined
      email: undefined,
      phone: undefined
    };
    
    console.log('\n📦 Cenário 3 - Dados com campos undefined:', JSON.stringify(scenario3, null, 2));
    
    try {
      const response3 = await axios.post('https://siteigreja-1.onrender.com/api/registrations', scenario3, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Cenário 3 - Sucesso:', response3.data);
    } catch (error) {
      console.error('❌ Cenário 3 - Erro:', error.response?.status, error.response?.data);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testFrontendDebug(); 