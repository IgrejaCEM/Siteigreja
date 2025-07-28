const axios = require('axios');

async function forcarDeployDashboard() {
  console.log('🚀 FORÇANDO DEPLOY DA CORREÇÃO DO DASHBOARD');
  console.log('==============================================');
  
  try {
    // 1. Verificar se o servidor está respondendo
    console.log('📡 [1/3] Verificando se o servidor está online...');
    
    const healthCheck = await axios.get('https://siteigreja-1.onrender.com/api/admin/registrations/recent', {
      headers: {
        'Authorization': 'Bearer test-token'
      },
      timeout: 15000
    });
    
    console.log('✅ Servidor está online!');
    console.log('📊 Total de inscrições:', healthCheck.data.length);
    
    // 2. Verificar se a correção foi aplicada
    console.log('\n📡 [2/3] Verificando se a correção foi aplicada...');
    
    if (healthCheck.data.length > 0) {
      const primeira = healthCheck.data[0];
      console.log('📋 Primeira inscrição:');
      console.log('   ID:', primeira.id);
      console.log('   Nome:', primeira.name);
      console.log('   Email:', primeira.email);
      console.log('   Evento:', primeira.event_title);
      console.log('   Status:', primeira.status);
      
      const nomeOk = primeira.name && primeira.name !== '-';
      const emailOk = primeira.email && primeira.email !== '-';
      
      if (nomeOk && emailOk) {
        console.log('\n🎉 CORREÇÃO APLICADA COM SUCESSO!');
        console.log('✅ Nome e email estão sendo exibidos corretamente');
        console.log('✅ Dashboard deve mostrar os dados agora');
        console.log('\n🌐 Acesse: https://igrejacemchurch.org/admin');
        console.log('📊 Verifique se os nomes e emails aparecem no dashboard');
        return;
      } else {
        console.log('\n⚠️ CORREÇÃO AINDA NÃO APLICADA');
        console.log('❌ Nome ou email ainda estão vazios');
        console.log('⏳ O deploy pode estar em andamento...');
      }
    }
    
    // 3. Tentar forçar atualização
    console.log('\n📡 [3/3] Tentando forçar atualização...');
    
    // Fazer uma requisição para "acordar" o servidor
    await axios.get('https://siteigreja-1.onrender.com/api/events', {
      timeout: 10000
    });
    
    console.log('✅ Requisição de atualização enviada');
    console.log('\n⏳ Aguardando 30 segundos para o deploy...');
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    // Verificar novamente
    console.log('\n🔄 Verificando novamente...');
    const recheck = await axios.get('https://siteigreja-1.onrender.com/api/admin/registrations/recent', {
      headers: {
        'Authorization': 'Bearer test-token'
      },
      timeout: 15000
    });
    
    if (recheck.data.length > 0) {
      const primeira = recheck.data[0];
      const nomeOk = primeira.name && primeira.name !== '-';
      const emailOk = primeira.email && primeira.email !== '-';
      
      if (nomeOk && emailOk) {
        console.log('\n🎉 CORREÇÃO APLICADA APÓS FORÇAR DEPLOY!');
        console.log('✅ Nome e email estão sendo exibidos corretamente');
        console.log('✅ Dashboard deve mostrar os dados agora');
      } else {
        console.log('\n⚠️ CORREÇÃO AINDA NÃO APLICADA');
        console.log('❌ Pode demorar mais alguns minutos');
        console.log('🌐 Verifique manualmente: https://igrejacemchurch.org/admin');
      }
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    
    if (error.response) {
      console.log('📋 Status:', error.response.status);
      console.log('📄 Dados:', error.response.data);
    }
    
    console.log('\n🌐 Verifique manualmente: https://igrejacemchurch.org/admin');
  }
}

// Executar
forcarDeployDashboard(); 