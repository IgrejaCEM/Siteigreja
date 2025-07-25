const axios = require('axios');
const config = require('../config');

// Classe do Mercado Pago
class MercadoPagoGateway {
  constructor() {
    this.api = axios.create({
      baseURL: 'https://api.mercadopago.com/v1',
      headers: {
        'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN || config.payment.mercadopago.accessToken}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': Date.now().toString() // Chave de idempotência para evitar duplicidade
      }
    });
  }

  async createPayment({ amount, description, customer, method = 'CREDITCARD' }) {
    try {
      // Mapeamento dos métodos para os valores aceitos pelo Mercado Pago
      const mpMethodMap = {
        PIX: 'pix',
        BOLETO: 'bolbradesco',
        CREDITCARD: 'credit_card',
        CREDIT_CARD: 'credit_card',
      };
      const mpMethod = mpMethodMap[method] || 'credit_card';

      // Monta o payload base
      const payload = {
        transaction_amount: Number(amount),
        description: description || 'Pagamento de inscrição',
        payment_method_id: mpMethod,
        payer: {
          email: customer.email || '',
          identification: {
            type: 'CPF',
            number: customer.cpf || ''
          },
          first_name: customer.name ? customer.name.split(' ')[0] : '',
          last_name: customer.name ? customer.name.split(' ').slice(1).join(' ') : ''
        },
        notification_url: config.payment.mercadopago.webhookUrl,
        statement_descriptor: 'INSCRICAO',
        external_reference: customer.registration_code || '',
        installments: 1, // Parcelas (pode ser configurável)
        metadata: {
          registration_code: customer.registration_code,
          customer_id: customer.id,
          event_id: customer.event_id
        }
      };

      // Adiciona campos específicos para cada método de pagamento
      if (mpMethod === 'pix') {
        payload.payment_method_id = 'pix';
        payload.payment_type_id = 'pix';
        payload.transaction_details = {
          financial_institution: '00000000'
        };
      } else if (mpMethod === 'bolbradesco') {
        payload.payment_method_id = 'bolbradesco';
        payload.payment_type_id = 'ticket';
        payload.date_of_expiration = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(); // 3 dias
      } else if (mpMethod === 'credit_card' && customer.card_token) {
        payload.token = customer.card_token;
        payload.binary_mode = true;
      }

      const response = await this.api.post('/payments', payload);
      
      let paymentUrl = '';
      if (response.data.point_of_interaction) {
        if (mpMethod === 'pix') {
          paymentUrl = response.data.point_of_interaction.transaction_data.qr_code_base64;
        } else if (mpMethod === 'bolbradesco') {
          paymentUrl = response.data.transaction_details.external_resource_url;
        } else {
          paymentUrl = response.data.point_of_interaction.transaction_data.ticket_url;
        }
      }

      return {
        payment_id: response.data.id,
        payment_url: paymentUrl,
        status: response.data.status,
        status_detail: response.data.status_detail,
        payment_method_id: response.data.payment_method_id,
        payment_type_id: response.data.payment_type_id,
        external_reference: response.data.external_reference,
        transaction_details: response.data.transaction_details,
        point_of_interaction: response.data.point_of_interaction,
        raw: response.data
      };
    } catch (error) {
      console.error('Erro ao criar pagamento Mercado Pago:', error.response?.data || error.message);
      throw error;
    }
  }

  async getPaymentStatus(paymentId) {
    try {
      const response = await this.api.get(`/payments/${paymentId}`);
      return {
        status: response.data.status,
        status_detail: response.data.status_detail,
        payment_method_id: response.data.payment_method_id,
        payment_type_id: response.data.payment_type_id,
        external_reference: response.data.external_reference,
        transaction_details: response.data.transaction_details,
        point_of_interaction: response.data.point_of_interaction,
        metadata: response.data.metadata,
        raw: response.data
      };
    } catch (error) {
      console.error('Erro ao consultar status Mercado Pago:', error.response?.data || error.message);
      throw error;
    }
  }

