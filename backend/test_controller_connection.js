// Script para testar a conexão do controller especificamente
require('dotenv').config();

// Forçar uso do banco de produção
process.env.DATABASE_URL = 'postgresql://postgres:WWiZILOORFMgerRjFMPSJLQrfLGFfviU@shuttle.proxy.rlwy.net:14638/railway';

console.log('🔍 TESTANDO CONEXÃO DO CONTROLLER...');
console.log('🔧 DATABASE_URL:', process.env.DATABASE_URL);

// Importar o controller e o banco
const { db } = require('./src/database/db');

async function testControllerConnection() {
  try {
    console.log('🔍 Testando conexão...');
    await db.raw('SELECT 1');
    console.log('✅ Conexão estabelecida!');
    
    // Testar busca de produtos como o controller faz
    console.log('🔍 Testando busca de produtos como o controller...');
    const products = await db('store_products').select('*');
    console.log('📦 Produtos encontrados:', products.length);
    
    if (products.length > 0) {
      console.log('📋 Lista de produtos:');
      products.forEach(product => {
        console.log(`   - ID: ${product.id}, Nome: ${product.name}, Preço: R$ ${product.price}`);
      });
      
      // Testar busca específica como o controller
      console.log('\n🔍 Testando busca específica como o controller...');
      for (let i = 1; i <= 3; i++) {
        const product = await db('store_products').where('id', i).first();
        if (product) {
          console.log(`✅ Produto ID ${i} encontrado: ${product.name} - R$ ${product.price}`);
        } else {
          console.log(`❌ Produto ID ${i} NÃO encontrado!`);
        }
      }
      
      // Simular exatamente o que o controller faz
      console.log('\n🧪 Simulando exatamente o que o controller faz...');
      const testProducts = [
        { product_id: 1, quantity: 1, unit_price: 45 },
        { product_id: 2, quantity: 1, unit_price: 35 },
        { product_id: 3, quantity: 1, unit_price: 25 }
      ];
      
      for (const product of testProducts) {
        console.log(`🔍 Buscando produto ${product.product_id}...`);
        const productId = parseInt(product.product_id);
        const foundProduct = await db('store_products').where('id', productId).first();
        
        if (foundProduct) {
          console.log(`✅ Produto ${product.product_id} encontrado: ${foundProduct.name} - R$ ${foundProduct.price}`);
        } else {
          console.log(`❌ Produto ${product.product_id} NÃO encontrado!`);
        }
      }
      
    } else {
      console.log('❌ Nenhum produto encontrado!');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await db.destroy();
    process.exit(0);
  }
}

testControllerConnection(); 