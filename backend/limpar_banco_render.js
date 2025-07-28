const axios = require('axios');

async function limparBancoRender() {
  try {
    console.log('🗑️ Limpando banco no Render...');
    
    // URL do Render
    const baseURL = 'https://siteigreja-1.onrender.com/api';
    
    // Limpar inscrições
    console.log('🗑️ Limpando inscrições...');
    await axios.delete(`${baseURL}/admin/participants/clear`);
    
    // Limpar eventos (vamos usar uma rota de emergência)
    console.log('🗑️ Limpando eventos...');
    await axios.post(`${baseURL}/admin/clear-events-emergency`);
    
    console.log('✅ Banco limpo no Render!');
    
  } catch (error) {
    console.error('❌ Erro ao limpar banco:', error.response?.data || error.message);
  }
}

limparBancoRender(); 