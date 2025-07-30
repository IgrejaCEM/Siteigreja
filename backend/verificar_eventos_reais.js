const axios = require('axios');

const API_BASE_URL = 'https://siteigreja-1.onrender.com/api';
const TEST_EMAIL = 'admin@admin.com';
const TEST_PASSWORD = 'admin123';

async function verificarEventosReais() {
  try {
    console.log('🔍 VERIFICANDO EVENTOS REAIS NO BANCO');
    console.log('========================================');
    
    // 1. Fazer login
    console.log('\n🔐 [1/4] Fazendo login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      emailOrUsername: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    const token = loginResponse.data.token;
    const authHeaders = { Authorization: `Bearer ${token}` };
    console.log('✅ Login realizado com sucesso');
    
    // 2. Listar eventos via API admin
    console.log('\n📋 [2/4] Listando eventos via API admin...');
    const adminEventsResponse = await axios.get(`${API_BASE_URL}/admin/events`, { headers: authHeaders });
    const adminEvents = adminEventsResponse.data;
    
    console.log(`📊 Eventos via admin API: ${adminEvents.length}`);
    adminEvents.forEach(event => {
      console.log(`  - ID: ${event.id}, Título: ${event.title}, Status: ${event.status}, Criado: ${event.created_at}`);
    });
    
    // 3. Listar eventos via API pública
    console.log('\n📋 [3/4] Listando eventos via API pública...');
    const publicEventsResponse = await axios.get(`${API_BASE_URL}/events`);
    const publicEvents = publicEventsResponse.data;
    
    console.log(`📊 Eventos via API pública: ${publicEvents.length}`);
    publicEvents.forEach(event => {
      console.log(`  - ID: ${event.id}, Título: ${event.title}, Status: ${event.status}`);
    });
    
    // 4. Verificar inconsistências
    console.log('\n🔍 [4/4] Verificando inconsistências...');
    
    const adminIds = adminEvents.map(e => e.id);
    const publicIds = publicEvents.map(e => e.id);
    
    console.log('📋 IDs via admin:', adminIds);
    console.log('📋 IDs via pública:', publicIds);
    
    const missingInPublic = adminIds.filter(id => !publicIds.includes(id));
    const missingInAdmin = publicIds.filter(id => !adminIds.includes(id));
    
    if (missingInPublic.length > 0) {
      console.log('⚠️ Eventos que aparecem no admin mas não na API pública:', missingInPublic);
    }
    
    if (missingInAdmin.length > 0) {
      console.log('⚠️ Eventos que aparecem na API pública mas não no admin:', missingInAdmin);
    }
    
    if (missingInPublic.length === 0 && missingInAdmin.length === 0) {
      console.log('✅ Nenhuma inconsistência encontrada');
    }
    
    // 5. Verificar especificamente o ID 5
    console.log('\n🎯 Verificando especificamente o ID 5...');
    const event5Admin = adminEvents.find(e => e.id === 5);
    const event5Public = publicEvents.find(e => e.id === 5);
    
    if (event5Admin) {
      console.log('✅ Evento ID 5 encontrado no admin:', event5Admin.title);
    } else {
      console.log('❌ Evento ID 5 NÃO encontrado no admin');
    }
    
    if (event5Public) {
      console.log('✅ Evento ID 5 encontrado na API pública:', event5Public.title);
    } else {
      console.log('❌ Evento ID 5 NÃO encontrado na API pública');
    }
    
    // 6. Sugestões
    console.log('\n💡 SUGESTÕES:');
    console.log('1. Recarregue a página do admin no navegador (Ctrl+F5)');
    console.log('2. Limpe o cache do navegador');
    console.log('3. Verifique se não há múltiplas abas do admin abertas');
    console.log('4. Se o problema persistir, tente criar um novo evento e deletá-lo');
    
  } catch (error) {
    console.error('❌ Erro geral:', error.response?.data || error.message);
  }
}

verificarEventosReais(); 