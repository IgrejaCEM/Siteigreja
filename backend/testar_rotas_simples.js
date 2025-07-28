const axios = require('axios');

const API_BASE_URL = 'https://siteigreja-1.onrender.com/api';

async function testarRotasSimples() {
  console.log('🧪 TESTANDO ROTAS SIMPLIFICADAS');
  console.log('==================================');
  
  try {
    console.log('📡 [1/4] Aguardando deploy...');
    await new Promise(resolve => setTimeout(resolve, 20000));
    
    console.log('📡 [2/4] Testando rota ultra-simplificada...');
    const testResponse = await axios.post(`${API_BASE_URL}/events/1/inscricao-test`, {
      teste: 'dados'
    });
    
    if (testResponse.status === 200) {
      console.log('✅ Rota ultra-simplificada funcionando:', testResponse.data);
    }
    
    console.log('📡 [3/4] Testando rota com banco...');
    const testDbResponse = await axios.post(`${API_BASE_URL}/events/1/inscricao-test-db`, {
      lote_id: 1
    });
    
    if (testDbResponse.status === 200) {
      console.log('✅ Rota com banco funcionando:', testDbResponse.data);
    }
    
    console.log('📡 [4/4] Testando rota original com dados mínimos...');
    const inscricaoData = {
      participantes: [
        {
          name: 'Teste Usuario',
          email: 'teste@teste.com',
          cpf: '12345678901',
          phone: '11999999999'
        }
      ],
      lote_id: 1,
      payment_method: 'fake',
      products: []
    };
    
    const inscricaoResponse = await axios.post(`${API_BASE_URL}/events/1/inscricao-unificada`, inscricaoData);
    
    if (inscricaoResponse.status === 200 || inscricaoResponse.status === 201) {
      console.log('✅ Inscrição original funcionando:', inscricaoResponse.data);
    }
    
  } catch (error) {
    console.error('❌ ERRO DETALHADO:');
    console.error('📋 Mensagem:', error.message);
    console.error('📋 Status:', error.response?.status);
    console.error('📋 Data:', error.response?.data);
    
    if (error.response?.data?.error) {
      console.log('\n🔍 ERRO ESPECÍFICO:');
      console.log('📋 Error:', error.response.data.error);
      console.log('📋 Details:', error.response.data.details);
      console.log('📋 Stack:', error.response.data.stack);
    }
  }
}

testarRotasSimples(); 