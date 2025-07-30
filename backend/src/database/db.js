const knex = require('knex');
const path = require('path');
const bcrypt = require('bcrypt');
const config = require('../config');
const { Model } = require('objection');

// Forçar uso do PostgreSQL em produção
const databaseConfig = {
  client: 'pg',
  connection: process.env.DATABASE_URL || 'postgresql://postgres:WWiZILOORFMgerRjFMPSJLQrfLGFfviU@shuttle.proxy.rlwy.net:14638/railway',
  migrations: {
    directory: path.resolve(__dirname, 'migrations')
  },
  seeds: {
    directory: path.resolve(__dirname, 'seeds')
  }
};

const db = knex(databaseConfig);

// Configurar Objection.js com a instância do Knex
Model.knex(db);

// Função para inicializar o banco de dados
const initializeDatabase = async () => {
  try {
    console.log('🔧 Inicializando banco de dados PostgreSQL...');
    
    // Verificar conexão
    await db.raw('SELECT 1');
    console.log('✅ Conexão com PostgreSQL estabelecida');
    
    // Executar migrações
    try {
      await db.migrate.latest();
      console.log('✅ Migrações executadas com sucesso');
    } catch (migrationError) {
      console.log('⚠️ Erro nas migrações:', migrationError.message);
    }
    
    // Criar usuário admin padrão se não existir
    try {
      const adminExists = await db('users').where('email', 'admin@admin.com').first();
      if (!adminExists) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await db('users').insert({
          name: 'Admin',
          email: 'admin@admin.com',
          password: hashedPassword,
          is_admin: true
        });
        console.log('✅ Usuário admin criado com sucesso');
      } else {
        console.log('ℹ️ Usuário admin já existe');
      }
    } catch (error) {
      console.log('⚠️ Erro ao criar usuário admin:', error.message);
    }
    
    console.log('🎉 Banco de dados inicializado com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao inicializar banco:', error);
    throw error;
  }
};

module.exports = {
  db,
  initializeDatabase
}; 