require('dotenv').config();
const path = require('path');

const config = {
  jwtSecret: process.env.JWT_SECRET || 'igreja-eventos-jwt-secret-key-2024',
  database: {
    client: process.env.NODE_ENV === 'production' ? 'pg' : 'sqlite3',
    connection: process.env.NODE_ENV === 'production' 
      ? (process.env.DATABASE_URL || 'postgresql://postgres:WWiZILOORFMgerRjFMPSJLQrfLGFfviU@shuttle.proxy.rlwy.net:14638/railway')
      : {
          filename: path.resolve(__dirname, '../../database.sqlite')
        },
    migrations: {
      directory: path.resolve(__dirname, '../database/migrations')
    },
    seeds: {
      directory: path.resolve(__dirname, '../database/seeds')
    }
  },
  payment: {
    mercadopago: {
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
      publicKey: process.env.MERCADOPAGO_PUBLIC_KEY || '',
      clientId: process.env.MERCADOPAGO_CLIENT_ID || '',
      clientSecret: process.env.MERCADOPAGO_CLIENT_SECRET || '',
      sandbox: process.env.NODE_ENV !== 'production'
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