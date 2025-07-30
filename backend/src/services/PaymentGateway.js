const axios = require('axios');
const config = require('../config');

// Classe do Mercado Pago
class MercadoPagoGateway {
  constructor() {
    // Credenciais de produção do Checkout PRO
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || 'APP_USR-7906695833613236-072622-a7c53bcaf7bc8b8289f1961ce3937843-2568627728';
    const publicKey = process.env.MERCADOPAGO_PUBLIC_KEY || 'APP_USR-c478c542-b18d-4ab1-acba-9539754cb167';
    
    console.log('🔑 Configurando Mercado Pago Checkout PRO');
    console.log('   Access Token:', accessToken.substring(0, 20) + '...');
    console.log('   Public Key:', publicKey.substring(0, 20) + '...');
    
    this.api = axios.create({
      baseURL: 'https://api.mercadopago.com',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'cross-site'
      }
    });
  }

  async createPayment(paymentData) {
    try {
      const { amount, description, customer } = paymentData;
      
      console.log('🔗 Criando preferência no Mercado Pago...');
      
      // Extrair nome e sobrenome do cliente
      const fullName = customer.name || '';
      const nameParts = fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || firstName;
      
      // Payload simplificado baseado na documentação oficial
      const payload = {
        items: [
          {
            id: customer.registration_code || 'INSCRICAO-001',
            title: description || 'Inscrição no Evento',
            description: `Inscrição para ${customer.name || 'Participante'}`,
            quantity: 1,
            unit_price: Number(amount)
          }
        ],
        payer: {
          name: firstName,
          surname: lastName,
          email: customer.email || '',
          phone: {
            area_code: '11',
            number: '999999999'
          }
        },
        back_urls: {
          success: 'https://igrejacemchurch.org',
          failure: 'https://igrejacemchurch.org',
          pending: 'https://igrejacemchurch.org'
        },
        auto_return: 'approved',
        external_reference: customer.registration_code || '',
        notification_url: 'https://siteigreja-1.onrender.com/api/payments/webhook',
        statement_descriptor: 'INSCRICAO',
        binary_mode: true,
        expires: true,
        expiration_date_from: new Date().toISOString(),
        expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };

      console.log('📦 Payload da preferência:', JSON.stringify(payload, null, 2));
      
      // Usar endpoint correto da documentação
      const response = await this.api.post('/checkout/preferences', payload);
      
      console.log('✅ Preferência criada com sucesso!');
      console.log('🔗 ID da preferência:', response.data.id);
      console.log('🔗 URL do checkout:', response.data.init_point);
      
      return {
        id: response.data.id,
        payment_url: response.data.init_point,
        status: 'pending'
      };
      
    } catch (error) {
      console.error('❌ Erro ao criar preferência no Mercado Pago:', error.response?.data || error.message);
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
    // Forçar modo fake temporariamente para debug
    this.config.PAYMENT_FAKE_MODE = true;
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