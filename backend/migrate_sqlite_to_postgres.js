const sqlite3 = require('sqlite3').verbose();
const { Client } = require('pg');
require('dotenv').config();

// Configurações
const SQLITE_FILE = './database.sqlite';
const POSTGRES_URL = process.env.DATABASE_URL || 'COLE_AQUI_SUA_STRING_DO_SUPABASE';

// Liste aqui as tabelas que você quer migrar
const TABLES = ['users', 'events', 'registrations', 'settings']; // Adapte para suas tabelas reais

async function migrate() {
  const db = new sqlite3.Database(SQLITE_FILE);
  const pg = new Client({ connectionString: POSTGRES_URL });
  await pg.connect();

  for (const table of TABLES) {
    console.log(`Migrando tabela: ${table}`);
    // Pega os dados do SQLite
    const rows = await new Promise((resolve, reject) => {
      db.all(`SELECT * FROM ${table}`, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    for (const row of rows) {
      // Monta os campos e valores
      const columns = Object.keys(row);
      const values = Object.values(row);
      const placeholders = columns.map((_, i) => `$${i + 1}`).join(',');

      // Insere no PostgreSQL
      try {
        await pg.query(
          `INSERT INTO ${table} (${columns.join(',')}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`,
          values
        );
      } catch (err) {
        console.error(`Erro ao inserir na tabela ${table}:`, err.message);
      }
    }
    console.log(`Tabela ${table} migrada!`);
  }

  db.close();
  await pg.end();
  console.log('Migração concluída!');
}

migrate().catch(console.error); 