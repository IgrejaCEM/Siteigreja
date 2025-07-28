const express = require('express');
const router = express.Router();
const PaymentGateway = require('../services/PaymentGateway');
const { db } = require('../database/db');
const { authenticateToken, requireAdmin } = require('../middleware');

// Rotas de configuração de pagamento
router.get('/events/:eventId/payment-settings', authenticateToken, async (req, res) => {
  try {
    const { eventId } = req.params;
    const settings = await db('event_payment_settings')
      .where('event_id', eventId)
      .first();
    res.json(settings || {});
  } catch (error) {
    console.error('Erro ao buscar configurações de pagamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.put('/events/:eventId/payment-settings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { eventId } = req.params;
    const settings = req.body;
    
    const existing = await db('event_payment_settings')
      .where('event_id', eventId)
      .first();
      
    if (existing) {
      await db('event_payment_settings')
        .where('event_id', eventId)
        .update({
          ...settings,
          updated_at: new Date()
        });
    } else {
      await db('event_payment_settings').insert({
        event_id: eventId,
        ...settings,
        created_at: new Date(),
        updated_at: new Date()
      });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao atualizar configurações de pagamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.get('/payment-methods', async (req, res) => {
  try {
    const methods = await db('payment_methods')
      .where('status', 'active')
      .orderBy('name');
    res.json(methods);
  } catch (error) {
    console.error('Erro ao buscar métodos de pagamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota de teste para Mercado Pago (REMOVER APÓS USO)
router.post('/test-mercadopago', async (req, res) => {
  try {
    console.log('🧪 TESTANDO MERCADO PAGO...');
    
    const paymentGateway = new PaymentGateway();
    const paymentData = {
      amount: 50.00,
      description: 'Teste de Pagamento',
      customer: {
        name: 'Teste Usuario',
        email: 'teste@teste.com',
        cpf: '12345678901',
        registration_code: 'TEST-001',
        id: 1,
        event_id: 1
      },
      method: 'CREDITCARD'
    };
    
    console.log('📦 Dados do pagamento:', paymentData);
    
    const payment = await paymentGateway.createPayment(paymentData);
    
    console.log('✅ Pagamento criado:', payment);
    
    res.json({
      success: true,
      payment: payment,
      message: 'Teste do Mercado Pago realizado com sucesso!'
    });
    
  } catch (error) {
    console.error('❌ Erro no teste do Mercado Pago:', error);
    res.status(500).json({
      error: 'Erro no teste do Mercado Pago',
      details: error.message,
      stack: error.stack
    });
  }
});

// Criar uma nova intenção de pagamento
router.post('/payments/create', authenticateToken, async (req, res) => {
  try {
    const { eventId, loteId, amount, customer } = req.body;

    // Verificar se o evento e lote existem
    const event = await db('events').where('id', eventId).first();
    if (!event) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }

    const lote = await db('lots').where({ id: loteId, event_id: eventId }).first();
    if (!lote) {
      return res.status(404).json({ error: 'Lote não encontrado' });
    }

    // Criar pagamento
    const payment = await PaymentGateway.createPayment({
      amount,
      description: `Inscrição - ${event.title} - ${lote.name}`,
      customer,
      eventId,
      loteId
    });

    // Salvar a intenção de pagamento no banco
    const [paymentId] = await db('payments').insert({
      user_id: req.user.id,
      event_id: eventId,
      lote_id: loteId,
      amount,
      payment_intent_id: payment.id,
      status: payment.status,
      created_at: new Date(),
      updated_at: new Date()
    });

    res.json({ ...payment, id: paymentId });
  } catch (error) {
    console.error('Erro ao criar pagamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Confirmar pagamento
router.post('/payments/:paymentId/confirm', authenticateToken, async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    const result = await PaymentGateway.confirmPayment(paymentId);

    // Atualizar status no banco
    await db('payments')
      .where('payment_intent_id', paymentId)
      .update({
        status: result.status,
        updated_at: new Date()
      });

    res.json(result);
  } catch (error) {
    console.error('Erro ao confirmar pagamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Consultar status do pagamento
router.get('/payments/:paymentId/status', authenticateToken, async (req, res) => {
  try {
    const { paymentId } = req.params;
    const result = await PaymentGateway.getPaymentStatus(paymentId);
    res.json(result);
  } catch (error) {
    console.error('Erro ao consultar status do pagamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Webhook para receber notificações do gateway de pagamento
router.post('/payments/webhook', async (req, res) => {
  try {
    const event = req.body;
    const config = require('../config');
    
    // Verifica se é uma notificação do Mercado Pago
    if (config.payment.activeGateway === 'mercadopago') {
      const paymentId = event.data.id;
      
      // Busca os detalhes do pagamento no Mercado Pago
      const PaymentGateway = require('../services/PaymentGateway');
      const paymentDetails = await PaymentGateway.getPaymentStatus(paymentId);
      
      let newStatus;
      switch (paymentDetails.status) {
        case 'approved':
          newStatus = 'completed';
          break;
        case 'pending':
          newStatus = 'pending';
          break;
        case 'rejected':
        case 'cancelled':
          newStatus = 'failed';
          break;
        default:
          newStatus = 'pending';
      }

      // Atualiza o status do pagamento no banco de dados
      await db('payments')
        .where('payment_intent_id', paymentId)
        .update({
          status: newStatus,
          payment_details: JSON.stringify(paymentDetails),
          updated_at: new Date()
        });

      // Se o pagamento foi aprovado, atualiza o status das inscrições
      if (newStatus === 'completed') {
        const payment = await db('payments')
          .where('payment_intent_id', paymentId)
          .first();
          
        if (payment) {
          await db('registrations')
            .where('registration_code', payment.registration_code)
            .update({
              status: 'confirmed',
              payment_status: 'paid',
              updated_at: new Date()
            });
        }
      }
    } else {
      // Processa notificações do Acabate Pay (mantido para compatibilidade)
      switch (event.type) {
        case 'payment.success':
          await db('payments')
            .where('payment_intent_id', event.data.id)
            .update({
              status: 'completed',
              updated_at: new Date()
            });
          break;
        
        case 'payment.failed':
          await db('payments')
            .where('payment_intent_id', event.data.id)
            .update({
              status: 'failed',
              updated_at: new Date()
            });
          break;
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Erro no webhook:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router; 