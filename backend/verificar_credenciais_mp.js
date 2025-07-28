const axios = require('axios');

const ACCESS_TOKEN = 'APP_USR-7906695833613236-072622-a7c53bcaf7bc8b8289f1961ce3937843-2568627728';

console.log('🔍 VERIFICANDO CREDENCIAIS DO MERCADO PAGO');
console.log('==========================================');

async function verificarCredenciais() {
  try {
    console.log('📋 Testando token de acesso...');
    
    const response = await axios.get('https://api.mercadopago.com/v1/account', {
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Token válido!');
    console.log('📊 Status:', response.status);
    console.log('📦 Dados da conta:');
    console.log('   - ID:', response.data.id);
    console.log('   - Nome:', response.data.name);
    console.log('   - Email:', response.data.email);
    console.log('   - Tipo:', response.data.type);
    console.log('   - País:', response.data.country_id);
    
    // Verificar se é sandbox ou produção
    const isSandbox = ACCESS_TOKEN.includes('TEST');
    console.log('🌐 Ambiente:', isSandbox ? 'SANDBOX (TESTE)' : 'PRODUÇÃO');
    
    if (isSandbox) {
      console.log('⚠️ ATENÇÃO: Usando ambiente de TESTE!');
      console.log('💡 Para produção, use token sem TEST');
    }
    
    console.log('\n🎯 RECOMENDAÇÃO:');
    if (isSandbox) {
      console.log('🔧 Mude para token de PRODUÇÃO');
    } else {
      console.log('✅ Token de produção configurado');
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar credenciais:', error.response?.data || error.message);
    console.error('📊 Status:', error.response?.status);
    
    if (error.response?.status === 401) {
      console.log('🔑 Token inválido ou expirado!');
      console.log('💡 Verifique se o token está correto');
    } else if (error.response?.status === 403) {
      console.log('🚫 Acesso negado!');
      console.log('💡 Verifique permissões da conta');
    }
  }
}

verificarCredenciais(); 