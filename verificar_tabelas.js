const { db } = require('./backend/src/database/db');

async function verificarTabelas() {
  console.log('🔍 Verificando estrutura do banco de dados...');

  try {
    // Lista de tabelas que devem existir
    const tabelasEsperadas = [
      'users',
      'events', 
      'lots',
      'registrations',
      'settings',
      'tickets',
      'checkin_logs'
    ];

    console.log('\n1️⃣ Verificando existência das tabelas...');
    
    for (const tabela of tabelasEsperadas) {
      try {
        const exists = await db.schema.hasTable(tabela);
        console.log(`   ${tabela}: ${exists ? '✅ Existe' : '❌ Não existe'}`);
        
        if (exists) {
          // Verificar estrutura da tabela
          const columns = await db.raw(`PRAGMA table_info(${tabela})`);
          console.log(`   ${tabela} - Colunas:`);
          columns.forEach(col => {
            console.log(`     - ${col.name} (${col.type})`);
          });
          
          // Contar registros
          const count = await db(tabela).count('* as total');
          console.log(`   ${tabela} - Registros: ${count[0].total}`);
        }
      } catch (error) {
        console.log(`   ${tabela}: ❌ Erro - ${error.message}`);
      }
    }

    console.log('\n2️⃣ Testando queries específicas...');
    
    // Teste 1: Verificar se registrations tem dados
    try {
      const registrations = await db('registrations').select('*').limit(5);
      console.log(`   registrations: ${registrations.length} registros encontrados`);
      if (registrations.length > 0) {
        console.log('   Primeiro registro:', registrations[0]);
      }
    } catch (error) {
      console.log(`   registrations: ❌ Erro - ${error.message}`);
    }

    // Teste 2: Verificar se events tem dados
    try {
      const events = await db('events').select('*');
      console.log(`   events: ${events.length} eventos encontrados`);
      if (events.length > 0) {
        console.log('   Primeiro evento:', events[0].title);
      }
    } catch (error) {
      console.log(`   events: ❌ Erro - ${error.message}`);
    }

    // Teste 3: Verificar se lots tem dados
    try {
      const lots = await db('lots').select('*');
      console.log(`   lots: ${lots.length} lotes encontrados`);
    } catch (error) {
      console.log(`   lots: ❌ Erro - ${error.message}`);
    }

    // Teste 4: Verificar se users tem dados
    try {
      const users = await db('users').select('*');
      console.log(`   users: ${users.length} usuários encontrados`);
      if (users.length > 0) {
        console.log('   Usuários:', users.map(u => `${u.name} (${u.email})`));
      }
    } catch (error) {
      console.log(`   users: ❌ Erro - ${error.message}`);
    }

    console.log('\n3️⃣ Testando query de participantes...');
    try {
      const participants = await db('registrations')
        .leftJoin('events', 'registrations.event_id', 'events.id')
        .select(
          'registrations.name',
          'registrations.email',
          'registrations.phone',
          db.raw('MIN(registrations.created_at) as created_at'),
          db.raw('COUNT(registrations.event_id) as events_count'),
          db.raw("GROUP_CONCAT(events.title, '; ') as events_titles"),
          db.raw('MAX(registrations.payment_status) as last_status')
        )
        .groupBy('registrations.name', 'registrations.email', 'registrations.phone')
        .orderBy('created_at', 'desc');

      console.log(`   Query participantes: ${participants.length} participantes encontrados`);
      if (participants.length > 0) {
        console.log('   Primeiro participante:', participants[0]);
      }
    } catch (error) {
      console.log(`   Query participantes: ❌ Erro - ${error.message}`);
    }

    console.log('\n4️⃣ Verificando tabelas que podem estar faltando...');
    
    // Verificar se tabelas opcionais existem
    const tabelasOpcionais = ['tickets', 'checkin_logs'];
    
    for (const tabela of tabelasOpcionais) {
      try {
        const exists = await db.schema.hasTable(tabela);
        console.log(`   ${tabela}: ${exists ? '✅ Existe' : '⚠️ Não existe (opcional)'}`);
      } catch (error) {
        console.log(`   ${tabela}: ❌ Erro - ${error.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  } finally {
    await db.destroy();
    console.log('\n🔚 Conexão com banco fechada.');
  }
}

verificarTabelas(); 