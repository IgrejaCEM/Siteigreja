require('dotenv').config();
const path = require('path');
const { db } = require('./database/db');

async function testSettings() {
  try {
    const settings = await db('settings').first();
    console.log('Settings:', settings);
  } catch (error) {
    console.error('Erro ao acessar tabela settings:', error);
    if (error && error.stack) console.error(error.stack);
  } finally {
    process.exit();
  }
}

testSettings();

const config = {
  jwtSecret: process.env.JWT_SECRET || 'igreja-eventos-jwt-secret-key-2024',
  database: {
    client: 'pg',
    connection: process.env.DATABASE_URL || 'postgresql://postgres:WWiZILOORFMgerRjFMPSJLQrfLGFfviU@shuttle.proxy.rlwy.net:14638/railway',
    migrations: {
      directory: path.resolve(__dirname, '../database/migrations')
    },
    seeds: {
      directory: path.resolve(__dirname, '../database/seeds')
    }
  },
  server: {
    port: process.env.PORT || 3005,
    cors: {
      origin: [
        'http://localhost:5173',
        'https://d48a876efd53.ngrok-free.app',
        'https://2d526206e93c.ngrok-free.app' // novo domínio ngrok
      ],
      credentials: true
    },
    proxy: {
      '/api': 'http://localhost:3005'
    }
  }
};

module.exports = config; 