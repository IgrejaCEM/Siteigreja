const { db } = require('./src/database/db');

async function testConnection() {
  try {
    console.log('🔍 Testando conexão com banco de dados...');
    
    // Testar conexão básica
    const result = await db.raw('SELECT 1 as test');
    console.log('✅ Conexão básica OK:', result.rows);
    
    // Testar tabela events
    const events = await db('events').select('*').limit(1);
    console.log('✅ Tabela events OK:', events.length, 'eventos encontrados');
    
    // Testar estrutura da tabela events
    const columns = await db.raw(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'events'
      ORDER BY ordinal_position
    `);
    console.log('📊 Estrutura da tabela events:');
    columns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    // Testar inserção simples
    const testEvent = {
      title: 'Teste Conexão',
      description: 'Evento de teste para verificar conexão',
      date: new Date(),
      location: 'Local de teste',
      slug: 'teste-conexao-' + Date.now(),
      status: 'active',
      has_payment: false
    };
    
    const [inserted] = await db('events').insert(testEvent).returning('*');
    console.log('✅ Inserção OK:', inserted.id);
    
    // Limpar teste
    await db('events').where('id', inserted.id).del();
    console.log('✅ Limpeza OK');
    
    console.log('🎉 Todos os testes passaram!');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
    console.error('📋 Detalhes:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      hint: error.hint
    });
  } finally {
    process.exit(0);
  }
}

testConnection(); 