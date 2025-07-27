const knex = require('knex');

// Configuração PostgreSQL
const postgresConfig = {
  client: 'pg',
  connection: {
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT || 5432,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME
  }
};

async function migrateToPostgres() {
  const sqliteDb = knex({
    client: 'sqlite3',
    connection: { filename: './database.sqlite' },
    useNullAsDefault: true
  });
  
  const postgresDb = knex(postgresConfig);
  
  try {
    console.log('🔄 Migrando dados para PostgreSQL...');
    
    // Migrar eventos
    const events = await sqliteDb('events').select('*');
    if (events.length > 0) {
      await postgresDb('events').insert(events);
      console.log(`✅ ${events.length} eventos migrados`);
    }
    
    // Migrar lotes
    const lots = await sqliteDb('lots').select('*');
    if (lots.length > 0) {
      await postgresDb('lots').insert(lots);
      console.log(`✅ ${lots.length} lotes migrados`);
    }
    
    // Migrar inscrições
    const registrations = await sqliteDb('registrations').select('*');
    if (registrations.length > 0) {
      await postgresDb('registrations').insert(registrations);