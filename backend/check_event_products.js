const { db } = require('./src/database/db');

async function checkEventProducts() {
  console.log('🧪 Verificando produtos do evento...');
  
  try {
    // Teste 1: Verificar tabela event_products
    console.log('🧪 Teste 1: Verificar tabela event_products');
    const tableExists = await db.schema.hasTable('event_products');
    console.log('✅ Tabela event_products existe:', tableExists);
    
    if (tableExists) {
      // Teste 2: Contar produtos
      console.log('\n🧪 Teste 2: Contar produtos');
      const count = await db('event_products').count('* as total');
      console.log('✅ Total de produtos:', count[0].total);
      
      // Teste 3: Listar todos os produtos
      console.log('\n🧪 Teste 3: Listar todos os produtos');
      const allProducts = await db('event_products').select('*');
      console.log('✅ Produtos encontrados:', allProducts.length);
      allProducts.forEach(p => {
        console.log(`   - ID: ${p.id}, Event ID: ${p.event_id}, Nome: ${p.name}, Preço: ${p.price}`);
      });
      
      // Teste 4: Buscar produtos do evento 14
      console.log('\n🧪 Teste 4: Buscar produtos do evento 14');
      const event14Products = await db('event_products')
        .where('event_id', 14)
        .select('*');
      console.log('✅ Produtos do evento 14:', event14Products.length);
      event14Products.forEach(p => {
        console.log(`   - ID: ${p.id}, Nome: ${p.name}, Preço: ${p.price}`);
      });
      
      // Teste 5: Buscar produtos do evento 999 (loja geral)
      console.log('\n🧪 Teste 5: Buscar produtos do evento 999 (loja geral)');
      const event999Products = await db('event_products')
        .where('event_id', 999)
        .select('*');
      console.log('✅ Produtos do evento 999:', event999Products.length);
      event999Products.forEach(p => {
        console.log(`   - ID: ${p.id}, Nome: ${p.name}, Preço: ${p.price}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error('❌ Stack:', error.stack);
  }
}

checkEventProducts(); 