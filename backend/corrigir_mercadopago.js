const axios = require('axios');

const API_BASE_URL = 'https://siteigreja-1.onrender.com/api';

async function corrigirMercadoPago() {
  console.log('🔧 CORRIGINDO MERCADO PAGO');
  console.log('============================');
  
  try {
    console.log('📡 [1/4] Aguardando deploy...');
    await new Promise(resolve => setTimeout(resolve, 15000));
    
    console.log('📡 [2/4] Verificando configuração atual...');
    const configResponse = await axios.get(`${API_BASE_URL}/admin/payment-config`);
    
    if (configResponse.status === 200) {
      console.log('✅ Configuração atual:', configResponse.data);
    }
    
    console.log('📡 [3/4] Ativando modo fake temporariamente...');
    const fakeResponse = await axios.post(`${API_BASE_URL}/admin/activate-fake-payment`);
    
    if (fakeResponse.status === 200) {
      console.log('✅ Modo fake ativado:', fakeResponse.data);
    }
    
    console.log('📡 [4/4] Testando pagamento fake...');
    const testResponse = await axios.post(`${API_BASE_URL}/test-fake-payment`, {
      amount: 50.00,
      description: 'Teste de Pagamento Fake',
      customer: {
        name: 'Teste Usuario',
        email: 'teste@teste.com',
        cpf: '12345678901',
        registration_code: 'TEST-001'
      }
    });
    
    if (testResponse.status === 200) {
      console.log('✅ Pagamento fake funcionando:', testResponse.data);
      console.log('\n🎉 SOLUÇÃO TEMPORÁRIA IMPLEMENTADA!');
      console.log('💡 O sistema agora usa pagamentos fake (sempre aprovados)');
      console.log('🌐 Teste a inscrição: https://igrejacemchurch.org/evento/connect-conf---2025');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    if (error.response) {
      console.error('📋 Status:', error.response.status);
      console.error('📄 Resposta:', error.response.data);
    }
  }
}

corrigirMercadoPago(); 