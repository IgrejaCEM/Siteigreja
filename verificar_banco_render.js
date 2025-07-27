const https = require('https');

async function verificarBancoRender() {
  console.log('🔍 Verificando qual banco o Render está usando...');
  
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
    
    // 2. Testar listar eventos
    console.log('\n2️⃣ Testando listar eventos...');
    try {
      const eventosResponse = await makeRequest(`${baseUrl}/api/events`);
      console.log('✅ Eventos encontrados:', eventosResponse.data.length);
      eventosResponse.data.forEach(evento => {
        console.log(`   ID: ${evento.id} - ${evento.title}`);
      });
    } catch (error) {
      console.log('❌ Erro ao listar eventos:', error.response?.data);
    }
    
    // 3. Testar evento específico
    console.log('\n3️⃣ Testando evento ID 8...');
    try {
      const eventoResponse = await makeRequest(`${baseUrl}/api/events/8`);
      console.log('✅ Evento 8 encontrado:', eventoResponse.data.title);
    } catch (error) {
      console.log('❌ Evento 8 não encontrado:', error.response?.data);
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

verificarBancoRender(); 