const { db } = require('./src/database/db');

async function testProductionConnectionSpecific() {
  console.log('🧪 Testando conexão específica com banco de produção...');
  
  try {
    // Teste 1: Verificar configuração específica
    console.log('🧪 Teste 1: Verificar configuração específica');
    console.log('🔍 DATABASE_URL:', process.env.DATABASE_URL ? 'CONFIGURADO' : 'NÃO CONFIGURADO');
    console.log('🔍 NODE_ENV:', process.env.NODE_ENV);
    console.log('🔍 Client do banco:', db.client.config.client);
    console.log('🔍 Host:', db.client.config.connection.host);
    console.log('🔍 Database:', db.client.config.connection.database);
    console.log('🔍 User:', db.client.config.connection.user);
    
    // Teste 2: Testar query específica que está falhando
    console.log('\n🧪 Teste 2: Testar query específica que está falhando');
    try {
      const product1 = await db('store_products')
        .where('id', 1)
        .where('active', true)
        .first();
      console.log('✅ Query específica OK:', !!product1);
      if (product1) {
        console.log('✅ Dados do produto:', {
          id: product1.id,
          name: product1.name,
          price: product1.price,
          stock: product1.stock
        });
      }
    } catch (error) {
      console.log('❌ Erro na query específica:', error.message);
    }
    
    // Teste 3: Testar query sem filtro active
    console.log('\n🧪 Teste 3: Testar query sem filtro active');
    try {
      const product1NoActive = await db('store_products')
        .where('id', 1)
        .first();
      console.log('✅ Query sem active OK:', !!product1NoActive);
      if (product1NoActive) {
        console.log('✅ Dados do produto (sem active):', {
          id: product1NoActive.id,
          name: product1NoActive.name,
          price: product1NoActive.price,
          stock: product1NoActive.stock,
          active: product1NoActive.active
        });
      }
    } catch (error) {
      console.log('❌ Erro na query sem active:', error.message);
    }
    
    // Teste 4: Testar query com conversão de tipo
    console.log('\n🧪 Teste 4: Testar query com conversão de tipo');
    try {
      const productIdInt = parseInt('1');
      const product1Int = await db('store_products')
        .where('id', productIdInt)
        .where('active', true)
        .first();
      console.log('✅ Query com conversão OK:', !!product1Int);
      if (product1Int) {
        console.log('✅ Dados do produto (com conversão):', {
          id: product1Int.id,
          name: product1Int.name,
          price: product1Int.price,
          stock: product1Int.stock
        });
      }
    } catch (error) {
      console.log('❌ Erro na query com conversão:', error.message);
    }
    
    // Teste 5: Testar query com string
    console.log('\n🧪 Teste 5: Testar query com string');
    try {
      const product1String = await db('store_products')
        .where('id', '1')
        .where('active', true)
        .first();
      console.log('✅ Query com string OK:', !!product1String);
      if (product1String) {
        console.log('✅ Dados do produto (com string):', {
          id: product1String.id,
          name: product1String.name,
          price: product1String.price,
          stock: product1String.stock
        });
      }
    } catch (error) {
      console.log('❌ Erro na query com string:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error('❌ Stack:', error.stack);
  }
}

testProductionConnectionSpecific(); 