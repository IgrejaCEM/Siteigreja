const { db } = require('./src/database/db');

async function removerEventoId6() {
  try {
    console.log('🗑️ Removendo evento ID 6...');
    
    // Verificar se o evento existe
    const evento = await db('events').where('id', 6).first();
    
    if (evento) {
      console.log('📋 Evento encontrado:', evento.title);
      
      // Remover inscrições relacionadas
      const inscricoesRemovidas = await db('registrations')
        .where('event_id', 6)
        .del();
      
      console.log('🗑️ Inscrições removidas:', inscricoesRemovidas);
      
      // Remover lotes relacionados
      const lotesRemovidos = await db('lots')
        .where('event_id', 6)
        .del();
      
      console.log('🗑️ Lotes removidos:', lotesRemovidos);
      
      // Remover produtos relacionados
      const produtosRemovidos = await db('event_products')
        .where('event_id', 6)
        .del();
      
      console.log('🗑️ Produtos removidos:', produtosRemovidos);
      
      // Remover o evento
      const eventoRemovido = await db('events')
        .where('id', 6)
        .del();
      
      console.log('🗑️ Evento removido:', eventoRemovido);
      
      console.log('✅ Evento ID 6 removido com sucesso!');
    } else {
      console.log('ℹ️ Evento ID 6 não encontrado');
    }
    
    // Listar eventos restantes
    const eventosRestantes = await db('events').select('id', 'title', 'date');
    console.log('\n📋 Eventos restantes:');
    eventosRestantes.forEach(evento => {
      console.log(`   - ID: ${evento.id} | ${evento.title} | ${evento.date}`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao remover evento ID 6:', error);
  } finally {
    process.exit(0);
  }
}

removerEventoId6(); 