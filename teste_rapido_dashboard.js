const axios = require('axios');

async function testeRapidoDashboard() {
  try {
    console.log('🧪 TESTE RÁPIDO - CORREÇÃO DO DASHBOARD');
    console.log('==========================================');
    
    console.log('📡 Testando API...');
    
    const response = await axios.get('https://siteigreja-1.onrender.com/api/admin/registrations/recent', {
      headers: {
        'Authorization': 'Bearer test-token'
      },
      timeout: 10000
    });
    
    console.log('✅ API respondeu!');
    console.log('📊 Total de inscrições:', response.data.length);
    
    if (response.data.length > 0) {
      console.log('\n📋 Dados das inscrições:');
      
      response.data.forEach((reg, index) => {
        console.log(`\n${index + 1}. ID: ${reg.id}`);
        console.log(`   Nome: "${reg.name}"`);
        console.log(`   Email: "${reg.email}"`);
        console.log(`   Evento: ${reg.event_title}`);
        console.log(`   Status: ${reg.status}`);
        
        const nomeOk = reg.name && reg.name !== '-';
        const emailOk = reg.email && reg.email !== '-';
        
        console.log(`   Nome OK: ${nomeOk ? '✅' : '❌'}`);
        console.log(`   Email OK: ${emailOk ? '✅' : '❌'}`);
      });
      
      // Verificar se algum tem nome/email
      const comNome = response.data.filter(r => r.name && r.name !== '-').length;
      const comEmail = response.data.filter(r => r.email && r.email !== '-').length;
      
      console.log('\n📈 ESTATÍSTICAS:');
      console.log(`   Total: ${response.data.length}`);
      console.log(`   Com nome: ${comNome}`);
      console.log(`   Com email: ${comEmail}`);
      
      if (comNome > 0 || comEmail > 0) {
        console.log('\n🎉 CORREÇÃO FUNCIONANDO!');
        console.log('✅ Alguns nomes/emails estão aparecendo');
      } else {
        console.log('\n❌ CORREÇÃO AINDA NÃO APLICADA');
        console.log('⚠️ Todos os nomes/emails ainda estão vazios');
      }
      
    } else {
      console.log('📭 Nenhuma inscrição encontrada');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testeRapidoDashboard(); 