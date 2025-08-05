const axios = require('axios');

async function checkDeployVersion() {
  console.log('🔍 Verificando se o deploy mais recente foi aplicado...');
  
  try {
    // Testar se os logs detalhados estão funcionando
    console.log('🧪 Testando logs detalhados...');
    const testData = {
      event_id: 999,
      customer: {
        name: "Teste",
        email: "teste@teste.com",
        phone: "11999999999"
      },
      products: [
        {
          product_id: 1,
          quantity: 1,
          unit_price: 45.00
        }
      ]
    };
    
    console.log('📦 Enviando dados de teste...');
    
    const response = await axios.post('https://siteigreja.onrender.com/api/registrations', testData, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Deploy-Check/1.0'
      },
      timeout: 30000
    });
    
    console.log('✅ Deploy mais recente aplicado!');
    console.log('📊 Status:', response.status);
    console.log('📦 Resposta:', JSON.stringify(response.data, null, 2));
    
    if (response.data.payment_url) {
      console.log('🔗 URL de pagamento gerada:', response.data.payment_url);
      console.log('🎉 FUNCIONALIDADE FUNCIONANDO!');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.response?.status);
    console.error('📦 Dados do erro:', error.response?.data);
    console.error('❌ Erro completo:', error.message);
    
    if (error.response?.data?.error === 'Valor total inválido') {
      console.log('⚠️ Deploy ainda não foi aplicado ou problema persiste');
      console.log('🔍 O RegistrationController ainda não está encontrando os produtos');
    }
  }
}

checkDeployVersion(); 