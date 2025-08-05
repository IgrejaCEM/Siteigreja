// Script para forçar seed no banco de produção do Render.com
require('dotenv').config();

// Forçar uso do banco de produção do Render.com
process.env.DATABASE_URL = 'postgresql://postgres:WWiZILOORFMgerRjFMPSJLQrfLGFfviU@shuttle.proxy.rlwy.net:14638/railway';

const knex = require('knex');
const path = require('path');

// Configuração específica para produção
const productionConfig = {
  client: 'pg',
  connection: process.env.DATABASE_URL,
  migrations: {
    directory: path.resolve(__dirname, 'src/database/migrations')
  },
  seeds: {
    directory: path.resolve(__dirname, 'src/database/seeds')
  },
  pool: {
    min: 2,
    max: 10
  }
};

console.log('🚀 CONECTANDO AO BANCO DE PRODUÇÃO DO RENDER.COM...');
console.log('🔧 URL do banco:', process.env.DATABASE_URL ? 'CONFIGURADO' : 'NÃO CONFIGURADO');

const db = knex(productionConfig);

async function forceProductionSeed() {
  try {
    console.log('🔍 Testando conexão com banco de produção...');
    await db.raw('SELECT 1');
    console.log('✅ Conexão com banco de produção estabelecida!');
    
    // Verificar se a tabela existe
    const tableExists = await db.schema.hasTable('store_products');
    console.log('✅ Tabela store_products existe:', tableExists);
    
    if (!tableExists) {
      console.log('❌ Tabela store_products não existe! Criando...');
      await db.schema.createTable('store_products', (table) => {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.text('description');
        table.decimal('price', 10, 2).notNullable();
        table.integer('stock').defaultTo(0);
        table.string('image_url');
        table.string('category');
        table.boolean('active').defaultTo(true);
        table.timestamps(true, true);
      });
      console.log('✅ Tabela store_products criada!');
    }
    
    // Verificar produtos existentes
    const existingProducts = await db('store_products').select('*');
    console.log('📦 Produtos existentes no banco de PRODUÇÃO:', existingProducts.length);
    
    if (existingProducts.length > 0) {
      console.log('🧹 Limpando produtos existentes...');
      try {
        // Desabilitar foreign key checks temporariamente
        await db.raw('SET session_replication_role = replica;');
        await db('store_products').del();
        await db.raw('SET session_replication_role = DEFAULT;');
        console.log('✅ Produtos existentes removidos');
      } catch (error) {
        console.log('⚠️ Erro ao limpar produtos:', error.message);
      }
    }
    
    // Inserir produtos manualmente
    console.log('🌱 Inserindo produtos no banco de PRODUÇÃO...');
    const products = [
      {
        id: 1,
        name: 'Bíblia Sagrada',
        description: 'Bíblia Sagrada',
        price: 45.00,
        stock: 20,
        image_url: 'https://via.placeholder.com/300x300?text=Biblia',
        category: 'livros',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 2,
        name: 'Camiseta "Fé"',
        description: 'Camiseta "Fé"',
        price: 35.00,
        stock: 50,
        image_url: 'https://via.placeholder.com/300x300?text=Camiseta',
        category: 'vestuario',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 3,
        name: 'Caneca Personalizada',
        description: 'Caneca Personalizada',
        price: 25.00,
        stock: 30,
        image_url: 'https://via.placeholder.com/300x300?text=Caneca',
        category: 'acessorios',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 4,
        name: 'Livro de Orações',
        description: 'Livro de Orações',
        price: 30.00,
        stock: 14,
        image_url: 'https://via.placeholder.com/300x300?text=Livro',
        category: 'livros',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 5,
        name: 'Chaveiro da Igreja',
        description: 'Chaveiro da Igreja',
        price: 15.00,
        stock: 40,
        image_url: 'https://via.placeholder.com/300x300?text=Chaveiro',
        category: 'acessorios',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 6,
        name: 'CD de Louvores',
        description: 'CD de Louvores',
        price: 20.00,
        stock: 22,
        image_url: 'https://via.placeholder.com/300x300?text=CD',
        category: 'musica',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 7,
        name: 'CAMISET',
        description: 'TESTE',
        price: 50.00,
        stock: 5,
        image_url: 'https://via.placeholder.com/300x300?text=CAMISET',
        category: 'vestuario',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];
    
    await db('store_products').insert(products);
    console.log('✅ Produtos inseridos com sucesso no banco de PRODUÇÃO!');
    
    // Verificar produtos inseridos
    const insertedProducts = await db('store_products').select('*');
    console.log('📦 Produtos encontrados no banco de PRODUÇÃO:', insertedProducts.length);
    
    insertedProducts.forEach(product => {
      console.log(`   - ID: ${product.id}, Nome: ${product.name}, Preço: R$ ${product.price}, Estoque: ${product.stock}`);
    });
    
    // Verificar especificamente o produto ID 7
    const product7 = await db('store_products').where('id', 7).first();
    console.log('\n🔍 Produto ID 7 no banco de PRODUÇÃO:', product7);
    
    if (product7) {
      console.log('✅ Produto ID 7 encontrado no banco de PRODUÇÃO!');
    } else {
      console.log('❌ Produto ID 7 NÃO encontrado no banco de PRODUÇÃO!');
    }
    
  } catch (error) {
    console.error('❌ Erro ao executar seed no banco de PRODUÇÃO:', error);
    console.error('📋 Stack:', error.stack);
  } finally {
    await db.destroy();
    process.exit(0);
  }
}

forceProductionSeed(); 