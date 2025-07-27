const knex = require('knex');
const path = require('path');
const bcrypt = require('bcrypt');
const config = require('../config');

const db = knex(config.database);

// Função para inicializar o banco de dados
const initializeDatabase = async () => {
  try {
    console.log('🔧 Inicializando banco de dados...');
    
    // Criar tabela de usuários se não existir
    try {
      await db.schema.createTable('users', table => {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.string('email').unique().notNullable();
        table.string('password').notNullable();
        table.boolean('is_admin').defaultTo(false);
        table.timestamps(true, true);
      });
      console.log('✅ Tabela de usuários criada');
    } catch (error) {
      if (error.code === 'SQLITE_ERROR' && error.message.includes('already exists')) {
        console.log('ℹ️ Tabela de usuários já existe');
      } else {
        throw error;
      }
    }

    // Criar usuário admin padrão
    try {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await db('users').insert({
        name: 'Admin',
        email: 'admin@admin.com',
        password: hashedPassword,
        is_admin: true
      });
      console.log('✅ Usuário admin criado com sucesso');
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT') {
        console.log('ℹ️ Usuário admin já existe');
      } else {
        throw error;
      }
    }

    // Criar tabela de eventos se não existir
    try {
      await db.schema.createTable('events', table => {
        table.increments('id').primary();
        table.string('title').notNullable();
        table.text('description');
        table.datetime('date').notNullable();
        table.string('location').notNullable();
        table.decimal('price', 10, 2);
        table.string('banner');
        table.string('banner_home');
        table.string('banner_evento');
        table.string('slug').unique();
        table.string('status').defaultTo('active');
        table.json('registration_form');
        table.timestamps(true, true);
      });
      console.log('✅ Tabela de eventos criada');
    } catch (error) {
      if (error.code === 'SQLITE_ERROR' && error.message.includes('already exists')) {
        console.log('ℹ️ Tabela de eventos já existe');
      } else {
        throw error;
      }
    }

    // Criar tabela de lotes se não existir
    try {
      await db.schema.createTable('lots', table => {
        table.increments('id').primary();
        table.integer('event_id').references('id').inTable('events').onDelete('CASCADE');
        table.string('name').notNullable();
        table.decimal('price', 10, 2).notNullable();
        table.integer('quantity').notNullable();
        table.datetime('start_date').notNullable();
        table.datetime('end_date').notNullable();
        table.timestamps(true, true);
      });
      console.log('✅ Tabela de lotes criada');
    } catch (error) {
      if (error.code === 'SQLITE_ERROR' && error.message.includes('already exists')) {
        console.log('ℹ️ Tabela de lotes já existe');
      } else {
        throw error;
      }
    }

    // Criar tabela de inscrições se não existir
    try {
      await db.schema.createTable('registrations', table => {
        table.increments('id').primary();
        table.integer('event_id').references('id').inTable('events').onDelete('CASCADE');
        table.integer('user_id').references('id').inTable('users').onDelete('CASCADE');
        table.integer('lot_id').references('id').inTable('lots').onDelete('SET NULL');
        table.string('payment_status').defaultTo('pending');
        table.json('form_data');
        table.timestamps(true, true);
      });
      console.log('✅ Tabela de inscrições criada');
    } catch (error) {
      if (error.code === 'SQLITE_ERROR' && error.message.includes('already exists')) {
        console.log('ℹ️ Tabela de inscrições já existe');
      } else {
        throw error;
      }
    }

    // Criar tabela de configurações se não existir
    try {
      await db.schema.createTable('settings', table => {
        table.increments('id').primary();
        table.json('homeContent');
        table.text('homeCss');
        table.json('homeLayout');
        table.timestamps(true, true);
      });
      console.log('✅ Tabela de configurações criada');
    } catch (error) {
      if (error.code === 'SQLITE_ERROR' && error.message.includes('already exists')) {
        console.log('ℹ️ Tabela de configurações já existe');
      } else {
        throw error;
      }
    }

    console.log('✅ Banco de dados inicializado com sucesso');
  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error);
    throw error;
  }
};

// Inicializar o banco de dados imediatamente
initializeDatabase().catch(console.error);

module.exports = {
  db,
  initializeDatabase
}; 