  // Método para criar token de cartão (necessário para pagamentos com cartão)
  async createCardToken(cardData) {
    try {
      const response = await this.api.post('/card_tokens', {
        card_number: cardData.number.replace(/\s/g, ''),
        security_code: cardData.cvv,
        expiration_month: parseInt(cardData.expiry.split('/')[0]),
        expiration_year: parseInt(cardData.expiry.split('/')[1]),
        cardholder: {
          name: cardData.holder_name,
          identification: {
            type: 'CPF',
            number: cardData.holder_doc
          }
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao criar token do cartão:', error.response?.data || error.message);
      throw error;
    }
  }
}

// Classe original do AbacatePay (mantida em standby)
class AbacatePayGateway {
  constructor() {
    this.api = axios.create({
      baseURL: 'https://api.abacatepay.com',
      headers: {
        'Authorization': `Bearer ${process.env.ABACATEPAY_API_KEY || 'abc_dev_hwNkfZYxj06YeTg0gb0C2cbg'}`,
        'Content-Type': 'application/json'
      }
    });
  }

  // Cria uma cobrança na AbacatePay
  async createPayment({ amount, description, customer, method = 'CREDITCARD' }) {
    try {
      // Mapeamento dos métodos para os valores aceitos pela AbacatePay
      const abacatePayMethodMap = {
        PIX: 'PIX',
        BOLETO: 'BOLETO', // Corrigido para o valor aceito pela AbacatePay
        BOLETO_BANCARIO: 'BOLETO',
        CREDITCARD: 'CREDIT_CARD',
        CREDIT_CARD: 'CREDIT_CARD',
      };
      const abacatePayMethod = abacatePayMethodMap[method] || 'CREDIT_CARD';
      // Monta o payload conforme documentação oficial
      const payload = {
        amount: Math.round(Number(amount)),
        description: description || 'Pagamento de inscrição',
        frequency: 'ONE_TIME',
        methods: [abacatePayMethod],
        products: [
          {
            externalId: 'INSCRICAO',
            name: 'Inscrição',
            price: Math.round(Number(amount) * 100),
            quantity: 1
          }
        ],
        returnUrl: 'http://localhost:5173/inscricao/sucesso',
        completionUrl: 'http://localhost:5173/inscricao/sucesso',
      };
      // Inclui dados do cliente se disponíveis
      if (customer && (customer.name || customer.email || customer.phone || customer.cpf)) {
        payload.customer = {
          name: customer.name || '',
          email: customer.email || '',
          cellphone: customer.phone || '',
          taxId: customer.cpf || ''
        };
      }
      const response = await this.api.post('/v1/billing/create', payload);
      if (response.data && response.data.data) {
        return {
          payment_id: response.data.data.id,
          payment_url: response.data.data.url,
          status: response.data.data.status,
          raw: response.data.data
        };
      } else {
        throw new Error(response.data.error || 'Erro ao criar cobrança na AbacatePay');
      }
    } catch (error) {
      console.error('Erro ao criar cobrança AbacatePay:', error.response?.data || error.message);
      throw error;
    }
  }

  // (Opcional) Consultar status do pagamento futuramente
  async getPaymentStatus(paymentId) {
    try {
      const response = await this.api.get(`/billing/get?id=${paymentId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao consultar status AbacatePay:', error.response?.data || error.message);
      throw error;
    }
  }
}

// Classe principal que gerencia os gateways
class PaymentGateway {
  constructor() {
    this.mercadoPago = new MercadoPagoGateway();
    this.abacatePay = new AbacatePayGateway();
    this.activeGateway = 'mercadopago'; // Define Mercado Pago como gateway padrão
  }

  async createPayment(paymentData) {
    if (this.activeGateway === 'mercadopago') {
      return await this.mercadoPago.createPayment(paymentData);
    } else {
      return await this.abacatePay.createPayment(paymentData);
    }
  }

  async getPaymentStatus(paymentId) {
    if (this.activeGateway === 'mercadopago') {
      return await this.mercadoPago.getPaymentStatus(paymentId);
    } else {
      return await this.abacatePay.getPaymentStatus(paymentId);
    }
  }

  setActiveGateway(gateway) {
    if (['mercadopago', 'abacatepay'].includes(gateway)) {
      this.activeGateway = gateway;
    } else {
      throw new Error('Gateway de pagamento inválido');
    }
  }
}

module.exports = new PaymentGateway(); 