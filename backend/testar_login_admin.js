const axios = require('axios');

const API_BASE_URL = 'https://siteigreja-1.onrender.com/api';

async function testarLoginAdmin() {
  console.log('🔐 TESTANDO LOGIN DO ADMIN');
  console.log('===========================');
  
  try {
    console.log('📡 [1/4] Aguardando deploy...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    console.log('📡 [2/4] Criando admin de emergência...');
    const createAdminResponse = await axios.post(`${API_BASE_URL}/auth/create-admin-emergency`);
    
    if (createAdminResponse.status === 200) {
      console.log('✅ Admin criado/verificado:', createAdminResponse.data);
    } else {
      console.log('❌ Erro ao criar admin');
      return;
    }
    
    console.log('📡 [3/4] Testando login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      emailOrUsername: 'admin@admin.com',
      password: 'admin123'
    });
    
    if (loginResponse.status === 200) {
      console.log('✅ Login realizado com sucesso!');
      console.log('📋 Token:', loginResponse.data.token.substring(0, 50) + '...');
      console.log('👤 Usuário:', loginResponse.data.user);
      
      const token = loginResponse.data.token;
      
      console.log('📡 [4/4] Testando perfil...');
      const profileResponse = await axios.get(`${API_BASE_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (profileResponse.status === 200) {
        console.log('✅ Perfil carregado com sucesso!');
        console.log('📋 Dados do perfil:', profileResponse.data);
        
        console.log('\n🎉 LOGIN DO ADMIN FUNCIONANDO!');
        console.log('🌐 Teste agora: https://igrejacemchurch.org/admin');
        console.log('📧 Email: admin@admin.com');
        console.log('🔑 Senha: admin123');
        
      } else {
        console.log('❌ Erro ao carregar perfil');
      }
      
    } else {
      console.log('❌ Erro no login');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    if (error.response) {
      console.error('📋 Status:', error.response.status);
      console.error('📄 Resposta:', error.response.data);
    }
  }
}

testarLoginAdmin(); 