const axios = require('axios');

async function verificarDeployDashboard() {
  console.log('🔍 VERIFICANDO DEPLOY DA CORREÇÃO DO DASHBOARD');
  console.log('================================================');
  console.log('⏳ Aguarde alguns minutos para o Render fazer o deploy...\n');
  
  let tentativas = 0;
  const maxTentativas = 15;
  
  const verificar = async () => {
    try {
      tentativas++;
      console.log(`🔄 Tentativa ${tentativas}/${maxTentativas}...`);
      
      const response = await axios.get('https://siteigreja-1.onrender.com/api/admin/registrations/recent', {
        headers: {
          'Authorization': 'Bearer test-token'
        },
        timeout: 10000
      });
      
      console.log('✅ SERVIDOR RESPONDEU!');
      console.log('📊 Total de inscrições:', response.data.length);
      
      if (response.data.length > 0) {
        const primeira = response.data[0];
        console.log('\n📋 Primeira inscrição:');
        console.log('   ID:', primeira.id);
        console.log('   Nome:', primeira.name);
        console.log('   Email:', primeira.email);
        console.log('   Evento:', primeira.event_title);
        console.log('   Status:', primeira.status);
        
        // Verificar se nome e email estão preenchidos
        const nomeOk = primeira.name && primeira.name !== '-';
        const emailOk = primeira.email && primeira.email !== '-';
        
        if (nomeOk && emailOk) {
          console.log('\n🎉 CORREÇÃO APLICADA COM SUCESSO!');
          console.log('✅ Nome e email estão sendo exibidos corretamente');
          console.log('✅ Dashboard deve mostrar os dados agora');
          return true;
        } else {
          console.log('\n⚠️ CORREÇÃO AINDA NÃO APLICADA');
          console.log('❌ Nome ou email ainda estão vazios');
          console.log('⏳ Aguardando deploy...');
          return false;
        }
      } else {
        console.log('📭 Nenhuma inscrição encontrada para testar');
        return false;
      }
      
    } catch (error) {
      console.log(`❌ Erro na tentativa ${tentativas}:`, error.message);
      return false;
    }
  };
  
  // Tentar até maxTentativas ou até funcionar
  while (tentativas < maxTentativas) {
    const sucesso = await verificar();
    if (sucesso) {
      console.log('\n🎯 DEPLOY VERIFICADO COM SUCESSO!');
      console.log('✅ A correção foi aplicada no servidor');
      console.log('🌐 Acesse: https://igrejacemchurch.org/admin');
      console.log('📊 Verifique se os nomes e emails aparecem no dashboard');
      break;
    }
    
    if (tentativas < maxTentativas) {
      console.log(`⏳ Aguardando 30 segundos antes da próxima tentativa...`);
      await new Promise(resolve => setTimeout(resolve, 30000));
    }
  }
  
  if (tentativas >= maxTentativas) {
    console.log('\n⏰ TEMPO ESGOTADO');
    console.log('⚠️ O deploy pode estar demorando mais do que esperado');
    console.log('🌐 Verifique manualmente: https://igrejacemchurch.org/admin');
  }
}

// Executar verificação
verificarDeployDashboard(); 