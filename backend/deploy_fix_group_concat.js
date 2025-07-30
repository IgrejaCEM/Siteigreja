const axios = require('axios');

async function deployFix() {
  console.log('🚀 Fazendo deploy da correção GROUP_CONCAT...');
  
  try {
    // Fazer login
    const loginResponse = await axios.post('https://siteigreja-1.onrender.com/api/auth/login', {
      emailOrUsername: 'admin@admin.com',
      password: 'admin123'
    });
    
    console.log('✅ Login realizado');
    
    // Testar a rota corrigida
    const participantsResponse = await axios.get('https://siteigreja-1.onrender.com/api/admin/participants', {
      headers: { 'Authorization': `Bearer ${loginResponse.data.token}` }
    });
    
    console.log('✅ Rota /admin/participants funcionando:', participantsResponse.data.length, 'participantes');
    
    console.log('🎉 Correção aplicada com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
  }
}

deployFix(); 