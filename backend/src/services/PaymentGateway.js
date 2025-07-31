require('dotenv').config();
const axios = require('axios');
const config = require('../config');

// Classe do Mercado Pago
class MercadoPagoGateway {
  constructor() {
    // Credenciais de produção do Checkout PRO
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    const publicKey = process.env.MERCADOPAGO_PUBLIC_KEY;
    
    if (!accessToken) {
      console.error('[MP] ERRO: MERCADOPAGO_ACCESS_TOKEN não está definido!');
      throw new Error('MERCADOPAGO_ACCESS_TOKEN não está definido');
    }
    
    if (!publicKey) {
      console.error('[MP] ERRO: MERCADOPAGO_PUBLIC_KEY não está definido!');
      throw new Error('MERCADOPAGO_PUBLIC_KEY não está definido');
    }
    
    console.log('[MP] Access Token em uso:', accessToken);
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
      
      console.log('[MP] Criando preferência no Mercado Pago...');
      console.log('[MP] PaymentData recebido:', JSON.stringify(paymentData, null, 2));
      console.log('[MP] Amount:', amount);
      console.log('[MP] Description:', description);
      console.log('[MP] Customer:', customer);
      
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

      console.log('[MP] Payload enviado:', JSON.stringify(payload, null, 2));
      
      // Usar endpoint correto da documentação
      const response = await this.api.post('/checkout/preferences', payload);
      
      console.log('[MP] Resposta do Mercado Pago:', JSON.stringify(response.data, null, 2));
      console.log('✅ Preferência criada com sucesso!');
      console.log('🔗 ID da preferência:', response.data.id);
      console.log('🔗 URL do checkout:', response.data.init_point);
      
      return {
        id: response.data.id,
        payment_url: response.data.init_point,
        status: 'pending'
      };
      
    } catch (error) {
      console.error('[MP] Erro ao criar preferência:', error.response?.data || error.message);
      if (error.response) {
        console.error('[MP] Status:', error.response.status);
        console.error('[MP] Headers:', error.response.headers);
        console.error('[MP] Data:', JSON.stringify(error.response.data, null, 2));
      }
      throw error;
    }
  }

  async getPaymentStatus(paymentId) {
    try {
      const response = await this.api.get(`/checkout/preferences/${paymentId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao consultar status MercadoPago:', error.response?.data || error.message);
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
    
    // Carregar config de forma mais robusta
    try {
      this.config = require('../config');
      console.log('✅ Config carregado com sucesso');
    } catch (configError) {
      console.error('❌ Erro ao carregar config:', configError.message);
      // Fallback para config básico
      this.config = {
        PAYMENT_FAKE_MODE: false
      };
      console.log('⚠️ Usando config fallback');
    }
    
    // Desativar modo fake para usar credenciais reais
    this.config.PAYMENT_FAKE_MODE = false;
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

// Criar instância do PaymentGateway
const paymentGatewayInstance = new PaymentGateway();

// Verificar se foi inicializado corretamente
console.log('🔧 PaymentGateway instance criada:', !!paymentGatewayInstance);
console.log('🔧 PaymentGateway methods:', Object.keys(paymentGatewayInstance));
console.log('🔧 PaymentGateway activeGateway:', paymentGatewayInstance.activeGateway);

module.exports = paymentGatewayInstance; 