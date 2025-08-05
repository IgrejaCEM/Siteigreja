const axios = require('axios');

async function testStoreOnlyPurchase() {
  console.log('🧪 Testando compra apenas de produtos da loja...');
  
  const testData = {
    event_id: 999, // Evento especial para produtos da loja
    customer: {
      name: "Teste Usuário",
      email: "teste@teste.com", 
      phone: "11999999999",
      cpf: null // CPF opcional para produtos da loja
    },
    products: [
      {
        product_id: 1,
        quantity: 2,
        unit_price: 25.00
      },
      {
        product_id: 7, // CAMISETA
        quantity: 1,
        unit_price: 50.00
      }
    ],
    totalAmount: 100.00 // 2x R$ 25 + 1x R$ 50
  };

  console.log('📦 Dados do teste:', JSON.stringify(testData, null, 2));
  console.log('💰 Total esperado: R$ 100,00 (2x R$ 25,00 + 1x R$ 50,00)');

  try {
    console.log('🌐 Fazendo requisição para: https://siteigreja.onrender.com/api/registrations');
    
    const response = await axios.post('https://siteigreja.onrender.com/api/registrations', testData, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Test-Script/1.0'
      },
      timeout: 30000
    });

    console.log('✅ Sucesso!');
    console.log('📊 Status:', response.status);
    console.log('📦 Resposta:', JSON.stringify(response.data, null, 2));
    
    if (response.data.payment_url) {
      console.log('🔗 URL de pagamento gerada:', response.data.payment_url);
    }
    
  } catch (error) {
    console.error('❌ Erro na API:', error.response?.status);
    console.error('📦 Dados do erro:', error.response?.data);
    console.error('❌ Erro completo:', error.message);
  }
}

testStoreOnlyPurchase(); 