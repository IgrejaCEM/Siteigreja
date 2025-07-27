const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:WWiZILOORFMgerRjFMPSJLQrfLGFfviU@shuttle.proxy.rlwy.net:14638/railway',
  ssl: {
    rejectUnauthorized: false
  }
});

async function criarEventoRailway() {
  console.log('🔧 Criando evento no PostgreSQL Railway...');
  
  try {
    // 1. Criar evento
    console.log('\n1️⃣ Criando evento...');
    const eventoResult = await pool.query(`
      INSERT INTO events (title, description, date, location, price, banner, slug, status, has_payment, payment_gateway, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id;
    `, [
      'CONNECT CONF 2025 - INPROVÁVEIS',
      'O maior evento de jovens do ano!',
      '2025-08-15 19:00:00',
      'Igreja CEM - São Paulo',
      50.00,
      'https://via.placeholder.com/1200x400?text=CONNECT+CONF+2025',
      'connect-conf-2025',
      'active',
      true,
      'mercadopago',
      new Date(),
      new Date()
    ]);
    
    const eventoId = eventoResult.rows[0].id;
    console.log('✅ Evento criado com ID:', eventoId);
    
    // 2. Criar lote
    console.log('\n2️⃣ Criando lote...');
    const loteResult = await pool.query(`
      INSERT INTO lots (event_id, name, price, quantity, status, is_free, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id;
    `, [
      eventoId,
      '1º Lote - CONNECT CONF 2025',
      50.00,
      200,
      'active',
      false,
      new Date(),
      new Date()
    ]);
    
    const loteId = loteResult.rows[0].id;
    console.log('✅ Lote criado com ID:', loteId);
    
    // 3. Verificar se foi criado
    console.log('\n3️⃣ Verificando criação...');
    const eventoVerificado = await pool.query('SELECT * FROM events WHERE id = $1', [eventoId]);
    const loteVerificado = await pool.query('SELECT * FROM lots WHERE id = $1', [loteId]);
    
    console.log('✅ Evento verificado:', eventoVerificado.rows[0].title);
    console.log('✅ Lote verificado:', loteVerificado.rows[0].name);
    
    console.log('\n🎉 Evento criado com sucesso!');
    console.log(`📋 ID do Evento: ${eventoId}`);
    console.log(`🎫 ID do Lote: ${loteId}`);
    
  } catch (error) {
    console.error('❌ Erro ao criar evento:', error.message);
  } finally {
    await pool.end();
  }
}

criarEventoRailway(); 