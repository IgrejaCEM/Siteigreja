const { db } = require('./src/database/db');

console.log('🔍 Verificando evento ID 14...');

async function verificarEvento14() {
  try {
    console.log('📋 Buscando evento ID 14 diretamente...');
    const event14 = await db('events').where('id', 14).first();
    
    if (event14) {
      console.log('✅ Evento ID 14 encontrado:');
      console.log(`   Título: ${event14.title}`);
      console.log(`   Status: ${event14.status}`);
      console.log(`   Data: ${event14.date}`);
      
      // Verificar produtos
      const products = await db('event_products')
        .where('event_id', 14)
        .where('is_active', true);
      
      console.log(`📊 Produtos do evento 14: ${products.length}`);
      
      if (products.length === 0) {
        console.log('❌ Nenhum produto encontrado. Criando produtos...');
        
        const sampleProducts = [
          {
            event_id: 14,
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
            event_id: 14,
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
            event_id: 14,
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
        console.log(`✅ ${insertedProducts.length} produtos criados para o evento 14!`);
        
        insertedProducts.forEach((product, index) => {
          console.log(`  ${index + 1}. ${product.name} - R$ ${product.price}`);
        });
        
      } else {
        console.log('✅ Produtos já existem:');
        products.forEach((product, index) => {
          console.log(`  ${index + 1}. ${product.name} - R$ ${product.price}`);
        });
      }
      
    } else {
      console.log('❌ Evento ID 14 não encontrado no banco');
      
      // Verificar se há algum evento com ID maior que 13
      console.log('📋 Verificando eventos com ID > 13...');
      const higherEvents = await db('events').where('id', '>', 13).select('*');
      console.log(`📊 Eventos com ID > 13: ${higherEvents.length}`);
      
      higherEvents.forEach((event, index) => {
        console.log(`${index + 1}. ID: ${event.id} | Título: ${event.title} | Status: ${event.status}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar evento 14:', error);
  } finally {
    process.exit(0);
  }
}

verificarEvento14(); 