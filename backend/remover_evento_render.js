const axios = require('axios');

const API_BASE_URL = 'https://siteigreja-1.onrender.com/api';

async function removerEventoRender() {
  try {
    console.log('🗑️ Removendo evento do Render...');
    
    // Primeiro, verificar se o evento existe
    console.log('📡 [1/3] Verificando evento...');
    const response1 = await axios.get(`${API_BASE_URL}/events`);
    
    if (response1.data.length > 0) {
      const evento = response1.data[0];
      console.log('📋 Evento encontrado:', evento.title, '(ID:', evento.id, ')');
      
      // Tentar remover via API usando rota de força
      console.log('📡 [2/3] Tentando remover via API (força total)...');
      try {
        const deleteResponse = await axios.delete(`${API_BASE_URL}/admin/events/${evento.id}/force`);
        console.log('✅ Evento removido via API (força total)');
        console.log('📋 Detalhes:', deleteResponse.data);
      } catch (deleteError) {
        console.log('❌ Erro ao remover via API:', deleteError.response?.data || deleteError.message);
      }
    } else {
      console.log('✅ Nenhum evento encontrado no Render');
    }
    
    // Verificar se foi removido
    console.log('\n📡 [3/3] Verificando se foi removido...');
    const response2 = await axios.get(`${API_BASE_URL}/events`);
    
    if (response2.data.length === 0) {
      console.log('✅ Evento removido com sucesso!');
    } else {
      console.log('⚠️ Evento ainda existe:', response2.data[0].title);
      console.log('💡 Recarregue a página do admin para ver as mudanças');
    }
    
  } catch (error) {
    console.error('❌ Erro ao remover evento:', error.response?.data || error.message);
  }
}

removerEventoRender(); 