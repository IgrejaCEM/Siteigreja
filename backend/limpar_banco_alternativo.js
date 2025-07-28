const axios = require('axios');

async function limparBancoAlternativo() {
  try {
    console.log('🗑️ Limpando banco no Render (método alternativo)...');
    
    // URL do Render
    const baseURL = 'https://siteigreja-1.onrender.com/api';
    
    // Método 1: Limpar inscrições (rota que já existe)
    console.log('🗑️ Limpando inscrições...');
    try {
      await axios.delete(`${baseURL}/admin/participants/clear`);
      console.log('✅ Inscrições limpas!');
    } catch (error) {
      console.log('⚠️ Erro ao limpar inscrições:', error.response?.data?.error || error.message);
    }
    
    // Método 2: Tentar a nova rota de emergência
    console.log('🗑️ Tentando limpar eventos...');
    try {
      await axios.post(`${baseURL}/admin/clear-events-emergency`);
      console.log('✅ Eventos limpos!');
    } catch (error) {
      console.log('⚠️ Rota de emergência ainda não disponível, tentando método alternativo...');
      
      // Método 3: Deletar eventos um por um
      console.log('🗑️ Deletando eventos individualmente...');
      const eventsResponse = await axios.get(`${baseURL}/admin/events`);
      const events = eventsResponse.data;
      
      for (const event of events) {
        try {
          await axios.delete(`${baseURL}/admin/events/${event.id}`);
          console.log(`✅ Evento "${event.title}" removido`);
        } catch (error) {
          console.log(`⚠️ Erro ao remover evento ${event.id}:`, error.response?.data?.error || error.message);
        }
      }
    }
    
    console.log('✅ Limpeza concluída!');
    
  } catch (error) {
    console.error('❌ Erro geral:', error.response?.data || error.message);
  }
}

limparBancoAlternativo(); 