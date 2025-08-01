const axios = require('axios');

async function testValidationDebug() {
  try {
    console.log('🧪 Testando validação de dados obrigatórios...');
    
    // Teste 1: Dados completos (deve funcionar)
    const test1 = {
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
    
    console.log('📦 Teste 1 - Dados completos:', JSON.stringify(test1, null, 2));
    
    try {
      const response1 = await axios.post('https://siteigreja-1.onrender.com/api/registrations', test1);
      console.log('✅ Teste 1 - Sucesso:', response1.data);
    } catch (error) {
      console.error('❌ Teste 1 - Erro:', error.response?.status, error.response?.data);
    }
    
    // Teste 2: Dados com campos vazios (deve falhar)
    const test2 = {
      event_id: 14,
      customer: {
        name: '',
        email: '',
        phone: ''
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
    
    console.log('\n📦 Teste 2 - Dados com campos vazios:', JSON.stringify(test2, null, 2));
    
    try {
      const response2 = await axios.post('https://siteigreja-1.onrender.com/api/registrations', test2);
      console.log('✅ Teste 2 - Sucesso:', response2.data);
    } catch (error) {
      console.error('❌ Teste 2 - Erro:', error.response?.status, error.response?.data);
    }
    
    // Teste 3: Dados com campos undefined (deve falhar)
    const test3 = {
      event_id: 14,
      customer: {
        name: undefined,
        email: undefined,
        phone: undefined
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
    
    console.log('\n📦 Teste 3 - Dados com campos undefined:', JSON.stringify(test3, null, 2));
    
    try {
      const response3 = await axios.post('https://siteigreja-1.onrender.com/api/registrations', test3);
      console.log('✅ Teste 3 - Sucesso:', response3.data);
    } catch (error) {
      console.error('❌ Teste 3 - Erro:', error.response?.status, error.response?.data);
    }
    
    // Teste 4: Dados com campos null (deve falhar)
    const test4 = {
      event_id: 14,
      customer: {
        name: null,
        email: null,
        phone: null
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
    
    console.log('\n📦 Teste 4 - Dados com campos null:', JSON.stringify(test4, null, 2));
    
    try {
      const response4 = await axios.post('https://siteigreja-1.onrender.com/api/registrations', test4);
      console.log('✅ Teste 4 - Sucesso:', response4.data);
    } catch (error) {
      console.error('❌ Teste 4 - Erro:', error.response?.status, error.response?.data);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testValidationDebug(); 