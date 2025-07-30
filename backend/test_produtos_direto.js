const knex = require('knex');

// Configuração PostgreSQL (produção)
const db = knex({
  client: 'pg',
  connection: 'postgresql://postgres:WWiZILOORFMgerRjFMPSJLQrfLGFfviU@shuttle.proxy.rlwy.net:14638/railway'
});

async function testProdutosDireto() {
  console.log('🔍 TESTANDO PRODUTOS DIRETAMENTE');
  console.log('==================================');
  
  try {
    // 1. Verificar evento 13
    console.log('📋 [1/3] Verificando evento 13...');
    const evento = await db('events').where('id', 13).first();
    
    if (!evento) {
      console.log('❌ Evento 13 não encontrado!');
      return;
    }
    
    console.log(`✅ Evento encontrado: ${evento.title}`);
    
    // 2. Verificar produtos do evento 13
    console.log('📋 [2/3] Verificando produtos do evento 13...');
    const produtos = await db('event_products')
      .where('event_id', 13)
      .where('is_active', true)
      .orderBy('created_at', 'desc');
    
    console.log(`📊 Produtos encontrados: ${produtos.length}`);
    
    if (produtos.length > 0) {
      produtos.forEach((produto, index) => {
        console.log(`  ${index + 1}. ID: ${produto.id} | Nome: ${produto.name} | Preço: R$ ${produto.price}`);
      });
    } else {
      console.log('❌ Nenhum produto encontrado!');
    }
    
    // 3. Testar consulta completa (como na rota)
    console.log('📋 [3/3] Testando consulta completa...');
    const eventWithDetails = {
      ...evento,
      products: produtos,
      banner: evento.banner || 'https://via.placeholder.com/1200x400?text=Imagem+do+Evento',
      banner_home: evento.banner_home || evento.banner || 'https://via.placeholder.com/1200x400?text=Imagem+do+Evento',
      banner_evento: evento.banner_evento || evento.banner || 'https://via.placeholder.com/1200x400?text=Imagem+do+Evento'
    };
    
    console.log('✅ Consulta completa realizada');
    console.log(`📊 Produtos na resposta: ${eventWithDetails.products.length}`);
    
    if (eventWithDetails.products.length > 0) {
      console.log('📋 Produtos na resposta:');
      eventWithDetails.products.forEach((produto, index) => {
        console.log(`  ${index + 1}. ${produto.name} - R$ ${produto.price}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await db.destroy();
  }
}

testProdutosDireto(); 