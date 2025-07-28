const axios = require('axios');

const API_BASE_URL = 'https://siteigreja-1.onrender.com/api';

async function diagnosticarInscricao() {
  console.log('🔍 DIAGNOSTICANDO ERRO 500 NA INSCRIÇÃO');
  console.log('==========================================');
  
  try {
    console.log('📡 [1/5] Aguardando deploy...');
    await new Promise(resolve => setTimeout(resolve, 15000));
    
    console.log('📡 [2/5] Verificando se o evento existe...');
    const eventResponse = await axios.get(`${API_BASE_URL}/events`);
    
    if (eventResponse.status === 200) {
      console.log('✅ Eventos encontrados:', eventResponse.data.length);
      if (eventResponse.data.length > 0) {
        console.log('📋 Primeiro evento:', eventResponse.data[0]);
      }
    }
    
    console.log('📡 [3/5] Verificando lote do evento...');
    const lotsResponse = await axios.get(`${API_BASE_URL}/events/1/lots`);
    
    if (lotsResponse.status === 200) {
      console.log('✅ Lotes encontrados:', lotsResponse.data.length);
      if (lotsResponse.data.length > 0) {
        console.log('📋 Primeiro lote:', lotsResponse.data[0]);
      }
    }
    
    console.log('📡 [4/5] Testando inscrição com dados mínimos...');
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
      payment_method: 'fake', // Usar modo fake
      products: []
    };
    
    console.log('📦 Dados da inscrição:', inscricaoData);
    
    const inscricaoResponse = await axios.post(`${API_BASE_URL}/events/1/inscricao-unificada`, inscricaoData);
    
    if (inscricaoResponse.status === 200) {
      console.log('✅ Inscrição realizada com sucesso!');
      console.log('📋 Resposta:', inscricaoResponse.data);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    if (error.response) {
      console.error('📋 Status:', error.response.status);
      console.error('📄 Resposta:', error.response.data);
      
      if (error.response.status === 500) {
        console.log('\n🔍 DIAGNÓSTICO DO ERRO 500:');
        console.log('💡 Possíveis causas:');
        console.log('   1. Tabela registrations não existe');
        console.log('   2. Colunas faltando na tabela');
        console.log('   3. Erro no PaymentGateway');
        console.log('   4. Problema na transação do banco');
      }
    }
  }
}

diagnosticarInscricao(); 