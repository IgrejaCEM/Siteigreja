const knex = require('knex');
const config = require('./config');

const db = knex(config.database);

async function initializeDatabase() {
  try {
    // Criar tabela de usuários
    const usersExists = await db.schema.hasTable('users');
    if (!usersExists) {
      await db.schema.createTable('users', table => {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.string('email').unique().notNullable();
        table.string('password').notNullable();
        table.boolean('is_admin').defaultTo(false);
        table.timestamps(true, true);
      });
      console.log('Tabela users criada');
    }

    // Criar tabela de eventos
    const eventsExists = await db.schema.hasTable('events');
    if (!eventsExists) {
      await db.schema.createTable('events', table => {
        table.increments('id').primary();
        table.string('title').notNullable();
        table.text('description');
        table.date('date').notNullable();
        table.string('location').notNullable();
        table.decimal('price', 10, 2);
        table.string('banner');
        table.string('banner_home');
        table.string('banner_evento');
        table.string('slug').unique();
        table.string('status').defaultTo('active');
        table.text('registration_form');
        table.timestamps(true, true);
      });
      console.log('Tabela events criada');
    }

    // Criar tabela de lotes
    const lotsExists = await db.schema.hasTable('lots');
    if (!lotsExists) {
      await db.schema.createTable('lots', table => {
        table.increments('id').primary();
        table.integer('event_id').unsigned().references('id').inTable('events');
        table.string('name').notNullable();
        table.decimal('price', 10, 2);
        table.integer('quantity');
        table.date('start_date');
        table.date('end_date');
        table.timestamps(true, true);
      });
      console.log('Tabela lots criada');
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

module.exports = { db, initializeDatabase }; 