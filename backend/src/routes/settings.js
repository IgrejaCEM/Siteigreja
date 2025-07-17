const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/SettingsController');
const { authenticateToken, requireAdmin } = require('../middleware');
const { db } = require('../database/db');

// Get settings
router.get('/', async (req, res) => {
  try {
    const settings = await db('settings').first();
    res.json(settings || {});
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Update settings
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { homeLayout } = req.body;
    // Check if settings exist
    const existingSettings = await db('settings').first();
    if (existingSettings) {
      await db('settings')
        .update({
          homeLayout: JSON.stringify(homeLayout),
          updatedAt: new Date()
        });
    } else {
      await db('settings')
        .insert({
          homeLayout: JSON.stringify(homeLayout),
          createdAt: new Date(),
          updatedAt: new Date()
        });
    }
    res.json({ message: 'Configurações atualizadas com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Home layout routes
router.get('/home-layout', settingsController.getHomeLayout);
router.post('/home-layout', authenticateToken, requireAdmin, settingsController.updateHomeLayout);

// Home content routes
router.get('/home-content', settingsController.getHomeContent);
router.post('/home-content', authenticateToken, requireAdmin, settingsController.updateHomeContent);

module.exports = router; 