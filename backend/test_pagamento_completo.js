const axios = require('axios');

const BASE_URL = 'https://siteigreja-1.onrender.com';
const ACCESS_TOKEN = 'APP_USR-7906695833613236-072622-a7c53bcaf7bc8b8289f1961ce3937843-2568627728';

console.log('🧪 TESTE COMPLETO DO FLUXO DE PAGAMENTO');
console.log('==========================================');

async function testarPagamentoCompleto() {
  try {
    console.log('📋 Passo 1: Verificando se o backend está online...');
    
    const healthResponse = await axios.get(`${BASE_URL}/api/auth/health`);
    console.log('✅ Backend online:', healthResponse.data);
    
    console.log('\n📋 Passo 2: Buscando evento de teste...');
    
    const eventResponse = await axios.get(`${BASE_URL}/api/events/4`);
    console.log('✅ Evento encontrado:', eventResponse.data.title);
    console.log('💰 Preço:', eventResponse.data.price);
    console.log('🎫 Lotes:', eventResponse.data.lots.length);
    
    const lote = eventResponse.data.lots[0];
    console.log('📦 Lote selecionado:', lote.name, '- R$', lote.price);
    
    console.log('\n📋 Passo 3: Simulando inscrição...');
    
    const inscricaoData = {
      lot_id: lote.id,
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
      products: []
    };
    
    console.log('📦 Dados da inscrição:', JSON.stringify(inscricaoData, null, 2));
    
    const inscricaoResponse = await axios.post(`${BASE_URL}/api/events/4/inscricao-unificada`, inscricaoData);
    console.log('✅ Inscrição criada!');
    console.log('📊 Status:', inscricaoResponse.status);
    console.log('🔗 Payment URL:', inscricaoResponse.data.payment_info?.payment_url);
    
    if (inscricaoResponse.data.payment_info?.payment_url) {
      console.log('\n📋 Passo 4: Testando URL do pagamento...');
      
      const paymentUrl = inscricaoResponse.data.payment_info.payment_url;
      console.log('🔗 URL do pagamento:', paymentUrl);
      
      // Verificar se é deep link
      if (paymentUrl.includes('mercadopago://') || paymentUrl.includes('meli://')) {
        console.log('🚫 DEEP LINK DETECTADO!');
        console.log('❌ O problema é que ainda está gerando deep links');
        
        // Extrair preference ID
        const prefIdMatch = paymentUrl.match(/pref_id=([^&]+)/);
        if (prefIdMatch) {
          const prefId = prefIdMatch[1];
          const webUrl = `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=${prefId}`;
          console.log('✅ URL convertida para web:', webUrl);
          
          // Testar acessibilidade
          try {
            const urlResponse = await axios.get(webUrl, {
              timeout: 10000,
              maxRedirects: 5,
              validateStatus: function (status) {
                return status < 500;
              }
            });
            
            console.log('✅ URL web acessível!');
            console.log('📊 Status:', urlResponse.status);
            console.log('📊 Content-Type:', urlResponse.headers['content-type']);
            
          } catch (urlError) {
            console.log('❌ URL web não acessível:', urlError.message);
          }
        }
      } else {
        console.log('✅ URL já é web!');
        
        // Testar acessibilidade
        try {
          const urlResponse = await axios.get(paymentUrl, {
            timeout: 10000,
            maxRedirects: 5,
            validateStatus: function (status) {
              return status < 500;
            }
          });
          
          console.log('✅ URL acessível!');
          console.log('📊 Status:', urlResponse.status);
          console.log('📊 Content-Type:', urlResponse.headers['content-type']);
          
        } catch (urlError) {
          console.log('❌ URL não acessível:', urlError.message);
        }
      }
    } else {
      console.log('❌ Nenhuma URL de pagamento recebida!');
      console.log('📦 Resposta completa:', inscricaoResponse.data);
    }
    
    console.log('\n🎯 CONCLUSÃO:');
    console.log('🔗 URL para teste manual:', inscricaoResponse.data.payment_info?.payment_url);
    console.log('💰 Valor:', lote.price);
    console.log('🔍 Verifique se consegue fazer o pagamento manualmente');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
    console.error('📊 Status:', error.response?.status);
    
    if (error.response?.data) {
      console.error('📦 Data do erro:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testarPagamentoCompleto(); 