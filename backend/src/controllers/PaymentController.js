const { db } = require('../db');
const PaymentGateway = require('../services/PaymentGateway');
const Payment = require('../models/Payment');
const Registration = require('../models/Registration');
const RegistrationProduct = require('../models/RegistrationProduct');
const { processPayment } = require('../services/paymentService');

class PaymentController {
  async getEventPaymentSettings(req, res) {
    try {
      const { eventId } = req.params;
      
      const event = await db('events')
        .where('id', eventId)
        .select('id', 'title', 'has_payment', 'payment_settings', 'payment_gateway', 'ticket_price', 'currency', 'payment_enabled')
        .first();

      if (!event) {
        return res.status(404).json({ error: 'Evento não encontrado' });
      }

      // Parse payment settings if it exists
      if (event.payment_settings && typeof event.payment_settings === 'string') {
        event.payment_settings = JSON.parse(event.payment_settings);
      }

      res.json(event);
    } catch (error) {
      console.error('Erro ao buscar configurações de pagamento:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async updateEventPaymentSettings(req, res) {
    try {
      const { eventId } = req.params;
      const {
        has_payment,
        payment_settings,
        payment_gateway,
        ticket_price,
        currency,
        payment_enabled
      } = req.body;

      const event = await db('events').where('id', eventId).first();
      if (!event) {
        return res.status(404).json({ error: 'Evento não encontrado' });
      }

      await db('events')
        .where('id', eventId)
        .update({
          has_payment: has_payment || false,
          payment_settings: JSON.stringify(payment_settings || {}),
          payment_gateway: payment_gateway || 'stripe',
          ticket_price: ticket_price || 0,
          currency: currency || 'BRL',
          payment_enabled: payment_enabled || false,
          updated_at: new Date()
        });

      res.json({ message: 'Configurações de pagamento atualizadas com sucesso' });
    } catch (error) {
      console.error('Erro ao atualizar configurações de pagamento:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async getPaymentMethods(req, res) {
    try {
      // Retorna os métodos de pagamento disponíveis
      const paymentMethods = [
        {
          id: 'credit_card',
          name: 'Cartão de Crédito',
          enabled: true,
          supported_currencies: ['BRL', 'USD'],
          icon: 'credit_card'
        },
        {
          id: 'pix',
          name: 'PIX',
          enabled: true,
          supported_currencies: ['BRL'],
          icon: 'pix'
        },
        {
          id: 'boleto',
          name: 'Boleto Bancário',
          enabled: true,
          supported_currencies: ['BRL'],
          icon: 'barcode'
        }
      ];

      res.json(paymentMethods);
    } catch (error) {
      console.error('Erro ao buscar métodos de pagamento:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async getPaymentSummary(req, res) {
    try {
      const { eventId } = req.params;

      const payments = await db('payments')
        .where('event_id', eventId)
        .select(
          'status',
          db.raw('COUNT(*) as count'),
          db.raw('SUM(amount) as total_amount')
        )
        .groupBy('status');

      const summary = {
        total_payments: 0,
        total_amount: 0,
        by_status: {}
      };

      payments.forEach(p => {
        summary.total_payments += parseInt(p.count);
        summary.total_amount += parseFloat(p.total_amount || 0);
        summary.by_status[p.status] = {
          count: parseInt(p.count),
          amount: parseFloat(p.total_amount || 0)
        };
      });

      res.json(summary);
    } catch (error) {
      console.error('Erro ao gerar resumo de pagamentos:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async create(req, res) {
    try {
      const { registration_code, payment_method } = req.body;

      const registration = await Registration.query()
        .where('registration_code', registration_code)
        .first();

      if (!registration) {
        return res.status(404).json({ error: 'Inscrição não encontrada' });
      }

      // Busca os produtos da inscrição
      const registrationProducts = await RegistrationProduct.query()
        .where('registration_id', registration.id)
        .withGraphFetched('product');

      // Calcula o valor total incluindo os produtos
      const productsTotal = registrationProducts.reduce((total, rp) => {
        return total + (rp.unit_price * rp.quantity);
      }, 0);

      const lot = await registration.$relatedQuery('lot');
      const totalAmount = lot.price + productsTotal;

      const payment = await Payment.query().insert({
        registration_code,
        amount: totalAmount,
        payment_method,
        status: 'pending'
      });

      // Processa o pagamento
      const paymentResult = await processPayment(payment);

      if (paymentResult.success) {
        await Payment.query()
          .patch({
            status: 'completed',
            transaction_id: paymentResult.transactionId,
            payment_details: paymentResult.details
          })
          .where('id', payment.id);

        await Registration.query()
          .patch({ payment_status: 'paid' })
          .where('id', registration.id);

        return res.json({
          success: true,
          payment: {
            ...payment,
            status: 'completed',
            transaction_id: paymentResult.transactionId
          }
        });
      } else {
        await Payment.query()
          .patch({
            status: 'failed',
            payment_details: paymentResult.details
          })
          .where('id', payment.id);

        return res.status(400).json({
          success: false,
          error: paymentResult.error
        });
      }
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      return res.status(500).json({ error: 'Erro ao processar pagamento' });
    }
  }

  async getPaymentDetails(req, res) {
    try {
      const { registration_code } = req.params;

      const registration = await Registration.query()
        .where('registration_code', registration_code)
        .first();

      if (!registration) {
        return res.status(404).json({ error: 'Inscrição não encontrada' });
      }

      const lot = await registration.$relatedQuery('lot');
      const registrationProducts = await RegistrationProduct.query()
        .where('registration_id', registration.id)
        .withGraphFetched('product');

      const productsTotal = registrationProducts.reduce((total, rp) => {
        return total + (rp.unit_price * rp.quantity);
      }, 0);

      const totalAmount = lot.price + productsTotal;

      return res.json({
        registration,
        lot,
        products: registrationProducts,
        productsTotal,
        totalAmount
      });
    } catch (error) {
      console.error('Erro ao buscar detalhes do pagamento:', error);
      return res.status(500).json({ error: 'Erro ao buscar detalhes do pagamento' });
    }
  }
}

module.exports = new PaymentController(); 