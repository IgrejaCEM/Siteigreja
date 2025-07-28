const axios = require('axios');

const API_BASE_URL = 'https://siteigreja-1.onrender.com/api';

async function testarInscricaoDetalhado() {
  console.log('🔍 TESTE DETALHADO DA INSCRIÇÃO');
  console.log('==================================');
  
  try {
    console.log('📡 [1/6] Aguardando deploy...');
    await new Promise(resolve => setTimeout(resolve, 20000));
    
    console.log('📡 [2/6] Verificando se o servidor está online...');
    const healthResponse = await axios.get(`${API_BASE_URL}/auth/health`);
    console.log('✅ Servidor online:', healthResponse.data);
    
    console.log('📡 [3/6] Verificando eventos...');
    const eventsResponse = await axios.get(`${API_BASE_URL}/events`);
    console.log('✅ Eventos:', eventsResponse.data.length);
    
    if (eventsResponse.data.length === 0) {
      console.log('❌ NENHUM EVENTO ENCONTRADO!');
      return;
    }
    
    const event = eventsResponse.data[0];
    console.log('📋 Evento encontrado:', {
      id: event.id,
      title: event.title,
      status: event.status
    });
    
    console.log('📡 [4/6] Verificando lote...');
    const lotsResponse = await axios.get(`${API_BASE_URL}/events/${event.id}/lots`);
    console.log('✅ Lotes:', lotsResponse.data.length);
    
    if (lotsResponse.data.length === 0) {
      console.log('❌ NENHUM LOTE ENCONTRADO!');
      return;
    }
    
    const lot = lotsResponse.data[0];
    console.log('📋 Lote encontrado:', {
      id: lot.id,
      name: lot.name,
      price: lot.price,
      quantity: lot.quantity
    });
    
    console.log('📡 [5/6] Testando inscrição com dados mínimos...');
    const inscricaoData = {
      participantes: [
        {
          name: 'Teste Usuario',
          email: 'teste@teste.com',
          cpf: '12345678901',
          phone: '11999999999'
        }
      ],
      lote_id: lot.id,
      payment_method: 'fake',
      products: []
    };
    
    console.log('📦 Dados da inscrição:', JSON.stringify(inscricaoData, null, 2));
    
    console.log('📡 [6/6] Fazendo inscrição...');
    const inscricaoResponse = await axios.post(`${API_BASE_URL}/events/${event.id}/inscricao-unificada`, inscricaoData, {
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Inscrição realizada com sucesso!');
    console.log('📋 Resposta:', inscricaoResponse.data);
    
  } catch (error) {
    console.error('❌ ERRO DETALHADO:');
    console.error('📋 Mensagem:', error.message);
    console.error('📋 Código:', error.code);
    console.error('📋 Status:', error.response?.status);
    console.error('📋 Status Text:', error.response?.statusText);
    console.error('📋 URL:', error.config?.url);
    console.error('📋 Método:', error.config?.method);
    console.error('📋 Headers:', error.config?.headers);
    console.error('📋 Data:', error.response?.data);
    
    if (error.response?.data?.error) {
      console.log('\n🔍 ERRO ESPECÍFICO DO SERVIDOR:');
      console.log('📋 Error:', error.response.data.error);
      console.log('📋 Details:', error.response.data.details);
      console.log('📋 Stack:', error.response.data.stack);
    }
    
    console.log('\n💡 POSSÍVEIS CAUSAS:');
    console.log('   1. Tabela registrations não existe');
    console.log('   2. Colunas faltando na tabela');
    console.log('   3. Erro no PaymentGateway');
    console.log('   4. Problema na transação do banco');
    console.log('   5. Erro no QR Code generation');
    console.log('   6. Problema com UUID generation');
  }
}

testarInscricaoDetalhado(); 