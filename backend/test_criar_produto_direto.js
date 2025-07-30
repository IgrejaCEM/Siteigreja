const knex = require('knex');

// Configuração PostgreSQL (produção)
const db = knex({
  client: 'pg',
  connection: 'postgresql://postgres:WWiZILOORFMgerRjFMPSJLQrfLGFfviU@shuttle.proxy.rlwy.net:14638/railway'
});

async function testCriarProduto() {
  console.log('🧪 TESTANDO CRIAÇÃO DE PRODUTO DIRETO');
  console.log('======================================');
  
  try {
    // 1. Verificar se a tabela existe
    console.log('📋 [1/4] Verificando tabela event_products...');
    const hasTable = await db.schema.hasTable('event_products');
    console.log(`📊 Tabela existe: ${hasTable}`);
    
    if (!hasTable) {
      console.log('❌ Tabela event_products não existe!');
      return;
    }
    
    // 2. Contar produtos antes
    console.log('📋 [2/4] Contando produtos antes...');
    const countBefore = await db('event_products').count('* as total');
    console.log(`📊 Produtos antes: ${countBefore[0].total}`);
    
    // 3. Criar produto diretamente
    console.log('📋 [3/4] Criando produto diretamente...');
    const produto = {
      event_id: 13,
      name: 'Produto Teste Direto',
      description: 'Produto criado diretamente no banco',
      price: 15.50,
      image_url: 'https://via.placeholder.com/300x200?text=Teste',
      stock: 10,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    const [id] = await db('event_products').insert(produto).returning('id');
    console.log(`✅ Produto criado com ID: ${id}`);
    
    // 4. Verificar se foi persistido
    console.log('📋 [4/4] Verificando persistência...');
    const countAfter = await db('event_products').count('* as total');
    console.log(`📊 Produtos depois: ${countAfter[0].total}`);
    
    const produtoCriado = await db('event_products').where('id', id).first();
    if (produtoCriado) {
      console.log('✅ Produto encontrado no banco:');
      console.log(`  - ID: ${produtoCriado.id}`);
      console.log(`  - Nome: ${produtoCriado.name}`);
      console.log(`  - Preço: ${produtoCriado.price}`);
      console.log(`  - Event ID: ${produtoCriado.event_id}`);
    } else {
      console.log('❌ Produto não foi encontrado no banco!');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await db.destroy();
  }
}

testCriarProduto(); 