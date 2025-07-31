const axios = require('axios');

async function testTokenValidation() {
  try {
    console.log('🧪 Testando validação do token do MercadoPago...');
    
    // Testar se o token está funcionando
    console.log('🔧 Testando token em produção...');
    
    try {
      const response = await axios.get('https://api.mercadopago.com/users/me', {
        headers: {
          'Authorization': 'Bearer APP_USR-7906695833613236-072622-a7c53bcaf7bc8b8289f1961ce3937843-2568627728',
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      console.log('✅ Token de produção válido');
      console.log('📊 Dados do usuário:', JSON.stringify(response.data, null, 2));
      
    } catch (error) {
      console.error('❌ Token de produção inválido:', error.response?.data || error.message);
    }
    
    // Testar se o token local está funcionando
    console.log('🔧 Testando token local...');
    
    try {
      const response = await axios.get('https://api.mercadopago.com/users/me', {
        headers: {
          'Authorization': 'Bearer APP_USR-1241061656504413-072321-83887fb0a02804e86068b8babad3c40e-2568627728',
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      console.log('✅ Token local válido');
      console.log('📊 Dados do usuário:', JSON.stringify(response.data, null, 2));
      
    } catch (error) {
      console.error('❌ Token local inválido:', error.response?.data || error.message);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testTokenValidation(); 