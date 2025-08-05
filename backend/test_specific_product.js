const { db } = require('./src/database/db');

async function testSpecificProduct() {
  console.log('🧪 Testando produto específico...');
  
  try {
    // Teste 1: Verificar produto ID 1 na loja geral
    console.log('🧪 Teste 1: Verificar produto ID 1 na loja geral');
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
    
    // Teste 2: Listar todos os produtos da loja geral
    console.log('\n🧪 Teste 2: Listar todos os produtos da loja geral');
    const allProducts = await db('store_products').select('*');
    console.log('✅ Total de produtos:', allProducts.length);
    allProducts.forEach(p => {
      console.log(`   - ID: ${p.id}, Nome: ${p.name}, Preço: ${p.price}, Ativo: ${p.active}, Estoque: ${p.stock}`);
    });
    
    // Teste 3: Testar com dados exatos do frontend
    console.log('\n🧪 Teste 3: Simular processamento do RegistrationController');
    const testData = {
      event_id: 999,
      products: [
        {
          product_id: 1,
          quantity: 1,
          unit_price: 25
        }
      ]
    };
    
    console.log('📤 Dados de teste:', testData);
    
    let totalAmount = 0;
    const isStoreOnly = testData.event_id === 999;
    
    for (const product of testData.products) {
      console.log(`🛍️ Processando produto:`, product);
      
      let storeProduct = null;
      
      if (isStoreOnly) {
        console.log('🔍 Buscando na loja geral (store_products)...');
        storeProduct = await db('store_products')
          .where('id', product.product_id)
          .where('active', true)
          .first();
        console.log('🔍 Produto encontrado na loja geral:', !!storeProduct);
      }
      
      if (storeProduct) {
        const productTotal = storeProduct.price * product.quantity;
        totalAmount += productTotal;
        console.log(`💰 Produto ${storeProduct.name}: R$ ${storeProduct.price} x ${product.quantity} = R$ ${productTotal}`);
      } else {
        console.log(`❌ Produto ${product.product_id} não encontrado`);
      }
    }
    
    console.log(`💰 TotalAmount calculado: R$ ${totalAmount}`);
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error('❌ Stack:', error.stack);
  }
}

testSpecificProduct(); 