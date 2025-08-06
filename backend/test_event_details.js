const axios = require('axios');

const API_BASE_URL = 'https://siteigreja.onrender.com/api';

async function testEventDetails() {
  try {
    console.log('🧪 Testando endpoint /events/14...');
    console.log('🌐 URL:', `${API_BASE_URL}/events/14`);
    
    const response = await axios.get(`${API_BASE_URL}/events/14`);
    
    console.log('✅ Status:', response.status);
    console.log('📊 Evento encontrado:', response.data.title);
    console.log('🎫 Lotes:', response.data.lots?.length || 0);
    console.log('🛍️ Produtos:', response.data.products?.length || 0);
    
    if (response.data.lots && response.data.lots.length > 0) {
      console.log('🎯 Primeiro lote:', response.data.lots[0]);
    }
    
    if (response.data.products && response.data.products.length > 0) {
      console.log('🛍️ Primeiro produto:', response.data.products[0]);
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar /events/14:');
    console.error('   Status:', error.response?.status);
    console.error('   Mensagem:', error.response?.data);
    console.error('   Erro completo:', error.message);
  }
}

testEventDetails(); 