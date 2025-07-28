const axios = require('axios');

const API_BASE_URL = 'https://siteigreja-1.onrender.com/api';

async function testarInscricao() {
  try {
    console.log('🧪 TESTANDO INSCRIÇÃO SIMPLES');
    
    const inscricaoData = {
      participantes: [
        {
          name: 'Teste API',
          email: 'teste@api.com',
          phone: '11999999999'
        }
      ],
      lot_id: 1,
      payment_method: 'mercadopago',
      products: []
    };
    
    console.log('📦 Dados enviados:', JSON.stringify(inscricaoData, null, 2));
    
    const response = await axios.post(`${API_BASE_URL}/events/1/inscricao-unificada`, inscricaoData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
    
    console.log('✅ Resposta recebida:');
    console.log('📊 Status:', response.status);
    console.log('📦 Data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Erro no teste:');
    console.error('📊 Status:', error.response?.status);
    console.error('📊 Status Text:', error.response?.statusText);
    console.error('📦 Data:', error.response?.data);
    console.error('🔗 URL:', error.config?.url);
    console.error('📋 Message:', error.message);
  }
}

testarInscricao(); 