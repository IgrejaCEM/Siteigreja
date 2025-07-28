const axios = require('axios');

console.log('🧪 TESTE API - INSCRIÇÕES');
console.log('==========================');

async function testeApiInscricoes() {
  try {
    console.log('📋 Testando API de inscrições...');
    
    const response = await axios.get('https://siteigreja-1.onrender.com/api/admin/registrations', {
      timeout: 10000
    });
    
    console.log('✅ API respondendo!');
    console.log(`📊 Status: ${response.status}`);
    console.log(`📊 Total de inscrições: ${response.data.length}`);
    
    if (response.data.length > 0) {
      console.log('\n📋 Primeira inscrição:');
      const inscricao = response.data[0];
      console.log(`   ID: ${inscricao.id}`);
      console.log(`   Nome: ${inscricao.name || 'NULO'}`);
      console.log(`   Email: ${inscricao.email || 'NULO'}`);
      console.log(`   Telefone: ${inscricao.phone || 'NULO'}`);
      console.log(`   Status: ${inscricao.status || 'NULO'}`);
      console.log(`   Evento: ${inscricao.event_title || 'NULO'}`);
      console.log(`   Lote: ${inscricao.lot_name || 'NULO'}`);
      
      if (inscricao.form_data) {
        console.log(`   Form Data: ${inscricao.form_data.substring(0, 100)}...`);
      }
    }
    
    console.log('\n🎯 RESULTADO:');
    if (response.data.length > 0) {
      console.log('✅ Inscrições encontradas na API');
      console.log('✅ Dados estão sendo retornados');
      console.log('💡 Se não aparecer no dashboard, é problema no frontend');
    } else {
      console.log('❌ Nenhuma inscrição encontrada na API');
      console.log('💡 Verifique se a inscrição foi salva corretamente');
    }
    
  } catch (error) {
    console.error('❌ Erro na API:', error.response?.data || error.message);
    console.error('📊 Status:', error.response?.status);
  }
}

testeApiInscricoes(); 