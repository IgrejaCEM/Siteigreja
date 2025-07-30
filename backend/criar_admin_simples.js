const axios = require('axios');

const API_BASE_URL = 'https://siteigreja-1.onrender.com/api';

async function criarAdmin() {
  try {
    console.log('👤 CRIANDO USUÁRIO ADMIN');
    
    // Tentar criar usuário admin
    const createResponse = await axios.post(`${API_BASE_URL}/auth/register`, {
      name: 'Admin',
      username: 'admin',
      email: 'admin@igreja.com',
      password: 'admin123',
      birthdate: '1990-01-01',
      gender: 'masculino'
    });
    
    console.log('✅ Usuário admin criado com sucesso');
    console.log('📋 Dados:', createResponse.data);
    
  } catch (error) {
    console.error('❌ Erro ao criar admin:', error.response?.data || error.message);
    console.error('📋 Status:', error.response?.status);
    
    if (error.response?.status === 409) {
      console.log('💡 Usuário já existe, tentando fazer login...');
      
      try {
        const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
          email: 'admin@igreja.com',
          password: 'admin123'
        });
        
        console.log('✅ Login realizado com sucesso');
        console.log('📋 Token:', loginResponse.data.token ? 'Token recebido' : 'Sem token');
        
      } catch (loginError) {
        console.error('❌ Erro no login:', loginError.response?.data || loginError.message);
      }
    }
  }
}

criarAdmin(); 