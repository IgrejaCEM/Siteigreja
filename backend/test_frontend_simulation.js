const axios = require('axios');

async function testFrontendSimulation() {
  try {
    console.log('🧪 Simulando requisição do frontend...');
    
    // Simular exatamente o que o frontend está enviando
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
    
    console.log('📦 Dados simulados:', JSON.stringify(testData, null, 2));
    
    // Teste 1: URL com -1 (que o frontend está usando)
    const url1 = 'https://siteigreja-1.onrender.com/api/registrations';
    console.log('\n🔍 Testando URL 1:', url1);
    
    try {
      const response1 = await axios.post(url1, testData, {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Origin': 'https://siteigreja-mctd5i4q8-igrejacems-projects.vercel.app',
          'Referer': 'https://siteigreja-mctd5i4q8-igrejacems-projects.vercel.app/'
        }
      });
      console.log('✅ URL 1 - Sucesso:', response1.data);
    } catch (error1) {
      console.error('❌ URL 1 - Erro:', error1.response?.status, error1.response?.data);
    }
    
    // Teste 2: URL sem -1
    const url2 = 'https://siteigreja.onrender.com/api/registrations';
    console.log('\n🔍 Testando URL 2:', url2);
    
    try {
      const response2 = await axios.post(url2, testData, {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Origin': 'https://siteigreja-mctd5i4q8-igrejacems-projects.vercel.app',
          'Referer': 'https://siteigreja-mctd5i4q8-igrejacems-projects.vercel.app/'
        }
      });
      console.log('✅ URL 2 - Sucesso:', response2.data);
    } catch (error2) {
      console.error('❌ URL 2 - Erro:', error2.response?.status, error2.response?.data);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testFrontendSimulation(); 