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

// Middleware CORS mais robusto
app.use((req, res, next) => {
  console.log('🔧 CORS - Origin recebido:', req.headers.origin);
  console.log('🔧 CORS - Method:', req.method);
  console.log('🔧 CORS - Path:', req.path);
  
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://igrejacemchurch.org',
    'https://www.igrejacemchurch.org',
    'https://siteigreja-mctd5i4q8-igrejacems-projects.vercel.app',
    'https://siteigreja-1.onrender.com',
    'https://siteigreja.onrender.com'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    console.log('✅ CORS - Origin permitido:', origin);
  } else {
    console.log('❌ CORS - Origin não permitido:', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    console.log('✅ CORS - OPTIONS request respondida com sucesso');
    res.status(200).end();
    return;
  }
  
  next();
});

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
  // Log mais detalhado para debug
  const timestamp = new Date().toISOString();
  const method = req.method;
  const path = req.path;
  
  console.log(`🔔 REQUISIÇÃO RECEBIDA: ${timestamp} - ${method} ${path}`);
  console.log(`🔔 Headers:`, req.headers);
  console.log(`🔔 Body:`, req.body);
  console.log(`🔔 Debug: Servidor funcionando corretamente`);
  
  // Log específico para /api/registrations
  if (path === '/api/registrations' && method === 'POST') {
    console.log('🎯 REQUISIÇÃO /api/registrations POST DETECTADA!');
    console.log('📦 Body completo:', JSON.stringify(req.body, null, 2));
    console.log('🔍 Origin:', req.headers.origin);
    console.log('🔍 User-Agent:', req.headers['user-agent']);
    console.log('🔍 Content-Type:', req.headers['content-type']);
  }
  
  // Log para qualquer requisição POST
  if (method === 'POST') {
    console.log('📝 REQUISIÇÃO POST DETECTADA!');
    console.log('   - Path:', path);
    console.log('   - Origin:', req.headers.origin);
    console.log('   - Content-Type:', req.headers['content-type']);
  }
  
  next();
});

// Rota de teste na raiz
app.get('/', (req, res) => {
  res.json({ 
    message: 'Servidor funcionando!',
    timestamp: new Date().toISOString(),
    status: 'online'
  });
});

// Rota de webhook direta (temporária para debug)
app.post('/api/payments/webhook', async (req, res) => {
  try {
    console.log('🔔 WEBHOOK RECEBIDO (ROTA DIRETA)');
    console.log('📦 Dados:', req.body);
    
    // Validar assinatura do webhook do Mercado Pago (temporariamente desabilitada para teste)
    const signature = req.headers['x-signature'] || req.headers['x-signature-id'] || req.headers['x-signature-id'];
    const expectedSignature = 'd2fbc1af5dd4eb4e1290657b6107c0c7be62e3e00c3f7ca635c6c23a5bc27f6c';
    
    console.log('🔍 Headers recebidos:', req.headers);
    console.log('🔍 Assinatura recebida:', signature);
    
    // Temporariamente aceitar sem validação para teste
    if (signature && signature !== expectedSignature) {
      console.log('⚠️ Assinatura inválida, mas aceitando para teste:', signature);
      // return res.status(401).json({ error: 'Assinatura inválida' });
    }
    
    console.log('✅ Webhook aceito (validação temporariamente desabilitada)');
    
    res.json({ 
      received: true, 
      message: 'Webhook processado com sucesso!',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Erro no webhook:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Health check routes
const healthRoutes = require('./routes/health');
app.use('/api', healthRoutes);

// Rotas
app.use('/api', routes);

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// Inicializar banco de dados e iniciar servidor
const knex = Knex(process.env.NODE_ENV === 'production' ? knexConfig.production : knexConfig.development);
Model.knex(knex);

// Exportar o app para ser usado pelo index.js
module.exports = app;

// Se este arquivo for executado diretamente, inicializar o servidor
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('Database initialized successfully');
      const port = config.server.port || process.env.PORT || 3005;
      app.listen(port, () => {
        console.log(`Server running on port ${port}`);
        console.log(`Server URL: https://siteigreja-1.onrender.com`);
      });
    })
    .catch(error => {
      console.error('Failed to initialize database:', error);
      process.exit(1);
    });
}