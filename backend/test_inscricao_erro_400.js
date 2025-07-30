const axios = require('axios');

const API_BASE_URL = 'https://siteigreja-1.onrender.com/api';

console.log('🧪 TESTANDO ERRO 400 NA INSCRIÇÃO');
console.log('=====================================');

const testInscricao = async () => {
  try {
    console.log('📋 [1/4] Fazendo login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      emailOrUsername: 'admin@admin.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login realizado com sucesso');
    
    console.log('📋 [2/4] Verificando evento ID 13...');
    const eventResponse = await axios.get(`${API_BASE_URL}/events/13`);
    console.log('✅ Evento encontrado:', eventResponse.data.title);
    
    console.log('📋 [3/4] Verificando lotes do evento...');
    const lots = eventResponse.data.lots || [];
    console.log(`📊 ${lots.length} lotes encontrados:`);
    lots.forEach(lot => {
      console.log(`  - ID: ${lot.id}, Nome: ${lot.name}, Preço: ${lot.price}, Quantidade: ${lot.quantity}`);
    });
    
    console.log('📋 [4/4] Testando inscrição...');
    const inscricaoData = {
      participantes: [
        {
          name: "Teste",
          email: "teste@teste.com",
          phone: "11999999999",
          cpf: null,
          age: null,
          gender: null,
          address: null,
          image_authorization: false,
          custom_fields: {}
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
          'Authorization': `Bearer ${token}`,
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
    console.log('📋 Dados do erro:', JSON.stringify(error.response?.data, null, 2));
    
    if (error.response?.status === 400) {
      console.log('\n🔍 DIAGNÓSTICO DO ERRO 400:');
      console.log('1. Verificar se o lote_id é válido');
      console.log('2. Verificar se o evento está ativo');
      console.log('3. Verificar se há produtos obrigatórios');
      console.log('4. Verificar se o payment_method é válido');
    }
  }
};

testInscricao(); 