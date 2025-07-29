const axios = require('axios');

const API_BASE_URL = 'https://siteigreja-1.onrender.com/api';

async function limparCacheFrontend() {
  try {
    console.log('🧹 Limpando cache do frontend...');
    
    // Forçar atualização da lista de eventos
    console.log('📡 [1/3] Forçando atualização da lista de eventos...');
    const response1 = await axios.get(`${API_BASE_URL}/events`);
    console.log('✅ Lista de eventos atualizada:', response1.data.length, 'eventos');
    
    // Verificar se há eventos
    if (response1.data.length > 0) {
      console.log('📋 Eventos encontrados:');
      response1.data.forEach(evento => {
        console.log(`   - ID: ${evento.id} | ${evento.title}`);
      });
    } else {
      console.log('✅ Nenhum evento encontrado (banco limpo)');
    }
    
    // Forçar atualização do admin
    console.log('\n📡 [2/3] Forçando atualização do admin...');
    const response2 = await axios.get(`${API_BASE_URL}/admin/events`);
    console.log('✅ Admin atualizado');
    
    // Verificar eventos do admin
    if (response2.data.length > 0) {
      console.log('📋 Eventos no admin:');
      response2.data.forEach(evento => {
        console.log(`   - ID: ${evento.id} | ${evento.title}`);
      });
    } else {
      console.log('✅ Nenhum evento no admin (banco limpo)');
    }
    
    console.log('\n🎯 PRÓXIMOS PASSOS:');
    console.log('1. Recarregue a página do admin (Ctrl+F5)');
    console.log('2. Se ainda aparecer, limpe o cache do navegador');
    console.log('3. Ou abra em uma aba anônima');
    
  } catch (error) {
    console.error('❌ Erro ao limpar cache:', error.response?.data || error.message);
  }
}

limparCacheFrontend(); 