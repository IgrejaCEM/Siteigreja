const { db } = require('./src/database/db');

async function addEventProducts() {
  try {
    console.log('🔍 Verificando produtos do evento...');
    
    // Verificar se a tabela event_products existe
    const hasEventProductsTable = await db.schema.hasTable('event_products');
    console.log('📋 Tabela event_products existe:', hasEventProductsTable);
    
    if (!hasEventProductsTable) {
      console.log('❌ Tabela event_products não existe!');
      console.log('📝 Criando tabela event_products...');
      
      await db.schema.createTable('event_products', function(table) {
        table.increments('id').primary();
        table.integer('event_id').unsigned().references('id').inTable('events').onDelete('CASCADE');
        table.string('name').notNullable();
        table.text('description').notNullable();
        table.decimal('price', 10, 2).notNullable();
        table.string('image_url').notNullable();
        table.integer('stock').notNullable().defaultTo(0);
        table.boolean('is_active').defaultTo(true);
        table.timestamp('created_at').defaultTo(db.fn.now());
        table.timestamp('updated_at').defaultTo(db.fn.now());
      });
      
      console.log('✅ Tabela event_products criada!');
    }
    
    // Adicionar produtos ao evento
    const products = [
      {
        event_id: 14,
        name: 'Camiseta do Evento',
        description: 'Camiseta oficial do Connect Conf 2025',
        price: 45.00,
        stock: 100,
        image_url: 'https://via.placeholder.com/300x300?text=Camiseta+Evento',
        is_active: true
      },
      {
        event_id: 14,
        name: 'Caneca Personalizada',
        description: 'Caneca exclusiva do Connect Conf 2025',
        price: 35.00,
        stock: 50,
        image_url: 'https://via.placeholder.com/300x300?text=Caneca+Evento',
        is_active: true
      },
      {
        event_id: 14,
        name: 'Kit do Evento',
        description: 'Kit com materiais exclusivos do Connect Conf 2025',
        price: 75.00,
        stock: 30,
        image_url: 'https://via.placeholder.com/300x300?text=Kit+Evento',
        is_active: true
      }
    ];
    
    console.log('📝 Adicionando produtos ao evento...');
    
    for (const product of products) {
      await db('event_products').insert(product);
    }
    
    console.log('✅ Produtos adicionados com sucesso!');
    
    // Verificar produtos cadastrados
    const allProducts = await db('event_products').where('event_id', 14);
    console.log('📊 Produtos cadastrados:', allProducts.length);
    
    if (allProducts.length > 0) {
      console.log('📋 Produtos:');
      allProducts.forEach(product => {
        console.log(`  - ${product.name}: R$ ${product.price} (Estoque: ${product.stock})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    process.exit(0);
  }
}

addEventProducts();