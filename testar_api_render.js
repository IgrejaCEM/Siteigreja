const https = require('https');

async function testarApiRender() {
  console.log('🔍 Testando API do Render diretamente...');
  
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
    
    // 2. Testar inscrição com dados completos
    console.log('\n2️⃣ Testando inscrição unificada...');
    const inscricaoData = {
      participantes: [
        {
          name: 'Teste API Render',
          email: 'teste@apirender.com',
          phone: '(11) 33333-3333'
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
      console.log('   Status:', inscricaoResponse.status);
      console.log('   Data:', inscricaoResponse.data);
      
    } catch (error) {
      console.log('❌ Inscrição falhou:');
      console.log('   Status:', error.response?.status);
      console.log('   Data:', error.response?.data);
      console.log('   Message:', error.message);
      
      // Se o erro for de coluna faltando, vamos tentar recriar o banco
      if (error.response?.data?.details?.includes('no column named')) {
        console.log('\n🔧 Problema detectado: Coluna faltando');
        console.log('💡 Solução: O banco precisa ser recriado no Render.com');
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

testarApiRender(); 