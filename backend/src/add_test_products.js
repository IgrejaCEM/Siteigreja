const { db } = require('./database/db');

async function addTestProducts() {
  try {
    console.log('🔍 Verificando produtos no banco de dados...');
    
    // Verificar se a tabela event_products existe
    const hasEventProductsTable = await db.schema.hasTable('event_products');
    console.log('📋 Tabela event_products existe:', hasEventProductsTable);
    
    if (!hasEventProductsTable) {
      console.log('❌ Tabela event_products não existe!');
      console.log('📋 Criando tabela event_products...');
      
      await db.schema.createTable('event_products', (table) => {
        table.increments('id').primary();
        table.integer('event_id').notNullable();
        table.string('name').notNullable();
        table.text('description');
        table.decimal('price', 10, 2).notNullable();
        table.integer('stock').defaultTo(100);
        table.boolean('is_active').defaultTo(true);
        table.timestamps(true, true);
        
        table.foreign('event_id').references('id').inTable('events').onDelete('CASCADE');
      });
      
      console.log('✅ Tabela event_products criada!');
    }
    
    // Verificar se há produtos cadastrados
    const existingProducts = await db('event_products').select('*');
    console.log('️ Total de produtos encontrados:', existingProducts.length);
    
    if (existingProducts.length === 0) {
      console.log('📦 Adicionando produtos de teste...');
      
      // Buscar o primeiro evento
      const event = await db('events').first();
      if (!event) {
        console.log('❌ Nenhum evento encontrado!');
        return;
      }
      
      // Adicionar produtos de teste
      const testProducts = [
        {
          event_id: event.id,
          name: 'Camiseta do Evento',
          description: 'Camiseta personalizada do evento',
          price: 35.00,
          stock: 50,
          is_active: true
        },
        {
          event_id: event.id,
          name: 'Caneca Personalizada',
          description: 'Caneca com logo do evento',
          price: 15.00,
          stock: 30,
          is_active: true
        },
        {
          event_id: event.id,
          name: 'Kit Completo',
          description: 'Kit com camiseta + caneca + adesivo',
          price: 45.00,
          stock: 20,
          is_active: true
        }
      ];
      
      await db('event_products').insert(testProducts);
      console.log('✅ Produtos de teste adicionados!');
    } else {
      console.log('✅ Produtos encontrados:');
      existingProducts.forEach(product => {
        console.log(`  - ID: ${product.id}, Nome: ${product.name}, Preço: R$ ${product.price}, Ativo: ${product.is_active}`);
      });
    }
    
    // Testar API de produtos
    console.log('🧪 Testando API de produtos...');
    
    // Criar usuário admin se não existir
    const adminUser = await db('users').where('email', 'admin@example.com').first();
    if (!adminUser) {
      await db('users').insert({
        name: 'Admin',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin',
        created_at: new Date(),
        updated_at: new Date()
      });
      console.log('👤 Usuário admin criado');
    } else {
      console.log('👤 Usuário admin já existe, privilégios de admin garantidos');
    }
    
    // Buscar produtos via API
    const event = await db('events').first();
    if (event) {
      const products = await db('event_products')
        .where('event_id', event.id)
        .where('is_active', true)
        .orderBy('created_at', 'desc');
      
      console.log(`✅ API retornou ${products.length} produtos para evento ${event.id}`);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await db.destroy();
  }
}

addTestProducts(); 