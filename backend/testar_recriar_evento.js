const axios = require('axios');

const API_BASE_URL = 'https://siteigreja-1.onrender.com/api';

async function testarRecriarEvento() {
  console.log('🚨 TESTANDO RECRIAÇÃO DE EVENTO');
  console.log('=================================');
  
  try {
    console.log('📡 [1/2] Aguardando deploy...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    console.log('📡 [2/2] Chamando rota de emergência...');
    const response = await axios.post(`${API_BASE_URL}/admin/recreate-event-emergency`);
    
    if (response.status === 200) {
      console.log('✅ EVENTO RECRIADO COM SUCESSO!');
      console.log('📋 Resposta:', response.data);
      
      // Aguardar um pouco
      console.log('⏳ Aguardando 3 segundos...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Verificar se o evento foi criado
      console.log('🔍 Verificando se o evento foi criado...');
      const eventResponse = await axios.get(`${API_BASE_URL}/events/1`);
      
      if (eventResponse.status === 200) {
        console.log('✅ EVENTO CONFIRMADO!');
        console.log('📋 Título:', eventResponse.data.title);
        console.log('🌐 Teste agora: https://igrejacemchurch.org/evento/connect-conf-2025-inprovveis');
        console.log('🔗 Admin: https://igrejacemchurch.org/admin/eventos');
      } else {
        console.log('❌ Erro ao verificar evento');
      }
    } else {
      console.log('❌ Erro na recriação:', response.status);
    }
    
  } catch (error) {
    console.error('❌ Erro ao recriar evento:', error.message);
    if (error.response) {
      console.error('📋 Status:', error.response.status);
      console.error('📄 Resposta:', error.response.data);
    }
  }
}

testarRecriarEvento(); 