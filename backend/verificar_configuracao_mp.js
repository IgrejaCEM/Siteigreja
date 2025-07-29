const axios = require('axios');

// Credenciais de produção
const ACCESS_TOKEN = 'APP_USR-7906695833613236-072622-a7c53bcaf7bc8b8289f1961ce3937843-2568627728';

console.log('🔍 Verificando configurações do Mercado Pago...');

const api = axios.create({
  baseURL: 'https://api.mercadopago.com',
  headers: {
    'Authorization': `Bearer ${ACCESS_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

async function verificarConfiguracoes() {
  try {
    console.log('📋 Verificando informações da conta...');
    
    // Verificar informações da conta
    const accountResponse = await api.get('/users/me');
    console.log('✅ Conta:', accountResponse.data.nickname);
    console.log('✅ Tipo:', accountResponse.data.site_id);
    console.log('✅ País:', accountResponse.data.country_id);
    
    // Verificar configurações de pagamento
    console.log('\n💳 Verificando configurações de pagamento...');
    const paymentMethodsResponse = await api.get('/sites/MLB/payment_methods');
    console.log('✅ Métodos de pagamento disponíveis:', paymentMethodsResponse.data.length);
    
    // Verificar configurações de webhook
    console.log('\n🔗 Verificando webhooks...');
    try {
      const webhooksResponse = await api.get('/notifications/webhooks');
      console.log('✅ Webhooks configurados:', webhooksResponse.data.length);
      webhooksResponse.data.forEach(webhook => {
        console.log(`   - ${webhook.url} (${webhook.topic})`);
      });
    } catch (webhookError) {
      console.log('⚠️ Erro ao verificar webhooks:', webhookError.response?.data?.message || 'Não configurados');
    }
    
    // Verificar configurações de domínio
    console.log('\n🌐 Verificando configurações de domínio...');
    console.log('⚠️ IMPORTANTE: Verifique no painel do Mercado Pago:');
    console.log('   1. Vá em: https://www.mercadopago.com.br/developers/panel');
    console.log('   2. Clique em "Credenciais"');
    console.log('   3. Verifique se o domínio está liberado');
    console.log('   4. Adicione: https://siteigreja-1.onrender.com');
    console.log('   5. Adicione: https://igrejacemchurch.org');
    
    // Verificar configurações de Checkout PRO
    console.log('\n🛒 Verificando configurações do Checkout PRO...');
    console.log('⚠️ IMPORTANTE: Verifique no painel do Mercado Pago:');
    console.log('   1. Vá em: https://www.mercadopago.com.br/developers/panel');
    console.log('   2. Clique em "Checkout PRO"');
    console.log('   3. Verifique se está habilitado');
    console.log('   4. Configure as URLs de retorno');
    
    return {
      success: true,
      account: accountResponse.data,
      paymentMethods: paymentMethodsResponse.data.length
    };
    
  } catch (error) {
    console.error('❌ Erro ao verificar configurações:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
}

// Executar verificação
verificarConfiguracoes().then(result => {
  if (result.success) {
    console.log('\n🎉 Verificação concluída!');
    console.log('📋 Próximos passos:');
    console.log('   1. Acesse o painel do Mercado Pago');
    console.log('   2. Configure os domínios permitidos');
    console.log('   3. Configure o Checkout PRO');
    console.log('   4. Configure os webhooks');
  } else {
    console.log('\n❌ Erro na verificação!');
  }
}); 