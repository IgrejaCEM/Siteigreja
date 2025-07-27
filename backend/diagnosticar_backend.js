const { db } = require('./src/database/db');

async function diagnosticarBackend() {
  console.log('🔍 Iniciando diagnóstico do backend...');
  
  try {
    // 1. Verificar se o banco está acessível
    console.log('\n1️⃣ Testando conexão com banco de dados...');
    await db.raw('SELECT 1');
    console.log('✅ Conexão com banco OK');
    
    // 2. Verificar tabelas existentes
    console.log('\n2️⃣ Verificando tabelas...');
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
        console.log(`   ${table}: ❌ Erro ao verificar - ${error.message}`);
      }
    }
    
    // 3. Verificar usuário admin
    console.log('\n3️⃣ Verificando usuário admin...');
    const admin = await db('users').where('email', 'admin@admin.com').first();
    if (admin) {
      console.log('✅ Usuário admin encontrado');
      console.log(`   ID: ${admin.id}`);
      console.log(`   Nome: ${admin.name}`);
      console.log(`   É admin: ${admin.is_admin}`);
    } else {
      console.log('❌ Usuário admin não encontrado');
    }
    
    // 4. Verificar eventos
    console.log('\n4️⃣ Verificando eventos...');
    const events = await db('events').select('*');
    console.log(`   Total de eventos: ${events.length}`);
    if (events.length > 0) {
      events.forEach(event => {
        console.log(`   - ${event.title} (${event.slug})`);
      });
    }
    
    // 5. Verificar inscrições
    console.log('\n5️⃣ Verificando inscrições...');
    const registrations = await db('registrations').select('*');
    console.log(`   Total de inscrições: ${registrations.length}`);
    
    // 6. Testar queries que estão falhando
    console.log('\n6️⃣ Testando queries problemáticas...');
    
    // Teste 1: /admin/registrations/recent
    try {
      const recentRegs = await db('registrations')
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
      
      console.log('✅ Query /admin/registrations/recent: OK');
      console.log(`   Retornou ${recentRegs.length} registros`);
    } catch (error) {
      console.log('❌ Query /admin/registrations/recent: FALHOU');
      console.log(`   Erro: ${error.message}`);
    }
    
    // Teste 2: /admin/events
    try {
      const eventsList = await db('events').select('*');
      console.log('✅ Query /admin/events: OK');
      console.log(`   Retornou ${eventsList.length} eventos`);
    } catch (error) {
      console.log('❌ Query /admin/events: FALHOU');
      console.log(`   Erro: ${error.message}`);
    }
    
    // Teste 3: /admin/stats
    try {
      const totalEvents = await db('events').count('* as total');
      const activeEvents = await db('events').where('status', 'active').count('* as total');
      const totalParticipants = await db('registrations').countDistinct('user_id as total');
      
      console.log('✅ Query /admin/stats: OK');
      console.log(`   Total eventos: ${totalEvents[0].total}`);
      console.log(`   Eventos ativos: ${activeEvents[0].total}`);
      console.log(`   Total participantes: ${totalParticipants[0].total}`);
    } catch (error) {
      console.log('❌ Query /admin/stats: FALHOU');
      console.log(`   Erro: ${error.message}`);
    }
    
  } catch (error) {
    console.error('❌ Erro durante diagnóstico:', error);
  } finally {
    await db.destroy();
    console.log('\n🔚 Conexão com banco fechada.');
  }
}

diagnosticarBackend(); 