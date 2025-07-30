const knex = require('knex');

// Configuração PostgreSQL (produção)
const db = knex({
  client: 'pg',
  connection: 'postgresql://postgres:WWiZILOORFMgerRjFMPSJLQrfLGFfviU@shuttle.proxy.rlwy.net:14638/railway'
});

async function testDatabaseConnection() {
  console.log('🔍 TESTANDO CONEXÃO COM O BANCO');
  console.log('=================================');
  
  try {
    // 1. Testar conexão básica
    console.log('📋 [1/4] Testando conexão básica...');
    await db.raw('SELECT 1');
    console.log('✅ Conexão com PostgreSQL estabelecida');
    
    // 2. Verificar tabelas existentes
    console.log('📋 [2/4] Verificando tabelas existentes...');
    const tables = await db.raw(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('📊 Tabelas encontradas:');
    tables.rows.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });
    
    // 3. Verificar eventos
    console.log('📋 [3/4] Verificando eventos...');
    const events = await db('events').select('*');
    console.log(`📊 Total de eventos: ${events.length}`);
    
    if (events.length > 0) {
      events.forEach(event => {
        console.log(`  - ID: ${event.id} | Título: ${event.title} | Status: ${event.status}`);
      });
    }
    
    // 4. Verificar produtos
    console.log('📋 [4/4] Verificando produtos...');
    const products = await db('event_products').select('*');
    console.log(`📊 Total de produtos: ${products.length}`);
    
    if (products.length > 0) {
      products.forEach(product => {
        console.log(`  - ID: ${product.id} | Nome: ${product.name} | Event ID: ${product.event_id} | Preço: R$ ${product.price}`);
      });
    }
    
    console.log('\n✅ Banco de dados está funcionando corretamente!');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Não foi possível conectar ao banco de dados');
    } else if (error.code === 'ENOTFOUND') {
      console.log('❌ Host do banco de dados não encontrado');
    } else if (error.code === '28P01') {
      console.log('❌ Erro de autenticação no banco de dados');
    }
  } finally {
    await db.destroy();
  }
}

testDatabaseConnection(); 