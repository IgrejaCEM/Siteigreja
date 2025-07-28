const axios = require('axios');

const API_BASE_URL = 'https://siteigreja-1.onrender.com/api';

async function testarCheckoutComPreco() {
  try {
    console.log('🧪 TESTANDO CHECKOUT COM PREÇO');
    
    // Primeiro, vou verificar se há eventos com preço
    const eventosResponse = await axios.get(`${API_BASE_URL}/events`);
    console.log('📋 Eventos disponíveis:', eventosResponse.data.length);
    
    // Procurar por evento com preço
    const eventoComPreco = eventosResponse.data.find(event => 
      event.price > 0 || event.has_payment === true
    );
    
    if (!eventoComPreco) {
      console.log('❌ Nenhum evento com preço encontrado');
      return;
    }
    
    console.log('✅ Evento com preço encontrado:', eventoComPreco.title);
    console.log('💰 Preço:', eventoComPreco.price);
    
    // Buscar lotes do evento
    const lotesResponse = await axios.get(`${API_BASE_URL}/events/${eventoComPreco.id}/lots`);
    const loteComPreco = lotesResponse.data.find(lot => lot.price > 0);
    
    if (!loteComPreco) {
      console.log('❌ Nenhum lote com preço encontrado');
      return;
    }
    
    console.log('✅ Lote com preço encontrado:', loteComPreco.name);
    console.log('💰 Preço do lote:', loteComPreco.price);
    
    // Testar inscrição com preço
    const inscricaoData = {
      participantes: [
        {
          name: 'Teste Checkout',
          email: 'teste@checkout.com',
          phone: '11999999999'
        }
      ],
      lot_id: loteComPreco.id,
      payment_method: 'mercadopago',
      products: []
    };
    
    console.log('📦 Dados enviados:', JSON.stringify(inscricaoData, null, 2));
    
    const response = await axios.post(`${API_BASE_URL}/events/${eventoComPreco.id}/inscricao-unificada`, inscricaoData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
    
    console.log('✅ Resposta recebida:');
    console.log('📊 Status:', response.status);
    console.log('📦 Data:', JSON.stringify(response.data, null, 2));
    
    if (response.data.payment_info && response.data.payment_info.payment_url) {
      console.log('🔗 URL do checkout:', response.data.payment_info.payment_url);
      console.log('🎭 Modo fake ativo:', response.data.payment_info.payment_url.includes('checkout-fake'));
    } else {
      console.log('❌ Nenhuma URL de checkout retornada');
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
  }
}

testarCheckoutComPreco(); 