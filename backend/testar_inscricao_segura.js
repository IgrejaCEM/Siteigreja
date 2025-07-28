const axios = require('axios');

const API_BASE_URL = 'https://siteigreja-1.onrender.com/api';

async function testarInscricaoSegura() {
  console.log('🔒 TESTANDO INSCRIÇÃO SEGURA');
  console.log('==============================');
  
  try {
    console.log('📡 [1/4] Aguardando deploy...');
    await new Promise(resolve => setTimeout(resolve, 15000));
    
    console.log('📡 [2/4] Verificando evento antes da inscrição...');
    const eventBefore = await axios.get(`${API_BASE_URL}/events`);
    console.log('✅ Eventos antes da inscrição:', eventBefore.data.length);
    
    if (eventBefore.data.length === 0) {
      console.log('❌ Nenhum evento encontrado! Restaurando...');
      const restoreResponse = await axios.post(`${API_BASE_URL}/admin/restore-complete-event-emergency`);
      console.log('✅ Evento restaurado:', restoreResponse.data);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    
    console.log('📡 [3/4] Fazendo inscrição de teste...');
    const inscricaoData = {
      participantes: [
        {
          name: 'Teste Seguro',
          email: 'teste.seguro@email.com',
          phone: '(11) 99999-9999'
        }
      ],
      lot_id: 1,
      products: [],
      payment_method: null
    };
    
    const inscricaoResponse = await axios.post(`${API_BASE_URL}/events/1/inscricao-unificada`, inscricaoData);
    console.log('✅ Inscrição realizada:', inscricaoResponse.data.registration_code);
    
    console.log('📡 [4/4] Verificando evento após inscrição...');
    const eventAfter = await axios.get(`${API_BASE_URL}/events`);
    console.log('✅ Eventos após inscrição:', eventAfter.data.length);
    
    if (eventAfter.data.length > 0) {
      console.log('🎉 SUCESSO! Evento permaneceu após inscrição!');
      console.log('📋 Eventos encontrados:');
      eventAfter.data.forEach((event, index) => {
        console.log(`   ${index + 1}. ${event.title} (ID: ${event.id})`);
      });
      
      console.log('\n🌐 Links para testar:');
      console.log('   Evento: https://igrejacemchurch.org/evento/connect-conf---2025');
      console.log('   Admin eventos: https://igrejacemchurch.org/admin/eventos');
      console.log('   Admin participantes: https://igrejacemchurch.org/admin/participantes');
    } else {
      console.log('❌ PROBLEMA: Evento desapareceu após inscrição!');
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    if (error.response) {
      console.error('📋 Status:', error.response.status);
      console.error('📄 Resposta:', error.response.data);
    }
  }
}

testarInscricaoSegura(); 