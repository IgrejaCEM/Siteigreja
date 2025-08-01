const { db } = require('./src/database/db');

async function checkTables() {
  try {
    console.log('🔍 Verificando tabelas no banco...');
    
    // Listar todas as tabelas
    const tables = await db.raw("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('📋 Tabelas existentes:', tables.rows.map(row => row.table_name));
    
    // Verificar se registration_store_products existe
    const hasTable = await db.schema.hasTable('registration_store_products');
    console.log('✅ Tabela registration_store_products existe:', hasTable);
    
    if (hasTable) {
      // Verificar estrutura da tabela
      const columns = await db.raw("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'registration_store_products'");
      console.log('📊 Colunas da tabela registration_store_products:', columns.rows);
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar tabelas:', error);
  } finally {
    process.exit(0);
  }
}

checkTables(); 