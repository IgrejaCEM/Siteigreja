const axios = require('axios');
const config = require('../config');

class BoletoPaymentGateway {
  constructor() {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    this.api = axios.create({
      baseURL: 'https://api.mercadopago.com',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
  }

  // ESTRATÉGIA 1: RESERVA TEMPORÁRIA (3 dias)
  async createBoletoWithTemporaryReservation(paymentData) {
    try {
      const { amount, description, customer, registrationCode } = paymentData;
      
      console.log('🏦 Criando boleto com reserva temporária...');
      
      // Extrair nome e sobrenome do cliente
      const fullName = customer.name || '';
      const nameParts = fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || firstName;

      const payload = {
        items: [
          {
            id: registrationCode || 'BOLETO-001',
            title: description || 'Inscrição no Evento',
            description: `Inscrição para ${customer.name || 'Participante'} - ${description || 'Evento'}`,
            category_id: 'events',
            quantity: 1,
            unit_price: Number(amount)
          }
        ],
        payer: {
          name: firstName,
          surname: lastName, // ✅ MELHORIA: Sobrenome do comprador
          email: customer.email || '',
          phone: {
            area_code: '11',
            number: customer.phone || '999999999'
          }
        },
        back_urls: {
          success: `${process.env.FRONTEND_URL || 'https://igrejacemchurch.org'}/inscricao/sucesso`,
          failure: `${process.env.FRONTEND_URL || 'https://igrejacemchurch.org'}/inscricao/erro`,
          pending: `${process.env.FRONTEND_URL || 'https://igrejacemchurch.org'}/inscricao/pendente`
        },
        auto_return: 'approved',
        external_reference: registrationCode,
        notification_url: `${process.env.BACKEND_URL || 'https://siteigreja-1.onrender.com'}/api/payments/webhook`,
        statement_descriptor: 'INSCRICAO',
        binary_mode: true,
        installments: 1,
        payment_methods: {
          installments: 1,
          default_installments: 1,
          included_payment_types: [
            { id: "ticket" } // Apenas boleto
          ],
          excluded_payment_methods: [
            { id: "amex" },
            { id: "naranja" },
            { id: "nativa" },
            { id: "shopping" },
            { id: "cencosud" },
            { id: "argencard" },
            { id: "cabal" },
            { id: "diners" }
          ]
        },
        expires: true,
        expiration_date_from: new Date().toISOString(),
        expiration_date_to: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 dias
        metadata: {
          registration_code: registrationCode,
          payment_type: 'boleto',
          strategy: 'temporary_reservation',
          customer_id: customer.id,
          event_id: customer.event_id
        }
      };

      const response = await this.api.post('/checkout/preferences', payload);
      
      console.log('✅ Boleto criado com reserva temporária');
      
      return {
        payment_id: response.data.id,
        payment_url: response.data.init_point,
        boleto_url: response.data.init_point,
        expiration_date: response.data.expires,
        strategy: 'temporary_reservation',
        message: 'Boleto gerado! Você tem 3 dias para pagar. A vaga está reservada até o vencimento.'
      };
      
    } catch (error) {
      console.error('❌ Erro ao criar boleto:', error.response?.data || error.message);
      throw new Error(`Erro ao gerar boleto: ${error.response?.data?.message || error.message}`);
    }
  }

  // ESTRATÉGIA 2: CONFIRMAÇÃO IMEDIATA
  async createBoletoWithImmediateConfirmation(paymentData) {
    try {
      const { amount, description, customer, registrationCode } = paymentData;
      
      console.log('🏦 Criando boleto com confirmação imediata...');
      
      // Extrair nome e sobrenome do cliente
      const fullName = customer.name || '';
      const nameParts = fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || firstName;

      const payload = {
        items: [
          {
            id: registrationCode || 'BOLETO-002',
            title: description || 'Inscrição no Evento',
            description: `Inscrição para ${customer.name || 'Participante'} - ${description || 'Evento'}`,
            category_id: 'events',
            quantity: 1,
            unit_price: Number(amount)
          }
        ],
        payer: {
          name: firstName,
          surname: lastName, // ✅ MELHORIA: Sobrenome do comprador
          email: customer.email || '',
          phone: {
            area_code: '11',
            number: customer.phone || '999999999'
          }
        },
        back_urls: {
          success: `${process.env.FRONTEND_URL || 'https://igrejacemchurch.org'}/inscricao/sucesso`,
          failure: `${process.env.FRONTEND_URL || 'https://igrejacemchurch.org'}/inscricao/erro`,
          pending: `${process.env.FRONTEND_URL || 'https://igrejacemchurch.org'}/inscricao/pendente`
        },
        auto_return: 'approved',
        external_reference: registrationCode,
        notification_url: `${process.env.BACKEND_URL || 'https://siteigreja-1.onrender.com'}/api/payments/webhook`,
        statement_descriptor: 'INSCRICAO',
        binary_mode: true,
        installments: 1,
        payment_methods: {
          installments: 1,
          default_installments: 1,
          included_payment_types: [
            { id: "ticket" } // Apenas boleto
          ],
          excluded_payment_methods: [
            { id: "amex" },
            { id: "naranja" },
            { id: "nativa" },
            { id: "shopping" },
            { id: "cencosud" },
            { id: "argencard" },
            { id: "cabal" },
            { id: "diners" }
          ]
        },
        expires: true,
        expiration_date_from: new Date().toISOString(),
        expiration_date_to: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 dias
        metadata: {
          registration_code: registrationCode,
          payment_type: 'boleto',
          strategy: 'immediate_confirmation',
          customer_id: customer.id,
          event_id: customer.event_id
        }
      };

      const response = await this.api.post('/checkout/preferences', payload);
      
      console.log('✅ Boleto criado com confirmação imediata');
      
      return {
        payment_id: response.data.id,
        payment_url: response.data.init_point,
        boleto_url: response.data.init_point,
        expiration_date: response.data.expires,
        strategy: 'immediate_confirmation',
        message: 'Boleto gerado! Sua inscrição está confirmada. Pague quando puder.'
      };
      
    } catch (error) {
      console.error('❌ Erro ao criar boleto:', error.response?.data || error.message);
      throw new Error(`Erro ao gerar boleto: ${error.response?.data?.message || error.message}`);
    }
  }

  // ESTRATÉGIA 3: RESERVA COM PRAZO (24h)
  async createBoletoWithTimeLimit(paymentData) {
    try {
      const { amount, description, customer, registrationCode } = paymentData;
      
      console.log('🏦 Criando boleto com prazo de 24h...');
      
      // Extrair nome e sobrenome do cliente
      const fullName = customer.name || '';
      const nameParts = fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || firstName;

      const payload = {
        items: [
          {
            id: registrationCode || 'BOLETO-003',
            title: description || 'Inscrição no Evento',
            description: `Inscrição para ${customer.name || 'Participante'} - ${description || 'Evento'}`,
            category_id: 'events',
            quantity: 1,
            unit_price: Number(amount)
          }
        ],
        payer: {
          name: firstName,
          surname: lastName, // ✅ MELHORIA: Sobrenome do comprador
          email: customer.email || '',
          phone: {
            area_code: '11',
            number: customer.phone || '999999999'
          }
        },
        back_urls: {
          success: `${process.env.FRONTEND_URL || 'https://igrejacemchurch.org'}/inscricao/sucesso`,
          failure: `${process.env.FRONTEND_URL || 'https://igrejacemchurch.org'}/inscricao/erro`,
          pending: `${process.env.FRONTEND_URL || 'https://igrejacemchurch.org'}/inscricao/pendente`
        },
        auto_return: 'approved',
        external_reference: registrationCode,
        notification_url: `${process.env.BACKEND_URL || 'https://siteigreja-1.onrender.com'}/api/payments/webhook`,
        statement_descriptor: 'INSCRICAO',
        binary_mode: true,
        installments: 1,
        payment_methods: {
          installments: 1,
          default_installments: 1,
          included_payment_types: [
            { id: "ticket" } // Apenas boleto
          ],
          excluded_payment_methods: [
            { id: "amex" },
            { id: "naranja" },
            { id: "nativa" },
            { id: "shopping" },
            { id: "cencosud" },
            { id: "argencard" },
            { id: "cabal" },
            { id: "diners" }
          ]
        },
        expires: true,
        expiration_date_from: new Date().toISOString(),
        expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h
        metadata: {
          registration_code: registrationCode,
          payment_type: 'boleto',
          strategy: 'time_limit',
          customer_id: customer.id,
          event_id: customer.event_id
        }
      };

      const response = await this.api.post('/checkout/preferences', payload);
      
      console.log('✅ Boleto criado com prazo de 24h');
      
      return {
        payment_id: response.data.id,
        payment_url: response.data.init_point,
        boleto_url: response.data.init_point,
        expiration_date: response.data.expires,
        strategy: 'time_limit',
        message: 'Boleto gerado! Você tem 24h para pagar. Após esse prazo, a vaga será liberada.'
      };
      
    } catch (error) {
      console.error('❌ Erro ao criar boleto:', error.response?.data || error.message);
      throw new Error(`Erro ao gerar boleto: ${error.response?.data?.message || error.message}`);
    }
  }

  // Verificar status do boleto
  async getBoletoStatus(paymentId) {
    try {
      const response = await this.api.get(`/v1/payments/${paymentId}`);
      
      return {
        status: response.data.status,
        status_detail: response.data.status_detail,
        payment_method: response.data.payment_method,
        transaction_amount: response.data.transaction_amount,
        date_approved: response.data.date_approved,
        date_created: response.data.date_created,
        date_last_updated: response.data.date_last_updated
      };
      
    } catch (error) {
      console.error('❌ Erro ao verificar status do boleto:', error.response?.data || error.message);
      throw new Error(`Erro ao verificar boleto: ${error.response?.data?.message || error.message}`);
    }
  }

  // Cancelar boleto vencido
  async cancelExpiredBoleto(paymentId) {
    try {
      const response = await this.api.put(`/v1/payments/${paymentId}`, {
        status: 'cancelled'
      });
      
      console.log('✅ Boleto cancelado:', paymentId);
      return response.data;
      
    } catch (error) {
      console.error('❌ Erro ao cancelar boleto:', error.response?.data || error.message);
      throw new Error(`Erro ao cancelar boleto: ${error.response?.data?.message || error.message}`);
    }
  }
}

module.exports = BoletoPaymentGateway; 