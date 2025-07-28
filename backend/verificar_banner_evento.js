const axios = require('axios');

const API_BASE_URL = 'https://siteigreja-1.onrender.com/api';

async function verificarBannerEvento() {
  console.log('🔍 VERIFICANDO BANNER DO EVENTO');
  console.log('================================');
  
  try {
    console.log('📡 Buscando dados do evento ID 1...');
    const response = await axios.get(`${API_BASE_URL}/events/1`);
    const evento = response.data;
    
    console.log('✅ Evento encontrado!');
    console.log('📋 Título:', evento.title);
    console.log('🎨 Campos de banner:');
    console.log('   - banner:', evento.banner || 'NÃO DEFINIDO');
    console.log('   - banner_home:', evento.banner_home || 'NÃO DEFINIDO');
    console.log('   - banner_evento:', evento.banner_evento || 'NÃO DEFINIDO');
    
    // Verificar se algum banner existe
    const banners = [evento.banner, evento.banner_home, evento.banner_evento].filter(Boolean);
    
    if (banners.length === 0) {
      console.log('❌ NENHUM BANNER ENCONTRADO!');
      console.log('💡 Solução: Adicione uma imagem de banner no evento');
    } else {
      console.log('✅ Banners encontrados:', banners.length);
      banners.forEach((banner, index) => {
        console.log(`   ${index + 1}. ${banner}`);
      });
    }
    
    // Testar se as URLs são acessíveis
    console.log('\n🔗 Testando URLs dos banners...');
    for (const banner of banners) {
      try {
        const imgResponse = await axios.head(banner, { timeout: 5000 });
        console.log(`✅ ${banner} - Status: ${imgResponse.status}`);
      } catch (error) {
        console.log(`❌ ${banner} - Erro: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar banner:', error.message);
  }
}

verificarBannerEvento(); 