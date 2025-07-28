const axios = require('axios');

const BASE_URL = 'https://siteigreja-1.onrender.com';

console.log('🔍 LISTANDO EVENTOS VIA API');
console.log('============================');

async function listarEventos() {
  try {
    console.log('📋 Buscando eventos via API...');
    
    const response = await axios.get(`${BASE_URL}/api/admin/events`);
    
    console.log(`✅ Encontrados ${response.data.length} eventos:`);
    
    response.data.forEach(event => {
      console.log(`📅 ID: ${event.id} | ${event.title}`);
      console.log(`   Slug: ${event.slug}`);
      console.log(`   Status: ${event.status}`);
      console.log(`   Pagamento: ${event.has_payment ? 'Sim' : 'Não'}`);
      console.log(`   Gateway: ${event.payment_gateway || 'N/A'}`);
      console.log(`   Data: ${event.date}`);
      console.log('---');
    });
    
    // Encontrar eventos com pagamento
    const eventosComPagamento = response.data.filter(event => event.has_payment);
    
    if (eventosComPagamento.length > 0) {
      console.log('\n💰 EVENTOS COM PAGAMENTO:');
      eventosComPagamento.forEach(event => {
        console.log(`   📅 ID: ${event.id} | ${event.title}`);
        console.log(`   🔗 URL: https://igrejacemchurch.org/evento/${event.slug}`);
      });
      
      // Testar o primeiro evento com pagamento
      const eventoTeste = eventosComPagamento[0];
      console.log(`\n🎯 TESTANDO EVENTO: ${eventoTeste.title} (ID: ${eventoTeste.id})`);
      
      // Buscar lotes do evento
      const lotesResponse = await axios.get(`${BASE_URL}/api/admin/events/${eventoTeste.id}`);
      console.log('📦 Lotes disponíveis:');
      lotesResponse.data.lots.forEach(lot => {
        console.log(`   🎫 ID: ${lot.id} | ${lot.name} | R$ ${lot.price} | Qtd: ${lot.quantity}`);
      });
      
      console.log(`\n🔗 URL para teste: https://igrejacemchurch.org/evento/${eventoTeste.slug}`);
      
    } else {
      console.log('\n❌ Nenhum evento com pagamento encontrado!');
      console.log('💡 Vou criar um evento de teste...');
    }
    
  } catch (error) {
    console.error('❌ Erro ao listar eventos:', error.response?.data || error.message);
  }
}

listarEventos(); 