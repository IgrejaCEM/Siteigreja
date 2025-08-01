const { db } = require('./src/database/db');

async function testTotalCalculation() {
  try {
    console.log('🧪 Testando cálculo do totalAmount...');
    
    // Simular dados do pedido
    const items = [
      {
        type: 'EVENT_TICKET',
        name: 'Ingresso - FREE TESTE',
        price: 50,
        quantity: 1,
        lot_id: 1
      }
    ];
    
    const products = [
      {
        product_id: 1,
        quantity: 1,
        unit_price: 25
      }
    ];
    
    console.log('📦 Itens:', items);
    console.log('🏪 Produtos:', products);
    
    let totalAmount = 0;
    console.log('💰 Iniciando cálculo do valor total...');
    
    // Processar itens
    if (items && items.length > 0) {
      console.log('🛍️ Processando itens:', items);
      console.log('💰 TotalAmount antes dos itens:', totalAmount);
      
      for (const item of items) {
        if (item.type === 'EVENT_TICKET') {
          if (item.lot_id) {
            console.log('🔍 Buscando lote:', item.lot_id);
            const lot = await db('lots')
              .where('id', item.lot_id)
              .first();
            
            console.log('🔍 Lote encontrado:', lot);
            
            if (lot) {
              totalAmount += lot.price * item.quantity;
              console.log(`✅ Ingresso do lote ${lot.name} adicionado - R$ ${lot.price}`);
              console.log(`💰 TotalAmount após ingresso: R$ ${totalAmount}`);
            } else {
              console.log('❌ Lote não encontrado');
            }
          } else {
            totalAmount += item.price * item.quantity;
            console.log(`✅ Ingresso adicionado - R$ ${item.price}`);
            console.log(`💰 TotalAmount após ingresso: R$ ${totalAmount}`);
          }
        }
      }
    }
    
    console.log('💰 TotalAmount após processar itens:', totalAmount);
    
    // Processar produtos da loja
    if (products && products.length > 0) {
      console.log('🏪 Processando produtos da loja:', products);
      
      for (const product of products) {
        console.log('🔍 Buscando produto da loja:', product.product_id);
        
        const storeProduct = await db('store_products')
          .where('id', product.product_id)
          .first();
        
        console.log('🔍 Produto encontrado:', storeProduct);
        
        if (storeProduct) {
          totalAmount += product.unit_price * product.quantity;
          console.log(`✅ Produto da loja ${storeProduct.name} adicionado`);
          console.log(`💰 TotalAmount após produto da loja: R$ ${totalAmount}`);
        } else {
          console.log('❌ Produto da loja não encontrado');
        }
      }
    }
    
    console.log('💰 TotalAmount final:', totalAmount);
    
    if (totalAmount <= 0) {
      console.log('⚠️ TotalAmount é inválido:', totalAmount);
    } else {
      console.log('✅ TotalAmount válido:', totalAmount);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    process.exit(0);
  }
}

testTotalCalculation(); 