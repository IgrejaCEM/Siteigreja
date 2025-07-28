const axios = require('axios');

const BASE_URL = 'https://siteigreja-1.onrender.com';

console.log('🔍 DEBUGANDO PROBLEMA DO FRONTEND');
console.log('==================================');

async function testarFrontendDebug() {
  try {
    console.log('📋 Passo 1: Simulando requisição do frontend...');
    
    // Simular exatamente o que o frontend envia
    const frontendData = {
      lot_id: 2,
      participantes: [
        {
          name: 'João Silva Teste',
          email: 'joao.teste@email.com',
          phone: '11999999999',
          cpf: '12345678901',
          address: 'Rua Teste, 123',
          form_data: {
            nome: 'João Silva Teste',
            email: 'joao.teste@email.com',
            telefone: '11999999999',
            cpf: '12345678901',
            endereco: 'Rua Teste, 123'
          }
        }
      ],
      payment_method: 'CHECKOUT_PRO',
      products: []
    };

    console.log('📦 Dados que o frontend envia:', JSON.stringify(frontendData, null, 2));

    const response = await axios.post(`${BASE_URL}/api/events/4/inscricao-unificada`, frontendData);
    
    console.log('✅ Resposta da API:', response.status);
    console.log('📦 Dados da resposta:', JSON.stringify(response.data, null, 2));
    
    if (response.data.payment_info?.payment_url) {
      console.log('🔗 URL do pagamento:', response.data.payment_info.payment_url);
      
      // Testar acessibilidade
      try {
        const urlResponse = await axios.get(response.data.payment_info.payment_url, {
          timeout: 10000,
          maxRedirects: 5,
          validateStatus: function (status) {
            return status < 500;
          }
        });
        
        console.log('✅ URL acessível!');
        console.log('📊 Status:', urlResponse.status);
        
      } catch (urlError) {
        console.log('❌ URL não acessível:', urlError.message);
      }
    } else {
      console.log('❌ Nenhuma URL de pagamento recebida!');
    }

    console.log('\n📋 Passo 2: Verificando logs do backend...');
    
    // Fazer uma requisição para verificar se há logs
    const logsResponse = await axios.get(`${BASE_URL}/api/auth/health`);
    console.log('✅ Backend online:', logsResponse.data);

    console.log('\n🎯 CONCLUSÃO:');
    console.log('🔗 URL para teste manual:', response.data.payment_info?.payment_url);
    console.log('💰 Valor: R$ 50,00');
    console.log('🔍 Compare com a URL que aparece no frontend');

  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
    console.error('📊 Status:', error.response?.status);
    
    if (error.response?.data) {
      console.error('📦 Data do erro:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testarFrontendDebug(); 