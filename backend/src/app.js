const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const { authenticateToken } = require('./middleware');
const config = require('./config');
const routes = require('./routes');
const db = require('./db'); // Adicionado para inicialização do banco

const app = express();

// Configuração CORS PERMISSIVA para resolver o problema
app.use(cors({
  origin: true, // Permitir todas as origens
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Content-Length'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Middleware para adicionar headers CORS em todas as respostas
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Content-Length');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Configuração do Helmet mais permissiva
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, '../../frontend/public')));

// Servir arquivos de upload
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api', routes);

// Inicialização automática do banco de dados
const initializeDatabase = async () => {
  try {
    console.log('🔧 INICIALIZANDO BANCO DE DADOS...');
    
    // Verificar se as tabelas existem
    const eventsExists = await db.schema.hasTable('events');
    const lotsExists = await db.schema.hasTable('lots');
    const registrationsExists = await db.schema.hasTable('registrations');
    
    if (!eventsExists || !lotsExists || !registrationsExists) {
      console.log('❌ Tabelas não existem! Criando...');
      
      // Criar tabela events se não existir
      if (!eventsExists) {
        await db.schema.createTable('events', function(table) {
          table.increments('id').primary();
          table.string('title').notNullable();
          table.text('description').nullable();
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
        console.log('✅ Tabela events criada');
      }
      
      // Criar tabela lots se não existir
      if (!lotsExists) {
        await db.schema.createTable('lots', function(table) {
          table.increments('id').primary();
          table.integer('event_id').unsigned().references('id').inTable('events').onDelete('CASCADE');
          table.string('name').notNullable();
          table.text('description').nullable();
          table.decimal('price', 10, 2);
          table.integer('quantity');
          table.datetime('start_date');
          table.datetime('end_date');
          table.string('status').defaultTo('active');
          table.boolean('is_free').defaultTo(false);
          table.timestamps(true, true);
        });
        console.log('✅ Tabela lots criada');
      }
      
      // Criar tabela registrations se não existir
      if (!registrationsExists) {
        await db.schema.createTable('registrations', function(table) {
          table.increments('id').primary();
          table.integer('event_id').unsigned().references('id').inTable('events').onDelete('CASCADE');
          table.integer('lot_id').unsigned().references('id').inTable('lots').onDelete('SET NULL');
          table.integer('user_id').unsigned().references('id').inTable('users').onDelete('SET NULL');
          table.string('name').notNullable();
          table.string('email').notNullable();
          table.string('phone').notNullable();
          table.string('cpf').nullable();
          table.string('address').nullable();
          table.string('registration_code').nullable();
          table.string('status').defaultTo('pending');
          table.string('payment_status').nullable();
          table.text('form_data').nullable();
          table.timestamp('created_at').defaultTo(db.fn.now());
          table.timestamp('updated_at').defaultTo(db.fn.now());
        });
        console.log('✅ Tabela registrations criada');
      }
      
      // Verificar se há eventos, se não, criar evento padrão
      const eventCount = await db('events').count('id as count').first();
      if (eventCount.count === 0) {
        console.log('❌ Nenhum evento encontrado! Criando evento padrão...');
        
        const fs = require('fs');
        const path = require('path');
        
        try {
          // Tentar ler backup
          const backupPath = path.join(__dirname, 'backups/critical_data_2025-07-27T00-43-31-763Z.json');
          const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
          
          // Restaurar eventos do backup
          for (const event of backupData.events) {
            const eventData = {
              title: event.title,
              description: event.description,
              date: event.date,
              location: event.location,
              banner: event.banner,
              banner_home: event.banner_home,
              banner_evento: event.banner_evento,
              slug: event.slug,
              status: event.status,
              registration_form: event.registration_form,
              created_at: event.created_at,
              updated_at: event.updated_at
            };
            
            const [eventId] = await db('events').insert(eventData).returning('id');
            console.log(`✅ Evento restaurado: ${event.title} (ID: ${eventId})`);
          }
          
          // Restaurar lotes do backup
          for (const lot of backupData.lots) {
            const lotData = {
              event_id: lot.event_id,
              name: lot.name,
              price: lot.price,
              quantity: lot.quantity,
              start_date: lot.start_date,
              end_date: lot.end_date,
              status: lot.status,
              is_free: lot.is_free,
              created_at: lot.created_at,
              updated_at: lot.updated_at
            };
            
            const [lotId] = await db('lots').insert(lotData).returning('id');
            console.log(`✅ Lote restaurado: ${lot.name} (ID: ${lotId})`);
          }
          
          // Restaurar participantes do backup
          let participantCount = 0;
          for (const registration of backupData.registrations) {
            const registrationData = {
              event_id: registration.event_id,
              lot_id: registration.lot_id,
              user_id: registration.user_id,
              name: registration.name,
              email: registration.email,
              phone: registration.phone,
              cpf: registration.cpf,
              address: registration.address,
              registration_code: registration.registration_code,
              status: registration.status,
              payment_status: registration.payment_status,
              form_data: registration.form_data,
              created_at: registration.created_at,
              updated_at: registration.updated_at
            };
            
            await db('registrations').insert(registrationData);
            participantCount++;
            console.log(`✅ Participante restaurado: ${registration.name} (${registration.email})`);
          }
          
          console.log(`🎉 RESTAURAÇÃO AUTOMÁTICA CONCLUÍDA!`);
          console.log(`   📅 Eventos: ${backupData.events.length}`);
          console.log(`   🎫 Lotes: ${backupData.lots.length}`);
          console.log(`   👥 Participantes: ${participantCount}`);
          
        } catch (backupError) {
          console.log('⚠️ Erro ao restaurar do backup, criando evento padrão...');
          
          // Criar evento padrão
          const [eventId] = await db('events').insert({
            title: 'CONNECT CONF 2025 - INPROVÁVEIS',
            description: 'A Connect Conf 2025 é mais do que uma conferência – é um chamado para aqueles que se acham fora do padrão, esquecidos ou desacreditados.',
            date: '2025-10-24 19:00:00',
            location: 'Igreja CEM - CAJATI, localizada na Av. dos trabalhadores, Nº99 - Centro, Cajati/SP.',
            price: 60,
            banner: 'https://i.ibb.co/tpzV7gt4/jpg-foto.jpg',
            banner_home: 'https://i.ibb.co/tpzV7gt4/jpg-foto.jpg',
            banner_evento: 'https://i.ibb.co/tpzV7gt4/jpg-foto.jpg',
            slug: 'connect-conf-2025-inprovveis',
            status: 'active'
          }).returning('id');
          
          // Criar lote padrão
          await db('lots').insert({
            event_id: eventId,
            name: 'LOTE 1',
            description: 'Lote principal do evento',
            price: 60,
            quantity: 100,
            start_date: '2025-01-01 00:00:00',
            end_date: '2025-07-30 23:59:59',
            status: 'active',
            is_free: false
          });
          
          console.log(`✅ Evento padrão criado: CONNECT CONF 2025 (ID: ${eventId})`);
        }
      }
    }
    
    console.log('✅ BANCO DE DADOS INICIALIZADO COM SUCESSO!');
    
  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error);
  }
};

// Executar inicialização
initializeDatabase();

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo deu errado!' });
});

module.exports = app; 