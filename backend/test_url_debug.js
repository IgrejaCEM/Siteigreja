const axios = require('axios');

async function testUrlDebug() {
  try {
    console.log('🧪 Testando URLs do backend...');
    
    // Teste 1: URL com -1
    const url1 = 'https://siteigreja-1.onrender.com/api/registrations';
    console.log('🔍 Testando URL 1:', url1);
    
    try {
      const response1 = await axios.get('https://siteigreja-1.onrender.com/api/health');
      console.log('✅ URL 1 - Health check OK:', response1.data);
    } catch (error1) {
      console.error('❌ URL 1 - Erro:', error1.response?.status, error1.response?.data);
    }
    
    // Teste 2: URL sem -1
    const url2 = 'https://siteigreja.onrender.com/api/registrations';
    console.log('🔍 Testando URL 2:', url2);
    
    try {
      const response2 = await axios.get('https://siteigreja.onrender.com/api/health');
      console.log('✅ URL 2 - Health check OK:', response2.data);
    } catch (error2) {
      console.error('❌ URL 2 - Erro:', error2.response?.status, error2.response?.data);
    }
    
    // Teste 3: POST para URL 1
    const testData = {
      event_id: 14,
      customer: {
        name: 'Teste URL',
        email: 'teste@teste.com',
        phone: '11999999999'
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
    
    console.log('\n📦 Testando POST para URL 1:', url1);
    
    try {
      const response3 = await axios.post(url1, testData);
      console.log('✅ POST URL 1 - Sucesso:', response3.data);
    } catch (error3) {
      console.error('❌ POST URL 1 - Erro:', error3.response?.status, error3.response?.data);
    }
    
    // Teste 4: POST para URL 2
    console.log('\n📦 Testando POST para URL 2:', url2);
    
    try {
      const response4 = await axios.post(url2, testData);
      console.log('✅ POST URL 2 - Sucesso:', response4.data);
    } catch (error4) {
      console.error('❌ POST URL 2 - Erro:', error4.response?.status, error4.response?.data);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testUrlDebug(); 