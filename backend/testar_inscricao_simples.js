const axios = require('axios');

const API_BASE_URL = 'https://siteigreja-1.onrender.com/api';

async function testarInscricaoSimples() {
  console.log('🎯 TESTANDO INSCRIÇÃO SIMPLIFICADA');
  console.log('====================================');
  
  try {
    console.log('📡 [1/4] Aguardando deploy...');
    await new Promise(resolve => setTimeout(resolve, 20000));
    
    console.log('📡 [2/4] Verificando eventos...');
    const eventsResponse = await axios.get(`${API_BASE_URL}/events`);
    
    if (eventsResponse.data.length === 0) {
      console.log('❌ NENHUM EVENTO ENCONTRADO!');
      return;
    }
    
    const event = eventsResponse.data[0];
    console.log('✅ Evento encontrado:', event.title);
    
    console.log('📡 [3/4] Verificando lote...');
    const lotsResponse = await axios.get(`${API_BASE_URL}/events/${event.id}/lots`);
    
    if (lotsResponse.data.length === 0) {
      console.log('❌ NENHUM LOTE ENCONTRADO!');
      return;
    }
    
    const lot = lotsResponse.data[0];
    console.log('✅ Lote encontrado:', lot.name);
    
    console.log('📡 [4/4] Testando inscrição simplificada...');
    const inscricaoData = {
      participantes: [
        {
          name: 'Teste Usuario',
          email: 'teste@teste.com',
          cpf: '12345678901',
          phone: '11999999999'
        }
      ],
      lote_id: lot.id,
      payment_method: 'fake',
      products: []
    };
    
    const inscricaoResponse = await axios.post(`${API_BASE_URL}/events/${event.id}/inscricao-simples`, inscricaoData);
    
    if (inscricaoResponse.status === 200) {
      console.log('✅ Inscrição simplificada funcionando!');
      console.log('📋 Resposta:', inscricaoResponse.data);
      
      console.log('\n🎉 SUCESSO! INSCRIÇÃO FUNCIONANDO!');
      console.log('🌐 Teste agora: https://igrejacemchurch.org/evento/connect-conf---2025');
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

testarInscricaoSimples(); 