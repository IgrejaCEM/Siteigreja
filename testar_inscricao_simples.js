const https = require('https');

async function testarInscricaoSimples() {
  console.log('🔍 Testando inscrição simples...');
  
  const baseUrl = 'https://siteigreja-1.onrender.com';
  
  try {
    const inscricaoData = {
      participantes: [
        {
          name: 'Teste Simples',
          email: 'teste@simples.com',
          phone: '(11) 11111-1111'
        }
      ],
      lot_id: 1,
      products: [],
      payment_method: null
    };
    
    console.log('📤 Enviando dados:', JSON.stringify(inscricaoData, null, 2));
    
    const response = await makeRequest(`${baseUrl}/api/events/1/inscricao-unificada`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: inscricaoData
    });
    
    console.log('📥 Resposta completa:');
    console.log('   Status:', response.status);
    console.log('   Data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ Erro:');
    console.log('   Status:', error.response?.status);
    console.log('   Data:', error.response?.data);
    console.log('   Message:', error.message);
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

testarInscricaoSimples(); 