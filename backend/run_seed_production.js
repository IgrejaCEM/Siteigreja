const { db } = require('./src/database/db');
const storeProductsSeed = require('./src/database/seeds/04_store_products');

async function runSeed() {
  try {
    console.log('🌱 Executando seed de produtos da loja no banco de produção...');
    
    // Verificar se a tabela existe
    const tableExists = await db.schema.hasTable('store_products');
    console.log('✅ Tabela store_products existe:', tableExists);
    
    if (!tableExists) {
      console.log('❌ Tabela store_products não existe!');
      return;
    }
    
    // Executar o seed
    await storeProductsSeed.seed(db);
    
    console.log('✅ Seed executado com sucesso!');
    
    // Verificar se os produtos foram inseridos
    const products = await db('store_products').select('*');
    console.log('📦 Produtos encontrados:', products.length);
    
    products.forEach(product => {
      console.log(`   - ID: ${product.id}, Nome: ${product.name}, Preço: R$ ${product.price}, Estoque: ${product.stock}`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao executar seed:', error);
  } finally {
    process.exit(0);
  }
}

runSeed(); 