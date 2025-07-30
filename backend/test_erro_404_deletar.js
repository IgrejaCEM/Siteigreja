const axios = require('axios');

const API_BASE_URL = 'https://siteigreja-1.onrender.com/api';
const TEST_EMAIL = 'admin@admin.com';
const TEST_PASSWORD = 'admin123';

async function testarErro404Deletar() {
  try {
    console.log('🧪 TESTANDO ERRO 404 AO DELETAR EVENTO ID 5');
    
    // 1. Fazer login para obter token
    console.log('\n🔐 [1/5] Fazendo login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      emailOrUsername: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    const token = loginResponse.data.token;
    const authHeaders = { Authorization: `Bearer ${token}` };
    console.log('✅ Login realizado com sucesso');
    
    // 2. Listar todos os eventos para verificar se o ID 5 existe
    console.log('\n📋 [2/5] Listando todos os eventos...');
    const eventsResponse = await axios.get(`${API_BASE_URL}/admin/events`, { headers: authHeaders });
    const events = eventsResponse.data;
    
    console.log(`📊 Total de eventos: ${events.length}`);
    events.forEach(event => {
      console.log(`  - ID: ${event.id}, Título: ${event.title}, Status: ${event.status}`);
    });
    
    // 3. Verificar especificamente se o evento ID 5 existe
    console.log('\n🔍 [3/5] Verificando se o evento ID 5 existe...');
    const event5 = events.find(e => e.id === 5);
    if (event5) {
      console.log('✅ Evento ID 5 encontrado:', event5.title);
    } else {
      console.log('❌ Evento ID 5 NÃO encontrado na lista');
    }
    
    // 4. Tentar acessar diretamente o evento ID 5
    console.log('\n🔍 [4/5] Tentando acessar evento ID 5 diretamente...');
    try {
      const event5Response = await axios.get(`${API_BASE_URL}/admin/events/5`, { headers: authHeaders });
      console.log('✅ Evento ID 5 acessível:', event5Response.data.title);
    } catch (error) {
      console.log('❌ Erro ao acessar evento ID 5:', error.response?.status, error.response?.data?.error);
    }
    
    // 5. Tentar deletar o evento ID 5
    console.log('\n🗑️ [5/5] Tentando deletar evento ID 5...');
    try {
      const deleteResponse = await axios.delete(`${API_BASE_URL}/admin/events/5`, { headers: authHeaders });
      console.log('✅ Evento ID 5 deletado com sucesso');
      console.log('📋 Status:', deleteResponse.status);
    } catch (error) {
      console.log('❌ Erro ao deletar evento ID 5:');
      console.log('📋 Status:', error.response?.status);
      console.log('📋 Erro:', error.response?.data?.error);
      console.log('📋 URL:', error.config?.url);
      
      // Se for 404, tentar com rota de força
      if (error.response?.status === 404) {
        console.log('\n🚨 Tentando rota de força para evento ID 5...');
        try {
          const forceDeleteResponse = await axios.delete(`${API_BASE_URL}/admin/events/5/force`, { headers: authHeaders });
          console.log('✅ Evento ID 5 deletado via força');
          console.log('📋 Resposta:', forceDeleteResponse.data);
        } catch (forceError) {
          console.log('❌ Erro na rota de força:', forceError.response?.status, forceError.response?.data?.error);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.response?.data || error.message);
  }
}

testarErro404Deletar(); 