const axios = require('axios');

const API_BASE_URL = 'https://siteigreja-1.onrender.com/api';

async function testarEventoCompleto() {
  try {
    console.log('🧪 TESTANDO COMPONENTE EVENTO COMPLETO');
    console.log('=======================================');
    
    // 1. Testar carregamento de eventos públicos
    console.log('\n📋 [1/5] Testando carregamento de eventos públicos...');
    try {
      const eventsResponse = await axios.get(`${API_BASE_URL}/events`);
      const events = eventsResponse.data;
      
      if (events.length === 0) {
        console.log('❌ Nenhum evento encontrado - isso pode causar erro no frontend');
        return;
      }
      
      console.log(`✅ ${events.length} eventos encontrados`);
      events.forEach(event => {
        console.log(`  - ID: ${event.id}, Título: ${event.title}, Slug: ${event.slug}`);
      });
      
      // 2. Testar carregamento de detalhes de um evento específico
      const firstEvent = events[0];
      console.log(`\n📋 [2/5] Testando carregamento de detalhes do evento "${firstEvent.title}"...`);
      
      try {
        const eventDetailsResponse = await axios.get(`${API_BASE_URL}/events/${firstEvent.slug || firstEvent.id}`);
        const eventDetails = eventDetailsResponse.data;
        
        console.log('✅ Detalhes do evento carregados com sucesso');
        console.log(`📋 Título: ${eventDetails.title}`);
        console.log(`📋 Slug: ${eventDetails.slug}`);
        console.log(`📋 Lotes: ${eventDetails.lots?.length || 0}`);
        console.log(`📋 Produtos: ${eventDetails.products?.length || 0}`);
        
        // 3. Verificar se há lotes disponíveis
        if (eventDetails.lots && eventDetails.lots.length > 0) {
          console.log('\n📋 [3/5] Verificando lotes disponíveis...');
          eventDetails.lots.forEach(lot => {
            console.log(`  - Lote: ${lot.name}, Preço: R$ ${lot.price}, Quantidade: ${lot.quantity}`);
          });
        } else {
          console.log('⚠️ Nenhum lote encontrado - isso pode causar erro no frontend');
        }
        
        // 4. Verificar se há produtos disponíveis
        if (eventDetails.products && eventDetails.products.length > 0) {
          console.log('\n📋 [4/5] Verificando produtos disponíveis...');
          eventDetails.products.forEach(product => {
            console.log(`  - Produto: ${product.name}, Preço: R$ ${product.price}`);
          });
        } else {
          console.log('ℹ️ Nenhum produto encontrado (isso é normal)');
        }
        
        // 5. Testar se o evento tem slug válido
        console.log('\n📋 [5/5] Verificando slug do evento...');
        if (eventDetails.slug) {
          console.log(`✅ Slug válido: ${eventDetails.slug}`);
          
          // Testar acesso via slug
          try {
            const slugResponse = await axios.get(`${API_BASE_URL}/events/${eventDetails.slug}`);
            console.log('✅ Acesso via slug funcionando');
          } catch (slugError) {
            console.log('❌ Erro ao acessar via slug:', slugError.response?.status, slugError.response?.data?.error);
          }
        } else {
          console.log('⚠️ Evento não tem slug - isso pode causar problemas no frontend');
        }
        
      } catch (eventError) {
        console.log('❌ Erro ao carregar detalhes do evento:', eventError.response?.status, eventError.response?.data?.error);
      }
      
    } catch (eventsError) {
      console.log('❌ Erro ao carregar eventos:', eventsError.response?.status, eventsError.response?.data?.error);
    }
    
    console.log('\n💡 POSSÍVEIS CAUSAS DO ERRO:');
    console.log('1. Evento sem slug válido');
    console.log('2. Evento sem lotes disponíveis');
    console.log('3. Problema de CORS no frontend');
    console.log('4. Erro de JavaScript no componente EventoCompleto');
    console.log('5. Problema de rede entre frontend e backend');
    
  } catch (error) {
    console.error('❌ Erro geral:', error.response?.data || error.message);
  }
}

testarEventoCompleto(); 