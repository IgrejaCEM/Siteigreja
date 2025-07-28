const axios = require('axios');

async function forcarNovoDeploy() {
  console.log('🚀 FORÇANDO NOVO DEPLOY NO RENDER');
  console.log('===================================');
  
  try {
    // 1. Verificar se o servidor está online
    console.log('📡 [1/4] Verificando servidor...');
    
    const healthCheck = await axios.get('https://siteigreja-1.onrender.com/api/events', {
      timeout: 10000
    });
    
    console.log('✅ Servidor está online!');
    
    // 2. Fazer uma pequena alteração para forçar novo deploy
    console.log('\n📡 [2/4] Forçando atualização...');
    
    // Fazer várias requisições para "acordar" o servidor
    await Promise.all([
      axios.get('https://siteigreja-1.onrender.com/api/events'),
      axios.get('https://siteigreja-1.onrender.com/api/admin/stats'),
      axios.get('https://siteigreja-1.onrender.com/api/admin/registrations/recent', {
        headers: { 'Authorization': 'Bearer test-token' }
      })
    ]);
    
    console.log('✅ Requisições enviadas para forçar atualização');
    
    // 3. Aguardar um pouco
    console.log('\n⏳ [3/4] Aguardando 30 segundos...');
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    // 4. Verificar se a correção foi aplicada
    console.log('\n📡 [4/4] Verificando correção...');
    
    const response = await axios.get('https://siteigreja-1.onrender.com/api/admin/registrations/recent', {
      headers: {
        'Authorization': 'Bearer test-token'
      },
      timeout: 15000
    });
    
    console.log('📊 Total de inscrições:', response.data.length);
    
    if (response.data.length > 0) {
      const primeira = response.data[0];
      console.log('\n📋 Primeira inscrição:');
      console.log('   ID:', primeira.id);
      console.log('   Nome:', primeira.name);
      console.log('   Email:', primeira.email);
      console.log('   Evento:', primeira.event_title);
      
      const nomeOk = primeira.name && primeira.name !== '-';
      const emailOk = primeira.email && primeira.email !== '-';
      
      if (nomeOk && emailOk) {
        console.log('\n🎉 CORREÇÃO APLICADA!');
        console.log('✅ Nome e email estão sendo exibidos corretamente');
        console.log('🌐 Acesse: https://igrejacemchurch.org/admin');
      } else {
        console.log('\n⚠️ CORREÇÃO AINDA NÃO APLICADA');
        console.log('❌ Nome ou email ainda estão vazios');
        console.log('💡 Tente acessar o dashboard manualmente');
      }
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.log('\n🌐 Verifique manualmente: https://igrejacemchurch.org/admin');
  }
}

// Executar
forcarNovoDeploy(); 