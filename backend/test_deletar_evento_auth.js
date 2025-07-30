const axios = require('axios');

const API_BASE_URL = 'https://siteigreja-1.onrender.com/api';

// Credenciais de teste
const TEST_EMAIL = 'admin@admin.com';
const TEST_PASSWORD = 'admin123';

async function testarDeletarEventoComAuth() {
  try {
    console.log('🧪 TESTANDO DELEÇÃO DE EVENTOS COM AUTENTICAÇÃO');
    
    // 1. Fazer login para obter token
    console.log('\n🔐 [1/5] Fazendo login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      emailOrUsername: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login realizado com sucesso');
    
    // Configurar headers com token
    const authHeaders = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    // 2. Listar eventos existentes
    console.log('\n📋 [2/5] Listando eventos existentes...');
    const eventsResponse = await axios.get(`${API_BASE_URL}/admin/events`, { headers: authHeaders });
    const events = eventsResponse.data;
    
    if (events.length === 0) {
      console.log('✅ Nenhum evento encontrado para deletar');
      return;
    }
    
    console.log(`📊 Encontrados ${events.length} eventos:`);
    events.forEach(event => {
      console.log(`  - ID: ${event.id}, Título: ${event.title}, Status: ${event.status}`);
    });
    
    // 3. Tentar deletar o primeiro evento (rota normal)
    const firstEvent = events[0];
    console.log(`\n🗑️ [3/5] Tentando deletar evento "${firstEvent.title}" (ID: ${firstEvent.id}) via rota normal...`);
    
    try {
      const deleteResponse = await axios.delete(`${API_BASE_URL}/admin/events/${firstEvent.id}`, { headers: authHeaders });
      console.log('✅ Evento deletado com sucesso via rota normal');
      console.log('📋 Status:', deleteResponse.status);
    } catch (deleteError) {
      console.log('❌ Erro ao deletar via rota normal:', deleteError.response?.data?.error || deleteError.message);
      
      // 4. Se falhar, tentar rota de força
      console.log(`\n🚨 [4/5] Tentando deletar via rota de força...`);
      try {
        const forceDeleteResponse = await axios.delete(`${API_BASE_URL}/admin/events/${firstEvent.id}/force`, { headers: authHeaders });
        console.log('✅ Evento deletado com sucesso via rota de força');
        console.log('📋 Resposta:', forceDeleteResponse.data);
      } catch (forceError) {
        console.log('❌ Erro ao deletar via rota de força:', forceError.response?.data?.error || forceError.message);
      }
    }
    
    // 5. Verificar se foi deletado
    console.log('\n📋 [5/5] Verificando se o evento foi deletado...');
    const finalEventsResponse = await axios.get(`${API_BASE_URL}/admin/events`, { headers: authHeaders });
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
    
    if (error.response?.status === 401) {
      console.log('💡 Dica: Verifique se as credenciais de teste estão corretas');
    }
  }
}

testarDeletarEventoComAuth(); 