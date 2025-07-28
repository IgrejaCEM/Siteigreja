const axios = require('axios');

const API_BASE_URL = 'https://siteigreja-1.onrender.com/api';

async function testarMercadoPago() {
  console.log('🔐 TESTANDO MERCADO PAGO');
  console.log('==========================');
  
  try {
    console.log('📡 [1/3] Aguardando deploy...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    console.log('📡 [2/3] Testando criação de pagamento...');
    const paymentData = {
      amount: 50.00,
      description: 'Teste de Pagamento',
      customer: {
        name: 'Teste Usuario',
        email: 'teste@teste.com',
        cpf: '12345678901',
        registration_code: 'TEST-001',
        id: 1,
        event_id: 1
      },
      method: 'CREDITCARD'
    };
    
    const paymentResponse = await axios.post(`${API_BASE_URL}/test-mercadopago`, paymentData);
    
    if (paymentResponse.status === 200) {
      console.log('✅ Pagamento criado com sucesso!');
      console.log('📋 Payment ID:', paymentResponse.data.payment_id);
      console.log('🔗 Payment URL:', paymentResponse.data.payment_url);
      console.log('📊 Status:', paymentResponse.data.status);
      
      console.log('📡 [3/3] Verificando resposta...');
      console.log('✅ Resposta completa:', paymentResponse.data);
      
      console.log('\n🎉 MERCADO PAGO FUNCIONANDO!');
      console.log('🔗 URL do pagamento:', paymentResponse.data.payment_url);
      
    } else {
      console.log('❌ Erro ao criar pagamento');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    if (error.response) {
      console.error('📋 Status:', error.response.status);
      console.error('📄 Resposta:', error.response.data);
      
      if (error.response.status === 401) {
        console.log('\n🔑 PROBLEMA: Credenciais do Mercado Pago inválidas!');
        console.log('💡 Solução: Verifique as variáveis de ambiente:');
        console.log('   - MERCADOPAGO_ACCESS_TOKEN');
        console.log('   - MERCADOPAGO_PUBLIC_KEY');
      }
    }
  }
}

testarMercadoPago(); 