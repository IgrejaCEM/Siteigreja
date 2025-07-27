const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const { authenticateToken } = require('./middleware');
const config = require('./config');
const routes = require('./routes');

const app = express();

// Middlewares
// Configuração CORS corrigida para resolver problemas de cross-origin
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://igrejacemchurch.org',
    'https://www.igrejacemchurch.org',
    'https://siteigreja-mctd5i4q8-igrejacems-projects.vercel.app',
    'https://siteigreja.vercel.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Headers CORS adicionais para garantir
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://igrejacemchurch.org');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Configuração do Helmet mais permissiva para CORS
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

// API Routes
app.use('/api', routes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo deu errado!' });
});

module.exports = app; 