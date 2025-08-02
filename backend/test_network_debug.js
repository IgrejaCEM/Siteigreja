const axios = require('axios');

async function testNetworkDebug() {
  try {
    console.log('🧪 Testando conectividade de rede...');
    
    // Teste 1: Health check
    console.log('\n🔍 Teste 1: Health check');
    try {
      const response1 = await axios.get('https://siteigreja-1.onrender.com/api/health');
      console.log('✅ Health check OK:', response1.data);
    } catch (error1) {
      console.error('❌ Health check falhou:', error1.message);
    }
    
    // Teste 2: POST simples
    console.log('\n🔍 Teste 2: POST simples');
    try {
      const response2 = await axios.post('https://siteigreja-1.onrender.com/api/registrations', {
        test: true
      });
      console.log('✅ POST simples OK:', response2.data);
    } catch (error2) {
      console.error('❌ POST simples falhou:', error2.response?.status, error2.response?.data);
    }
    
    // Teste 3: POST com dados completos
    console.log('\n🔍 Teste 3: POST com dados completos');
    const testData = {
      event_id: 14,
      customer: {
        name: 'Teste Network',
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
    
    try {
      const response3 = await axios.post('https://siteigreja-1.onrender.com/api/registrations', testData, {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Origin': 'https://siteigreja-mctd5i4q8-igrejacems-projects.vercel.app',
          'Referer': 'https://siteigreja-mctd5i4q8-igrejacems-projects.vercel.app/'
        }
      });
      console.log('✅ POST completo OK:', response3.data);
    } catch (error3) {
      console.error('❌ POST completo falhou:', error3.response?.status, error3.response?.data);
    }
    
    // Teste 4: Verificar se há logs no servidor
    console.log('\n🔍 Teste 4: Verificar logs do servidor');
    console.log('📝 Se você não vê logs do servidor nos logs do backend, significa que a requisição não está chegando.');
    console.log('📝 Isso pode indicar um problema de rede, proxy ou CDN.');
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testNetworkDebug(); 