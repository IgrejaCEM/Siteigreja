const { db } = require('./src/database/db');

console.log('🔍 Verificando todos os eventos no banco...');

async function verificarTodosEventos() {
  try {
    console.log('📋 Buscando todos os eventos...');
    const events = await db('events').select('*').orderBy('id', 'asc');
    console.log(`📊 Total de eventos no banco: ${events.length}`);
    
    events.forEach((event, index) => {
      console.log(`${index + 1}. ID: ${event.id} | Título: ${event.title} | Status: ${event.status}`);
    });
    
    console.log('\n📋 Verificando eventos ativos...');
    const activeEvents = await db('events').where('status', 'active').select('*');
    console.log(`📊 Eventos ativos: ${activeEvents.length}`);
    
    activeEvents.forEach((event, index) => {
      console.log(`${index + 1}. ID: ${event.id} | Título: ${event.title}`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao verificar eventos:', error);
  } finally {
    process.exit(0);
  }
}

verificarTodosEventos(); 