const axios = require('axios');

const ABACATEPAY_API_KEY = 'abc_dev_hwNkfZYxj06YeTg0gb0C2cbg';
const ABACATEPAY_BASE_URL = 'https://api.abacatepay.com';

class PaymentGateway {
  constructor() {
    this.api = axios.create({
      baseURL: ABACATEPAY_BASE_URL,
      headers: {
        'Authorization': `Bearer ${ABACATEPAY_API_KEY}`,
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

module.exports = new PaymentGateway(); 