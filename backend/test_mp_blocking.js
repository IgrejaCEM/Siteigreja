const axios = require('axios');

const ACCESS_TOKEN = 'APP_USR-7906695833613236-072622-a7c53bcaf7bc8b8289f1961ce3937843-2568627728';

console.log('🔍 TESTANDO SE MERCADO PAGO ESTÁ BLOQUEANDO PAGAMENTOS');
console.log('========================================================');

async function testarBloqueioMP() {
  try {
    console.log('\n📋 Teste 1: Verificar status da conta...');
    
    // Verificar informações da conta
    const accountResponse = await axios.get('https://api.mercadopago.com/v1/account', {
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Informações da conta:');
    console.log('📦 ID:', accountResponse.data.id);
    console.log('📦 Nome:', accountResponse.data.name);
    console.log('📦 Email:', accountResponse.data.email);
    console.log('📦 Tipo:', accountResponse.data.type);
    console.log('📦 País:', accountResponse.data.country_id);
    console.log('📦 Status:', accountResponse.data.status);
    
    // Verificar se a conta está ativa
    if (accountResponse.data.status !== 'active') {
      console.log('⚠️ CONTA NÃO ESTÁ ATIVA! Status:', accountResponse.data.status);
    } else {
      console.log('✅ Conta está ativa');
    }
    
    console.log('\n📋 Teste 2: Verificar permissões...');
    
    // Verificar permissões da aplicação
    const permissionsResponse = await axios.get('https://api.mercadopago.com/v1/application', {
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Permissões da aplicação:', permissionsResponse.data);
    
    console.log('\n📋 Teste 3: Criar preferência de teste...');
    
    const preferenceData = {
      items: [
        {
          title: "Teste de Pagamento",
          quantity: 1,
          unit_price: 1.00  // Valor mínimo para teste
        }
      ],
      payer: {
        name: "Teste",
        email: "teste@teste.com"
      },
      back_urls: {
        success: "https://igrejacemchurch.org/inscricao/sucesso",
        failure: "https://igrejacemchurch.org/inscricao/erro",
        pending: "https://igrejacemchurch.org/inscricao/pendente"
      },
      external_reference: "TEST-BLOCK-" + Date.now(),
      notification_url: "https://siteigreja-1.onrender.com/api/payments/webhook",
      statement_descriptor: "INSCRICAO",
      binary_mode: true,
      expires: true,
      expiration_date_from: new Date().toISOString(),
      expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };
    
    console.log('📦 Dados da preferência:', JSON.stringify(preferenceData, null, 2));
    
    const preferenceResponse = await axios.post('https://api.mercadopago.com/checkout/preferences', preferenceData, {
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });
    
    console.log('✅ Preferência criada com sucesso!');
    console.log('📊 Status:', preferenceResponse.status);
    console.log('🔗 ID da preferência:', preferenceResponse.data.id);
    console.log('🔗 URL do checkout:', preferenceResponse.data.init_point);
    
    // Testar se a URL é acessível
    console.log('\n📋 Teste 4: Verificar se a URL é acessível...');
    try {
      const urlResponse = await axios.get(preferenceResponse.data.init_point, {
        timeout: 10000,
        maxRedirects: 5,
        validateStatus: function (status) {
          return status < 500; // Aceitar qualquer status < 500
        }
      });
      console.log('✅ URL do checkout é acessível!');
      console.log('📊 Status:', urlResponse.status);
      console.log('📊 Headers:', urlResponse.headers);
    } catch (urlError) {
      console.log('❌ URL do checkout não é acessível:', urlError.message);
      console.log('📊 Status:', urlError.response?.status);
      console.log('📊 Data:', urlError.response?.data);
    }
    
    // Verificar se há restrições geográficas
    console.log('\n📋 Teste 5: Verificar restrições...');
    
    const restrictionsResponse = await axios.get('https://api.mercadopago.com/v1/payment_methods', {
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Métodos de pagamento disponíveis:', restrictionsResponse.data.length);
    restrictionsResponse.data.forEach(method => {
      console.log(`  - ${method.id}: ${method.name} (${method.payment_type_id})`);
    });
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
    console.error('📊 Status:', error.response?.status);
    console.error('📊 Status Text:', error.response?.statusText);
    
    if (error.response?.data) {
      console.error('📦 Data do erro:', JSON.stringify(error.response.data, null, 2));
      
      // Verificar se é erro de bloqueio
      if (error.response.data.error) {
        console.error('🔍 Erro específico:', error.response.data.error);
        console.error('🔍 Código:', error.response.data.error_code);
        console.error('🔍 Mensagem:', error.response.data.message);
        
        // Verificar se é bloqueio por conta
        if (error.response.data.error.includes('blocked') || 
            error.response.data.error.includes('suspended') ||
            error.response.data.error.includes('inactive')) {
          console.error('🚫 CONTA BLOQUEADA OU SUSPENSA!');
        }
      }
    }
  }
}

testarBloqueioMP(); 