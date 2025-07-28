const axios = require('axios');

const API_BASE_URL = 'https://siteigreja-1.onrender.com/api';

async function testarDadosPublico() {
  console.log('🔍 TESTANDO DADOS PÚBLICOS');
  console.log('============================');
  
  try {
    console.log('📡 [1/2] Testando evento público...');
    const eventResponse = await axios.get(`${API_BASE_URL}/events/1`);
    console.log('✅ Evento encontrado:', eventResponse.data.title);
    console.log('📋 Dados do evento:', {
      id: eventResponse.data.id,
      title: eventResponse.data.title,
      date: eventResponse.data.date,
      location: eventResponse.data.location
    });
    
    console.log('\n📡 [2/2] Testando inscrições do evento...');
    const registrationsResponse = await axios.get(`${API_BASE_URL}/events/1/registrations`);
    console.log(`✅ Total de inscrições do evento: ${registrationsResponse.data.length}`);
    
    if (registrationsResponse.data.length > 0) {
      console.log('📋 Primeiras 3 inscrições:');
      registrationsResponse.data.slice(0, 3).forEach((reg, index) => {
        console.log(`   ${index + 1}. ID: ${reg.id}`);
        console.log(`      Nome: "${reg.name}"`);
        console.log(`      Email: "${reg.email}"`);
        console.log(`      Status: ${reg.payment_status}`);
        console.log(`      Form Data: ${reg.form_data ? 'SIM' : 'NÃO'}`);
        if (reg.form_data) {
          try {
            const data = JSON.parse(reg.form_data);
            console.log(`      Dados extraídos:`, {
              nome: data.nome || data.name,
              email: data.email,
              participantes: data.participantes?.length || 0
            });
          } catch (e) {
            console.log(`      Erro ao parsear form_data: ${e.message}`);
          }
        }
        console.log('');
      });
    }
    
    console.log('✅ TESTE CONCLUÍDO!');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    if (error.response) {
      console.error('📋 Status:', error.response.status);
      console.error('📄 Resposta:', error.response.data);
    }
  }
}

testarDadosPublico(); 