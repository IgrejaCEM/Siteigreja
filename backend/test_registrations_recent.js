const axios = require('axios');

async function testRegistrationsRecent() {
  try {
    console.log('🧪 Testando rota /registrations/recent...');
    
    // URL de produção do Render
    const response = await axios.get('https://siteigreja-1.onrender.com/api/admin/registrations/recent');
    
    console.log('✅ Sucesso! Dados retornados:');
    console.log('📊 Total de inscrições:', response.data.length);
    
    if (response.data.length > 0) {
      console.log('\n📋 Primeira inscrição:');
      console.log('   Nome:', response.data[0].name);
      console.log('   Email:', response.data[0].email);
      console.log('   Evento:', response.data[0].event_title);
      console.log('   Status:', response.data[0].status);
    }
    
    // Verificar se todos têm nome e email
    const semNome = response.data.filter(r => !r.name || r.name === '-');
    const semEmail = response.data.filter(r => !r.email || r.email === '-');
    
    console.log('\n🔍 Verificação:');
    console.log('   Inscrições sem nome:', semNome.length);
    console.log('   Inscrições sem email:', semEmail.length);
    
    if (semNome.length > 0) {
      console.log('   ❌ Problema: Inscrições sem nome encontradas');
      console.log('   Exemplos de inscrições sem nome:');
      semNome.slice(0, 3).forEach((r, i) => {
        console.log(`     ${i+1}. ID: ${r.id}, Nome: "${r.name}", Email: "${r.email}"`);
      });
    } else {
      console.log('   ✅ Todos têm nome');
    }
    
    if (semEmail.length > 0) {
      console.log('   ❌ Problema: Inscrições sem email encontradas');
      console.log('   Exemplos de inscrições sem email:');
      semEmail.slice(0, 3).forEach((r, i) => {
        console.log(`     ${i+1}. ID: ${r.id}, Nome: "${r.name}", Email: "${r.email}"`);
      });
    } else {
      console.log('   ✅ Todos têm email');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Dados:', error.response.data);
    }
  }
}

testRegistrationsRecent(); 