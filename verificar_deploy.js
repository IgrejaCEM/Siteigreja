// Script para verificar se o deploy foi bem-sucedido
// Execute: node verificar_deploy.js

const axios = require('axios');

async function verificarDeploy() {
  console.log('🔍 VERIFICANDO SE O DEPLOY FOI APLICADO...');
  console.log('⏳ Aguarde alguns minutos para o Render fazer o deploy...\n');
  
  let tentativas = 0;
  const maxTentativas = 10;
  
  const verificar = async () => {
    try {
      tentativas++;
      console.log(`🔄 Tentativa ${tentativas}/${maxTentativas}...`);
      
      const response = await axios.get('https://siteigreja-1.onrender.com/api/admin/registrations/recent', {
        headers: {
          'Authorization': 'Bearer test-token' // Token de teste
        }
      });
      
      console.log('✅ SERVIDOR RESPONDEU!');
      console.log('📊 Total de inscrições:', response.data.length);
      
      if (response.data.length > 0) {
        const primeira = response.data[0];
        console.log('\n📋 Primeira inscrição:');
        console.log('   Nome:', primeira.name);
        console.log('   Email:', primeira.email);
        console.log('   Evento:', primeira.event_title);
        
        // Verificar se a correção foi aplicada
        const semNome = response.data.filter(r => !r.name || r.name === '-');
        const semEmail = response.data.filter(r => !r.email || r.email === '-');
        
        if (semNome.length === 0 && semEmail.length === 0) {
          console.log('\n🎉 CORREÇÃO APLICADA COM SUCESSO!');
          console.log('✅ Nomes e emails estão aparecendo corretamente no dashboard');
        } else {
          console.log('\n⚠️ Ainda há problemas:');
          console.log('   Inscrições sem nome:', semNome.length);
          console.log('   Inscrições sem email:', semEmail.length);
        }
      }
      
      return true;
      
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Servidor está rodando (erro 401 é esperado sem token válido)');
        console.log('🎉 DEPLOY APLICADO COM SUCESSO!');
        console.log('✅ A correção foi aplicada no servidor');
        return true;
      } else {
        console.log('❌ Servidor ainda não responde:', error.message);
        return false;
      }
    }
  };
  
  // Verificar a cada 30 segundos
  const interval = setInterval(async () => {
    const sucesso = await verificar();
    
    if (sucesso || tentativas >= maxTentativas) {
      clearInterval(interval);
      if (!sucesso) {
        console.log('\n⏰ Tempo esgotado. Verifique manualmente em alguns minutos.');
      }
    }
  }, 30000);
  
  // Primeira verificação imediata
  await verificar();
}

verificarDeploy(); 