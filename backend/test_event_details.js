const axios = require('axios');

async function testEventDetails() {
  try {
    console.log('🧪 Testando API de detalhes do evento...');
    
    // Testar evento 14
    const response = await axios.get('https://siteigreja-1.onrender.com/api/events/14');
    console.log('✅ Detalhes do evento 14:', response.data);
    
    if (response.data.lots) {
      console.log('📋 Lotes do evento:');
      response.data.lots.forEach((lot, index) => {
        console.log(`  ${index + 1}. ID: ${lot.id} | Nome: ${lot.name} | Preço: R$ ${lot.price}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
  }
}

testEventDetails(); 