const { db } = require('./src/database/db');

console.log('🔧 Adicionando coluna products à tabela registrations...');

async function adicionarColunaProducts() {
  try {
    console.log('📋 Verificando se a coluna products já existe...');
    
    // Verificar se a coluna já existe
    const columns = await db('registrations').columnInfo();
    const hasProductsColumn = Object.keys(columns).includes('products');
    
    if (hasProductsColumn) {
      console.log('✅ Coluna products já existe!');
      return;
    }
    
    console.log('📋 Adicionando coluna products...');
    
    // Adicionar a coluna products
    await db.schema.table('registrations', function(table) {
      table.json('products').nullable();
    });
    
    console.log('✅ Coluna products adicionada com sucesso!');
    
    // Verificar se foi adicionada
    const newColumns = await db('registrations').columnInfo();
    const hasNewProductsColumn = Object.keys(newColumns).includes('products');
    
    if (hasNewProductsColumn) {
      console.log('✅ Verificação: Coluna products foi criada corretamente');
      console.log('📋 Configuração da coluna:', newColumns.products);
    } else {
      console.log('❌ Erro: Coluna products não foi criada');
    }
    
  } catch (error) {
    console.error('❌ Erro ao adicionar coluna products:', error);
  } finally {
    process.exit(0);
  }
}

adicionarColunaProducts(); 