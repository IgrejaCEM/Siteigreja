const https = require('https');

async function testarInscricaoEvento8() {
  console.log('🔍 Testando inscrição no evento ID 8...');
  
  const baseUrl = 'https://siteigreja-1.onrender.com';
  
  try {
    // Testar inscrição no evento ID 8
    console.log('\n📝 Testando inscrição unificada...');
    const inscricaoData = {
      participantes: [
        {
          name: 'Teste Evento 8',
          email: 'teste@evento8.com',
          phone: '(11) 44444-4444'
        }
      ],
      lot_id: 7, // Lote do evento 8
      products: [],
      payment_method: null
    };
    
    try {
      const inscricaoResponse = await makeRequest(`${baseUrl}/api/events/8/inscricao-unificada`, {
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

testarInscricaoEvento8(); 