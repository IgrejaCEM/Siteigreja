// Configurações do sistema de pagamento
const config = {
  server: {
    port: 3005,
    cors: {
      origin: [
        'http://localhost:5173',
        'https://igrejacemchurch.org',
        'https://siteigreja-mctd5i4q8-igrejacems-projects.vercel.app'
      ],
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
    activeGateway: 'mercadopago', // Define Mercado Pago como gateway padrão
    mercadopago: {
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || 'APP_USR-7906695833613236-072622-a7c53bcaf7bc8b8289f1961ce3937843-2568627728',
      publicKey: process.env.MERCADOPAGO_PUBLIC_KEY || 'APP_USR-c478c542-b18d-4ab1-acba-9539754cb167',
      webhookUrl: process.env.MERCADOPAGO_WEBHOOK_URL || (process.env.NODE_ENV === 'production' ? 'https://siteigreja-1.onrender.com/api/payments/webhook' : 'http://localhost:3005/api/payments/webhook'),
      sandbox: process.env.NODE_ENV !== 'production',
      statementDescriptor: 'INSCRICAO', // Descrição que aparecerá na fatura do cartão
      paymentMethods: {
        creditCard: {
          enabled: true,
          maxInstallments: 12,
          defaultInstallments: 1,
          processingMode: 'aggregator' // ou 'gateway'
        },
        pix: {
          enabled: true,
          expirationTime: 24 * 60 * 60, // 24 horas em segundos
          bank: '00000000' // Código do banco (opcional)
        },
        boleto: {
          enabled: true,
          expirationDays: 3, // Dias para vencimento
          bank: 'bradesco' // Banco emissor
        }
      },
      notificationSettings: {
        webhookUrl: process.env.MERCADOPAGO_WEBHOOK_URL || (process.env.NODE_ENV === 'production' ? 'https://siteigreja-1.onrender.com/api/payments/webhook' : 'http://localhost:3005/api/payments/webhook'),
        ipnUrl: process.env.MERCADOPAGO_IPN_URL || (process.env.NODE_ENV === 'production' ? 'https://siteigreja-1.onrender.com/api/payments/ipn' : 'http://localhost:3005/api/payments/ipn')
      }
    },
    abacatepay: {
      apiKey: process.env.ABACATEPAY_API_KEY || 'abc_dev_hwNkfZYxj06YeTg0gb0C2cbg',
      baseUrl: process.env.ABACATEPAY_API_URL || 'https://api.abacatepay.com',
      enabled: false // Desativa o Acabate Pay
    },
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