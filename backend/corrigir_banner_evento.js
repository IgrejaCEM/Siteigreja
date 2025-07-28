const axios = require('axios');

const API_BASE_URL = 'https://siteigreja-1.onrender.com/api';

async function corrigirBannerEvento() {
  console.log('🔧 CORRIGINDO BANNER DO EVENTO');
  console.log('================================');
  
  try {
    console.log('📡 Buscando dados do evento ID 1...');
    const response = await axios.get(`${API_BASE_URL}/admin/events/1`);
    const evento = response.data;
    
    console.log('✅ Evento encontrado!');
    console.log('📋 Título:', evento.title);
    
    // URLs corretas (sem HTML extra)
    const bannerCorreto = 'https://i.ibb.co/tpzV7gt4/jpg-foto.jpg';
    
    console.log('🎨 Corrigindo URLs de banner...');
    console.log('   - Antes:', evento.banner);
    console.log('   - Depois:', bannerCorreto);
    
    // Atualizar o evento com as URLs corretas
    const dadosAtualizados = {
      banner: bannerCorreto,
      banner_home: bannerCorreto,
      banner_evento: bannerCorreto
    };
    
    console.log('📤 Enviando atualização...');
    const updateResponse = await axios.put(`${API_BASE_URL}/admin/events/1`, dadosAtualizados);
    
    if (updateResponse.status === 200) {
      console.log('✅ Banner corrigido com sucesso!');
      console.log('🔄 Recarregando dados...');
      
      // Verificar se foi atualizado
      const verifyResponse = await axios.get(`${API_BASE_URL}/admin/events/1`);
      const eventoAtualizado = verifyResponse.data;
      
      console.log('🎨 Novos campos de banner:');
      console.log('   - banner:', eventoAtualizado.banner);
      console.log('   - banner_home:', eventoAtualizado.banner_home);
      console.log('   - banner_evento:', eventoAtualizado.banner_evento);
      
      console.log('✅ CORREÇÃO CONCLUÍDA!');
      console.log('🌐 Teste agora: https://igrejacemchurch.org/evento/connect-conf-2025-inprovveis');
    }
    
  } catch (error) {
    console.error('❌ Erro ao corrigir banner:', error.message);
    if (error.response) {
      console.error('📋 Status:', error.response.status);
      console.error('📄 Resposta:', error.response.data);
    }
  }
}

corrigirBannerEvento(); 