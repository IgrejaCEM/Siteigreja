const axios = require('axios');

const API_BASE_URL = 'https://siteigreja-1.onrender.com/api';

async function limparRenderCompleto() {
  try {
    console.log('🧹 Limpando dados no Render...');
    
    // 1. Verificar inscrições no Render
    console.log('📡 [1/4] Verificando inscrições no Render...');
    const inscricoesResponse = await axios.get(`${API_BASE_URL}/admin/registrations/recent`);
    
    if (inscricoesResponse.data && inscricoesResponse.data.length > 0) {
      console.log('📋 Inscrições encontradas no Render:');
      inscricoesResponse.data.forEach(inscricao => {
        console.log(`   - ID: ${inscricao.id} | ${inscricao.name} | Event ID: ${inscricao.event_id}`);
      });
    } else {
      console.log('✅ Nenhuma inscrição encontrada no Render');
    }
    
    // 2. Verificar eventos no Render
    console.log('📡 [2/4] Verificando eventos no Render...');
    const eventosResponse = await axios.get(`${API_BASE_URL}/events`);
    
    if (eventosResponse.data && eventosResponse.data.length > 0) {
      console.log('📋 Eventos encontrados no Render:');
      eventosResponse.data.forEach(evento => {
        console.log(`   - ID: ${evento.id} | ${evento.title}`);
      });
    } else {
      console.log('✅ Nenhum evento encontrado no Render');
    }
    
    // 3. Tentar remover inscrições específicas
    console.log('📡 [3/4] Removendo inscrições específicas...');
    
    // Buscar inscrição com nome "João Silva Teste"
    if (inscricoesResponse.data) {
      const joaoInscricao = inscricoesResponse.data.find(i => 
        i.name && i.name.includes('João Silva Teste')
      );
      
      if (joaoInscricao) {
        console.log('📋 Removendo inscrição do João Silva Teste...');
        try {
          // Tentar remover via rota de força
          const deleteResponse = await axios.delete(`${API_BASE_URL}/admin/registrations/${joaoInscricao.id}/force`);
          console.log('✅ Inscrição removida:', deleteResponse.data);
        } catch (deleteError) {
          console.log('⚠️ Erro ao remover inscrição:', deleteError.response?.data || deleteError.message);
        }
      }
    }
    
    // 4. Verificar estado final
    console.log('📡 [4/4] Verificando estado final...');
    const finalInscricoes = await axios.get(`${API_BASE_URL}/admin/registrations/recent`);
    const finalEventos = await axios.get(`${API_BASE_URL}/events`);
    
    console.log('📊 Estado final no Render:');
    console.log(`   - Inscrições: ${finalInscricoes.data?.length || 0}`);
    console.log(`   - Eventos: ${finalEventos.data?.length || 0}`);
    
    if (finalInscricoes.data && finalInscricoes.data.length > 0) {
      console.log('📋 Inscrições restantes:');
      finalInscricoes.data.forEach(inscricao => {
        console.log(`   - ${inscricao.name} (${inscricao.email})`);
      });
    }
    
    console.log('\n🎯 PRÓXIMOS PASSOS:');
    console.log('1. Recarregue a página do admin (Ctrl+F5)');
    console.log('2. Se ainda aparecer, aguarde alguns minutos');
    console.log('3. O cache pode demorar para atualizar');
    
  } catch (error) {
    console.error('❌ Erro ao limpar Render:', error.response?.data || error.message);
  }
}

limparRenderCompleto(); 