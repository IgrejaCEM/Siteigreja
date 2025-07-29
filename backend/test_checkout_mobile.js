const axios = require('axios');

const API_BASE_URL = 'https://siteigreja-1.onrender.com/api';

async function testCheckoutMobile() {
  try {
    console.log('📱 Testando checkout para mobile...');
    
    // Primeiro, verificar se há eventos disponíveis
    console.log('📡 [1/3] Verificando eventos...');
    const eventsResponse = await axios.get(`${API_BASE_URL}/events`);
    
    if (eventsResponse.data.length === 0) {
      console.log('❌ Nenhum evento disponível para teste');
      return;
    }
    
    const evento = eventsResponse.data[0];
    console.log('📋 Usando evento:', evento.title, '(ID:', evento.id, ')');
    
    // Verificar lotes do evento
    console.log('📡 [2/3] Verificando lotes...');
    const lotsResponse = await axios.get(`${API_BASE_URL}/events/${evento.id}`);
    
    if (!lotsResponse.data.lots || lotsResponse.data.lots.length === 0) {
      console.log('❌ Nenhum lote disponível para teste');
      return;
    }
    
    const lote = lotsResponse.data.lots[0];
    console.log('📋 Usando lote:', lote.name, '(ID:', lote.id, ')');
    
    // Testar inscrição (simular mobile)
    console.log('📡 [3/3] Testando inscrição (mobile)...');
    const inscricaoData = {
      participantes: [
        {
          name: 'Teste Mobile',
          email: 'mobile@teste.com',
          phone: '11999999999',
          cpf: null,
          age: null,
          gender: null,
          address: null,
          image_authorization: false,
          custom_fields: {}
        }
      ],
      payment_method: 'CHECKOUT_PRO',
      lote_id: lote.id,
      products: []
    };
    
    const inscricaoResponse = await axios.post(
      `${API_BASE_URL}/events/${evento.id}/inscricao-unificada`,
      inscricaoData,
      {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
        }
      }
    );
    
    console.log('✅ Inscrição criada com sucesso!');
    console.log('📋 Registration Code:', inscricaoResponse.data.registration_code);
    
    if (inscricaoResponse.data.payment_info) {
      console.log('🔗 URL do checkout:', inscricaoResponse.data.payment_info.payment_url);
      console.log('📱 Esta URL deve funcionar no mobile');
      
      // Verificar se a URL é mobile-friendly
      const checkoutUrl = inscricaoResponse.data.payment_info.payment_url;
      if (checkoutUrl.includes('mercadopago.com.br')) {
        console.log('✅ URL do Mercado Pago gerada corretamente');
        console.log('📱 Teste no celular acessando:', checkoutUrl);
      } else {
        console.log('⚠️ URL pode não ser mobile-friendly');
      }
    } else {
      console.log('ℹ️ Lote gratuito - sem pagamento necessário');
    }
    
  } catch (error) {
    console.error('❌ Erro no teste mobile:', error.response?.data || error.message);
  }
}

testCheckoutMobile(); 