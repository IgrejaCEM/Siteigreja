// Script para forçar o backend a usar o banco de produção
require('dotenv').config();

// Forçar uso do banco de produção
process.env.DATABASE_URL = 'postgresql://postgres:WWiZILOORFMgerRjFMPSJLQrfLGFfviU@shuttle.proxy.rlwy.net:14638/railway';

console.log('🚀 FORÇANDO BACKEND A USAR BANCO DE PRODUÇÃO...');
console.log('🔧 DATABASE_URL:', process.env.DATABASE_URL);

// Importar o backend com a configuração forçada
const { db } = require('./src/database/db');

async function testProductionBackend() {
  try {
    console.log('🔍 Testando conexão do backend com banco de PRODUÇÃO...');
    await db.raw('SELECT 1');
    console.log('✅ Conexão estabelecida!');
    
    // Verificar produtos
    console.log('🔍 Verificando produtos no backend...');
    const products = await db('store_products').select('*');
    console.log('📦 Produtos encontrados no backend:', products.length);
    
    if (products.length > 0) {
      console.log('📋 Lista de produtos no backend:');
      products.forEach(product => {
        console.log(`   - ID: ${product.id}, Nome: ${product.name}, Preço: R$ ${product.price}`);
      });
      
      // Testar busca específica
      console.log('\n🔍 Testando busca específica no backend:');
      for (let i = 1; i <= 3; i++) {
        const product = await db('store_products').where('id', i).first();
        if (product) {
          console.log(`✅ Produto ID ${i} encontrado no backend: ${product.name} - R$ ${product.price}`);
        } else {
          console.log(`❌ Produto ID ${i} NÃO encontrado no backend!`);
        }
      }
      
      // Simular uma requisição de registro
      console.log('\n🧪 Simulando requisição de registro...');
      const testData = {
        event_id: 999,
        customer: {
          name: 'Teste Usuário',
          email: 'teste@teste.com',
          phone: '11999999999',
          cpf: null
        },
        items: [],
        products: [
          { product_id: 1, quantity: 1, unit_price: 45 },
          { product_id: 2, quantity: 1, unit_price: 35 }
        ]
      };
      
      console.log('📦 Dados de teste:', JSON.stringify(testData, null, 2));
      
      // Testar se os produtos são encontrados
      for (const product of testData.products) {
        const foundProduct = await db('store_products').where('id', product.product_id).first();
        if (foundProduct) {
          console.log(`✅ Produto ${product.product_id} encontrado: ${foundProduct.name} - R$ ${foundProduct.price}`);
        } else {
          console.log(`❌ Produto ${product.product_id} NÃO encontrado!`);
        }
      }
      
    } else {
      console.log('❌ Nenhum produto encontrado no backend!');
    }
    
  } catch (error) {
    console.error('❌ Erro no backend:', error);
  } finally {
    await db.destroy();
    process.exit(0);
  }
}

testProductionBackend(); 