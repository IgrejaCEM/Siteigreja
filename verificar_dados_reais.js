const { db } = require('./backend/src/database/db');

async function verificarDadosReais() {
  try {
    console.log('🔍 VERIFICANDO DADOS REAIS NO BANCO');
    console.log('=====================================');
    
    // 1. Verificar todas as inscrições
    console.log('\n📊 [1/3] Verificando todas as inscrições...');
    
    const todasInscricoes = await db('registrations')
      .select('*')
      .orderBy('created_at', 'desc');
    
    console.log(`📋 Total de inscrições no banco: ${todasInscricoes.length}`);
    
    if (todasInscricoes.length === 0) {
      console.log('❌ Nenhuma inscrição encontrada no banco!');
      return;
    }
    
    // 2. Verificar dados de cada inscrição
    console.log('\n📋 [2/3] Dados de cada inscrição:');
    
    todasInscricoes.forEach((reg, index) => {
      console.log(`\n${index + 1}. ID: ${reg.id}`);
      console.log(`   Nome direto: "${reg.name}"`);
      console.log(`   Email direto: "${reg.email}"`);
      console.log(`   Form_data: ${reg.form_data ? 'SIM' : 'NÃO'}`);
      console.log(`   Status: ${reg.status}`);
      console.log(`   Payment_status: ${reg.payment_status}`);
      console.log(`   Created_at: ${reg.created_at}`);
      
      // Verificar form_data se existir
      if (reg.form_data) {
        try {
          const data = typeof reg.form_data === 'string' ? JSON.parse(reg.form_data) : reg.form_data;
          console.log(`   Form_data nome: "${data.nome || data.name || 'N/A'}"`);
          console.log(`   Form_data email: "${data.email || 'N/A'}"`);
        } catch (e) {
          console.log(`   Form_data: Erro ao parsear`);
        }
      }
    });
    
    // 3. Verificar se há dados válidos
    console.log('\n📈 [3/3] Análise dos dados:');
    
    const comNome = todasInscricoes.filter(r => r.name && r.name.trim() !== '').length;
    const comEmail = todasInscricoes.filter(r => r.email && r.email.trim() !== '').length;
    const comFormData = todasInscricoes.filter(r => r.form_data).length;
    
    console.log(`   Inscrições com nome: ${comNome}/${todasInscricoes.length}`);
    console.log(`   Inscrições com email: ${comEmail}/${todasInscricoes.length}`);
    console.log(`   Inscrições com form_data: ${comFormData}/${todasInscricoes.length}`);
    
    if (comNome === 0 && comEmail === 0) {
      console.log('\n❌ PROBLEMA IDENTIFICADO:');
      console.log('   Nenhuma inscrição tem nome ou email válidos!');
      console.log('   Isso explica por que o dashboard mostra "-"');
      
      // Verificar se há dados no form_data
      if (comFormData > 0) {
        console.log('\n💡 SOLUÇÃO:');
        console.log('   Os dados estão no form_data, mas não estão sendo extraídos corretamente');
        console.log('   Vou corrigir isso...');
        
        // Corrigir os dados
        await corrigirDadosInscricoes(todasInscricoes);
      } else {
        console.log('\n❌ PROBLEMA CRÍTICO:');
        console.log('   Não há dados válidos em nenhum lugar!');
        console.log('   As inscrições foram criadas sem nome/email');
      }
    } else {
      console.log('\n✅ DADOS VÁLIDOS ENCONTRADOS');
      console.log('   O problema pode estar na API ou no frontend');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    process.exit(0);
  }
}

async function corrigirDadosInscricoes(inscricoes) {
  console.log('\n🔧 CORRIGINDO DADOS DAS INSCRIÇÕES...');
  
  let corrigidas = 0;
  
  for (const reg of inscricoes) {
    if (reg.form_data) {
      try {
        const data = typeof reg.form_data === 'string' ? JSON.parse(reg.form_data) : reg.form_data;
        const nome = data.nome || data.name || data.participantes?.[0]?.name;
        const email = data.email || data.participantes?.[0]?.email;
        
        if (nome || email) {
          await db('registrations')
            .where('id', reg.id)
            .update({
              name: nome || reg.name || 'Nome não informado',
              email: email || reg.email || 'email@nao.informado',
              updated_at: new Date()
            });
          
          corrigidas++;
          console.log(`   ✅ Corrigida inscrição ${reg.id}: ${nome} (${email})`);
        }
      } catch (e) {
        console.log(`   ❌ Erro ao corrigir inscrição ${reg.id}:`, e.message);
      }
    }
  }
  
  console.log(`\n🎉 CORREÇÃO CONCLUÍDA: ${corrigidas} inscrições corrigidas`);
  console.log('🌐 Agora teste o dashboard novamente');
}

// Executar verificação
verificarDadosReais(); 