const { db } = require('./src/database/db');

async function createTablesProduction() {
  try {
    console.log('🔧 Criando tabelas no banco de produção...');
    
    // 1. Criar tabela store_products se não existir
    const storeProductsExists = await db.schema.hasTable('store_products');
    console.log('📊 Tabela store_products existe:', storeProductsExists);
    
    if (!storeProductsExists) {
      console.log('🚀 Criando tabela store_products...');
      await db.schema.createTable('store_products', (table) => {
        table.increments('id').primary();
        table.string('name', 255).notNullable();
        table.text('description');
        table.decimal('price', 10, 2).notNullable();
        table.integer('stock').notNullable().defaultTo(0);
        table.string('image_url', 500);
        table.string('category', 100);
        table.boolean('active').notNullable().defaultTo(true);
        table.timestamps(true, true);
        
        // Índices
        table.index('active');
        table.index('category');
      });
      console.log('✅ Tabela store_products criada!');
    }
    
    // 2. Criar tabela registration_store_products se não existir
    const registrationStoreProductsExists = await db.schema.hasTable('registration_store_products');
    console.log('📊 Tabela registration_store_products existe:', registrationStoreProductsExists);
    
    if (!registrationStoreProductsExists) {
      console.log('🚀 Criando tabela registration_store_products...');
      await db.schema.createTable('registration_store_products', (table) => {
        table.increments('id').primary();
        table.integer('registration_id').unsigned().references('id').inTable('registrations').onDelete('CASCADE');
        table.integer('product_id').unsigned().references('id').inTable('store_products').onDelete('CASCADE');
        table.integer('quantity').notNullable();
        table.decimal('unit_price', 10, 2).notNullable();
        table.timestamps(true, true);
      });
      console.log('✅ Tabela registration_store_products criada!');
    }
    
    // 3. Inserir dados de exemplo na store_products se estiver vazia
    const productCount = await db('store_products').count('* as total');
    console.log('📊 Produtos existentes:', productCount[0].total);
    
    if (productCount[0].total == 0) {
      console.log('🚀 Inserindo produtos de exemplo...');
      await db('store_products').insert([
        {
          name: 'Bíblia Sagrada',
          description: 'Bíblia Sagrada com capa dura',
          price: 45.00,
          stock: 20,
          category: 'Livros',
          active: true
        },
        {
          name: 'Camiseta "Fé"',
          description: 'Camiseta com estampa da igreja',
          price: 35.00,
          stock: 50,
          category: 'Vestuário',
          active: true
        },
        {
          name: 'Caneca Personalizada',
          description: 'Caneca com logo da igreja',
          price: 25.00,
          stock: 30,
          category: 'Utensílios',
          active: true
        }
      ]);
      console.log('✅ Produtos de exemplo inseridos!');
    }
    
    console.log('✅ Todas as tabelas foram criadas/verificadas com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao criar tabelas:', error);
  } finally {
    process.exit(0);
  }
}

createTablesProduction(); 