const { db } = require('./src/database/db');

async function removerEventoTeste() {
  try {
    console.log('🗑️ Removendo evento de teste...');
    
    // Buscar evento de teste
    const eventoTeste = await db('events')
      .where('title', 'like', '%TESTE%')
      .orWhere('title', 'like', '%teste%')
      .orWhere('title', 'like', '%EVENTO TESTE%')
      .first();
    
    if (eventoTeste) {
      console.log('📋 Evento encontrado:', eventoTeste.title);
      
      // Remover inscrições relacionadas
      const inscricoesRemovidas = await db('registrations')
        .where('event_id', eventoTeste.id)
        .del();
      
      console.log('🗑️ Inscrições removidas:', inscricoesRemovidas);
      
      // Remover lotes relacionados
      const lotesRemovidos = await db('lots')
        .where('event_id', eventoTeste.id)
        .del();
      
      console.log('🗑️ Lotes removidos:', lotesRemovidos);
      
      // Remover produtos relacionados
      const produtosRemovidos = await db('event_products')
        .where('event_id', eventoTeste.id)
        .del();
      
      console.log('🗑️ Produtos removidos:', produtosRemovidos);
      
      // Remover pagamentos relacionados (se a tabela existir)
      try {
        const pagamentosRemovidos = await db('payments')
          .where('event_id', eventoTeste.id)
          .del();
        console.log('🗑️ Pagamentos removidos:', pagamentosRemovidos);
      } catch (error) {
        console.log('ℹ️ Tabela payments não encontrada ou sem event_id');
      }
      
      // Remover o evento
      const eventoRemovido = await db('events')
        .where('id', eventoTeste.id)
        .del();
      
      console.log('🗑️ Evento removido:', eventoRemovido);
      
      console.log('✅ Evento de teste removido com sucesso!');
    } else {
      console.log('ℹ️ Nenhum evento de teste encontrado');
    }
    
    // Listar eventos restantes
    const eventosRestantes = await db('events').select('id', 'title', 'date');
    console.log('\n📋 Eventos restantes:');
    eventosRestantes.forEach(evento => {
      console.log(`   - ID: ${evento.id} | ${evento.title} | ${evento.date}`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao remover evento de teste:', error);
  } finally {
    process.exit(0);
  }
}

removerEventoTeste(); 