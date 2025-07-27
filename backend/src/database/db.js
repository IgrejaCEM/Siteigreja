const knex = require('knex');
const path = require('path');
const bcrypt = require('bcrypt');
const config = require('../config');

const db = knex(config.database);

// Função para inicializar o banco de dados
const initializeDatabase = async () => {
  try {
    // Criar tabela de usuários se não existir
    const hasUsersTable = await db.schema.hasTable('users');
    if (!hasUsersTable) {
      await db.schema.createTable('users', table => {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.string('email').unique().notNullable();
        table.string('password').notNullable();
        table.boolean('is_admin').defaultTo(false);
        table.timestamps(true, true);
      });

      // Criar usuário admin padrão
      try {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await db('users').insert({
          name: 'Admin',
          email: 'admin@admin.com',
          password: hashedPassword,
          is_admin: true
        });
        console.log('Tabela de usuários criada e usuário admin criado com sucesso');
      } catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT') {
          console.log('Usuário admin já existe, continuando...');
        } else {
          throw error;
        }
      }

      // Verificar se existe usuário admin pelo email
      const adminUser = await db('users')
        .where('email', 'admin@admin.com')
        .first();

      if (!adminUser) {
        try {
          const hashedPassword = await bcrypt.hash('admin123', 10);
          await db('users').insert({
            name: 'Admin',
            email: 'admin@admin.com',
            password: hashedPassword,
            is_admin: true
          });
          console.log('Usuário admin criado com sucesso');
        } catch (error) {
          if (error.code === 'SQLITE_CONSTRAINT') {
            console.log('Usuário admin já existe, continuando...');
          } else {
            throw error;
          }
        }
      } else {
        // Atualizar para garantir que é admin
        await db('users')
          .where('email', 'admin@admin.com')
          .update({ is_admin: true });
        console.log('Usuário admin já existe, privilégios de admin garantidos');
      }
    }

    // Criar tabela de eventos se não existir
    const hasEventsTable = await db.schema.hasTable('events');
    if (!hasEventsTable) {
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
        console.log('Tabela de eventos criada com sucesso');
      } catch (error) {
        if (error.code === 'SQLITE_ERROR' && error.message.includes('already exists')) {
          console.log('Tabela de eventos já existe, continuando...');
        } else {
          throw error;
        }
      }
    }

    // Criar tabela de lotes se não existir
    const hasLotsTable = await db.schema.hasTable('lots');
    if (!hasLotsTable) {
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
        console.log('Tabela de lotes criada com sucesso');
      } catch (error) {
        if (error.code === 'SQLITE_ERROR' && error.message.includes('already exists')) {
          console.log('Tabela de lotes já existe, continuando...');
        } else {
          throw error;
        }
      }
    }

    // Criar tabela de inscrições se não existir
    const hasRegistrationsTable = await db.schema.hasTable('registrations');
    if (!hasRegistrationsTable) {
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
        console.log('Tabela de inscrições criada com sucesso');
      } catch (error) {
        if (error.code === 'SQLITE_ERROR' && error.message.includes('already exists')) {
          console.log('Tabela de inscrições já existe, continuando...');
        } else {
          throw error;
        }
      }
    }

    // Criar tabela de configurações se não existir
    const hasSettingsTable = await db.schema.hasTable('settings');
    if (!hasSettingsTable) {
      try {
        await db.schema.createTable('settings', table => {
          table.increments('id').primary();
          table.json('homeContent');
          table.text('homeCss');
          table.json('homeLayout');
          table.timestamps(true, true);
        });
        console.log('Tabela de configurações criada com sucesso');
      } catch (error) {
        if (error.code === 'SQLITE_ERROR' && error.message.includes('already exists')) {
          console.log('Tabela de configurações já existe, continuando...');
        } else {
          throw error;
        }
      }
    }

    console.log('Banco de dados inicializado com sucesso');
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
    throw error;
  }
};

// Inicializar o banco de dados imediatamente
initializeDatabase().catch(console.error);

module.exports = {
  db,
  initializeDatabase
}; 