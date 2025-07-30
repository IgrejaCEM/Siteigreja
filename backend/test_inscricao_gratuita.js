const axios = require('axios');

const API_BASE_URL = 'https://siteigreja-1.onrender.com/api';

console.log('🧪 TESTANDO INSCRIÇÃO GRATUITA');
console.log('================================');

const testInscricaoGratuita = async () => {
  try {
    console.log('📋 [1/4] Verificando evento 13...');
    const eventResponse = await axios.get(`${API_BASE_URL}/events/13`);
    console.log('✅ Evento encontrado:', eventResponse.data.title);
    
    console.log('📋 [2/4] Verificando lotes...');
    const lots = eventResponse.data.lots || [];
    console.log(`📊 ${lots.length} lotes encontrados:`);
    lots.forEach(lot => {
      console.log(`  - ID: ${lot.id}, Nome: ${lot.name}, Preço: ${lot.price}, Quantidade: ${lot.quantity}, É gratuito: ${lot.price === 0 || lot.price === '0'}`);
    });
    
    // Encontrar lote gratuito
    const loteGratuito = lots.find(lot => lot.price === 0 || lot.price === '0');
    if (!loteGratuito) {
      console.log('❌ Nenhum lote gratuito encontrado!');
      return;
    }
    
    console.log('✅ Lote gratuito encontrado:', loteGratuito);
    
    console.log('📋 [3/4] Testando inscrição gratuita...');
    const inscricaoData = {
      participantes: [
        {
          name: "Teste Gratuito",
          email: "teste@gratuito.com",
          phone: "11999999999"
        }
      ],
      payment_method: "CHECKOUT_PRO",
      lote_id: loteGratuito.id,
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
    
    console.log('✅ Inscrição gratuita realizada com sucesso!');
    console.log('📋 Resposta:', inscricaoResponse.data);
    
    // Verificar se a resposta indica que é gratuito
    console.log('📋 [4/4] Verificando se é realmente gratuito...');
    console.log('📊 Status do pagamento:', inscricaoResponse.data.payment_status);
    console.log('📊 Código de inscrição:', inscricaoResponse.data.registration_code);
    console.log('📊 Tem link de pagamento:', !!inscricaoResponse.data.payment_info?.payment_url);
    
  } catch (error) {
    console.log('❌ Erro na inscrição gratuita:');
    console.log('📋 Status:', error.response?.status);
    console.log('📋 Mensagem:', error.response?.data?.message || error.message);
    console.log('📋 Dados completos do erro:', JSON.stringify(error.response?.data, null, 2));
  }
};

testInscricaoGratuita(); 