const { db } = require('./src/database/db');

console.log('🔧 Criando evento ID 14...');

async function criarEvento14() {
  try {
    console.log('📋 Verificando se o evento 14 já existe...');
    const existingEvent = await db('events').where('id', 14).first();
    
    if (existingEvent) {
      console.log('✅ Evento 14 já existe:', existingEvent.title);
      return;
    }
    
    console.log('📋 Criando evento ID 14...');
    
    // Criar o evento
    const eventData = {
      id: 14,
      title: 'CONNECT CONF 2025 - INPROVÁVEIS',
      description: 'O maior evento de jovens da região!',
      date: '2025-10-24T19:00:00.000Z',
      location: 'Igreja CEM',
      status: 'active',
      slug: 'connect-conf-2025',
      created_at: new Date(),
      updated_at: new Date()
    };
    
    const [event] = await db('events').insert(eventData).returning('*');
    console.log('✅ Evento criado:', event.title);
    
    // Criar um lote para o evento
    console.log('📋 Criando lote para o evento...');
    const lotData = {
      event_id: 14,
      name: 'Ingresso Geral',
      price: 0.00,
      quantity: 100,
      is_free: true,
      status: 'active',
      created_at: new Date(),
      updated_at: new Date()
    };
    
    const [lot] = await db('lots').insert(lotData).returning('*');
    console.log('✅ Lote criado:', lot.name);
    
    // Criar produtos para o evento
    console.log('📋 Criando produtos para o evento...');
    const productsData = [
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
    
    const products = await db('event_products').insert(productsData).returning('*');
    console.log(`✅ ${products.length} produtos criados!`);
    
    products.forEach((product, index) => {
      console.log(`  ${index + 1}. ${product.name} - R$ ${product.price}`);
    });
    
    console.log('🎉 Evento ID 14 criado com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao criar evento 14:', error);
  } finally {
    process.exit(0);
  }
}

criarEvento14(); 