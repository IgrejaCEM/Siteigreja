const knex = require('knex');

// Configuração PostgreSQL (produção)
const db = knex({
  client: 'pg',
  connection: 'postgresql://postgres:WWiZILOORFMgerRjFMPSJLQrfLGFfviU@shuttle.proxy.rlwy.net:14638/railway'
});

async function criarProdutosEvento8() {
  console.log('🛍️ CRIANDO PRODUTOS PARA O EVENTO 8');
  console.log('=====================================');
  
  try {
    // 1. Verificar se o evento 8 existe
    console.log('📋 [1/4] Verificando evento 8...');
    const evento = await db('events').where('id', 8).first();
    
    if (!evento) {
      console.log('❌ Evento 8 não encontrado!');
      return;
    }
    
    console.log(`✅ Evento encontrado: ${evento.title}`);
    
    // 2. Verificar produtos existentes
    console.log('📋 [2/4] Verificando produtos existentes...');
    const produtosExistentes = await db('event_products').where('event_id', 8).select('*');
    console.log(`📊 Produtos existentes: ${produtosExistentes.length}`);
    
    // 3. Criar produtos para o evento 8
    console.log('📋 [3/4] Criando produtos...');
    const produtos = [
      {
        event_id: 8,
        name: 'Camiseta do Evento',
        description: 'Camiseta exclusiva do CONNECT CONF 2025',
        price: 35.00,
        image_url: 'https://via.placeholder.com/300x200?text=Camiseta+Evento',
        stock: 50,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        event_id: 8,
        name: 'Kit Completo',
        description: 'Kit com camiseta, caneca e adesivos',
        price: 55.00,
        image_url: 'https://via.placeholder.com/300x200?text=Kit+Completo',
        stock: 30,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        event_id: 8,
        name: 'Caneca Personalizada',
        description: 'Caneca com logo do evento',
        price: 20.00,
        image_url: 'https://via.placeholder.com/300x200?text=Caneca+Evento',
        stock: 100,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];
    
    for (const produto of produtos) {
      const result = await db('event_products').insert(produto).returning('id');
      const id = result[0].id;
      console.log(`✅ Produto criado: ${produto.name} (ID: ${id})`);
    }
    
    // 4. Verificar produtos criados
    console.log('📋 [4/4] Verificando produtos criados...');
    const produtosCriados = await db('event_products').where('event_id', 8).select('*');
    console.log(`📊 Total de produtos para evento 8: ${produtosCriados.length}`);
    
    produtosCriados.forEach((produto, index) => {
      console.log(`  ${index + 1}. ID: ${produto.id} | Nome: ${produto.name} | Preço: R$ ${produto.price}`);
    });
    
    console.log('\n🎉 Produtos criados com sucesso!');
    console.log('💡 Agora teste a home page para ver se os produtos aparecem.');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await db.destroy();
  }
}

criarProdutosEvento8(); 