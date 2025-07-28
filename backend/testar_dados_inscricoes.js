const axios = require('axios');

const API_BASE_URL = 'https://siteigreja-1.onrender.com/api';

async function testarDadosInscricoes() {
  console.log('🔍 TESTANDO DADOS DAS INSCRIÇÕES');
  console.log('==================================');
  
  try {
    console.log('📡 [1/3] Testando estatísticas...');
    const statsResponse = await axios.get(`${API_BASE_URL}/admin/stats`);
    console.log('✅ Estatísticas:', statsResponse.data);
    
    console.log('\n📡 [2/3] Testando inscrições...');
    const registrationsResponse = await axios.get(`${API_BASE_URL}/admin/registrations`);
    console.log(`✅ Total de inscrições: ${registrationsResponse.data.length}`);
    
    if (registrationsResponse.data.length > 0) {
      console.log('📋 Primeiras 3 inscrições:');
      registrationsResponse.data.slice(0, 3).forEach((reg, index) => {
        console.log(`   ${index + 1}. ID: ${reg.id}`);
        console.log(`      Nome: "${reg.name}"`);
        console.log(`      Email: "${reg.email}"`);
        console.log(`      Status: ${reg.payment_status}`);
        console.log(`      Evento: ${reg.event_title}`);
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
    
    console.log('\n📡 [3/3] Testando participantes...');
    const participantsResponse = await axios.get(`${API_BASE_URL}/admin/participants`);
    console.log(`✅ Total de participantes únicos: ${participantsResponse.data.length}`);
    
    if (participantsResponse.data.length > 0) {
      console.log('📋 Primeiros 3 participantes:');
      participantsResponse.data.slice(0, 3).forEach((p, index) => {
        console.log(`   ${index + 1}. Nome: "${p.name}"`);
        console.log(`      Email: "${p.email}"`);
        console.log(`      Telefone: "${p.phone}"`);
        console.log(`      Eventos: ${p.events_count}`);
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

testarDadosInscricoes(); 