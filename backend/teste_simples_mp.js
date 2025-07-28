const axios = require('axios');

const ACCESS_TOKEN = 'APP_USR-7906695833613236-072622-a7c53bcaf7bc8b8289f1961ce3937843-2568627728';

console.log('🧪 TESTE SIMPLES - MERCADO PAGO');
console.log('================================');

async function testeSimples() {
  try {
    console.log('📋 Testando credenciais...');
    
    // Teste básico da API
    const response = await axios.get('https://api.mercadopago.com/v1/payment_methods', {
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Credenciais válidas!');
    console.log('📊 Métodos disponíveis:', response.data.length);
    
    // Verificar se é sandbox ou produção
    const isSandbox = ACCESS_TOKEN.includes('TEST');
    console.log('🌐 Ambiente:', isSandbox ? 'SANDBOX' : 'PRODUÇÃO');
    
    if (isSandbox) {
      console.log('⚠️ ATENÇÃO: Usando ambiente de TESTE!');
      console.log('💡 Para resolver o erro, use credenciais de PRODUÇÃO');
    } else {
      console.log('✅ Usando ambiente de PRODUÇÃO');
    }
    
    console.log('\n🎯 SOLUÇÃO:');
    if (isSandbox) {
      console.log('1. Acesse: https://www.mercadopago.com.br/developers/panel/credentials');
      console.log('2. Gere credenciais de PRODUÇÃO');
      console.log('3. Substitua o token atual');
    } else {
      console.log('1. Verifique se a conta está ativa');
      console.log('2. Teste com valor menor (R$ 1,00)');
      console.log('3. Use cartão de teste se necessário');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('🔑 Token inválido - gere novas credenciais');
    } else if (error.response?.status === 403) {
      console.log('🚫 Conta bloqueada - verifique status da conta');
    }
  }
}

testeSimples(); 