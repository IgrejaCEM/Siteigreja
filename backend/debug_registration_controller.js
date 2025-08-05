const { db } = require('./src/database/db');
const StoreProduct = require('./src/models/StoreProduct');

async function debugRegistrationController() {
  console.log('🔍 Debugando RegistrationController - Busca de produtos da loja...');
  
  try {
    // Simular exatamente o que o RegistrationController faz
    const productId = 1; // Bíblia Sagrada
    
    console.log('🔍 Testando busca por product_id:', productId);
    console.log('🔍 Tipo do product_id:', typeof productId);
    
    // Teste 1: StoreProduct.query().findById()
    console.log('\n🧪 Teste 1: StoreProduct.query().findById()');
    try {
      const storeProduct = await StoreProduct.query()
        .findById(productId)
        .where('active', true);
      
      console.log('✅ StoreProduct.query() resultado:', storeProduct);
      console.log('✅ Produto encontrado:', !!storeProduct);
      if (storeProduct) {
        console.log('✅ Nome:', storeProduct.name);
        console.log('✅ Preço:', storeProduct.price);
        console.log('✅ Estoque:', storeProduct.stock);
      }
    } catch (error) {
      console.error('❌ Erro no StoreProduct.query():', error.message);
    }
    
    // Teste 2: db() direto
    console.log('\n🧪 Teste 2: db() direto');
    try {
      const directProduct = await db('store_products')
        .where('id', productId)
        .where('active', true)
        .first();
      
      console.log('✅ db() direto resultado:', directProduct);
      console.log('✅ Produto encontrado:', !!directProduct);
      if (directProduct) {
        console.log('✅ Nome:', directProduct.name);
        console.log('✅ Preço:', directProduct.price);
        console.log('✅ Estoque:', directProduct.stock);
      }
    } catch (error) {
      console.error('❌ Erro no db() direto:', error.message);
    }
    
    // Teste 3: Verificar todos os produtos
    console.log('\n🧪 Teste 3: Verificar todos os produtos');
    try {
      const allProducts = await StoreProduct.query().where('active', true);
      console.log('✅ Total de produtos ativos:', allProducts.length);
      allProducts.forEach(p => {
        console.log(`   - ID: ${p.id}, Nome: ${p.name}, Preço: ${p.price}, Ativo: ${p.active}`);
      });
    } catch (error) {
      console.error('❌ Erro ao buscar todos os produtos:', error.message);
    }
    
    // Teste 4: Verificar tabela diretamente
    console.log('\n🧪 Teste 4: Verificar tabela diretamente');
    try {
      const allDirectProducts = await db('store_products').select('*');
      console.log('✅ Total de produtos na tabela:', allDirectProducts.length);
      allDirectProducts.forEach(p => {
        console.log(`   - ID: ${p.id}, Nome: ${p.name}, Preço: ${p.price}, Ativo: ${p.active}`);
      });
    } catch (error) {
      console.error('❌ Erro ao verificar tabela diretamente:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

debugRegistrationController(); 