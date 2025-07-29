const express = require('express');
const router = express.Router();
const { db } = require('../database/db');

// Listar todos os eventos públicos
router.get('/', async (req, res) => {
  try {
    const events = await db('events')
      .select('*')
      .where('status', 'active')
      .orderBy('date', 'asc');

    res.json(events.map(event => ({
      ...event,
      banner: event.banner || 'https://via.placeholder.com/1200x400?text=Imagem+do+Evento',
      banner_home: event.banner_home || event.banner || 'https://via.placeholder.com/1200x400?text=Imagem+do+Evento',
      banner_evento: event.banner_evento || event.banner || 'https://via.placeholder.com/1200x400?text=Imagem+do+Evento'
    })));
  } catch (error) {
    console.error('Erro ao listar eventos:', error);
    res.status(500).json({ error: 'Erro ao listar eventos' });
  }
});

// Buscar evento por ID ou slug
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if id is a number
    const eventId = parseInt(id);
    let event;
    
    if (isNaN(eventId)) {
      // Buscar por slug
      event = await db('events').where('slug', id).first();
    } else {
      // Buscar por ID
      event = await db('events').where('id', eventId).first();
    }
    
    if (!event) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }
    
    // Buscar lotes do evento
    const lots = await db('lots')
      .where('event_id', event.id)
      .where('status', 'active')
      .orderBy('created_at', 'asc');
    
    // Buscar produtos do evento
    const products = await db('event_products')
      .where('event_id', event.id)
      .where('is_active', true)
      .orderBy('created_at', 'desc');
    
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

// Endpoint unificado para inscrição e pagamento
router.post('/:id/inscricao-unificada', async (req, res) => {
  console.log('🚀 INICIANDO INSCRIÇÃO ULTRA-ROBUSTA');
  console.log('📦 Dados recebidos:', JSON.stringify(req.body, null, 2));
  
  try {
    const { id } = req.params;
    const { participantes, payment_method, lot_id, lote_id, products = [] } = req.body;
    
    // Suportar tanto lot_id quanto lote_id
    const finalLotId = lot_id || lote_id;
    
    console.log('🔍 Dados extraídos:', { id, payment_method, lot_id, participantesCount: participantes?.length });
    
    if (!Array.isArray(participantes) || participantes.length === 0) {
      return res.status(400).json({ error: 'Nenhum participante informado.' });
    }
    
    // Verificar se o evento existe
    const event = await db('events').where('id', id).first();
    if (!event) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }
    
    console.log('✅ Evento encontrado:', event.title);
    
    // Buscar o lote selecionado
    console.log('🔍 Buscando lote:', { finalLotId, event_id: id });
    console.log('🔍 Tipos:', { lot_id_type: typeof finalLotId, event_id_type: typeof id });
    
    const selectedLot = await db('lots')
      .where('id', parseInt(finalLotId))
      .andWhere('event_id', parseInt(id))
      .first();
      
    console.log('🔍 Resultado da busca:', selectedLot);
      
    if (!selectedLot) {
      return res.status(400).json({ error: 'Lote selecionado inválido' });
    }
    
    console.log('✅ Lote encontrado:', selectedLot.name, 'Preço:', selectedLot.price);
    
    // Verificar se há vagas suficientes
    if (selectedLot.quantity < participantes.length) {
      return res.status(400).json({ error: 'Não há vagas suficientes disponíveis neste lote' });
    }
    
    console.log('✅ Vagas disponíveis:', selectedLot.quantity, 'Inscrições:', participantes.length);
    
    // Criar inscrição simples
    const registrationCode = `REG-${Date.now()}`;
    const inscricoesIds = [];
    
    for (const participante of participantes) {
      console.log('📝 Processando participante:', participante.name);
      
      const inscricaoData = {
        event_id: parseInt(id),
        lot_id: selectedLot.id,
        name: participante.name,
        email: participante.email,
        phone: participante.phone,
        cpf: participante.cpf || null,
        status: 'confirmed',
        payment_status: 'paid',
        registration_code: registrationCode,
        created_at: new Date(),
        updated_at: new Date(),
        form_data: JSON.stringify(participante)
      };
      
      console.log('📋 Dados da inscrição:', inscricaoData);
      
      const [inscricaoId] = await db('registrations').insert(inscricaoData).returning('id');
      inscricoesIds.push(inscricaoId);
      console.log('✅ Inscrição criada:', inscricaoId);
    }
    
    // Atualizar quantidade do lote
    await db('lots')
      .where('id', selectedLot.id)
      .update({
        quantity: db.raw(`quantity - ${participantes.length}`),
        updated_at: new Date()
      });
    
    console.log('✅ Quantidade do lote atualizada');
    
    // Criar pagamento se não for gratuito
    let paymentInfo = null;
    if (selectedLot.price > 0) {
      try {
        console.log('🔗 Criando pagamento no Mercado Pago...');
        console.log('💰 Dados do pagamento:', {
          amount: selectedLot.price * participantes.length,
          description: `Inscrição - ${event.title} - ${selectedLot.name}`,
          customer: participantes[0],
          method: payment_method || 'CHECKOUT_PRO'
        });
        
        const PaymentGateway = require('../services/PaymentGateway');
        
        paymentInfo = await PaymentGateway.createPayment({
          amount: selectedLot.price * participantes.length,
          description: `Inscrição - ${event.title} - ${selectedLot.name}`,
          customer: participantes[0],
          method: payment_method || 'CHECKOUT_PRO'
        });
        
        console.log('✅ Pagamento criado:', paymentInfo);
      } catch (paymentError) {
        console.error('❌ Erro ao criar pagamento:', paymentError);
        console.error('📋 Stack do erro:', paymentError.stack);
        // Continuar mesmo se o pagamento falhar
      }
    } else {
      console.log('🆓 Lote gratuito - sem pagamento necessário');
    }
    
    const response = {
      success: true,
      registration_code: registrationCode,
      inscricoes: inscricoesIds,
      message: 'Inscrição realizada com sucesso!',
      payment_info: paymentInfo
    };
    
    console.log('📤 Resposta completa:', JSON.stringify(response, null, 2));
    res.json(response);
    
  } catch (error) {
    console.error('❌ Erro na inscrição:', error);
    console.error('📋 Stack:', error.stack);
    res.status(500).json({
      error: 'Erro na inscrição',
      details: error.message,
      stack: error.stack
    });
  }
});

