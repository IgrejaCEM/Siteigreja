const { db } = require('./src/database/db');

console.log('🔍 Verificando produtos do evento...');

async function verificarProdutosEvento() {
  try {
    console.log('📋 Verificando eventos...');
    const events = await db('events').select('*').where('status', 'active');
    console.log(`📊 Total de eventos: ${events.length}`);
    
    if (events.length === 0) {
      console.log('❌ Nenhum evento encontrado!');
      return;
    }
    
    const event = events[0];
    console.log(`📋 Evento: ${event.title} (ID: ${event.id})`);
    
    // Verificar produtos do evento
    console.log('📋 Verificando produtos do evento...');
    const products = await db('event_products')
      .where('event_id', event.id)
      .where('is_active', true);
    
    console.log(`📊 Produtos encontrados: ${products.length}`);
    
    if (products.length === 0) {
      console.log('❌ Nenhum produto encontrado. Criando produtos de exemplo...');
      
      // Criar produtos de exemplo
      const sampleProducts = [
        {
          event_id: event.id,
          name: 'Camiseta do Evento',
          description: 'Camiseta personalizada do CONNECT CONF 2025',
          price: 35.00,
          stock: 100,
          image_url: 'https://via.placeholder.com/300x200?text=Camiseta',
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          event_id: event.id,
          name: 'Kit Completo',
          description: 'Kit com camiseta, caneca e adesivos',
          price: 55.00,
          stock: 50,
          image_url: 'https://via.placeholder.com/300x200?text=Kit+Completo',
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          event_id: event.id,
          name: 'Caneca Personalizada',
          description: 'Caneca com logo do evento',
          price: 20.00,
          stock: 75,
          image_url: 'https://via.placeholder.com/300x200?text=Caneca',
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        }
      ];
      
      const insertedProducts = await db('event_products').insert(sampleProducts).returning('*');
      console.log(`✅ ${insertedProducts.length} produtos criados com sucesso!`);
      
      insertedProducts.forEach((product, index) => {
        console.log(`  ${index + 1}. ${product.name} - R$ ${product.price}`);
      });
      
    } else {
      console.log('✅ Produtos já existem:');
      products.forEach((product, index) => {
        console.log(`  ${index + 1}. ${product.name} - R$ ${product.price}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar produtos:', error);
  } finally {
    process.exit(0);
  }
}

verificarProdutosEvento(); 