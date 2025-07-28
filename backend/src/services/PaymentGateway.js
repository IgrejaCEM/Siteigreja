const axios = require('axios');
const config = require('../config');

// Classe do Mercado Pago
class MercadoPagoGateway {
  constructor() {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || config.payment.mercadopago.accessToken;
    console.log('🔑 Token Mercado Pago configurado:', accessToken ? 'SIM' : 'NÃO');
    console.log('🔑 Token completo:', accessToken || 'NÃO CONFIGURADO');
    console.log('🔑 Token prefixo:', accessToken ? accessToken.substring(0, 10) + '...' : 'NÃO CONFIGURADO');
    console.log('🔑 Tipo de credencial:', accessToken?.startsWith('APP_USR') ? 'PRODUÇÃO' : accessToken?.startsWith('TEST') ? 'SANDBOX' : 'DESCONHECIDO');
    console.log('🌍 Ambiente:', process.env.NODE_ENV || 'development');
    console.log('🔑 Variável de ambiente MERCADOPAGO_ACCESS_TOKEN:', process.env.MERCADOPAGO_ACCESS_TOKEN ? 'CONFIGURADA' : 'NÃO CONFIGURADA');
    console.log('🔑 Config fallback accessToken:', config.payment.mercadopago.accessToken);
    
    this.api = axios.create({
      baseURL: 'https://api.mercadopago.com/v1',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async createPayment({ amount, description, customer, method = 'CREDITCARD' }) {
    try {
      // Checkout Pro - Não precisa especificar método, usuário escolhe dentro do checkout
      const payload = {
        items: [
          {
            title: description || 'Inscrição no Evento',
            quantity: 1,
            unit_price: Number(amount)
          }
        ],
        payer: {
          name: customer.name || '',
          email: customer.email || '',
          identification: {
            type: 'CPF',
            number: customer.cpf || ''
          }
        },
        back_urls: {
          success: process.env.NODE_ENV === 'production' 
            ? 'https://igrejacemchurch.org/inscricao/sucesso'
            : 'http://localhost:5173/inscricao/sucesso',
          failure: process.env.NODE_ENV === 'production'
            ? 'https://igrejacemchurch.org/inscricao/erro'
            : 'http://localhost:5173/inscricao/erro',
          pending: process.env.NODE_ENV === 'production'
            ? 'https://igrejacemchurch.org/inscricao/pendente'
            : 'http://localhost:5173/inscricao/pendente'
        },
        auto_return: 'approved',
        external_reference: customer.registration_code || '',
        notification_url: process.env.NODE_ENV === 'production' 
          ? (process.env.MERCADOPAGO_WEBHOOK_URL || 'https://siteigreja-1.onrender.com/api/payments/webhook')
          : 'http://localhost:3005/api/payments/webhook',
        statement_descriptor: 'INSCRICAO',
        metadata: {
          registration_code: customer.registration_code,
          customer_id: customer.id,
          event_id: customer.event_id
        }
      };

      console.log('🔗 Criando checkout Pro do Mercado Pago...');
      console.log('📦 Payload:', JSON.stringify(payload, null, 2));

      // Criar preferência de pagamento (Checkout Pro)
      console.log('🔗 Criando preferência no Mercado Pago...');
      const response = await this.api.post('/preferences', payload);
      
      console.log('✅ Checkout Pro criado:', response.data.id);

      return {
        payment_id: response.data.id,
        payment_url: response.data.init_point, // URL do checkout onde usuário escolhe método
        status: 'pending',
        status_detail: 'pending',
        external_reference: response.data.external_reference,
        raw: response.data
      };
    } catch (error) {
      console.error('❌ Erro ao criar checkout Mercado Pago:');
      console.error('📊 Status:', error.response?.status);
      console.error('📊 Status Text:', error.response?.statusText);
      console.error('📊 URL:', error.config?.url);
      console.error('📊 Method:', error.config?.method);
      console.error('📊 Headers:', error.config?.headers);
      console.error('📊 Data:', error.response?.data);
      console.error('📊 Message:', error.message);
      throw error;
    }
  }

  async getPaymentStatus(paymentId) {
    try {
      const response = await this.api.get(`/v1/payments/${paymentId}`);
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
    this.config = require('../config');
    console.log('🔧 PaymentGateway inicializado com PAYMENT_FAKE_MODE:', this.config.PAYMENT_FAKE_MODE);
  }

  async createPayment(paymentData) {
    // Verificar se modo fake está ativado
    if (this.config.PAYMENT_FAKE_MODE) {
      console.log('🎭 MODO FAKE ATIVADO - Criando pagamento fake');
      
      const fakeUrl = `https://igrejacemchurch.org/inscricao/checkout-fake?amount=${paymentData.amount}&description=${encodeURIComponent(paymentData.description)}`;
      
      return {
        payment_id: 'FAKE-' + Date.now(),
        payment_url: fakeUrl,
        status: 'pending',
        status_detail: 'pending',
        external_reference: paymentData.customer.registration_code,
        amount: paymentData.amount,
        description: paymentData.description,
        customer: paymentData.customer,
        created_at: new Date(),
        updated_at: new Date()
      };
    }
    
    // Modo real
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