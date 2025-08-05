// Script para testar diretamente a API de registro em produção
const axios = require('axios');

async function testProductionRegistration() {
  try {
    console.log('🧪 TESTANDO API DE REGISTRO EM PRODUÇÃO...');
    
    const testData = {
      event_id: 999,
      customer: {
        name: 'Teste Usuário',
        email: 'teste@teste.com',
        phone: '11999999999',
        cpf: null
      },
      items: [],
      products: [
        { product_id: 1, quantity: 1, unit_price: 45 },
        { product_id: 2, quantity: 1, unit_price: 35 },
        { product_id: 3, quantity: 1, unit_price: 25 }
      ]
    };
    
    console.log('📦 Dados de teste:', JSON.stringify(testData, null, 2));
    
    console.log('🚀 Enviando requisição para /registrations...');
    const response = await axios.post('https://siteigreja.onrender.com/api/registrations', testData, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Test-Script/1.0'
      }
    });
    
    console.log('✅ Resposta da API:', response.status);
    console.log('📦 Dados da resposta:', response.data);
    
  } catch (error) {
    console.error('❌ Erro na API:', error.message);
    if (error.response) {
      console.error('📋 Status:', error.response.status);
      console.error('📋 Data:', error.response.data);
    }
  }
}

testProductionRegistration(); 