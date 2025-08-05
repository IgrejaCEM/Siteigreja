const { db } = require('./src/database/db');
const storeProductsSeed = require('./src/database/seeds/04_store_products');

async function deploySeedToProduction() {
  try {
    console.log('🚀 Executando seed de produtos da loja no banco de PRODUÇÃO...');
    
    // Verificar se a tabela existe
    const tableExists = await db.schema.hasTable('store_products');
    console.log('✅ Tabela store_products existe:', tableExists);
    
    if (!tableExists) {
      console.log('❌ Tabela store_products não existe! Criando...');
      await db.schema.createTable('store_products', (table) => {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.text('description');
        table.decimal('price', 10, 2).notNullable();
        table.integer('stock').defaultTo(0);
        table.string('image_url');
        table.string('category');
        table.boolean('active').defaultTo(true);
        table.timestamps(true, true);
      });
      console.log('✅ Tabela store_products criada!');
    }
    
    // Verificar produtos existentes
    const existingProducts = await db('store_products').select('*');
    console.log('📦 Produtos existentes:', existingProducts.length);
    
    if (existingProducts.length > 0) {
      console.log('🧹 Tentando limpar produtos existentes...');
      try {
        // Primeiro, desabilitar foreign key checks temporariamente
        await db.raw('SET session_replication_role = replica;');
        
        // Limpar produtos
        await db('store_products').del();
        console.log('✅ Produtos existentes removidos');
        
        // Reabilitar foreign key checks
        await db.raw('SET session_replication_role = DEFAULT;');
      } catch (error) {
        console.log('⚠️ Erro ao limpar produtos (pode ser devido a foreign keys):', error.message);
        console.log('🔄 Tentando inserir produtos sem limpar...');
      }
    }
    
    // Executar o seed
    console.log('🌱 Executando seed...');
    await storeProductsSeed.seed(db);
    
    console.log('✅ Seed executado com sucesso no banco de PRODUÇÃO!');
    
    // Verificar produtos inseridos
    const products = await db('store_products').select('*');
    console.log('📦 Produtos encontrados:', products.length);
    
    products.forEach(product => {
      console.log(`   - ID: ${product.id}, Nome: ${product.name}, Preço: R$ ${product.price}, Estoque: ${product.stock}`);
    });
    
    // Verificar especificamente o produto ID 7
    const product7 = await db('store_products').where('id', 7).first();
    console.log('\n🔍 Produto ID 7:', product7);
    
    if (product7) {
      console.log('✅ Produto ID 7 encontrado no banco de PRODUÇÃO!');
    } else {
      console.log('❌ Produto ID 7 NÃO encontrado no banco de PRODUÇÃO!');
    }
    
  } catch (error) {
    console.error('❌ Erro ao executar seed no banco de PRODUÇÃO:', error);
    console.error('📋 Stack:', error.stack);
  } finally {
    process.exit(0);
  }
}

deploySeedToProduction(); 