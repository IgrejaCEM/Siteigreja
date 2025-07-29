const { db } = require('./src/database/db');

async function verificarEventos() {
  try {
    console.log('🔍 Verificando eventos no banco de dados...');
    
    const eventos = await db('events').select('*');
    
    console.log(`📋 Total de eventos: ${eventos.length}`);
    
    if (eventos.length === 0) {
      console.log('✅ Nenhum evento encontrado no banco');
    } else {
      console.log('\n📋 Lista de eventos:');
      eventos.forEach((evento, index) => {
        console.log(`${index + 1}. ID: ${evento.id}`);
        console.log(`   Título: ${evento.title}`);
        console.log(`   Data: ${evento.date}`);
        console.log(`   Status: ${evento.status}`);
        console.log(`   Slug: ${evento.slug}`);
        console.log('   ---');
      });
    }
    
    // Verificar se há eventos com "TESTE" no título
    const eventosTeste = await db('events')
      .where('title', 'like', '%TESTE%')
      .orWhere('title', 'like', '%teste%')
      .select('*');
    
    console.log(`\n🧪 Eventos com "TESTE" no título: ${eventosTeste.length}`);
    eventosTeste.forEach(evento => {
      console.log(`   - ID: ${evento.id} | ${evento.title}`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao verificar eventos:', error);
  } finally {
    process.exit(0);
  }
}

verificarEventos(); 