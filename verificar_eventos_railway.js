const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:WWiZILOORFMgerRjFMPSJLQrfLGFfviU@shuttle.proxy.rlwy.net:14638/railway',
  ssl: {
    rejectUnauthorized: false
  }
});

async function verificarEventos() {
  console.log('🔍 Verificando eventos no PostgreSQL Railway...');
  
  try {
    // Verificar eventos
    const eventos = await pool.query('SELECT id, title, status FROM events ORDER BY id;');
    console.log('\n📋 Eventos encontrados:');
    eventos.rows.forEach(evento => {
      console.log(`   ID: ${evento.id} - ${evento.title} (${evento.status})`);
    });
    
    // Verificar lotes
    const lotes = await pool.query('SELECT id, event_id, name, price, quantity FROM lots ORDER BY event_id, id;');
    console.log('\n🎫 Lotes encontrados:');
    lotes.rows.forEach(lote => {
      console.log(`   ID: ${lote.id} - Evento: ${lote.event_id} - ${lote.name} - R$ ${lote.price} - Qtd: ${lote.quantity}`);
    });
    
    // Verificar inscrições
    const inscricoes = await pool.query('SELECT id, event_id, name, email FROM registrations ORDER BY created_at DESC LIMIT 5;');
    console.log('\n👥 Últimas inscrições:');
    inscricoes.rows.forEach(inscricao => {
      console.log(`   ID: ${inscricao.id} - Evento: ${inscricao.event_id} - ${inscricao.name} (${inscricao.email})`);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await pool.end();
  }
}

verificarEventos(); 