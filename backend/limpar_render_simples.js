const axios = require('axios');

const API_BASE_URL = 'https://siteigreja-1.onrender.com/api';

async function limparRenderSimples() {
  try {
    console.log('🧹 Chamando rota de limpeza no Render...');
    
    // Chamar rota de limpeza
    const response = await axios.post(`${API_BASE_URL}/admin/clear-orphaned-data`);
    
    console.log('✅ Limpeza executada:', response.data);
    
    // Verificar estado final
    console.log('\n📡 Verificando estado final...');
    const eventosResponse = await axios.get(`${API_BASE_URL}/events`);
    console.log(`📊 Eventos no Render: ${eventosResponse.data.length}`);
    
    if (eventosResponse.data.length === 0) {
      console.log('✅ Render limpo! Pronto para criar seu evento real.');
    } else {
      console.log('📋 Eventos restantes:');
      eventosResponse.data.forEach(evento => {
        console.log(`   - ${evento.title}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro ao limpar Render:', error.response?.data || error.message);
  }
}

limparRenderSimples(); 