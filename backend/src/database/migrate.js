require('dotenv').config();
const fs = require('fs');
const path = require('path');
const config = require('../config');
const knex = require('knex');

const db = knex(config.database);

async function migrate() {
  try {
    // Executar migrações do Knex
    console.log('Executando migrações do Knex...');
    await db.migrate.latest();
    
    // Executar seeds do Knex
    console.log('Executando seeds do Knex...');
    await db.seed.run();

    console.log('Migrações e seeds executados com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao executar migrações:', error);
    process.exit(1);
  }
}

migrate(); 