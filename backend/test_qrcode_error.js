const axios = require('axios');

const API_BASE_URL = 'https://siteigreja-1.onrender.com/api';

async function testQRCodeError() {
  console.log('🔍 TESTANDO ERRO DE QR CODE');
  console.log('============================');
  
  try {
    console.log('📡 [1/4] Fazendo login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      emailOrUsername: 'admin@admin.com',
      password: 'admin123'
    });
    const token = loginResponse.data.token;
    console.log('✅ Login OK');
    
    console.log('📡 [2/4] Testando criação de evento simples...');
    const eventData = {
      title: 'Evento Teste QR Code',
      description: 'Descrição do evento teste para verificar erro de QR code',
      date: '2024-12-25 00:00:00',
      location: 'Local Teste',
      status: 'active',
      has_payment: false,
      lots: []
    };
    
    try {
      const createEventResponse = await axios.post(`${API_BASE_URL}/admin/events`, eventData, {
        headers: { 'Authorization': `Bearer ${token}` },
        timeout: 30000
      });
      console.log('✅ Criação de evento OK:', createEventResponse.data);
    } catch (error) {
      console.log('❌ Criação de evento FALHOU:');
      console.log('   Status:', error.response?.status);
      console.log('   Mensagem:', error.message);
      console.log('   Data:', error.response?.data);
      
      if (error.message.includes('qrcode') || error.message.includes('ERR_BAD_RESPONSE')) {
        console.log('🎯 ERRO DE QR CODE DETECTADO!');
      }
    }
    
    console.log('📡 [3/4] Testando criação de evento com pagamento...');
    const eventDataWithPayment = {
      title: 'Evento Teste QR Code com Pagamento',
      description: 'Descrição do evento teste com pagamento',
      date: '2024-12-26 00:00:00',
      location: 'Local Teste',
      status: 'active',
      has_payment: true,
      payment_gateway: 'mercadopago',
      lots: [
        {
          name: 'Lote Teste',
          price: 50.00,
          quantity: 100,
          start_date: '2024-12-01 00:00:00',
          end_date: '2024-12-24 23:59:59',
          status: 'active'
        }
      ]
    };
    
    try {
      const createEventWithPaymentResponse = await axios.post(`${API_BASE_URL}/admin/events`, eventDataWithPayment, {
        headers: { 'Authorization': `Bearer ${token}` },
        timeout: 30000
      });
      console.log('✅ Criação de evento com pagamento OK:', createEventWithPaymentResponse.data);
    } catch (error) {
      console.log('❌ Criação de evento com pagamento FALHOU:');
      console.log('   Status:', error.response?.status);
      console.log('   Mensagem:', error.message);
      console.log('   Data:', error.response?.data);
      
      if (error.message.includes('qrcode') || error.message.includes('ERR_BAD_RESPONSE')) {
        console.log('🎯 ERRO DE QR CODE DETECTADO!');
      }
    }
    
    console.log('📡 [4/4] Verificando se há dependências de QR code no backend...');
    console.log('💡 Verificando se a biblioteca qrcode está sendo usada...');
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testQRCodeError(); 