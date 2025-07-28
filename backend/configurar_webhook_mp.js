const axios = require('axios');

const ACCESS_TOKEN = 'APP_USR-7906695833613236-072622-a7c53bcaf7bc8b8289f1961ce3937843-2568627728';

console.log('🔧 CONFIGURANDO WEBHOOK DO MERCADO PAGO');
console.log('========================================');

async function configurarWebhook() {
  try {
    console.log('📋 Passo 1: Verificando webhooks existentes...');
    
    // Listar webhooks existentes
    const webhooksResponse = await axios.get('https://api.mercadopago.com/v1/webhooks', {
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📊 Webhooks existentes:', webhooksResponse.data.length);
    webhooksResponse.data.forEach(webhook => {
      console.log(`   - ID: ${webhook.id}, URL: ${webhook.url}, Status: ${webhook.status}`);
    });
    
    console.log('\n📋 Passo 2: Criando novo webhook...');
    
    const webhookData = {
      url: 'https://siteigreja-1.onrender.com/api/payments/webhook',
      events: [
        'payment.created',
        'payment.updated',
        'payment.pending',
        'payment.approved',
        'payment.rejected',
        'payment.cancelled',
        'payment.refunded'
      ]
    };
    
    const createResponse = await axios.post('https://api.mercadopago.com/v1/webhooks', webhookData, {
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Webhook criado com sucesso!');
    console.log('📊 ID:', createResponse.data.id);
    console.log('🔗 URL:', createResponse.data.url);
    console.log('📋 Eventos:', createResponse.data.events);
    
    console.log('\n🎯 CONFIGURAÇÃO CONCLUÍDA!');
    console.log('✅ Webhook configurado');
    console.log('✅ Notificações serão enviadas');
    console.log('✅ Sistema financeiro funcionará corretamente');
    
  } catch (error) {
    console.error('❌ Erro ao configurar webhook:', error.response?.data || error.message);
    console.error('📊 Status:', error.response?.status);
    
    if (error.response?.status === 400) {
      console.log('💡 Dica: Verifique se a URL está acessível');
    } else if (error.response?.status === 401) {
      console.log('🔑 Token inválido');
    }
  }
}

configurarWebhook(); 