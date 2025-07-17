module.exports = {
  payment: {
    apiKey: process.env.PAYMENT_API_KEY || 'test_key',
    baseURL: process.env.PAYMENT_API_URL || 'https://api.payment.test',
    webhookSecret: process.env.PAYMENT_WEBHOOK_SECRET || 'webhook_secret_key',
    sandbox: process.env.PAYMENT_SANDBOX === 'true' || true,
    currency: 'BRL',
    supportedGateways: ['stripe', 'mercadopago', 'pagseguro']
  }
}; 