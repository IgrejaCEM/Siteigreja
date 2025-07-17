const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { db } = require('../database/db');
const config = require('../config');
const { authenticateToken } = require('../middleware');

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