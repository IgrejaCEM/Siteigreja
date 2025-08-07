const axios = require('axios');

const API_BASE_URL = 'https://siteigreja.onrender.com/api';

async function testEventSlug() {
  try {
    console.log('🧪 Testando endpoint com slug...');
    console.log('🌐 URL:', `${API_BASE_URL}/events/connect-conf-2025-inprovveis`);
    
    const response = await axios.get(`${API_BASE_URL}/events/connect-conf-2025-inprovveis`);
    
    console.log('✅ Status:', response.status);
    console.log('📊 Evento encontrado:', response.data.title);
    console.log('🎫 Lotes:', response.data.lots?.length || 0);
    console.log('🛍️ Produtos:', response.data.products?.length || 0);
    
  } catch (error) {
    console.error('❌ Erro ao testar com slug:');
    console.error('   Status:', error.response?.status);
    console.error('   Mensagem:', error.response?.data);
    console.error('   Erro completo:', error.message);
  }
}

testEventSlug(); 