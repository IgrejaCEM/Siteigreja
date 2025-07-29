const { db } = require('./src/database/db');

async function verificarPersistencia() {
  try {
    console.log('🔍 VERIFICANDO PERSISTÊNCIA DOS DADOS...');
    
    // Verificar eventos
    const eventos = await db('events').select('*');
    console.log('📋 Eventos encontrados:', eventos.length);
    eventos.forEach(evento => {
      console.log(`   - ID: ${evento.id} | Título: ${evento.title} | Criado: ${evento.created_at}`);
    });
    
    // Verificar inscrições
    const inscricoes = await db('registrations').select('*');
    console.log('👥 Inscrições encontradas:', inscricoes.length);
    inscricoes.forEach(inscricao => {
      console.log(`   - ID: ${inscricao.id} | Nome: ${inscricao.name} | Evento: ${inscricao.event_id}`);
    });
    
    // Verificar lotes
    const lotes = await db('lots').select('*');
    console.log('🎫 Lotes encontrados:', lotes.length);
    lotes.forEach(lote => {
      console.log(`   - ID: ${lote.id} | Nome: ${lote.name} | Evento: ${lote.event_id} | Preço: R$ ${lote.price}`);
    });
    
    // Verificar pagamentos
    const pagamentos = await db('payments').select('*');
    console.log('💳 Pagamentos encontrados:', pagamentos.length);
    pagamentos.forEach(pagamento => {
      console.log(`   - ID: ${pagamento.id} | Status: ${pagamento.status} | Valor: R$ ${pagamento.amount}`);
    });
    
    console.log('\n✅ DADOS PERSISTENTES CONFIRMADOS!');
    console.log('📊 Resumo:');
    console.log(`   - Eventos: ${eventos.length}`);
    console.log(`   - Inscrições: ${inscricoes.length}`);
    console.log(`   - Lotes: ${lotes.length}`);
    console.log(`   - Pagamentos: ${pagamentos.length}`);
    
  } catch (error) {
    console.error('❌ Erro ao verificar persistência:', error);
  } finally {
    process.exit();
  }
}

verificarPersistencia(); 