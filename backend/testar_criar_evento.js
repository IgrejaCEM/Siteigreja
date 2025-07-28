const axios = require('axios');

const API_BASE_URL = 'https://siteigreja-1.onrender.com/api';

async function testarCriarEvento() {
  console.log('🎯 TESTANDO CRIAÇÃO DE EVENTO');
  console.log('===============================');
  
  try {
    console.log('📡 [1/4] Aguardando deploy...');
    await new Promise(resolve => setTimeout(resolve, 20000));
    
    console.log('📡 [2/4] Testando rota de teste...');
    const testResponse = await axios.post(`${API_BASE_URL}/admin/events-test`, {
      title: 'Evento Teste',
      description: 'Descrição do evento teste',
      date: '2025-08-15T10:00:00',
      location: 'Local Teste'
    });
    
    if (testResponse.status === 200) {
      console.log('✅ Rota de teste funcionando:', testResponse.data);
    }
    
    console.log('📡 [3/4] Fazendo login do admin...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      emailOrUsername: 'admin@admin.com',
      password: 'admin123'
    });
    
    if (loginResponse.status === 200) {
      console.log('✅ Login realizado:', loginResponse.data.token.substring(0, 50) + '...');
      
      const token = loginResponse.data.token;
      
      console.log('📡 [4/4] Testando criação de evento com autenticação...');
      const eventData = {
        title: 'Evento Teste Admin',
        description: 'Evento criado via admin',
        date: '2025-08-15T10:00:00',
        location: 'Local Admin',
        status: 'active',
        lots: [
          {
            name: 'Lote Teste',
            price: 50.00,
            quantity: 100,
            start_date: '2025-07-28T00:00:00',
            end_date: '2025-08-14T23:59:59'
          }
        ]
      };
      
      const createResponse = await axios.post(`${API_BASE_URL}/admin/events`, eventData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (createResponse.status === 200 || createResponse.status === 201) {
        console.log('✅ Evento criado com sucesso:', createResponse.data);
        console.log('\n🎉 CRIAÇÃO DE EVENTO FUNCIONANDO!');
        console.log('🌐 Teste agora: https://igrejacemchurch.org/admin');
      }
      
    } else {
      console.log('❌ Erro no login');
    }
    
  } catch (error) {
    console.error('❌ ERRO DETALHADO:');
    console.error('📋 Mensagem:', error.message);
    console.error('📋 Status:', error.response?.status);
    console.error('📋 Data:', error.response?.data);
    
    if (error.response?.data?.error) {
      console.log('\n🔍 ERRO ESPECÍFICO:');
      console.log('📋 Error:', error.response.data.error);
      console.log('📋 Details:', error.response.data.details);
    }
  }
}

testarCriarEvento(); 