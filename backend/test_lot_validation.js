const axios = require('axios');

async function testLotValidation() {
  try {
    console.log('🧪 Testando validação do lote...');
    
    // Teste 1: Verificar se o lote 6 existe
    try {
      const response = await axios.get('https://siteigreja-1.onrender.com/api/events/14');
      console.log('✅ Evento 14 encontrado:', response.data);
      
      if (response.data.lots) {
        console.log('📋 Lotes disponíveis:', response.data.lots);
        const lot6 = response.data.lots.find(lot => lot.id === 6);
        console.log('🔍 Lote 6 encontrado:', lot6);
      }
    } catch (error) {
      console.error('❌ Erro ao buscar evento:', error.response?.status, error.response?.data);
    }
    
    // Teste 2: Dados com lote 1 (que sabemos que existe)
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
          lot_id: 1
        }
      ],
      products: []
    };
    
    console.log('\n📦 Teste com lote 1:', JSON.stringify(testData, null, 2));
    
    try {
      const response = await axios.post('https://siteigreja-1.onrender.com/api/registrations', testData);
      console.log('✅ Teste com lote 1 - Sucesso:', response.data);
    } catch (error) {
      console.error('❌ Teste com lote 1 - Erro:', error.response?.status, error.response?.data);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testLotValidation(); 