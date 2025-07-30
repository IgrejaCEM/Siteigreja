const knex = require('knex');

// Configuração PostgreSQL (produção)
const db = knex({
  client: 'pg',
  connection: 'postgresql://postgres:WWiZILOORFMgerRjFMPSJLQrfLGFfviU@shuttle.proxy.rlwy.net:14638/railway'
});

async function verificarEventosExistentes() {
  console.log('🔍 VERIFICANDO EVENTOS EXISTENTES');
  console.log('===================================');
  
  try {
    // 1. Verificar conexão
    console.log('📋 [1/3] Verificando conexão...');
    await db.raw('SELECT 1');
    console.log('✅ Conexão com PostgreSQL estabelecida');
    
    // 2. Verificar se a tabela events existe
    console.log('📋 [2/3] Verificando tabela events...');
    const hasEventsTable = await db.schema.hasTable('events');
    console.log(`📊 Tabela events existe: ${hasEventsTable}`);
    
    if (!hasEventsTable) {
      console.log('❌ Tabela events não existe!');
      return;
    }
    
    // 3. Listar todos os eventos
    console.log('📋 [3/3] Listando eventos existentes...');
    const eventos = await db('events').select('*').orderBy('id');
    console.log(`📊 Total de eventos: ${eventos.length}`);
    
    if (eventos.length > 0) {
      console.log('📋 Eventos encontrados:');
      eventos.forEach((evento, index) => {
        console.log(`  ${index + 1}. ID: ${evento.id} | Título: ${evento.title} | Slug: ${evento.slug} | Status: ${evento.status}`);
      });
    } else {
      console.log('❌ Nenhum evento encontrado!');
    }
    
    // 4. Verificar produtos existentes
    console.log('\n📋 Verificando produtos existentes...');
    const produtos = await db('event_products').select('*').orderBy('id');
    console.log(`📊 Total de produtos: ${produtos.length}`);
    
    if (produtos.length > 0) {
      console.log('📋 Produtos encontrados:');
      produtos.forEach((produto, index) => {
        console.log(`  ${index + 1}. ID: ${produto.id} | Nome: ${produto.name} | Event ID: ${produto.event_id} | Preço: R$ ${produto.price}`);
      });
    } else {
      console.log('❌ Nenhum produto encontrado!');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await db.destroy();
  }
}

verificarEventosExistentes(); 