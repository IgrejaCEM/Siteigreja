const { db } = require('./src/database/db');

console.log('🔍 DEBUG - DADOS DAS INSCRIÇÕES');
console.log('=================================');

async function debugInscricoes() {
  try {
    console.log('📋 Buscando inscrições...');
    
    const registrations = await db('registrations')
      .select('*')
      .orderBy('created_at', 'desc')
      .limit(5);
    
    console.log(`📊 Encontradas ${registrations.length} inscrições`);
    
    registrations.forEach((reg, index) => {
      console.log(`\n📋 Inscrição ${index + 1}:`);
      console.log(`   ID: ${reg.id}`);
      console.log(`   Nome direto: ${reg.name || 'NULO'}`);
      console.log(`   Email direto: ${reg.email || 'NULO'}`);
      console.log(`   Telefone: ${reg.phone || 'NULO'}`);
      console.log(`   Status: ${reg.status || 'NULO'}`);
      console.log(`   Payment Status: ${reg.payment_status || 'NULO'}`);
      console.log(`   Event ID: ${reg.event_id || 'NULO'}`);
      console.log(`   Lot ID: ${reg.lot_id || 'NULO'}`);
      
      // Verificar form_data
      if (reg.form_data) {
        console.log(`   Form Data (raw): ${reg.form_data.substring(0, 100)}...`);
        
        try {
          const formData = typeof reg.form_data === 'string' ? JSON.parse(reg.form_data) : reg.form_data;
          console.log(`   Form Data (parsed):`, formData);
          
          // Extrair nome e email do form_data
          const nome = formData.nome || formData.name || formData.participantes?.[0]?.name || 'NÃO ENCONTRADO';
          const email = formData.email || formData.participantes?.[0]?.email || 'NÃO ENCONTRADO';
          
          console.log(`   Nome extraído: ${nome}`);
          console.log(`   Email extraído: ${email}`);
          
        } catch (parseError) {
          console.log(`   ❌ Erro ao fazer parse do form_data: ${parseError.message}`);
        }
      } else {
        console.log(`   Form Data: NULO`);
      }
      
      console.log(`   Created At: ${reg.created_at}`);
    });
    
    console.log('\n🎯 ANÁLISE:');
    console.log('✅ Verificando se os dados estão sendo salvos corretamente');
    console.log('✅ Verificando se o form_data contém nome e email');
    console.log('✅ Verificando se a extração está funcionando');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

debugInscricoes(); 