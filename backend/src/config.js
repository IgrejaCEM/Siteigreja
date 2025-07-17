// Configurações do sistema de pagamento
const config = {
  server: {
    port: 3005,
    cors: {
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true
    }
  },

  // MODO DE PAGAMENTO
  // true = modo fake (pagamentos sempre aprovados)
  // false = modo real (integração com gateway de pagamento)
  PAYMENT_FAKE_MODE: true,
  
  // Status padrão para pagamentos no modo fake
  FAKE_PAYMENT_STATUS: 'paid',
  
  // Status padrão para pagamentos no modo real
  REAL_PAYMENT_STATUS: 'pending',
  
  // Configurações de e-mail
  EMAIL_ENABLED: process.env.EMAIL_USER && process.env.EMAIL_PASS,
  
  // Configurações de QR Code fake
  FAKE_QR_CODE_URL: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=',
  FAKE_LINHA_DIGITAVEL: 'FAKE-PAYMENT-APPROVED',

  // Configuração do JWT
  jwtSecret: process.env.JWT_SECRET || 'igreja-eventos-jwt-secret-key-2024',

  payment: {
    apiKey: process.env.PAYMENT_API_KEY || 'test_key',
    baseUrl: process.env.PAYMENT_API_URL || 'https://api.payment.test',
    defaultCurrency: 'BRL'
  },

  database: {
    client: 'sqlite3',
    connection: {
      filename: './database.sqlite'
    },
    useNullAsDefault: true,
    migrations: {
      directory: './src/database/migrations'
    }
  }
};

module.exports = config; 