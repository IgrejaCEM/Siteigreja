const knex = require('knex');
const path = require('path');
const fs = require('fs');

// Database configuration
const db = knex({
  client: 'sqlite3',
  connection: {
    filename: path.resolve(__dirname, 'database', 'database.sqlite')
  },
  useNullAsDefault: true
});

// Diretório de migrações
const migrationsDir = path.join(__dirname, 'database', 'migrations');

// Executar migrações
async function runMigrations() {
  try {
    // Criar tabela de migrações se não existir
    await db.schema.createTableIfNotExists('migrations', table => {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.timestamp('executed_at').defaultTo(db.fn.now());
    });

    // Listar arquivos de migração
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.js'))
      .sort();

    // Executar cada migração
    for (const file of migrationFiles) {
      const migrationName = path.basename(file, '.js');
      
      // Verificar se migração já foi executada
      const executed = await db('migrations')
        .where('name', migrationName)
        .first();

      if (!executed) {
        console.log(`Executando migração: ${migrationName}`);
        
        // Executar migração
        const migration = require(path.join(migrationsDir, file));
        await migration.up(db);
        
        // Registrar migração
        await db('migrations').insert({
          name: migrationName
        });
        
        console.log(`Migração ${migrationName} executada com sucesso`);
      } else {
        console.log(`Migração ${migrationName} já executada`);
      }
    }

    console.log('Todas as migrações foram executadas');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao executar migrações:', error);
    process.exit(1);
  }
}

runMigrations(); 