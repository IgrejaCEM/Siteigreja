const axios = require('axios');

const API_BASE_URL = 'https://igrejacemchurch.org/api';

async function forceHomeContent() {
  try {
    console.log('🚀 Forçando atualização do conteúdo da home...');
    
    const defaultContent = `
      <div style="width:100%;min-height:60vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
        <div style="text-align:center;color:white;padding:40px;">
          <h1 style="font-size:3rem;margin-bottom:20px;">Bem-vindo à Igreja CEM</h1>
          <p style="font-size:1.2rem;margin-bottom:30px;">Um lugar de fé, esperança e amor</p>
          <button style="background:#ff6b6b;color:white;border:none;padding:15px 30px;border-radius:25px;font-size:1.1rem;cursor:pointer;">
            Conheça Nossos Eventos
          </button>
        </div>
      </div>
    `;

    // Primeiro, verificar se a rota existe
    console.log('🔍 Verificando se a rota existe...');
    const testResponse = await axios.get(`${API_BASE_URL}/settings/home-content`, {
      timeout: 30000
    });
    console.log('✅ Rota existe! Conteúdo atual:', testResponse.data);

    // Fazer requisição para atualizar o conteúdo
    console.log('📝 Tentando atualizar conteúdo...');
    const response = await axios.post(`${API_BASE_URL}/settings/home-content`, {
      content: defaultContent,
      css: ''
    }, {
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer admin-token' // Token temporário para teste
      }
    });

    console.log('✅ Conteúdo atualizado com sucesso!');
    console.log('📊 Resposta:', response.data);
    
  } catch (error) {
    console.error('❌ Erro ao atualizar conteúdo:', error.response?.data || error.message);
    console.error('📊 Status:', error.response?.status);
    console.error('🔗 URL tentada:', error.config?.url);
  }
}

forceHomeContent(); 