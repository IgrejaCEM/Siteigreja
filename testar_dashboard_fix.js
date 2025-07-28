const axios = require('axios');

async function testarDashboardFix() {
  try {
    console.log('🧪 TESTANDO CORREÇÃO DO DASHBOARD');
    console.log('====================================');
    
    // URL de produção
    const baseUrl = 'https://siteigreja-1.onrender.com/api';
    
    console.log('📡 Testando rota /registrations/recent...');
    
    const response = await axios.get(`${baseUrl}/admin/registrations/recent`, {
      headers: {
        'Authorization': 'Bearer test-token'
      }
    });
    
    console.log('✅ Resposta recebida!');
    console.log('📊 Total de inscrições:', response.data.length);
    
    if (response.data.length > 0) {
      console.log('\n📋 Primeira inscrição:');
      const primeira = response.data[0];
      console.log('   ID:', primeira.id);
      console.log('   Nome:', primeira.name);
      console.log('   Email:', primeira.email);
      console.log('   Evento:', primeira.event_title);
      console.log('   Status:', primeira.status);
      console.log('   Data:', primeira.created_at);
      
      // Verificar se nome e email estão preenchidos
      if (primeira.name && primeira.name !== '-') {
        console.log('✅ NOME: CORRETO -', primeira.name);
      } else {
        console.log('❌ NOME: VAZIO -', primeira.name);
      }
      
      if (primeira.email && primeira.email !== '-') {
        console.log('✅ EMAIL: CORRETO -', primeira.email);
      } else {
        console.log('❌ EMAIL: VAZIO -', primeira.email);
      }
      
      // Verificar todas as inscrições
      console.log('\n📊 Verificando todas as inscrições:');
      response.data.forEach((reg, index) => {
        const nomeOk = reg.name && reg.name !== '-';
        const emailOk = reg.email && reg.email !== '-';
        
        console.log(`   ${index + 1}. ID ${reg.id}: ${nomeOk ? '✅' : '❌'} Nome: ${reg.name} | ${emailOk ? '✅' : '❌'} Email: ${reg.email}`);
      });
      
      // Estatísticas
      const comNome = response.data.filter(r => r.name && r.name !== '-').length;
      const comEmail = response.data.filter(r => r.email && r.email !== '-').length;
      
      console.log('\n📈 ESTATÍSTICAS:');
      console.log(`   Total de inscrições: ${response.data.length}`);
      console.log(`   Com nome: ${comNome}/${response.data.length} (${Math.round(comNome/response.data.length*100)}%)`);
      console.log(`   Com email: ${comEmail}/${response.data.length} (${Math.round(comEmail/response.data.length*100)}%)`);
      
      if (comNome === response.data.length && comEmail === response.data.length) {
        console.log('\n🎉 CORREÇÃO FUNCIONANDO PERFEITAMENTE!');
        console.log('✅ Todos os nomes e emails estão sendo exibidos corretamente');
      } else {
        console.log('\n⚠️ CORREÇÃO PARCIAL OU NÃO APLICADA');
        console.log('❌ Alguns nomes/emails ainda estão vazios');
      }
      
    } else {
      console.log('📭 Nenhuma inscrição encontrada');
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    
    if (error.response) {
      console.log('📋 Status:', error.response.status);
      console.log('📄 Dados:', error.response.data);
    }
  }
}

// Executar teste
testarDashboardFix(); 