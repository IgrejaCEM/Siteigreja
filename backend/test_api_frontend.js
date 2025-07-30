const axios = require('axios');

const API_BASE_URL = 'https://siteigreja-1.onrender.com/api';

async function testarAPIFrontend() {
  try {
    console.log('🧪 TESTANDO API PARA FRONTEND');
    console.log('==============================');
    
    // 1. Testar rota de eventos públicos
    console.log('\n📋 [1/4] Testando rota de eventos públicos...');
    try {
      const eventsResponse = await axios.get(`${API_BASE_URL}/events`);
      console.log('✅ Eventos públicos OK');
      console.log(`📊 Total de eventos: ${eventsResponse.data.length}`);
      eventsResponse.data.forEach(event => {
        console.log(`  - ID: ${event.id}, Título: ${event.title}, Slug: ${event.slug}`);
      });
    } catch (error) {
      console.log('❌ Erro na rota de eventos públicos:', error.response?.status, error.response?.data?.error);
    }
    
    // 2. Testar rota específica de evento
    console.log('\n📋 [2/4] Testando rota específica de evento...');
    try {
      const eventResponse = await axios.get(`${API_BASE_URL}/events/2`);
      console.log('✅ Evento específico OK');
      console.log(`📋 Título: ${eventResponse.data.title}`);
      console.log(`📋 Slug: ${eventResponse.data.slug}`);
      console.log(`📋 Lotes: ${eventResponse.data.lots?.length || 0}`);
    } catch (error) {
      console.log('❌ Erro na rota específica de evento:', error.response?.status, error.response?.data?.error);
    }
    
    // 3. Testar rota de configurações da home
    console.log('\n📋 [3/4] Testando rota de configurações da home...');
    try {
      const homeContentResponse = await axios.get(`${API_BASE_URL}/settings/home-content`);
      console.log('✅ Configurações da home OK');
      console.log(`📋 Conteúdo: ${homeContentResponse.data.content ? 'Sim' : 'Não'}`);
    } catch (error) {
      console.log('❌ Erro na rota de configurações da home:', error.response?.status, error.response?.data?.error);
    }
    
    // 4. Testar rota de layout da home
    console.log('\n📋 [4/4] Testando rota de layout da home...');
    try {
      const homeLayoutResponse = await axios.get(`${API_BASE_URL}/settings/home-layout`);
      console.log('✅ Layout da home OK');
      console.log(`📋 Layout: ${homeLayoutResponse.data?.layout ? 'Sim' : 'Não'}`);
    } catch (error) {
      console.log('❌ Erro na rota de layout da home:', error.response?.status, error.response?.data?.error);
    }
    
    console.log('\n💡 DIAGNÓSTICO:');
    console.log('Se algum dos testes acima falhou, isso pode estar causando o erro no frontend.');
    console.log('Verifique se o backend está rodando corretamente.');
    
  } catch (error) {
    console.error('❌ Erro geral:', error.response?.data || error.message);
  }
}

testarAPIFrontend(); 