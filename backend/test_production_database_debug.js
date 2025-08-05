const { db } = require('./src/database/db');

async function testProductionDatabaseDebug() {
  console.log('🧪 Testando banco de produção com debug detalhado...');
  
  try {
    // Teste 1: Verificar configuração
    console.log('🧪 Teste 1: Verificar configuração');
    console.log('🔍 DATABASE_URL:', process.env.DATABASE_URL ? 'CONFIGURADO' : 'NÃO CONFIGURADO');
    console.log('🔍 NODE_ENV:', process.env.NODE_ENV);
    console.log('🔍 Client do banco:', db.client.config.client);
    console.log('🔍 Host:', db.client.config.connection.host);
    console.log('🔍 Database:', db.client.config.connection.database);
    console.log('🔍 User:', db.client.config.connection.user);
    
    // Teste 2: Conexão básica
    console.log('\n🧪 Teste 2: Conexão básica');
    const testConnection = await db.raw('SELECT 1 as test');
    console.log('✅ Conexão OK:', testConnection.rows[0]);
    
    // Teste 3: Verificar tabela store_products
    console.log('\n🧪 Teste 3: Verificar tabela store_products');
    const tableExists = await db.schema.hasTable('store_products');
    console.log('✅ Tabela store_products existe:', tableExists);
    
    if (tableExists) {
      // Teste 4: Contar produtos
      console.log('\n🧪 Teste 4: Contar produtos');
      const count = await db('store_products').count('* as total');
      console.log('✅ Total de produtos:', count[0].total);
      
      // Teste 5: Listar todos os produtos
      console.log('\n🧪 Teste 5: Listar todos os produtos');
      const allProducts = await db('store_products').select('*');
      console.log('✅ Produtos encontrados:', allProducts.length);
      allProducts.forEach(p => {
        console.log(`   - ID: ${p.id}, Nome: ${p.name}, Preço: ${p.price}, Ativo: ${p.active}, Estoque: ${p.stock}`);
      });
      
      // Teste 6: Buscar produto específico
      console.log('\n🧪 Teste 6: Buscar produto ID 1');
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
      
      // Teste 7: Simular exatamente o que o RegistrationController faz
      console.log('\n🧪 Teste 7: Simular RegistrationController');
      const testProduct = {
        product_id: 1,
        quantity: 1,
        unit_price: 25
      };
      
      console.log('📤 Dados de teste:', testProduct);
      
      let storeProduct = null;
      try {
        storeProduct = await db('store_products')
          .where('id', testProduct.product_id)
          .where('active', true)
          .first();
        console.log('🔍 Produto encontrado:', !!storeProduct);
        if (storeProduct) {
          console.log('🔍 Dados do produto:', {
            id: storeProduct.id,
            name: storeProduct.name,
            price: storeProduct.price,
            stock: storeProduct.stock
          });
          
          // Calcular valor
          const productValue = storeProduct.price * testProduct.quantity;
          console.log(`💰 Produto ${storeProduct.name}: R$ ${storeProduct.price} x ${testProduct.quantity} = R$ ${productValue}`);
        }
      } catch (error) {
        console.log('❌ Erro ao buscar produto:', error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error('❌ Stack:', error.stack);
  }
}

testProductionDatabaseDebug(); 