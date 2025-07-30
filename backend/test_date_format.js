const axios = require('axios');

const API_BASE_URL = 'https://siteigreja-1.onrender.com/api';

async function testDateFormat() {
  console.log('🔍 TESTANDO FORMATO DE DATA');
  console.log('===========================');
  
  try {
    console.log('📡 [1/3] Fazendo login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      emailOrUsername: 'admin@admin.com',
      password: 'admin123'
    });
    const token = loginResponse.data.token;
    console.log('✅ Login OK');
    
    console.log('📡 [2/3] Testando diferentes formatos de data...');
    
    const testDates = [
      '2024-12-25',
      '2024-12-25 00:00:00',
      '2024-12-25T00:00:00',
      '2024-12-25 00:00:00 00:00:00',
      '2024-12-25T00:00:00.000Z'
    ];
    
    for (let i = 0; i < testDates.length; i++) {
      const testDate = testDates[i];
      console.log(`\n📅 Testando formato ${i + 1}: "${testDate}"`);
      
      const eventData = {
        title: `Evento Teste Data ${i + 1}`,
        description: `Descrição do evento teste com formato de data: ${testDate}`,
        date: testDate,
        location: 'Local Teste',
        status: 'active',
        has_payment: false,
        lots: []
      };
      
      try {
        const response = await axios.post(`${API_BASE_URL}/admin/events`, eventData, {
          headers: { 'Authorization': `Bearer ${token}` },
          timeout: 30000
        });
        console.log('✅ SUCESSO:', response.data.id);
      } catch (error) {
        console.log('❌ FALHOU:');
        console.log('   Status:', error.response?.status);
        console.log('   Mensagem:', error.message);
        if (error.response?.data?.details) {
          console.log('   Detalhes:', error.response.data.details);
        }
      }
    }
    
    console.log('\n📡 [3/3] Verificando logs do servidor...');
    console.log('💡 Verifique os logs no Render para mais detalhes');
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testDateFormat(); 