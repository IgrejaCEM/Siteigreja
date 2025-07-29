const axios = require('axios');

const API_BASE_URL = 'https://siteigreja-1.onrender.com/api';

async function configurarWebhookMP() {
  console.log('🔧 CONFIGURANDO WEBHOOK MERCADO PAGO');
  console.log('======================================');
  
  try {
    // 1. Fazer login
    console.log('📡 [1/3] Fazendo login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      emailOrUsername: 'admin@admin.com',
      password: 'admin123'
    });
    
    if (!loginResponse.data || !loginResponse.data.token) {
      console.log('❌ Login falhou:', loginResponse.data);
      return;
    }
    
    const token = loginResponse.data.token;
    console.log('✅ Login OK, token obtido');
    
    // 2. Configurar webhook via API
    console.log('📡 [2/3] Configurando webhook...');
    const webhookData = {
      url: 'https://siteigreja-1.onrender.com/api/payments/webhook',
      events: ['payment.created', 'payment.updated', 'payment.cancelled']
    };
    
    const webhookResponse = await axios.post(`${API_BASE_URL}/admin/configurar-webhook`, webhookData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Webhook configurado:', webhookResponse.data);
    
    // 3. Testar webhook
    console.log('📡 [3/3] Testando webhook...');
    const testResponse = await axios.post(`${API_BASE_URL}/admin/testar-webhook`, {
      test: true
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Teste do webhook:', testResponse.data);
    
    console.log('\n🎉 WEBHOOK CONFIGURADO COM SUCESSO!');
    console.log('🌐 URL: https://siteigreja-1.onrender.com/api/payments/webhook');
    
  } catch (error) {
    console.error('❌ Erro ao configurar webhook:', error.message);
    if (error.response) {
      console.error('📋 Status:', error.response.status);
      console.error('📄 Resposta:', error.response.data);
    }
  }
}

configurarWebhookMP(); 