const knex = require('knex');

// Configuração PostgreSQL (produção)
const db = knex({
  client: 'pg',
  connection: 'postgresql://postgres:WWiZILOORFMgerRjFMPSJLQrfLGFfviU@shuttle.proxy.rlwy.net:14638/railway'
});

async function testProdutosDiretoPostgres() {
  console.log('🧪 TESTANDO PRODUTOS DIRETO NO POSTGRESQL');
  console.log('===========================================');
  
  try {
    // 1. Verificar conexão
    console.log('📋 [1/5] Verificando conexão...');
    await db.raw('SELECT 1');
    console.log('✅ Conexão com PostgreSQL estabelecida');
    
    // 2. Verificar se a tabela existe
    console.log('📋 [2/5] Verificando tabela event_products...');
    const hasTable = await db.schema.hasTable('event_products');
    console.log(`📊 Tabela event_products existe: ${hasTable}`);
    
    if (!hasTable) {
      console.log('❌ Tabela event_products não existe!');
      return;
    }
    
    // 3. Contar produtos antes
    console.log('📋 [3/5] Contando produtos antes...');
    const countBefore = await db('event_products').count('* as total');
    console.log(`📊 Produtos antes: ${countBefore[0].total}`);
    
    // 4. Criar produto diretamente
    console.log('📋 [4/5] Criando produto diretamente...');
    const produto = {
      event_id: 8,
      name: 'Produto Teste PostgreSQL',
      description: 'Produto criado diretamente no PostgreSQL',
      price: 30.00,
      image_url: 'https://via.placeholder.com/300x200?text=PostgreSQL+Teste',
      stock: 15,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    const result = await db('event_products').insert(produto).returning('id');
    const id = result[0].id;
    console.log(`✅ Produto criado com ID: ${id}`);
    
    // 5. Verificar se foi persistido
    console.log('📋 [5/5] Verificando persistência...');
    const countAfter = await db('event_products').count('* as total');
    console.log(`📊 Produtos depois: ${countAfter[0].total}`);
    
    const produtoCriado = await db('event_products').where('id', id).first();
    if (produtoCriado) {
      console.log('✅ Produto encontrado no banco:');
      console.log(`  - ID: ${produtoCriado.id}`);
      console.log(`  - Nome: ${produtoCriado.name}`);
      console.log(`  - Preço: ${produtoCriado.price}`);
      console.log(`  - Event ID: ${produtoCriado.event_id}`);
      console.log(`  - Ativo: ${produtoCriado.is_active}`);
    } else {
      console.log('❌ Produto não foi encontrado no banco!');
    }
    
    // 6. Listar todos os produtos
    console.log('\n📋 Listando todos os produtos:');
    const todosProdutos = await db('event_products').select('*').orderBy('id', 'desc');
    console.log(`📊 Total de produtos no banco: ${todosProdutos.length}`);
    
    todosProdutos.forEach((produto, index) => {
      console.log(`  ${index + 1}. ID: ${produto.id} | Nome: ${produto.name} | Preço: R$ ${produto.price} | Event ID: ${produto.event_id} | Ativo: ${produto.is_active}`);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await db.destroy();
  }
}

testProdutosDiretoPostgres(); 