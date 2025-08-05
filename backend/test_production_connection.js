const { db } = require('./src/database/db');

async function testProductionConnection() {
  console.log('🔍 Testando conexão com banco de produção...');
  
  try {
    // Testar conexão básica
    console.log('🧪 Teste 1: Conexão básica');
    const testConnection = await db.raw('SELECT 1 as test');
    console.log('✅ Conexão OK:', testConnection.rows[0]);
    
    // Verificar se a tabela existe
    console.log('\n🧪 Teste 2: Verificar tabela store_products');
    const tableExists = await db.schema.hasTable('store_products');
    console.log('✅ Tabela store_products existe:', tableExists);
    
    if (tableExists) {
      // Contar produtos
      console.log('\n🧪 Teste 3: Contar produtos');
      const count = await db('store_products').count('* as total');
      console.log('✅ Total de produtos:', count[0].total);
      
      // Listar todos os produtos
      console.log('\n🧪 Teste 4: Listar todos os produtos');
      const allProducts = await db('store_products').select('*');
      console.log('✅ Produtos encontrados:', allProducts.length);
      allProducts.forEach(p => {
        console.log(`   - ID: ${p.id}, Nome: ${p.name}, Preço: ${p.price}, Ativo: ${p.active}`);
      });
      
      // Testar busca específica
      console.log('\n🧪 Teste 5: Buscar produto ID 1');
      const product1 = await db('store_products')
        .where('id', 1)
        .where('active', true)
        .first();
      console.log('✅ Produto ID 1 encontrado:', !!product1);
      if (product1) {
        console.log('✅ Nome:', product1.name);
        console.log('✅ Preço:', product1.price);
        console.log('✅ Estoque:', product1.stock);
      }
      
      // Testar busca por ID 7 (que estava falhando)
      console.log('\n🧪 Teste 6: Buscar produto ID 7');
      const product7 = await db('store_products')
        .where('id', 7)
        .where('active', true)
        .first();
      console.log('✅ Produto ID 7 encontrado:', !!product7);
      if (product7) {
        console.log('✅ Nome:', product7.name);
        console.log('✅ Preço:', product7.price);
        console.log('✅ Estoque:', product7.stock);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error('❌ Stack:', error.stack);
  }
}

testProductionConnection(); 