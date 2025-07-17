require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { db, initializeDatabase } = require('./database/db');
const routes = require('./routes/index');
const config = require('./config');
const { Model } = require('objection');
const knexConfig = require('../knexfile');
const Knex = require('knex');

const app = express();

// Middleware
app.use(cors(config.server.cors));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Criar pasta de uploads se não existir
const uploadsDir = path.join(__dirname, '../uploads');
const bannersDir = path.join(uploadsDir, 'banners');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(bannersDir)) {
  fs.mkdirSync(bannersDir, { recursive: true });
}

// Servir arquivos estáticos
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Adicionar middleware de log para todas as requisições
app.use((req, res, next) => {
  // Log mais limpo e eficiente
  const timestamp = new Date().toISOString();
  const method = req.method;
  const path = req.path;
  
  // Só logar detalhes completos em desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    console.log(`${timestamp} - ${method} ${path}`);
  } else {
    // Em produção, log mais simples
    console.log(`${timestamp} - ${method} ${path}`);
  }
  
  next();
});

// Rotas
app.use('/api', routes);

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// Inicializar banco de dados e iniciar servidor
const knex = Knex(knexConfig.development || knexConfig);
Model.knex(knex);

initializeDatabase()
  .then(() => {
    console.log('Database initialized successfully');
    app.listen(config.server.port, () => {
      console.log(`Server running on port ${config.server.port}`);
    });
  })
  .catch(error => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  });