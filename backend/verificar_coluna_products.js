const { db } = require('./src/database/db');

console.log('🔍 Verificando coluna products na tabela registrations...');

async function verificarColunaProducts() {
  try {
    console.log('📋 Verificando estrutura da tabela registrations...');
    
    // Verificar se a coluna products existe
    const columns = await db('registrations').columnInfo();
    console.log('📋 Colunas da tabela registrations:', Object.keys(columns));
    
    if (columns.products) {
      console.log('✅ Coluna products existe!');
      console.log('📋 Tipo da coluna products:', columns.products.type);
    } else {
      console.log('❌ Coluna products não existe!');
      return;
    }
    
    // Verificar registrations com produtos
    console.log('📋 Buscando registrations com produtos...');
    const registrationsComProdutos = await db('registrations')
      .whereNotNull('products')
      .whereRaw("products::text != '[]'");
    
    console.log(`📊 Encontrados ${registrationsComProdutos.length} registrations com produtos`);
    
    if (registrationsComProdutos.length > 0) {
      console.log('📋 Primeira registration com produtos:', {
        id: registrationsComProdutos[0].id,
        name: registrationsComProdutos[0].name,
        products: registrationsComProdutos[0].products
      });
    }
    
    // Verificar todas as registrations
    console.log('📋 Verificando todas as registrations...');
    const todasRegistrations = await db('registrations').select('id', 'name', 'products');
    console.log(`📊 Total de registrations: ${todasRegistrations.length}`);
    
    const comProdutos = todasRegistrations.filter(r => r.products && r.products !== '[]');
    console.log(`📊 Registrations com produtos: ${comProdutos.length}`);
    
  } catch (error) {
    console.error('❌ Erro ao verificar coluna products:', error);
  } finally {
    process.exit(0);
  }
}

verificarColunaProducts(); 