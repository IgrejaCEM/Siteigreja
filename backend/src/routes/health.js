const express = require('express');
const router = express.Router();

// Health check endpoint para UptimeRobot
router.get('/health', (req, res) => {
  try {
    const healthData = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
      }
    };
    
    console.log('🏥 Health check:', healthData);
    
    res.status(200).json(healthData);
  } catch (error) {
    console.error('❌ Health check error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Health check detalhado (para debug)
router.get('/health/detailed', async (req, res) => {
  try {
    const { db } = require('../database/db');
    
    // Testar conexão com banco
    const dbTest = await db.raw('SELECT 1 as test');
    
    const detailedHealth = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: {
        status: 'connected',
        test: dbTest.rows[0]
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024)
      },
      platform: {
        node: process.version,
        platform: process.platform,
        arch: process.arch
      }
    };
    
    console.log('🏥 Detailed health check:', detailedHealth);
    
    res.status(200).json(detailedHealth);
  } catch (error) {
    console.error('❌ Detailed health check error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router; 