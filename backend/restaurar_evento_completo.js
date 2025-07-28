const axios = require('axios');

const API_BASE_URL = 'https://siteigreja-1.onrender.com/api';

async function restaurarEventoCompleto() {
  console.log('🚨 RESTAURANDO EVENTO COMPLETO');
  console.log('================================');
  
  try {
    console.log('📡 [1/2] Aguardando deploy...');
    await new Promise(resolve => setTimeout(resolve, 15000));
    
    console.log('📡 [2/2] Chamando rota de restauração completa...');
    const response = await axios.post(`${API_BASE_URL}/admin/restore-complete-event-emergency`);
    
    if (response.status === 200) {
      console.log('✅ EVENTO COMPLETO RESTAURADO COM SUCESSO!');
      console.log('📋 Resposta:', response.data);
      
      // Aguardar um pouco
      console.log('⏳ Aguardando 5 segundos...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Verificar se o evento foi restaurado
      console.log('🔍 Verificando evento restaurado...');
      const eventResponse = await axios.get(`${API_BASE_URL}/events`);
      
      if (eventResponse.status === 200) {
        console.log('✅ EVENTOS CONFIRMADOS!');
        console.log('📋 Total de eventos:', eventResponse.data.length);
        
        eventResponse.data.forEach((event, index) => {
          console.log(`   ${index + 1}. ${event.title} (ID: ${event.id})`);
        });
        
        // Verificar participantes
        console.log('\n🔍 Verificando participantes...');
        const participantsResponse = await axios.get(`${API_BASE_URL}/admin/registrations`);
        
        if (participantsResponse.status === 200) {
          console.log('✅ PARTICIPANTES CONFIRMADOS!');
          console.log('📋 Total de participantes:', participantsResponse.data.length);
          
          participantsResponse.data.slice(0, 5).forEach((participant, index) => {
            console.log(`   ${index + 1}. ${participant.name} (${participant.email})`);
          });
        }
        
        console.log('\n🌐 Links para testar:');
        console.log('   Evento: https://igrejacemchurch.org/evento/connect-conf---2025');
        console.log('   Admin eventos: https://igrejacemchurch.org/admin/eventos');
        console.log('   Admin participantes: https://igrejacemchurch.org/admin/participantes');
        
      } else {
        console.log('❌ Erro ao verificar eventos');
      }
    } else {
      console.log('❌ Erro na restauração:', response.status);
    }
    
  } catch (error) {
    console.error('❌ Erro ao restaurar evento completo:', error.message);
    if (error.response) {
      console.error('📋 Status:', error.response.status);
      console.error('📄 Resposta:', error.response.data);
    }
  }
}

restaurarEventoCompleto(); 