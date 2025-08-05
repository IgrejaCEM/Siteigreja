// Script para testar a conexão do backend com o banco
require('dotenv').config();

console.log('🔍 TESTANDO CONEXÃO DO BACKEND COM O BANCO...');
console.log('🔧 DATABASE_URL:', process.env.DATABASE_URL ? 'CONFIGURADO' : 'NÃO CONFIGURADO');

const { db } = require('./src/database/db');

async function testBackendConnection() {
  try {
    console.log('🔍 Testando conexão...');
    await db.raw('SELECT 1');
    console.log('✅ Conexão estabelecida!');
    
    // Verificar produtos
    console.log('🔍 Verificando produtos...');
    const products = await db('store_products').select('*');
    console.log('📦 Produtos encontrados:', products.length);
    
    if (products.length > 0) {
      console.log('📋 Lista de produtos:');
      products.forEach(product => {
        console.log(`   - ID: ${product.id}, Nome: ${product.name}, Preço: R$ ${product.price}`);
      });
      
      // Testar busca específica
      console.log('\n🔍 Testando busca específica:');
      for (let i = 1; i <= 3; i++) {
        const product = await db('store_products').where('id', i).first();
        if (product) {
          console.log(`✅ Produto ID ${i} encontrado: ${product.name} - R$ ${product.price}`);
        } else {
          console.log(`❌ Produto ID ${i} NÃO encontrado!`);
        }
      }
    } else {
      console.log('❌ Nenhum produto encontrado!');
    }
    
  } catch (error) {
    console.error('❌ Erro na conexão:', error);
  } finally {
    await db.destroy();
    process.exit(0);
  }
}

testBackendConnection(); 