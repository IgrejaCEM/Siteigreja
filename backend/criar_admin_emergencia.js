const axios = require('axios');

const API_BASE_URL = 'https://siteigreja-1.onrender.com/api';

async function criarAdminEmergencia() {
  try {
    console.log('🚨 CRIANDO ADMIN DE EMERGÊNCIA');
    
    // Usar a rota de emergência para criar admin
    const createResponse = await axios.post(`${API_BASE_URL}/auth/create-admin-emergency`);
    
    console.log('✅ Admin criado com sucesso');
    console.log('📋 Dados:', createResponse.data);
    
    // Tentar fazer login com o admin criado
    console.log('\n🔐 Tentando fazer login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      emailOrUsername: 'admin@admin.com',
      password: 'admin123'
    });
    
    console.log('✅ Login realizado com sucesso');
    console.log('📋 Token:', loginResponse.data.token ? 'Token recebido' : 'Sem token');
    console.log('📋 Dados do usuário:', loginResponse.data.user);
    
  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
    console.error('📋 Status:', error.response?.status);
  }
}

criarAdminEmergencia(); 