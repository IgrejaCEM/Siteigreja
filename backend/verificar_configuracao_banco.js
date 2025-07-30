const knex = require('knex');
const path = require('path');

console.log('🔍 VERIFICANDO CONFIGURAÇÃO DO BANCO');
console.log('=====================================');

// Configuração SQLite (desenvolvimento)
const sqliteConfig = {
  client: 'sqlite3',
  connection: {
    filename: path.join(__dirname, 'database.sqlite')
  },
  useNullAsDefault: true
};

// Configuração PostgreSQL (produção)
const postgresConfig = {
  client: 'pg',
  connection: 'postgresql://postgres:WWiZILOORFMgerRjFMPSJLQrfLGFfviU@shuttle.proxy.rlwy.net:14638/railway'
};

async function testDatabase(config, name) {
  console.log(`\n📋 Testando configuração: ${name}`);
  console.log('=====================================');
  
  try {
    const db = knex(config);
    
    // Testar conexão
    console.log('🔌 Testando conexão...');
    await db.raw('SELECT 1');
    console.log('✅ Conexão estabelecida com sucesso');
    
    // Verificar se a tabela event_products existe
    console.log('📋 Verificando tabela event_products...');
    const hasTable = await db.schema.hasTable('event_products');
    console.log(`📊 Tabela event_products existe: ${hasTable}`);
    
    if (hasTable) {
      // Contar produtos
      const count = await db('event_products').count('* as total');
      console.log(`📊 Total de produtos: ${count[0].total}`);
      
      // Listar produtos
      const products = await db('event_products').select('*');
      console.log('📋 Produtos encontrados:');
      products.forEach((product, index) => {
        console.log(`  ${index + 1}. ID: ${product.id} | Nome: ${product.name} | Preço: ${product.price} | Event ID: ${product.event_id}`);
      });
    }
    
    await db.destroy();
    console.log('✅ Conexão fechada');
    
  } catch (error) {
    console.log(`❌ Erro na configuração ${name}:`, error.message);
  }
}

async function main() {
  console.log('🔍 Verificando configurações de banco...');
  
  // Testar SQLite
  await testDatabase(sqliteConfig, 'SQLite (Desenvolvimento)');
  
  // Testar PostgreSQL
  await testDatabase(postgresConfig, 'PostgreSQL (Produção)');
  
  console.log('\n🎯 CONCLUSÃO:');
  console.log('Verifique qual configuração está sendo usada em produção');
}

main().catch(console.error); 