const axios = require('axios');

const API_BASE_URL = 'https://siteigreja-1.onrender.com/api';

async function investigarErro500() {
  console.log('🔍 INVESTIGAÇÃO SISTEMÁTICA DO ERRO 500');
  console.log('==========================================');
  
  try {
    console.log('📡 [1/7] Aguardando deploy...');
    await new Promise(resolve => setTimeout(resolve, 25000));
    
    console.log('📡 [2/7] Testando se o servidor está online...');
    try {
      const healthResponse = await axios.get(`${API_BASE_URL}/auth/health`);
      console.log('✅ Servidor online:', healthResponse.data);
    } catch (error) {
      console.log('❌ Servidor não responde:', error.message);
      return;
    }
    
    console.log('📡 [3/7] Verificando se eventos existem...');
    try {
      const eventsResponse = await axios.get(`${API_BASE_URL}/events`);
      console.log('✅ Eventos encontrados:', eventsResponse.data.length);
      if (eventsResponse.data.length > 0) {
        console.log('📋 Primeiro evento ID:', eventsResponse.data[0].id);
      }
    } catch (error) {
      console.log('❌ Erro ao buscar eventos:', error.message);
    }
    
    console.log('📡 [4/7] Testando rota ultra-simplificada...');
    try {
      const simpleResponse = await axios.post(`${API_BASE_URL}/events/1/inscricao-test`, {
        teste: 'dados'
      });
      console.log('✅ Rota simples funciona:', simpleResponse.data);
    } catch (error) {
      console.log('❌ Rota simples falha:', error.response?.status, error.response?.data);
    }
    
    console.log('📡 [5/7] Testando rota com banco...');
    try {
      const dbResponse = await axios.post(`${API_BASE_URL}/events/1/inscricao-test-db`, {
        lote_id: 1
      });
      console.log('✅ Rota com banco funciona:', dbResponse.data);
    } catch (error) {
      console.log('❌ Rota com banco falha:', error.response?.status, error.response?.data);
    }
    
    console.log('📡 [6/7] Testando inscrição com dados mínimos...');
    try {
      const inscricaoData = {
        participantes: [
          {
            name: 'Teste Usuario',
            email: 'teste@teste.com',
            cpf: '12345678901',
            phone: '11999999999'
          }
        ],
        lote_id: 1,
        payment_method: 'fake',
        products: []
      };
      
      const inscricaoResponse = await axios.post(`${API_BASE_URL}/events/1/inscricao-unificada`, inscricaoData);
      console.log('✅ Inscrição funciona:', inscricaoResponse.data);
    } catch (error) {
      console.log('❌ Inscrição falha:', error.response?.status);
      console.log('📋 Erro detalhado:', error.response?.data);
    }
    
    console.log('📡 [7/7] Verificando logs do servidor...');
    console.log('💡 Se chegou até aqui, o problema pode estar em:');
    console.log('   1. Transação do banco de dados');
    console.log('   2. PaymentGateway');
    console.log('   3. Validação de dados');
    console.log('   4. Middleware de autenticação');
    
  } catch (error) {
    console.error('❌ ERRO GERAL:', error.message);
  }
}

investigarErro500(); 