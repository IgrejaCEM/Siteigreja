const { db } = require('./src/database/db');

async function testTableCreation() {
  try {
    console.log('🧪 Testando criação da tabela registration_store_products...');
    
    // Verificar se a tabela existe
    const tableExists = await db.schema.hasTable('registration_store_products');
    console.log('✅ Tabela registration_store_products existe:', tableExists);
    
    if (!tableExists) {
      console.log('⚠️ Tabela não existe, criando automaticamente...');
      
      // Criar a tabela automaticamente
      await db.schema.createTable('registration_store_products', (table) => {
        table.increments('id').primary();
        table.integer('registration_id').unsigned().references('id').inTable('registrations').onDelete('CASCADE');
        table.integer('product_id').unsigned().references('id').inTable('store_products').onDelete('CASCADE');
        table.integer('quantity').notNullable();
        table.decimal('unit_price', 10, 2).notNullable();
        table.timestamps(true, true);
      });
      
      console.log('✅ Tabela registration_store_products criada com sucesso!');
    } else {
      console.log('✅ Tabela já existe!');
    }
    
    // Verificar estrutura da tabela
    const columns = await db.raw("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'registration_store_products'");
    console.log('📊 Colunas da tabela:', columns.rows);
    
  } catch (error) {
    console.error('❌ Erro ao testar criação da tabela:', error);
  } finally {
    process.exit(0);
  }
}

testTableCreation(); 