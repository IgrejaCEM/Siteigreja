const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { db } = require('../database/db');
const config = require('../config');
const { authenticateToken } = require('../middleware');

// Middleware CORS específico para rotas de auth
router.use((req, res, next) => {
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://igrejacemchurch.org',
    'https://siteigreja-mctd5i4q8-igrejacems-projects.vercel.app',
    'https://siteigreja-1.onrender.com',
    'https://siteigreja.onrender.com'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    res.header('Access-Control-Allow-Origin', '*');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Content-Length');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400'); // 24 horas
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Auth API está funcionando',
    timestamp: new Date().toISOString()
  });
});

// Rota de emergência para criar admin (REMOVER APÓS USO)
router.post('/create-admin-emergency', async (req, res) => {
  try {
    console.log('🚨 CRIANDO ADMIN DE EMERGÊNCIA');
    
    // Verificar se a tabela users existe
    const usersExists = await db.schema.hasTable('users');
    if (!usersExists) {
      await db.schema.createTable('users', function(table) {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.string('username').unique();
        table.string('email').unique().notNullable();
        table.string('password').notNullable();
        table.date('birthdate');
        table.string('gender');
        table.boolean('is_admin').defaultTo(false);
        table.timestamps(true, true);
      });
      console.log('✅ Tabela users criada');
    }
    
    // Verificar se já existe um admin
    const existingAdmin = await db('users').where('is_admin', true).first();
    if (existingAdmin) {
      console.log('✅ Admin já existe:', existingAdmin.email);
      return res.json({
        success: true,
        message: 'Admin já existe',
        admin: {
          email: existingAdmin.email,
          is_admin: existingAdmin.is_admin
        }
      });
    }
    
    // Criar admin
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const [adminId] = await db('users').insert({
      name: 'Administrador',
      username: 'admin',
      email: 'admin@admin.com',
      password: hashedPassword,
      is_admin: true,
      created_at: new Date(),
      updated_at: new Date()
    }).returning('id');
    
    console.log('✅ Admin criado com ID:', adminId);
    
    res.json({
      success: true,
      message: 'Admin criado com sucesso!',
      admin: {
        email: 'admin@admin.com',
        password: 'admin123',
        is_admin: true
      }
    });
    
  } catch (error) {
    console.error('❌ Erro ao criar admin:', error);
    res.status(500).json({
      error: 'Erro ao criar admin',
      details: error.message
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    const user = await db('users')
      .where('email', emailOrUsername)
      .first();

    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        is_admin: user.is_admin 
      },
      config.jwtSecret,
      { expiresIn: '24h' }
    );

    res.json({ 
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        birthdate: user.birthdate,
        gender: user.gender,
        is_admin: user.is_admin
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Verificar token
router.get('/verify', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// Perfil do usuário
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await db('users')
      .where('id', req.user.id)
      .select('id', 'name', 'email', 'is_admin')
      .first();

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(user);
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({ error: 'Erro ao buscar perfil do usuário' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { name, username, email, password, birthdate, gender } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({ message: 'Preencha todos os campos obrigatórios.' });
    }

    const userExists = await db('users')
      .where('email', email)
      .orWhere('username', username)
      .first();

    if (userExists) {
      return res.status(400).json({ message: 'Email ou nome de usuário já está em uso' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [newUser] = await db('users')
      .insert({
        name,
        username,
        email,
        password: hashedPassword,
        birthdate,
        gender,
        is_admin: false
      })
      .returning(['id', 'name', 'username', 'email', 'birthdate', 'gender', 'is_admin']);

    const token = jwt.sign(
      { 
        id: newUser.id, 
        email: newUser.email,
        is_admin: newUser.is_admin 
      },
      config.jwtSecret,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        username: newUser.username,
        email: newUser.email,
        birthdate: newUser.birthdate,
        gender: newUser.gender,
        is_admin: newUser.is_admin
      }
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = router; 