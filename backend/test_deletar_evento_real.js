const axios = require('axios');

const API_BASE_URL = 'https://siteigreja-1.onrender.com/api';
const TEST_EMAIL = 'admin@admin.com';
const TEST_PASSWORD = 'admin123';

async function testarDeletarEventoReal() {
  try {
    console.log('🧪 TESTANDO DELEÇÃO COM EVENTO REAL');
    console.log('====================================');
    
    // 1. Fazer login
    console.log('\n🔐 [1/5] Fazendo login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      emailOrUsername: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    const token = loginResponse.data.token;
    const authHeaders = { Authorization: `Bearer ${token}` };
    console.log('✅ Login realizado com sucesso');
    
    // 2. Listar eventos existentes
    console.log('\n📋 [2/5] Listando eventos existentes...');
    const eventsResponse = await axios.get(`${API_BASE_URL}/admin/events`, { headers: authHeaders });
    const events = eventsResponse.data;
    
    if (events.length === 0) {
      console.log('❌ Nenhum evento encontrado para testar');
      return;
    }
    
    console.log(`📊 Encontrados ${events.length} eventos:`);
    events.forEach(event => {
      console.log(`  - ID: ${event.id}, Título: ${event.title}, Status: ${event.status}`);
    });
    
    // 3. Escolher um evento para deletar (o primeiro da lista)
    const eventToDelete = events[0];
    console.log(`\n🎯 [3/5] Escolhendo evento para deletar: "${eventToDelete.title}" (ID: ${eventToDelete.id})`);
    
    // 4. Tentar deletar o evento
    console.log(`\n🗑️ [4/5] Tentando deletar evento "${eventToDelete.title}" (ID: ${eventToDelete.id})...`);
    
    try {
      const deleteResponse = await axios.delete(`${API_BASE_URL}/admin/events/${eventToDelete.id}`, { headers: authHeaders });
      console.log('✅ Evento deletado com sucesso!');
      console.log('📋 Status:', deleteResponse.status);
    } catch (error) {
      console.log('❌ Erro ao deletar evento:');
      console.log('📋 Status:', error.response?.status);
      console.log('📋 Erro:', error.response?.data?.error);
      
      // Se falhar, tentar rota de força
      if (error.response?.status === 400) {
        console.log('\n🚨 Tentando rota de força...');
        try {
          const forceDeleteResponse = await axios.delete(`${API_BASE_URL}/admin/events/${eventToDelete.id}/force`, { headers: authHeaders });
          console.log('✅ Evento deletado via força!');
          console.log('📋 Resposta:', forceDeleteResponse.data);
        } catch (forceError) {
          console.log('❌ Erro na rota de força:', forceError.response?.status, forceError.response?.data?.error);
        }
      }
    }
    
    // 5. Verificar se foi deletado
    console.log('\n📋 [5/5] Verificando se o evento foi deletado...');
    const finalEventsResponse = await axios.get(`${API_BASE_URL}/admin/events`, { headers: authHeaders });
    const finalEvents = finalEventsResponse.data;
    
    const eventStillExists = finalEvents.find(e => e.id === eventToDelete.id);
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

testarDeletarEventoReal(); 