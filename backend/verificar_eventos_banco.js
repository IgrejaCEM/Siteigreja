const axios = require('axios');

const API_BASE_URL = 'https://siteigreja-1.onrender.com/api';

async function verificarEventosBanco() {
  console.log('🔍 VERIFICANDO EVENTOS NO BANCO');
  console.log('=================================');
  
  try {
    console.log('📡 [1/3] Listando todos os eventos...');
    const response1 = await axios.get(`${API_BASE_URL}/events`);
    
    if (response1.status === 200) {
      console.log('✅ Eventos encontrados:', response1.data.length);
      response1.data.forEach((event, index) => {
        console.log(`   ${index + 1}. ${event.title} (ID: ${event.id})`);
      });
    } else {
      console.log('❌ Erro ao listar eventos');
    }
    
    console.log('\n📡 [2/3] Verificando evento por slug...');
    const response2 = await axios.get(`${API_BASE_URL}/events/slug/connect-conf-2025-inprovveis`);
    
    if (response2.status === 200) {
      console.log('✅ Evento encontrado por slug!');
      console.log('📋 Título:', response2.data.title);
      console.log('🆔 ID:', response2.data.id);
    } else {
      console.log('❌ Evento não encontrado por slug');
    }
    
    console.log('\n📡 [3/3] Verificando evento por ID 1...');
    const response3 = await axios.get(`${API_BASE_URL}/events/1`);
    
    if (response3.status === 200) {
      console.log('✅ Evento encontrado por ID!');
      console.log('📋 Título:', response3.data.title);
      console.log('🆔 ID:', response3.data.id);
    } else {
      console.log('❌ Evento não encontrado por ID');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    if (error.response) {
      console.error('📋 Status:', error.response.status);
      console.error('📄 Resposta:', error.response.data);
    }
  }
}

verificarEventosBanco(); 