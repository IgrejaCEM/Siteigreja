const { db } = require('./src/database/db');

console.log('🔍 Verificando coluna products na tabela registrations...');

async function verificarColunaProducts() {
  try {
    console.log('📋 Passo 1: Verificando estrutura da tabela registrations...');
    
    // Verificar se a tabela registrations existe
    const registrationsExists = await db.schema.hasTable('registrations');
    console.log('📊 Tabela registrations existe:', registrationsExists);
    
    if (registrationsExists) {
      // Verificar estrutura da tabela
      const columns = await db('registrations').columnInfo();
      console.log('📋 Colunas da tabela registrations:', Object.keys(columns));
      
      // Verificar se a coluna products existe
      const hasProductsColumn = Object.keys(columns).includes('products');
      console.log('🛍️ Coluna products existe:', hasProductsColumn);
      
      if (hasProductsColumn) {
        console.log('📋 Tipo da coluna products:', columns.products.type);
        console.log('📋 Configuração da coluna products:', columns.products);
      }
      
      // Contar registros com produtos (usando sintaxe PostgreSQL)
      const countWithProducts = await db('registrations')
        .whereNotNull('products')
        .whereRaw("products::text != '[]'")
        .count('* as total').first();
      
      console.log('📊 Registrations com produtos:', countWithProducts.total);
      
      // Listar alguns registrations com produtos
      const registrationsWithProducts = await db('registrations')
        .select('id', 'name', 'email', 'products', 'created_at')
        .whereNotNull('products')
        .whereRaw("products::text != '[]'")
        .orderBy('created_at', 'desc')
        .limit(5);
      
      console.log('\n📋 Últimos registrations com produtos:');
      registrationsWithProducts.forEach((registration, index) => {
        console.log(`${index + 1}. ID: ${registration.id}`);
        console.log(`   Nome: ${registration.name}`);
        console.log(`   Email: ${registration.email}`);
        console.log(`   Produtos: ${registration.products}`);
        console.log(`   Data: ${registration.created_at}`);
        console.log('');
      });
    }
    
    console.log('\n📋 Passo 2: Verificando dados financeiros...');
    
    // Verificar se os produtos estão sendo incluídos no cálculo financeiro
    const registrations = await db('registrations')
      .select('*')
      .whereNotNull('products')
      .whereRaw("products::text != '[]'")
      .orderBy('created_at', 'desc')
      .limit(3);
    
    console.log('📊 Registrations para análise financeira:', registrations.length);
    
    registrations.forEach((registration, index) => {
      console.log(`\n📋 Registration ${index + 1}:`);
      console.log(`   ID: ${registration.id}`);
      console.log(`   Nome: ${registration.name}`);
      console.log(`   Status: ${registration.status}`);
      console.log(`   Payment Status: ${registration.payment_status}`);
      console.log(`   Produtos: ${registration.products}`);
      
      // Tentar calcular o valor dos produtos
      try {
        if (registration.products) {
          const products = JSON.parse(registration.products);
          const productsTotal = products.reduce((total, product) => {
            return total + (parseFloat(product.price) * product.quantity);
          }, 0);
          
          console.log(`   Valor dos produtos: R$ ${productsTotal.toFixed(2)}`);
          console.log(`   Produtos detalhados:`, products);
        }
      } catch (error) {
        console.log(`   Erro ao processar produtos: ${error.message}`);
      }
    });
    
    console.log('\n🎯 RESUMO:');
    console.log('✅ Verificação da coluna products concluída');
    console.log('✅ Dados financeiros analisados');
    
  } catch (error) {
    console.error('❌ Erro ao verificar coluna products:', error);
  } finally {
    process.exit(0);
  }
}

verificarColunaProducts(); 