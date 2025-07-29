const { db } = require('./src/database/db');

async function limparDadosAntigos() {
  try {
    console.log('🧹 Limpando dados antigos...');
    
    // 1. Verificar inscrições órfãs (sem evento)
    console.log('📡 [1/4] Verificando inscrições órfãs...');
    const inscricoesOrfas = await db('registrations')
      .leftJoin('events', 'registrations.event_id', 'events.id')
      .whereNull('events.id')
      .select('registrations.*');
    
    console.log(`📋 Inscrições órfãs encontradas: ${inscricoesOrfas.length}`);
    inscricoesOrfas.forEach(inscricao => {
      console.log(`   - ID: ${inscricao.id} | ${inscricao.name} | Event ID: ${inscricao.event_id}`);
    });
    
    // 2. Remover inscrições órfãs
    if (inscricoesOrfas.length > 0) {
      const inscricoesRemovidas = await db('registrations')
        .whereIn('event_id', inscricoesOrfas.map(i => i.event_id))
        .del();
      
      console.log('🗑️ Inscrições órfãs removidas:', inscricoesRemovidas);
    }
    
    // 3. Verificar lotes órfãos
    console.log('📡 [2/4] Verificando lotes órfãos...');
    const lotesOrfaos = await db('lots')
      .leftJoin('events', 'lots.event_id', 'events.id')
      .whereNull('events.id')
      .select('lots.*');
    
    console.log(`📋 Lotes órfãos encontrados: ${lotesOrfaos.length}`);
    lotesOrfaos.forEach(lote => {
      console.log(`   - ID: ${lote.id} | ${lote.name} | Event ID: ${lote.event_id}`);
    });
    
    // 4. Remover lotes órfãos
    if (lotesOrfaos.length > 0) {
      const lotesRemovidos = await db('lots')
        .whereIn('event_id', lotesOrfaos.map(l => l.event_id))
        .del();
      
      console.log('🗑️ Lotes órfãos removidos:', lotesRemovidos);
    }
    
    // 5. Verificar produtos órfãos
    console.log('📡 [3/4] Verificando produtos órfãos...');
    const produtosOrfaos = await db('event_products')
      .leftJoin('events', 'event_products.event_id', 'events.id')
      .whereNull('events.id')
      .select('event_products.*');
    
    console.log(`📋 Produtos órfãos encontrados: ${produtosOrfaos.length}`);
    produtosOrfaos.forEach(produto => {
      console.log(`   - ID: ${produto.id} | ${produto.name} | Event ID: ${produto.event_id}`);
    });
    
    // 6. Remover produtos órfãos
    if (produtosOrfaos.length > 0) {
      const produtosRemovidos = await db('event_products')
        .whereIn('event_id', produtosOrfaos.map(p => p.event_id))
        .del();
      
      console.log('🗑️ Produtos órfãos removidos:', produtosRemovidos);
    }
    
    // 7. Verificar estado final
    console.log('📡 [4/4] Verificando estado final...');
    const eventos = await db('events').select('*');
    const inscricoes = await db('registrations').select('*');
    const lotes = await db('lots').select('*');
    const produtos = await db('event_products').select('*');
    
    console.log('📊 Estado final:');
    console.log(`   - Eventos: ${eventos.length}`);
    console.log(`   - Inscrições: ${inscricoes.length}`);
    console.log(`   - Lotes: ${lotes.length}`);
    console.log(`   - Produtos: ${produtos.length}`);
    
    if (eventos.length === 0) {
      console.log('✅ Banco limpo! Pronto para criar seu evento real.');
    } else {
      console.log('📋 Eventos existentes:');
      eventos.forEach(evento => {
        console.log(`   - ID: ${evento.id} | ${evento.title}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro ao limpar dados:', error);
  } finally {
    process.exit(0);
  }
}

limparDadosAntigos(); 