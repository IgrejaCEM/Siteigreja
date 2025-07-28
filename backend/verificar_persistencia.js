const axios = require('axios');

const API_BASE_URL = 'https://siteigreja-1.onrender.com/api';

async function verificarPersistencia() {
  console.log('🔍 VERIFICANDO PERSISTÊNCIA DO BANCO');
  console.log('=====================================');
  
  try {
    console.log('📡 [1/3] Aguardando deploy...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    console.log('📡 [2/3] Verificando persistência...');
    const response = await axios.post(`${API_BASE_URL}/admin/check-persistence-emergency`);
    
    if (response.status === 200) {
      console.log('✅ VERIFICAÇÃO CONCLUÍDA!');
      console.log('📋 Resposta:', response.data);
      
      const { tables, counts, events } = response.data;
      
      console.log('\n📊 STATUS DO BANCO:');
      console.log('   📅 Tabela events existe:', tables.events);
      console.log('   🎫 Tabela lots existe:', tables.lots);
      console.log('   👥 Tabela registrations existe:', tables.registrations);
      
      console.log('\n📈 CONTAGEM DE REGISTROS:');
      console.log('   📅 Eventos:', counts.events);
      console.log('   🎫 Lotes:', counts.lots);
      console.log('   👥 Participantes:', counts.registrations);
      
      if (events.length > 0) {
        console.log('\n📅 EVENTOS ENCONTRADOS:');
        events.forEach((event, index) => {
          console.log(`   ${index + 1}. ${event.title} (ID: ${event.id})`);
        });
      } else {
        console.log('\n❌ NENHUM EVENTO ENCONTRADO!');
        console.log('🔄 Restaurando evento...');
        
        // Aguardar um pouco
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Restaurar evento
        const restoreResponse = await axios.post(`${API_BASE_URL}/admin/restore-complete-event-emergency`);
        
        if (restoreResponse.status === 200) {
          console.log('✅ EVENTO RESTAURADO COM SUCESSO!');
          console.log('📋 Resposta:', restoreResponse.data);
          
          console.log('\n🌐 Links para testar:');
          console.log('   Evento: https://igrejacemchurch.org/evento/connect-conf---2025');
          console.log('   Admin eventos: https://igrejacemchurch.org/admin/eventos');
          console.log('   Admin participantes: https://igrejacemchurch.org/admin/participantes');
        } else {
          console.log('❌ Erro ao restaurar evento');
        }
      }
      
    } else {
      console.log('❌ Erro na verificação:', response.status);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    if (error.response) {
      console.error('📋 Status:', error.response.status);
      console.error('📄 Resposta:', error.response.data);
    }
  }
}

verificarPersistencia(); 