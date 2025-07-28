const axios = require('axios');

const ACCESS_TOKEN = 'APP_USR-7906695833613236-072622-a7c53bcaf7bc8b8289f1961ce3937843-2568627728';

console.log('🧪 TESTE SIMPLES DO MERCADO PAGO');
console.log('==================================');

async function testarMP() {
  try {
    console.log('🔑 Token:', ACCESS_TOKEN.substring(0, 20) + '...');
    console.log('🔑 Tipo:', ACCESS_TOKEN.startsWith('APP_USR') ? 'PRODUÇÃO' : 'SANDBOX');
    
    // Teste 1: Verificar se o token é válido
    console.log('\n📋 Teste 1: Verificando token...');
    
    const response1 = await axios.get('https://api.mercadopago.com/v1/payment_methods', {
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Token válido!');
    console.log('📦 Métodos disponíveis:', response1.data.length);
    
    // Teste 2: Criar preferência simples
    console.log('\n📋 Teste 2: Criando preferência simples...');
    
    const preferenceData = {
      items: [
        {
          title: "Teste",
          quantity: 1,
          unit_price: 1.00
        }
      ],
      back_urls: {
        success: "https://igrejacemchurch.org/inscricao/sucesso",
        failure: "https://igrejacemchurch.org/inscricao/erro",
        pending: "https://igrejacemchurch.org/inscricao/pendente"
      },
      external_reference: "TEST-" + Date.now()
    };
    
    const response2 = await axios.post('https://api.mercadopago.com/checkout/preferences', preferenceData, {
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Preferência criada!');
    console.log('🔗 ID:', response2.data.id);
    console.log('🔗 URL:', response2.data.init_point);
    
    // Teste 3: Verificar se a URL funciona
    console.log('\n📋 Teste 3: Testando URL do checkout...');
    
    try {
      const response3 = await axios.get(response2.data.init_point, {
        timeout: 10000,
        maxRedirects: 5,
        validateStatus: function (status) {
          return status < 500;
        }
      });
      
      console.log('✅ URL do checkout funciona!');
      console.log('📊 Status:', response3.status);
      console.log('📊 Content-Type:', response3.headers['content-type']);
      
      // Verificar se é HTML (página web) ou JSON
      if (response3.headers['content-type']?.includes('text/html')) {
        console.log('✅ É uma página web HTML');
      } else {
        console.log('⚠️ Não é HTML:', response3.headers['content-type']);
      }
      
    } catch (urlError) {
      console.log('❌ URL do checkout não funciona:', urlError.message);
      console.log('📊 Status:', urlError.response?.status);
    }
    
    // Teste 4: Verificar se é conta de teste
    console.log('\n📋 Teste 4: Verificando tipo de conta...');
    
    if (ACCESS_TOKEN.startsWith('TEST')) {
      console.log('⚠️ CONTA DE TESTE - Pode ter limitações');
    } else if (ACCESS_TOKEN.startsWith('APP_USR')) {
      console.log('✅ CONTA DE PRODUÇÃO');
    } else {
      console.log('❓ TIPO DE CONTA DESCONHECIDO');
    }
    
    // Teste 5: Verificar se há restrições
    console.log('\n📋 Teste 5: Verificando restrições...');
    
    const methods = response1.data;
    const hasPix = methods.some(m => m.id === 'pix');
    const hasCreditCard = methods.some(m => m.payment_type_id === 'credit_card');
    const hasBoleto = methods.some(m => m.payment_type_id === 'ticket');
    
    console.log('✅ PIX disponível:', hasPix);
    console.log('✅ Cartão de crédito disponível:', hasCreditCard);
    console.log('✅ Boleto disponível:', hasBoleto);
    
    if (!hasPix && !hasCreditCard && !hasBoleto) {
      console.log('🚫 NENHUM MÉTODO DE PAGAMENTO DISPONÍVEL!');
      console.log('🚫 CONTA PODE ESTAR BLOQUEADA OU COM RESTRIÇÕES!');
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
    console.error('📊 Status:', error.response?.status);
    
    if (error.response?.data) {
      console.error('📦 Data do erro:', JSON.stringify(error.response.data, null, 2));
      
      // Verificar se é erro de token
      if (error.response.data.error === 'unauthorized') {
        console.error('🚫 TOKEN INVÁLIDO OU EXPIRADO!');
      }
      
      // Verificar se é erro de permissões
      if (error.response.data.error === 'forbidden') {
        console.error('🚫 SEM PERMISSÕES SUFICIENTES!');
      }
    }
  }
}

testarMP(); 