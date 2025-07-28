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
          table.string('logo').nullable();
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