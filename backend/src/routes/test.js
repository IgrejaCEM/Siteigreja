const express = require('express');
const router = express.Router();

router.get('/env-check', (req, res) => {
  try {
    console.log('🔍 Verificando variáveis de ambiente...');
    
    const envVars = {
      NODE_ENV: process.env.NODE_ENV,
      MERCADOPAGO_ACCESS_TOKEN: process.env.MERCADOPAGO_ACCESS_TOKEN ? 'SET' : 'NOT SET',
      MERCADOPAGO_PUBLIC_KEY: process.env.MERCADOPAGO_PUBLIC_KEY ? 'SET' : 'NOT SET',
      MERCADOPAGO_CLIENT_ID: process.env.MERCADOPAGO_CLIENT_ID ? 'SET' : 'NOT SET',
      MERCADOPAGO_CLIENT_SECRET: process.env.MERCADOPAGO_CLIENT_SECRET ? 'SET' : 'NOT SET',
      PAYMENT_FAKE_MODE: process.env.PAYMENT_FAKE_MODE || 'false'
    };
    
    console.log('📊 Variáveis de ambiente:', envVars);
    
    res.json({
      success: true,
      message: 'Variáveis de ambiente verificadas',
      env: envVars
    });
  } catch (error) {
    console.error('❌ Erro ao verificar variáveis:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router; 