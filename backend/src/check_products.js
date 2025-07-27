const { db } = require('./database/db');

async function checkProducts() {
  try {
    console.log('🔍 Verificando produtos no banco de dados...');
    
    // Verificar se a tabela existe
    const hasTable = await db.schema.hasTable('event_products');
    console.log('📋 Tabela event_products existe:', hasTable);
    
    if (!hasTable) {
      console.log('❌ Tabela event_products não existe!');
      return;
    }
    
    // Buscar todos os produtos
    const products = await db('event_products').select('*');
    console.log(`��️ Total de produtos encontrados: ${products.length}`);
    
    if (products.length === 0) {
      console.log('❌ Nenhum produto cadastrado!');
      
      // Buscar eventos para adicionar produtos de teste
      const events = await db('events').select('id', 'title');
      console.log(`📅 Eventos disponíveis: ${events.length}`);
      
      if (events.length > 0) {
        console.log('🎪 Eventos encontrados:');
        events.forEach(event => {
          console.log(`  - ID: ${event.id}, Título: ${event.title}`);
        });
        
        // Adicionar produto de teste
        const testProduct = {
          event_id: events[0].id,
          name: 'CAMISETA 1',
          description: 'Camiseta exclusiva do evento',
          price: 35.00,
          image_url: 'https://via.placeholder.com/300x300?text=CAMISETA',
          stock: 50,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        };
        
        await db('event_products').insert(testProduct);
        console.log('✅ Produto de teste adicionado:', testProduct.name);
      }
    } else {
      console.log('✅ Produtos encontrados:');
      products.forEach(product => {
        console.log(`  - ID: ${product.id}, Nome: ${product.name}, Preço: R$ ${product.price}, Ativo: ${product.is_active}`);
      });
    }
    
    // Testar a API
    console.log('\n🧪 Testando API de produtos...');
    const eventId = 1; // Assumindo que o evento tem ID 1
    const apiProducts = await db('event_products')
      .where('event_id', eventId)
      .where('is_active', true)
      .select('*');
    
    console.log(`�� API retornou ${apiProducts.length} produtos para evento ${eventId}`);
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await db.destroy();
    console.log('🔚 Conexão fechada');
  }
}

checkProducts(); 