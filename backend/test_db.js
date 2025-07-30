const { db } = require('./src/database/db');

async function testDatabase() {
  try {
    console.log('🔍 Testando conexão com banco...');
    
    // Teste básico
    const result = await db.raw('SELECT 1 as test');
    console.log('✅ Conexão OK:', result[0]);
    
    // Verificar tabelas
    const tables = await db.raw("SELECT tablename FROM pg_tables WHERE schemaname = 'public'");
    console.log('📋 Tabelas encontradas:', tables.rows.map(t => t.tablename));
    
    // Verificar se tabelas importantes existem
    const importantTables = ['events', 'registrations', 'users', 'lots'];
    for (const table of importantTables) {
      try {
        const count = await db(table).count('* as total');
        console.log(`✅ Tabela ${table}: ${count[0].total} registros`);
      } catch (error) {
        console.log(`❌ Tabela ${table}: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  } finally {
    process.exit(0);
  }
}

testDatabase(); 