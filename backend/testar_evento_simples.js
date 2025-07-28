const axios = require('axios');

const API_BASE_URL = 'https://siteigreja-1.onrender.com/api';

async function testarEventoSimples() {
  console.log('🔍 TESTANDO EVENTO SIMPLES');
  console.log('===========================');
  
  try {
    console.log('📡 Verificando evento público...');
    const response = await axios.get(`${API_BASE_URL}/events/1`);
    
    if (response.status === 200) {
      console.log('✅ EVENTO ENCONTRADO!');
      console.log('📋 Título:', response.data.title);
      console.log('📅 Data:', response.data.date);
      console.log('📍 Local:', response.data.location);
      console.log('🌐 URL:', response.data.slug);
      
      console.log('\n🔍 Verificando lotes...');
      const lotsResponse = await axios.get(`${API_BASE_URL}/events/1/lots`);
      
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

testarEventoSimples(); 