const { db } = require('./backend/src/database/db');

async function testarQueries() {
  console.log('🔍 Testando queries que estão falhando...');
  
  try {
    // Teste 1: Verificar se as tabelas existem
    console.log('\n1️⃣ Verificando tabelas...');
    const tables = ['users', 'events', 'lots', 'registrations', 'settings'];
    
    for (const table of tables) {
      try {
        const exists = await db.schema.hasTable(table);
        console.log(`   ${table}: ${exists ? '✅ Existe' : '❌ Não existe'}`);
        
        if (exists) {
          const count = await db(table).count('* as total');
          console.log(`   ${table}: ${count[0].total} registros`);
        }
      } catch (error) {
        console.log(`   ${table}: ❌ Erro - ${error.message}`);
      }
    }
    
    // Teste 2: Query de eventos (simples)
    console.log('\n2️⃣ Testando query de eventos...');
    try {
      const events = await db('events').select('*').orderBy('created_at', 'desc');
      console.log('✅ Query eventos OK:', events.length, 'eventos');
    } catch (error) {
      console.log('❌ Query eventos FALHOU:', error.message);
    }
    
    // Teste 3: Query de inscrições recentes (complexa)
    console.log('\n3️⃣ Testando query de inscrições recentes...');
    try {
      const registrations = await db('registrations')
        .join('events', 'registrations.event_id', 'events.id')
        .join('lots', 'registrations.lot_id', 'lots.id')
        .leftJoin('users', 'registrations.user_id', 'users.id')
        .select(
          'registrations.id',
          'registrations.name as reg_name',
          'registrations.email as reg_email',
          'registrations.form_data',
          'users.name as user_name',
          'users.email as user_email',
          'events.title as event_title',
          'lots.name as lot_name',
          'registrations.payment_status as status',
          'registrations.created_at'
        )
        .orderBy('registrations.created_at', 'desc')
        .limit(5);
      
      console.log('✅ Query inscrições recentes OK:', registrations.length, 'registros');
    } catch (error) {
      console.log('❌ Query inscrições recentes FALHOU:', error.message);
      
      // Teste mais simples
      console.log('\n   Tentando query mais simples...');
      try {
        const simpleRegs = await db('registrations').select('*').limit(5);
        console.log('✅ Query simples OK:', simpleRegs.length, 'registros');
      } catch (error2) {
        console.log('❌ Query simples também FALHOU:', error2.message);
      }
    }
    
    // Teste 4: Query de estatísticas
    console.log('\n4️⃣ Testando query de estatísticas...');
    try {
      const totalEvents = await db('events').count('* as total');
      const activeEvents = await db('events').where('status', 'active').count('* as total');
      const totalParticipants = await db('registrations').countDistinct('user_id as total');
      
      console.log('✅ Query estatísticas OK:');
      console.log(`   Total eventos: ${totalEvents[0].total}`);
      console.log(`   Eventos ativos: ${activeEvents[0].total}`);
      console.log(`   Total participantes: ${totalParticipants[0].total}`);
    } catch (error) {
      console.log('❌ Query estatísticas FALHOU:', error.message);
    }
    
    // Teste 5: Verificar estrutura das tabelas
    console.log('\n5️⃣ Verificando estrutura das tabelas...');
    try {
      const registrationsColumns = await db.raw("PRAGMA table_info(registrations)");
      console.log('✅ Colunas da tabela registrations:');
      registrationsColumns.forEach(col => {
        console.log(`   - ${col.name} (${col.type})`);
      });
    } catch (error) {
      console.log('❌ Erro ao verificar estrutura:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  } finally {
    await db.destroy();
    console.log('\n🔚 Conexão com banco fechada.');
  }
}

testarQueries(); 