const axios = require('axios');

async function testSimpleStoreProduct() {
  console.log('🧪 Testando produto da loja simples...');
  
  const testData = {
    event_id: 999,
    customer: {
      name: "Teste",
      email: "teste@teste.com",
      phone: "11999999999"
    },
    products: [
      {
        product_id: 1, // Bíblia Sagrada - R$ 45.00
        quantity: 1,
        unit_price: 45.00
      }
    ]
  };

  console.log('📦 Dados do teste:', JSON.stringify(testData, null, 2));
  console.log('💰 Total esperado: R$ 45,00');

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

testSimpleStoreProduct(); 