const { db } = require('./database/db');

async function addTestProducts() {
  try {
    console.log('🔍 Verificando tabelas...');
    
    // Verificar se a tabela event_products existe
    const hasEventProductsTable = await db.schema.hasTable('event_products');
    if (!hasEventProductsTable) {
      console.log('❌ Tabela event_products não existe!');
      console.log('📋 Criando tabela event_products...');
      
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
    } else {
      console.log('✅ Tabela event_products existe!');
    }
    
    // Verificar se a tabela registration_products existe
    const hasRegistrationProductsTable = await db.schema.hasTable('registration_products');
    if (!hasRegistrationProductsTable) {
      console.log('❌ Tabela registration_products não existe!');
      console.log('📋 Criando tabela registration_products...');
      
      await db.schema.createTable('registration_products', function(table) {
        table.increments('id').primary();
        table.integer('registration_id').unsigned().references('id').inTable('registrations').onDelete('CASCADE');
        table.integer('product_id').unsigned().references('id').inTable('event_products').onDelete('CASCADE');
        table.integer('quantity').notNullable().defaultTo(1);
        table.decimal('unit_price', 10, 2).notNullable();
        table.timestamp('created_at').defaultTo(db.fn.now());
        table.timestamp('updated_at').defaultTo(db.fn.now());
      });
      
      console.log('✅ Tabela registration_products criada!');
    } else {
      console.log('✅ Tabela registration_products existe!');
    }
    
    // Buscar eventos existentes
    const events = await db('events').select('id', 'title');
    console.log(`📅 Eventos encontrados: ${events.length}`);
    
    if (events.length === 0) {
      console.log('❌ Nenhum evento encontrado! Crie um evento primeiro.');
      return;
    }
    
    // Verificar produtos existentes
    const existingProducts = await db('event_products').select('*');
    console.log(`🛍️ Produtos existentes: ${existingProducts.length}`);
    
    if (existingProducts.length === 0) {
      console.log('📦 Adicionando produtos de teste...');
      
      // Adicionar produtos para o primeiro evento
      const firstEvent = events[0];
      console.log(`🎪 Adicionando produtos para o evento: ${firstEvent.title} (ID: ${firstEvent.id})`);
      
      const testProducts = [
        {
          event_id: firstEvent.id,
          name: 'Camiseta do Evento',
          description: 'Camiseta exclusiva do evento com design personalizado',
          price: 35.00,
          image_url: 'https://via.placeholder.com/300x300?text=Camiseta',
          stock: 50,
          is_active: true
        },
        {
          event_id: firstEvent.id,
          name: 'Caneca Personalizada',
          description: 'Caneca com logo do evento, perfeita para café',
          price: 15.00,
          image_url: 'https://via.placeholder.com/300x300?text=Caneca',
          stock: 30,
          is_active: true
        },
        {
          event_id: firstEvent.id,
          name: 'Kit Completo',
          description: 'Kit com camiseta, caneca e adesivos do evento',
          price: 45.00,
          image_url: 'https://via.placeholder.com/300x300?text=Kit',
          stock: 20,
          is_active: true
        }
      ];
      
      for (const product of testProducts) {
        await db('event_products').insert(product);
        console.log(`✅ Produto adicionado: ${product.name} - R$ ${product.price}`);
      }
      
      console.log('🎉 Produtos de teste adicionados com sucesso!');
    } else {
      console.log('✅ Já existem produtos cadastrados!');
      existingProducts.forEach(product => {
        console.log(`  - ${product.name} (R$ ${product.price}) - Estoque: ${product.stock}`);
      });
    }
    
    // Testar a API de produtos
    console.log('\n🧪 Testando API de produtos...');
    const products = await db('event_products')
      .where('event_id', events[0].id)
      .where('is_active', true)
      .select('*');
    
    console.log(`📡 API retornou ${products.length} produtos para o evento ${events[0].id}`);
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await db.destroy();
    console.log('🔚 Conexão fechada');
  }
}

addTestProducts(); 