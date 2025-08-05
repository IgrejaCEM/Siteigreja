// Script para verificar o estado atual do banco de produção
require('dotenv').config();

// Forçar uso do banco de produção do Render.com
process.env.DATABASE_URL = 'postgresql://postgres:WWiZILOORFMgerRjFMPSJLQrfLGFfviU@shuttle.proxy.rlwy.net:14638/railway';

const knex = require('knex');
const path = require('path');

// Configuração específica para produção
const productionConfig = {
  client: 'pg',
  connection: process.env.DATABASE_URL,
  pool: {
    min: 2,
    max: 10
  }
};

console.log('🔍 VERIFICANDO ESTADO DO BANCO DE PRODUÇÃO...');
console.log('🔧 URL do banco:', process.env.DATABASE_URL ? 'CONFIGURADO' : 'NÃO CONFIGURADO');

const db = knex(productionConfig);

async function checkProductionDB() {
  try {
    console.log('🔍 Testando conexão com banco de produção...');
    await db.raw('SELECT 1');
    console.log('✅ Conexão com banco de produção estabelecida!');
    
    // Verificar se a tabela existe
    const tableExists = await db.schema.hasTable('store_products');
    console.log('✅ Tabela store_products existe:', tableExists);
    
    if (tableExists) {
      // Verificar produtos existentes
      const products = await db('store_products').select('*');
      console.log('📦 Produtos encontrados no banco de PRODUÇÃO:', products.length);
      
      if (products.length > 0) {
        console.log('📋 Lista de produtos:');
        products.forEach(product => {
          console.log(`   - ID: ${product.id}, Nome: ${product.name}, Preço: R$ ${product.price}, Estoque: ${product.stock}`);
        });
        
        // Verificar especificamente os produtos 1, 2, 3
        console.log('\n🔍 Verificando produtos específicos:');
        for (let i = 1; i <= 3; i++) {
          const product = await db('store_products').where('id', i).first();
          if (product) {
            console.log(`✅ Produto ID ${i} encontrado: ${product.name} - R$ ${product.price}`);
          } else {
            console.log(`❌ Produto ID ${i} NÃO encontrado!`);
          }
        }
      } else {
        console.log('❌ Nenhum produto encontrado no banco de PRODUÇÃO!');
      }
    } else {
      console.log('❌ Tabela store_products não existe no banco de PRODUÇÃO!');
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar banco de PRODUÇÃO:', error);
    console.error('📋 Stack:', error.stack);
  } finally {
    await db.destroy();
    process.exit(0);
  }
}

checkProductionDB(); 