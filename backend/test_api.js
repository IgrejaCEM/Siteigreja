const axios = require('axios');

async function testAPI() {
  const baseURL = 'http://localhost:3005/api';
  
  try {
    console.log('🔍 Testando API...');
    
    // 1. Testar login
    console.log('\n1️⃣ Testando login...');
    try {
      const loginResponse = await axios.post(`${baseURL}/auth/login`, {
        emailOrUsername: 'admin@admin.com',
        password: 'admin123'
      });
      
      const token = loginResponse.data.token;
      console.log('✅ Login OK');
      
      // 2. Testar rota /admin/participants
      console.log('\n2️⃣ Testando /admin/participants...');
      try {
        const participantsResponse = await axios.get(`${baseURL}/admin/participants`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('✅ /admin/participants OK:', participantsResponse.data.length, 'participantes');
      } catch (error) {
        console.log('❌ /admin/participants FALHOU:', error.response?.status, error.response?.data);
      }
      
      // 3. Testar rota /admin/events
      console.log('\n3️⃣ Testando /admin/events...');
      try {
        const eventsResponse = await axios.get(`${baseURL}/admin/events`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('✅ /admin/events OK:', eventsResponse.data.length, 'eventos');
      } catch (error) {
        console.log('❌ /admin/events FALHOU:', error.response?.status, error.response?.data);
      }
      
      // 4. Testar criação de evento
      console.log('\n4️⃣ Testando criação de evento...');
      try {
        const createEventResponse = await axios.post(`${baseURL}/admin/events`, {
          title: 'Evento Teste',
          description: 'Descrição do evento teste',
          date: '2024-12-25',
          location: 'Local Teste',
          status: 'active'
        }, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('✅ Criação de evento OK:', createEventResponse.data);
      } catch (error) {
        console.log('❌ Criação de evento FALHOU:', error.response?.status, error.response?.data);
      }
      
    } catch (loginError) {
      console.log('❌ Login FALHOU:', loginError.message);
      if (loginError.response) {
        console.log('Status:', loginError.response.status);
        console.log('Data:', loginError.response.data);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testAPI(); 