const axios = require('axios');

const API_BASE_URL = 'https://siteigreja-1.onrender.com/api';

async function testarEventoId2() {
  console.log('🔍 TESTANDO EVENTO ID 2');
  console.log('=========================');
  
  try {
    console.log('📡 Verificando evento ID 2...');
    const response = await axios.get(`${API_BASE_URL}/events/2`);
    
    if (response.status === 200) {
      console.log('✅ EVENTO ENCONTRADO!');
      console.log('📋 Título:', response.data.title);
      console.log('📅 Data:', response.data.date);
      console.log('📍 Local:', response.data.location);
      console.log('🆔 ID:', response.data.id);
      console.log('🌐 Slug:', response.data.slug);
      
      console.log('\n🔍 Verificando lotes...');
      const lotsResponse = await axios.get(`${API_BASE_URL}/events/2/lots`);
      
      if (lotsResponse.status === 200) {
        console.log('✅ Lotes encontrados:', lotsResponse.data.length);
        lotsResponse.data.forEach((lot, index) => {
          console.log(`   Lote ${index + 1}: ${lot.name} - R$ ${lot.price}`);
        });
      }
      
      console.log('\n🌐 Links para testar:');
      console.log('   Evento: https://igrejacemchurch.org/evento/connect-conf-2025-inprovveis');
      console.log('   Admin: https://igrejacemchurch.org/admin/eventos');
      
    } else {
      console.log('❌ Evento não encontrado');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    if (error.response) {
      console.error('📋 Status:', error.response.status);
      console.error('📄 Resposta:', error.response.data);
    }
  }
}

testarEventoId2(); 