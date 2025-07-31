const { db } = require('./src/database/db');

async function testSimple() {
  try {
    console.log('🧪 Teste simples de conexão...');
    
    // Testar conexão básica
    const result = await db.raw('SELECT 1 as test');
    console.log('✅ Conexão OK:', result.rows[0]);
    
    // Testar acesso à tabela store_products
    const products = await db('store_products').select('id', 'name').limit(3);
    console.log('✅ Produtos da loja:', products);
    
    // Testar acesso à tabela events
    const events = await db('events').select('id', 'title').limit(3);
    console.log('✅ Eventos:', events);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error('❌ Stack:', error.stack);
    process.exit(1);
  }
}

testSimple(); 