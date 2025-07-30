const axios = require('axios');

const API_BASE_URL = 'https://siteigreja-1.onrender.com/api';

console.log('🧪 TESTANDO INSCRIÇÃO SEM AUTENTICAÇÃO');
console.log('========================================');

const testInscricaoSemAuth = async () => {
  try {
    console.log('📋 [1/3] Verificando evento 13...');
    const eventResponse = await axios.get(`${API_BASE_URL}/events/13`);
    console.log('✅ Evento encontrado:', eventResponse.data.title);
    
    console.log('📋 [2/3] Verificando lotes...');
    const lots = eventResponse.data.lots || [];
    console.log(`📊 ${lots.length} lotes encontrados:`);
    lots.forEach(lot => {
      console.log(`  - ID: ${lot.id}, Nome: ${lot.name}, Preço: ${lot.price}, Quantidade: ${lot.quantity}`);
    });
    
    console.log('📋 [3/3] Testando inscrição...');
    const inscricaoData = {
      participantes: [
        {
          name: "Teste Sem Auth",
          email: "teste@sem.auth.com",
          phone: "11999999999"
        }
      ],
      payment_method: "CHECKOUT_PRO",
      lote_id: lots[0]?.id || 1,
      products: []
    };
    
    console.log('📦 Dados da inscrição:', JSON.stringify(inscricaoData, null, 2));
    
    const inscricaoResponse = await axios.post(
      `${API_BASE_URL}/events/13/inscricao-unificada`,
      inscricaoData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Inscrição realizada com sucesso!');
    console.log('📋 Resposta:', inscricaoResponse.data);
    
  } catch (error) {
    console.log('❌ Erro na inscrição:');
    console.log('📋 Status:', error.response?.status);
    console.log('📋 Mensagem:', error.response?.data?.message || error.message);
    console.log('📋 Dados completos do erro:', JSON.stringify(error.response?.data, null, 2));
  }
};

testInscricaoSemAuth(); 