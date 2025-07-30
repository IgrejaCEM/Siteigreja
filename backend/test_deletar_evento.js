const axios = require('axios');

const API_BASE_URL = 'https://siteigreja-1.onrender.com/api';

async function testarDeletarEvento() {
  try {
    console.log('🧪 TESTANDO DELEÇÃO DE EVENTOS');
    
    // 1. Listar eventos existentes
    console.log('\n📋 [1/4] Listando eventos existentes...');
    const eventsResponse = await axios.get(`${API_BASE_URL}/admin/events`);
    const events = eventsResponse.data;
    
    if (events.length === 0) {
      console.log('✅ Nenhum evento encontrado para deletar');
      return;
    }
    
    console.log(`📊 Encontrados ${events.length} eventos:`);
    events.forEach(event => {
      console.log(`  - ID: ${event.id}, Título: ${event.title}, Status: ${event.status}`);
    });
    
    // 2. Tentar deletar o primeiro evento (rota normal)
    const firstEvent = events[0];
    console.log(`\n🗑️ [2/4] Tentando deletar evento "${firstEvent.title}" (ID: ${firstEvent.id}) via rota normal...`);
    
    try {
      const deleteResponse = await axios.delete(`${API_BASE_URL}/admin/events/${firstEvent.id}`);
      console.log('✅ Evento deletado com sucesso via rota normal');
      console.log('📋 Status:', deleteResponse.status);
    } catch (deleteError) {
      console.log('❌ Erro ao deletar via rota normal:', deleteError.response?.data?.error || deleteError.message);
      
      // 3. Se falhar, tentar rota de força
      console.log(`\n🚨 [3/4] Tentando deletar via rota de força...`);
      try {
        const forceDeleteResponse = await axios.delete(`${API_BASE_URL}/admin/events/${firstEvent.id}/force`);
        console.log('✅ Evento deletado com sucesso via rota de força');
        console.log('📋 Resposta:', forceDeleteResponse.data);
      } catch (forceError) {
        console.log('❌ Erro ao deletar via rota de força:', forceError.response?.data?.error || forceError.message);
      }
    }
    
    // 4. Verificar se foi deletado
    console.log('\n📋 [4/4] Verificando se o evento foi deletado...');
    const finalEventsResponse = await axios.get(`${API_BASE_URL}/admin/events`);
    const finalEvents = finalEventsResponse.data;
    
    const eventStillExists = finalEvents.find(e => e.id === firstEvent.id);
    if (eventStillExists) {
      console.log('⚠️ Evento ainda existe após tentativa de deleção');
    } else {
      console.log('✅ Evento foi deletado com sucesso!');
    }
    
    console.log(`📊 Total de eventos restantes: ${finalEvents.length}`);
    
  } catch (error) {
    console.error('❌ Erro geral:', error.response?.data || error.message);
  }
}

testarDeletarEvento(); 