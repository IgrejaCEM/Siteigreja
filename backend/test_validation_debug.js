const axios = require('axios');

async function testValidationDebug() {
  try {
    console.log('🧪 Testando validação de dados...');
    
    // Teste 1: Dados mínimos (apenas ticket)
    const testData1 = {
      event_id: 14,
      customer: {
        name: 'Lucas Carvalho',
        email: 'lucasrodrigo1922@hotmail.com',
        phone: '13996150372'
      },
      items: [
        {
          type: 'EVENT_TICKET',
          name: 'Ingresso - FREE TESTE',
          price: 50,
          quantity: 1,
          lot_id: 6
        }
      ],
      products: []
    };
    
    console.log('📦 Teste 1 - Dados mínimos:', JSON.stringify(testData1, null, 2));
    
    try {
      const response1 = await axios.post('https://siteigreja-1.onrender.com/api/registrations', testData1);
      console.log('✅ Teste 1 - Sucesso:', response1.data);
    } catch (error1) {
      console.error('❌ Teste 1 - Erro:', error1.response?.status, error1.response?.data);
    }
    
    // Teste 2: Dados completos (ticket + produto)
    const testData2 = {
      event_id: 14,
      customer: {
        name: 'Lucas Carvalho',
        email: 'lucasrodrigo1922@hotmail.com',
        phone: '13996150372',
        cpf: '46405781801',
        address: {
          street: 'aaaaaaa',
          number: '370',
          complement: 'aaaaaaa',
          neighborhood: 'Parafuso',
          city: 'Cajati',
          state: 'São Paulo',
          zipCode: '11950-000'
        }
      },
      items: [
        {
          type: 'EVENT_TICKET',
          name: 'Ingresso - FREE TESTE',
          price: 50,
          quantity: 1,
          lot_id: 6
        }
      ],
      products: [
        {
          product_id: 1,
          quantity: 1,
          unit_price: 25
        }
      ]
    };
    
    console.log('\n📦 Teste 2 - Dados completos:', JSON.stringify(testData2, null, 2));
    
    try {
      const response2 = await axios.post('https://siteigreja-1.onrender.com/api/registrations', testData2);
      console.log('✅ Teste 2 - Sucesso:', response2.data);
    } catch (error2) {
      console.error('❌ Teste 2 - Erro:', error2.response?.status, error2.response?.data);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testValidationDebug(); 