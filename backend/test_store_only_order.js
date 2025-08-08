const axios = require('axios');

(async () => {
  try {
    const payload = {
      event_id: 999,
      customer: {
        name: 'Teste Loja',
        email: 'loja@example.com',
        phone: '11999999999',
        cpf: null,
        address: {
          street: '',
          number: '',
          complement: '',
          neighborhood: '',
          city: '',
          state: '',
          zipCode: ''
        }
      },
      items: [],
      products: [
        { product_id: 3, quantity: 1, unit_price: 25 }
      ]
    };

    console.log('📦 Enviando payload:', JSON.stringify(payload));
    const res = await axios.post('https://siteigreja.onrender.com/api/registrations', payload, { timeout: 60000 });
    console.log('✅ Status:', res.status);
    console.log('✅ Body:', res.data);
  } catch (err) {
    console.error('❌ Erro:', err.response?.status, err.response?.data || err.message);
  }
})();