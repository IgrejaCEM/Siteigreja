const axios = require('axios');

const BASE_URL = 'https://siteigreja-1.onrender.com';

console.log('🚀 CRIANDO EVENTO VIA API');
console.log('==========================');

async function criarEventoViaAPI() {
  try {
    console.log('📝 Criando evento de teste...');
    
    const eventData = {
      title: 'EVENTO TESTE PAGAMENTO',
      description: 'Evento para testar pagamento via Mercado Pago',
      date: '2025-12-31 19:00:00',
      location: 'Igreja CEM - São Paulo',
      banner: 'https://via.placeholder.com/1200x400?text=Evento+Teste',
      banner_home: 'https://via.placeholder.com/1200x400?text=Evento+Teste',
      banner_evento: 'https://via.placeholder.com/1200x400?text=Evento+Teste',
      status: 'active',
      has_payment: true,
      payment_gateway: 'mercadopago',
      lots: [
        {
          name: 'LOTE TESTE PAGO',
          price: 50.00,
          quantity: 100,
          start_date: '2025-01-01 00:00:00',
          end_date: '2025-12-31 23:59:59',
          status: 'active'
        }
      ]
    };

    console.log('📦 Dados do evento:', JSON.stringify(eventData, null, 2));

    const response = await axios.post(`${BASE_URL}/api/admin/events`, eventData);
    
    console.log('✅ Evento criado com sucesso!');
    console.log('📊 Status:', response.status);
    console.log('📦 Resposta:', JSON.stringify(response.data, null, 2));
    
    const event = response.data;
    console.log(`\n🎯 EVENTO CRIADO:`);
    console.log(`📅 ID: ${event.id}`);
    console.log(`📝 Título: ${event.title}`);
    console.log(`🔗 Slug: ${event.slug}`);
    console.log(`💰 Pagamento: ${event.has_payment ? 'Sim' : 'Não'}`);
    console.log(`🎫 Lotes: ${event.lots.length}`);
    
    event.lots.forEach(lot => {
      console.log(`   - ${lot.name}: R$ ${lot.price} (${lot.quantity} vagas)`);
    });
    
    console.log(`\n🔗 URL para teste: https://igrejacemchurch.org/evento/${event.slug}`);
    console.log(`💰 Valor: R$ 50,00`);
    
    console.log('\n📋 Para testar via API:');
    console.log(`POST /api/events/${event.id}/inscricao-unificada`);
    console.log(`Com lot_id: ${event.lots[0].id}`);

  } catch (error) {
    console.error('❌ Erro ao criar evento:', error.response?.data || error.message);
    console.error('📊 Status:', error.response?.status);
  }
}

criarEventoViaAPI(); 