const { db } = require('../database/db');

// Cache simples para configurações
let settingsCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

class SettingsController {
  async getHomeLayout(req, res) {
    try {
      // Verificar cache
      if (settingsCache && cacheTimestamp && (Date.now() - cacheTimestamp) < CACHE_DURATION) {
        let layout = [];
        if (settingsCache.homeLayout) {
          if (typeof settingsCache.homeLayout === 'string') {
            layout = JSON.parse(settingsCache.homeLayout);
          } else {
            layout = settingsCache.homeLayout;
          }
        }
        return res.json({ layout });
      }

      const settings = await db('settings').first();
      
      // Atualizar cache
      settingsCache = settings;
      cacheTimestamp = Date.now();
      
      let layout = [];
      if (settings?.homeLayout) {
        if (typeof settings.homeLayout === 'string') {
          layout = JSON.parse(settings.homeLayout);
        } else {
          layout = settings.homeLayout;
        }
      }
      return res.json({ layout });
    } catch (error) {
      console.error('Erro ao buscar layout:', error);
      if (error && error.stack) console.error(error.stack);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async updateHomeLayout(req, res) {
    try {
      const { layout } = req.body;
      
      // Verificar se já existe um layout
      const existingSettings = await db('settings').first();
      
      if (existingSettings) {
        // Atualizar layout existente
        await db('settings')
          .update({
            homeLayout: JSON.stringify(layout),
            updatedAt: new Date()
          });
      } else {
        // Criar novo layout
        await db('settings').insert({
          homeLayout: JSON.stringify(layout),
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      
      // Invalidar cache
      settingsCache = null;
      cacheTimestamp = null;
      
      return res.json({ message: 'Layout atualizado com sucesso' });
    } catch (error) {
      console.error('Erro ao atualizar layout:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async getHomeContent(req, res) {
    try {
      // Verificar cache
      if (settingsCache && cacheTimestamp && (Date.now() - cacheTimestamp) < CACHE_DURATION) {
        let content = settingsCache.homeContent || '';
        if (typeof content !== 'string') {
          content = '';
        }
        return res.json({
          content,
          css: settingsCache.homeCss || ''
        });
      }

      const settings = await db('settings').first();
      
      // Atualizar cache
      settingsCache = settings;
      cacheTimestamp = Date.now();
      
      let content = settings?.homeContent || '';
      if (typeof content !== 'string') {
        content = '';
      }
      return res.json({
        content,
        css: settings?.homeCss || ''
      });
    } catch (error) {
      console.error('Erro ao buscar conteúdo:', error);
      if (error && error.stack) console.error(error.stack);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async updateHomeContent(req, res) {
    try {
      const { content, css } = req.body;
      
      // Verificar se já existe um conteúdo
      const existingSettings = await db('settings').first();
      
      if (existingSettings) {
        // Atualizar conteúdo existente
        await db('settings')
          .update({
            homeContent: content,
            homeCss: css,
            updatedAt: new Date()
          });
      } else {
        // Criar novo conteúdo
        await db('settings').insert({
          homeContent: content,
          homeCss: css,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      
      // Invalidar cache
      settingsCache = null;
      cacheTimestamp = null;
      
      return res.json({ message: 'Conteúdo atualizado com sucesso' });
    } catch (error) {
      console.error('Erro ao atualizar conteúdo:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

module.exports = new SettingsController(); 