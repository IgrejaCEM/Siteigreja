const https = require('https');

async function forcarAtualizacaoBanco() {
  console.log('🔧 Forçando atualização do banco de dados...');
  
  const baseUrl = 'https://siteigreja-1.onrender.com';
  
  try {
    // 1. Testar health check
    console.log('\n1️⃣ Testando health check...');
    try {
      const healthResponse = await makeRequest(`${baseUrl}/api/auth/health`);
      console.log('✅ Health check OK:', healthResponse.data);
    } catch (error) {
      console.log('❌ Health check falhou:', error.message);
      return;
    }
    
    // 2. Testar login para verificar se o banco está funcionando
    console.log('\n2️⃣ Testando login...');
    try {
      const loginResponse = await makeRequest(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: {
          emailOrUsername: 'admin@admin.com',
          password: 'admin123'
        }
      });
      
      if (loginResponse.data && loginResponse.data.token) {
        console.log('✅ Login OK - Banco funcionando');
      } else {
        console.log('❌ Login falhou');
        return;
      }
    } catch (error) {
      console.log('❌ Login falhou:', error.message);
      return;
    }
    
    // 3. Testar inscrição simples
    console.log('\n3️⃣ Testando inscrição simples...');
    const inscricaoData = {
      participantes: [
        {
          name: 'Teste Banco',
          email: 'teste@banco.com',
          phone: '(11) 22222-2222'
        }
      ],
      lot_id: 1,
      products: [],
      payment_method: null
    };
    
    try {
      const inscricaoResponse = await makeRequest(`${baseUrl}/api/events/1/inscricao-unificada`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: inscricaoData
      });
      
      console.log('✅ Inscrição OK!');
      console.log('   Código:', inscricaoResponse.data.registration_code);
      console.log('   Status:', inscricaoResponse.data.status);
      
    } catch (error) {
      console.log('❌ Inscrição falhou:');
      console.log('   Status:', error.response?.status);
      console.log('   Data:', error.response?.data);
      
      // Se o erro for de coluna faltando, vamos tentar recriar o banco
      if (error.response?.data?.details?.includes('no column named address')) {
        console.log('\n🔧 Problema detectado: Coluna address não existe');
        console.log('💡 Solução: O banco precisa ser recriado no Render.com');
        console.log('📋 Ações necessárias:');
        console.log('   1. Acesse o painel do Render.com');
        console.log('   2. Vá para o serviço siteigreja-1');
        console.log('   3. Clique em "Manual Deploy"');
        console.log('   4. Selecione "Clear build cache & deploy"');
        console.log('   5. Aguarde o deploy completar');
      }
    }
    
  } catch (error) {
    console.log('❌ Erro geral:', error.message);
  }
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };
    
    const req = https.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', (error) => {
      reject({ response: { status: 0, data: error.message }, message: error.message });
    });
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

forcarAtualizacaoBanco(); 