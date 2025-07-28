const { db } = require('./src/database/db');

async function markMigrationsComplete() {
  try {
    console.log('🔧 Marcando migrações como executadas...');
    
    // Lista de todas as migrações
    const migrations = [
      '20240319000000_create_users_table.js',
      '20240320000000_create_events_table.js',
      '20240320000001_create_lots_table.js',
      '20240321000000_create_inscricoes_table.js',
      '20240321000004_create_payments_table.js',
      '20240322000000_create_tickets_table.js',
      '20240322000001_create_checkin_logs_table.js',
      '20240323000000_create_transactions_table.js',
      '20240615000000_add_is_free_to_lots.js',
      '20240615_add_columns_to_events.js',
      '20240615_add_is_admin_to_users.js',
      '20250615083506_add_registration_code_to_inscricoes.js',
      '20250615084108_add_registration_code_to_inscricoes.js',
      '20250615091000_make_cpf_nullable_in_inscricoes.js',
      '20250615120000_add_address_and_cpf_to_registrations.js',
      '20250615140000_recreate_registrations_table.js',
      '20250615142000_recreate_checkin_logs_and_tickets.js',
      '20250615143000_add_checkin_time_to_tickets.js',
      '20250615144000_add_payment_status_to_registrations.js',
      '20250615145000_add_phone_to_users.js',
      '20250615150000_create_event_products.js',
      '20250616000000_add_home_content_to_settings.js',
      '20250717_add_qr_code_to_tickets.js'
    ];
    
    // Verificar se a tabela knex_migrations existe
    const tableExists = await db.schema.hasTable('knex_migrations');
    if (!tableExists) {
      console.log('📋 Criando tabela knex_migrations...');
      await db.schema.createTable('knex_migrations', table => {
        table.string('name').primary();
        table.integer('batch');
        table.timestamp('migration_time');
      });
    }
    
    // Inserir cada migração como executada
    for (const migration of migrations) {
      try {
        await db('knex_migrations').insert({
          name: migration,
          batch: 1,
          migration_time: new Date()
        });
        console.log(`✅ ${migration} marcada como executada`);
      } catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT') {
          console.log(`ℹ️ ${migration} já estava marcada`);
        } else {
          console.log(`⚠️ Erro ao marcar ${migration}:`, error.message);
        }
      }
    }
    
    console.log('🎉 Todas as migrações foram marcadas como executadas!');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    process.exit(0);
  }
}

markMigrationsComplete(); 