// Rota para buscar produtos do evento
router.get('/:id/products', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if id is a number
    const eventId = parseInt(id);
    let event;
    
    if (isNaN(eventId)) {
      // Buscar por slug
      event = await db('events').where('slug', id).first();
    } else {
      // Buscar por ID
      event = await db('events').where('id', eventId).first();
    }
    
    if (!event) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }
    
    const products = await db('event_products')
      .where('event_id', event.id)
      .where('is_active', true)
      .orderBy('created_at', 'desc');
    
    res.json(products);
  } catch (error) {
    console.error('Erro ao buscar produtos do evento:', error);
    res.status(500).json({ error: 'Erro ao buscar produtos do evento' });
  }
});

// Rota para buscar informações de pagamento
router.get('/payments/:registrationCode', async (req, res) => {
  try {
    const { registrationCode } = req.params;
    
    console.log('🔍 Buscando pagamento para:', registrationCode);
    
    // Buscar inscrição
    const registration = await db('registrations')
      .where('registration_code', registrationCode)
      .first();
      
    if (!registration) {
      return res.status(404).json({ error: 'Inscrição não encontrada' });
    }
    
    // Buscar informações de pagamento
    const payment = await db('payments')
      .where('registration_code', registrationCode)
      .first();
      
    const response = {
      registration: registration,
      payment: payment || null,
      status: payment ? payment.status : 'pending'
    };
    
    console.log('📤 Informações de pagamento:', response);
    res.json(response);
    
  } catch (error) {
    console.error('❌ Erro ao buscar pagamento:', error);
    res.status(500).json({
      error: 'Erro ao buscar pagamento',
      details: error.message
    });
  }
});

module.exports = router; 