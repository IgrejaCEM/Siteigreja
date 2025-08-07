const axios = require('axios');

const API_BASE_URL = 'https://siteigreja.onrender.com/api';

async function testFrontendAPI() {
  try {
    console.log('🧪 Testando API como o frontend faria...');
    
    // Testar endpoint de eventos (como o frontend faz)
    console.log('\n1️⃣ Testando /events (lista de eventos):');
    const eventsResponse = await axios.get(`${API_BASE_URL}/events`);
    console.log('✅ Status:', eventsResponse.status);
    console.log('📊 Eventos encontrados:', eventsResponse.data.length);
    
    if (eventsResponse.data.length > 0) {
      const firstEvent = eventsResponse.data[0];
      console.log('🎯 Primeiro evento:', firstEvent.title);
      console.log('🆔 ID do evento:', firstEvent.id);
      
      // Testar endpoint específico do evento (como o frontend faria)
      console.log('\n2️⃣ Testando /events/' + firstEvent.id + ' (detalhes do evento):');
      const eventDetailsResponse = await axios.get(`${API_BASE_URL}/events/${firstEvent.id}`);
      console.log('✅ Status:', eventDetailsResponse.status);
      console.log('📊 Evento:', eventDetailsResponse.data.title);
      console.log('🎫 Lotes:', eventDetailsResponse.data.lots?.length || 0);
      console.log('🛍️ Produtos:', eventDetailsResponse.data.products?.length || 0);
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar API como frontend:');
    console.error('   Status:', error.response?.status);
    console.error('   Mensagem:', error.response?.data);
    console.error('   URL:', error.config?.url);
    console.error('   Erro completo:', error.message);
  }
}

testFrontendAPI(); 