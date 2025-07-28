const axios = require('axios');

const API_BASE_URL = 'https://siteigreja-1.onrender.com/api';

async function corrigirTabelaEvents() {
  console.log('🔧 CORRIGINDO TABELA EVENTS');
  console.log('=============================');
  
  try {
    console.log('📡 [1/3] Recriando tabela events...');
    const response1 = await axios.post(`${API_BASE_URL}/admin/fix-database-emergency`);
    console.log('✅ Resposta 1:', response1.data);
    
    console.log('\n📡 [2/3] Aguardando 2 segundos...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('📡 [3/3] Criando evento de teste...');
    const eventData = {
      title: 'CONNECT CONF 2025 - INPROVÁVEIS',
      description: 'A Connect Conf 2025 é mais do que uma conferência – é um chamado para aqueles que se acham fora do padrão, esquecidos ou desacreditados.',
      date: '2025-10-24T19:00:00',
      location: 'Igreja CEM - CAJATI, localizada na Av. dos trabalhadores, Nº99 - Centro, Cajati/SP.',
      price: 60,
      banner: 'https://i.ibb.co/tpzV7gt4/jpg-foto.jpg',
      banner_home: 'https://i.ibb.co/tpzV7gt4/jpg-foto.jpg',
      banner_evento: 'https://i.ibb.co/tpzV7gt4/jpg-foto.jpg',
      slug: 'connect-conf-2025-inprovveis',
      status: 'active'
    };
    
    const response2 = await axios.post(`${API_BASE_URL}/admin/events`, eventData);
    console.log('✅ Evento criado:', response2.data);
    
    console.log('\n🎉 CORREÇÃO CONCLUÍDA!');
    console.log('🌐 Teste agora: https://igrejacemchurch.org/evento/connect-conf-2025-inprovveis');
    
  } catch (error) {
    console.error('❌ Erro na correção:', error.message);
    if (error.response) {
      console.error('📋 Status:', error.response.status);
      console.error('📄 Resposta:', error.response.data);
    }
  }
}

corrigirTabelaEvents(); 