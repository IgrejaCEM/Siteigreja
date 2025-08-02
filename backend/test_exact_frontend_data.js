const axios = require('axios');

async function testExactFrontendData() {
  try {
    console.log('🧪 Testando com dados exatos do frontend...');
    
    // Dados exatos que o frontend está enviando
    const testData = {
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
    
    console.log('📦 Dados exatos do frontend:', JSON.stringify(testData, null, 2));
    
    try {
      const response = await axios.post('https://siteigreja-1.onrender.com/api/registrations', testData);
      console.log('✅ Teste com dados exatos - Sucesso:', response.data);
    } catch (error) {
      console.error('❌ Teste com dados exatos - Erro:', error.response?.status);
      console.error('📊 Detalhes do erro:', error.response?.data);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testExactFrontendData(); 