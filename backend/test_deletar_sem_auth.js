const axios = require('axios');

const API_BASE_URL = 'https://siteigreja-1.onrender.com/api';

async function testarDeletarSemAuth() {
  try {
    console.log('🧪 TESTANDO DELEÇÃO SEM AUTENTICAÇÃO');
    
    // 1. Listar eventos (rota pública)
    console.log('\n📋 [1/3] Listando eventos...');
    const eventsResponse = await axios.get(`${API_BASE_URL}/events`);
    const events = eventsResponse.data;
    
    if (events.length === 0) {
      console.log('✅ Nenhum evento encontrado');
      return;
    }
    
    console.log(`📊 Encontrados ${events.length} eventos:`);
    events.forEach(event => {
      console.log(`  - ID: ${event.id}, Título: ${event.title}`);
    });
    
    // 2. Tentar deletar sem autenticação
    const firstEvent = events[0];
    console.log(`\n🗑️ [2/3] Tentando deletar evento "${firstEvent.title}" (ID: ${firstEvent.id}) sem autenticação...`);
    
    try {
      const deleteResponse = await axios.delete(`${API_BASE_URL}/admin/events/${firstEvent.id}`);
      console.log('❌ ERRO: Deletou sem autenticação (isso não deveria acontecer)');
    } catch (deleteError) {
      console.log('✅ CORRETO: Bloqueado por falta de autenticação');
      console.log('📋 Erro esperado:', deleteError.response?.data?.error || deleteError.message);
      console.log('📋 Status:', deleteError.response?.status);
    }
    
    // 3. Verificar se ainda existe
    console.log('\n📋 [3/3] Verificando se o evento ainda existe...');
    const finalEventsResponse = await axios.get(`${API_BASE_URL}/events`);
    const finalEvents = finalEventsResponse.data;
    
    const eventStillExists = finalEvents.find(e => e.id === firstEvent.id);
    if (eventStillExists) {
      console.log('✅ Evento ainda existe (correto, pois não foi deletado)');
    } else {
      console.log('❌ Evento foi deletado (erro, não deveria ter sido deletado)');
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.response?.data || error.message);
  }
}

testarDeletarSemAuth(); 