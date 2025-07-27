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
        table.boolean('has_payment').defaultTo(false);
        table.string('payment_gateway');
        table.json('registration_form');
        table.timestamps(true, true);
      });
      console.log('✅ Tabela de eventos criada');
    } catch (error) {
      if (error.code === 'SQLITE_ERROR' && error.message.includes('already exists')) {
        console.log('ℹ️ Tabela de eventos já existe');
        
        // Verificar se as colunas has_payment e payment_gateway existem
        try {
          await db.raw("PRAGMA table_info(events)");
          const columns = await db.raw("PRAGMA table_info(events)");
          const hasPaymentColumn = columns.some(col => col.name === 'has_payment');
          const paymentGatewayColumn = columns.some(col => col.name === 'payment_gateway');
          
          if (!hasPaymentColumn) {
            console.log('🔧 Adicionando coluna has_payment...');
            await db.raw("ALTER TABLE events ADD COLUMN has_payment BOOLEAN DEFAULT false");
          }
          
          if (!paymentGatewayColumn) {
            console.log('🔧 Adicionando coluna payment_gateway...');
            await db.raw("ALTER TABLE events ADD COLUMN payment_gateway TEXT");
          }
          
          console.log('✅ Colunas de pagamento verificadas/adicionadas');
        } catch (alterError) {
          console.log('⚠️ Erro ao verificar/adicionar colunas:', alterError.message);
        }
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
        table.boolean('is_free').defaultTo(false);
        table.string('status').defaultTo('active');
        table.timestamps(true, true);
      });
      console.log('✅ Tabela de lotes criada');
    } catch (error) {
      if (error.code === 'SQLITE_ERROR' && error.message.includes('already exists')) {
        console.log('ℹ️ Tabela de lotes já existe');
        
        // Verificar se a coluna is_free existe
        try {
          const columns = await db.raw("PRAGMA table_info(lots)");
          const isFreeColumn = columns.some(col => col.name === 'is_free');
          const statusColumn = columns.some(col => col.name === 'status');
          
          if (!isFreeColumn) {
            console.log('🔧 Adicionando coluna is_free...');
            await db.raw("ALTER TABLE lots ADD COLUMN is_free BOOLEAN DEFAULT false");
          }
          
          if (!statusColumn) {
            console.log('🔧 Adicionando coluna status...');
            await db.raw("ALTER TABLE lots ADD COLUMN status TEXT DEFAULT 'active'");
          }
          
          console.log('✅ Colunas de lotes verificadas/adicionadas');
        } catch (alterError) {
          console.log('⚠️ Erro ao verificar/adicionar colunas de lotes:', alterError.message);
        }
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
        table.string('name'); // Adicionado
        table.string('email'); // Adicionado
        table.string('phone'); // Adicionado
        table.string('payment_status').defaultTo('pending');
        table.json('form_data');
        table.timestamps(true, true);
      });
      console.log('✅ Tabela de inscrições criada');
    } catch (error) {
      if (error.code === 'SQLITE_ERROR' && error.message.includes('already exists')) {
        console.log('ℹ️ Tabela de inscrições já existe');
        
        // Verificar e adicionar colunas name, email, phone
        try {
          const columns = await db.raw("PRAGMA table_info(registrations)");
          const nameColumn = columns.some(col => col.name === 'name');
          const emailColumn = columns.some(col => col.name === 'email');
          const phoneColumn = columns.some(col => col.name === 'phone');

          if (!nameColumn) {
            console.log('🔧 Adicionando coluna name...');
            await db.raw("ALTER TABLE registrations ADD COLUMN name TEXT");
          }
          if (!emailColumn) {
            console.log('🔧 Adicionando coluna email...');
            await db.raw("ALTER TABLE registrations ADD COLUMN email TEXT");
          }
          if (!phoneColumn) {
            console.log('🔧 Adicionando coluna phone...');
            await db.raw("ALTER TABLE registrations ADD COLUMN phone TEXT");
          }
          console.log('✅ Colunas de registrations verificadas/adicionadas');
        } catch (alterError) {
          console.log('⚠️ Erro ao verificar/adicionar colunas de registrations:', alterError.message);
        }
      } else {
        throw error;
      }
    }

    // Criar tabela de tickets se não existir
    try {
      await db.schema.createTable('tickets', table => {
        table.increments('id').primary();
        table.integer('inscricao_id').references('id').inTable('registrations').onDelete('CASCADE');
        table.string('ticket_code').unique().notNullable();
        table.string('status').defaultTo('active');
        table.datetime('checkin_time');
        table.timestamps(true, true);
      });
      console.log('✅ Tabela de tickets criada');
    } catch (error) {
      if (error.code === 'SQLITE_ERROR' && error.message.includes('already exists')) {
        console.log('ℹ️ Tabela de tickets já existe');
      } else {
        throw error;
      }
    }

    // Criar tabela de logs de check-in se não existir
    try {
      await db.schema.createTable('checkin_logs', table => {
        table.increments('id').primary();
        table.integer('ticket_id').references('id').inTable('tickets').onDelete('CASCADE');
        table.integer('event_id').references('id').inTable('events').onDelete('CASCADE');
        table.datetime('checkin_time').notNullable();
        table.timestamps(true, true);
      });
      console.log('✅ Tabela de checkin_logs criada');
    } catch (error) {
      if (error.code === 'SQLITE_ERROR' && error.message.includes('already exists')) {
        console.log('ℹ️ Tabela de checkin_logs já existe');
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

    // Criar tabela de produtos de eventos se não existir
    try {
      await db.schema.createTable('event_products', table => {
        table.increments('id').primary();
        table.integer('event_id').references('id').inTable('events').onDelete('CASCADE');
        table.string('name').notNullable();
        table.text('description');
        table.decimal('price', 10, 2).notNullable();
        table.integer('stock').defaultTo(0);
        table.string('image');
        table.boolean('is_active').defaultTo(true);
        table.timestamps(true, true);
      });
      console.log('✅ Tabela de produtos de eventos criada');
    } catch (error) {
      if (error.code === 'SQLITE_ERROR' && error.message.includes('already exists')) {
        console.log('ℹ️ Tabela de produtos de eventos já existe');
      } else {
        throw error;
      }
    }

    // Criar tabela de produtos de inscrições se não existir
    try {
      await db.schema.createTable('registration_products', table => {
        table.increments('id').primary();
        table.integer('registration_id').references('id').inTable('registrations').onDelete('CASCADE');
        table.integer('product_id').references('id').inTable('event_products').onDelete('CASCADE');
        table.integer('quantity').notNullable();
        table.decimal('unit_price', 10, 2).notNullable();
        table.timestamps(true, true);
      });
      console.log('✅ Tabela de produtos de inscrições criada');
    } catch (error) {
      if (error.code === 'SQLITE_ERROR' && error.message.includes('already exists')) {
        console.log('ℹ️ Tabela de produtos de inscrições já existe');
      } else {
        throw error;
      }
    }

    // Criar tabela de pagamentos se não existir
    try {
      await db.schema.createTable('payments', table => {
        table.increments('id').primary();
        table.string('registration_code').notNullable();
        table.decimal('amount', 10, 2).notNullable();
        table.string('payment_method').notNullable();
        table.string('status').defaultTo('pending');
        table.string('payment_intent_id'); // Adicionado para webhook
        table.string('gateway_payment_id');
        table.json('payment_details'); // Adicionado para webhook
        table.json('gateway_response');
        table.timestamps(true, true);
      });
      console.log('✅ Tabela de pagamentos criada');
    } catch (error) {
      if (error.code === 'SQLITE_ERROR' && error.message.includes('already exists')) {
        console.log('ℹ️ Tabela de pagamentos já existe');
        
        // Verificar e adicionar colunas faltantes
        try {
          const columns = await db.raw("PRAGMA table_info(payments)");
          const paymentIntentIdColumn = columns.some(col => col.name === 'payment_intent_id');
          const paymentDetailsColumn = columns.some(col => col.name === 'payment_details');
          
          if (!paymentIntentIdColumn) {
            console.log('🔧 Adicionando coluna payment_intent_id...');
            await db.raw("ALTER TABLE payments ADD COLUMN payment_intent_id TEXT");
          }
          if (!paymentDetailsColumn) {
            console.log('🔧 Adicionando coluna payment_details...');
            await db.raw("ALTER TABLE payments ADD COLUMN payment_details TEXT");
          }
          console.log('✅ Colunas de payments verificadas/adicionadas');
        } catch (alterError) {
          console.log('⚠️ Erro ao verificar/adicionar colunas de payments:', alterError.message);
        }
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