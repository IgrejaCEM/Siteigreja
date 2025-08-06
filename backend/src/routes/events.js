const express = require('express');
const router = express.Router();
const { db } = require('../database/db');

// Buscar todos os eventos
router.get('/', async (req, res) => {
  try {
    console.log('🔍 Buscando todos os eventos...');
    
    // Verificar se a coluna active existe
    const hasActiveColumn = await db.schema.hasColumn('events', 'active');
    console.log('🔍 Coluna active existe:', hasActiveColumn);
    
    let events;
    if (hasActiveColumn) {
      events = await db('events')
        .where('active', true)
        .orderBy('created_at', 'desc');
    } else {
      // Fallback: buscar todos os eventos se a coluna não existir
      events = await db('events')
        .orderBy('created_at', 'desc');
    }
    
    console.log('📊 Eventos encontrados:', events.length);
    res.json(events);
  } catch (error) {
    console.error('❌ Erro ao buscar eventos:', error);
    res.status(500).json({ error: 'Erro ao buscar eventos', details: error.message });
  }
});

// Buscar evento por ID ou slug
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Buscar evento
    const event = await db('events')
      .where('id', id)
      .orWhere('slug', id)
      .first();

    if (!event) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }

    // Buscar lotes do evento
    const lots = await db('lots')
      .where('event_id', event.id)
      .where('active', true)
      .orderBy('created_at', 'asc');

    // Buscar produtos do evento (event_products)
    console.log('🔍 Buscando produtos para evento ID:', event.id);
    const products = await db('event_products')
      .where('event_id', event.id)
      .where('is_active', true)
      .orderBy('created_at', 'desc');
    console.log('📊 Produtos encontrados:', products.length);

    const eventWithDetails = {
      ...event,
      lots: lots,
      products: products,
      banner: event.banner || 'https://via.placeholder.com/1200x400?text=Imagem+do+Evento',
      banner_home: event.banner_home || event.banner || 'https://via.placeholder.com/1200x400?text=Imagem+do+Evento',
      banner_evento: event.banner_evento || event.banner || 'https://via.placeholder.com/1200x400?text=Imagem+do+Evento'
    };

    res.json(eventWithDetails);
  } catch (error) {
    console.error('Erro ao buscar evento:', error);
    res.status(500).json({ error: 'Erro ao buscar evento' });
  }
});

module.exports = router; 