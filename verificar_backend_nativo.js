const https = require('https');
const http = require('http');

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };
    
    const req = client.request(requestOptions, (res) => {
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
      reject(error);
    });
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

async function verificarBackend() {
  console.log('🔍 Verificando status do backend...');
  
  const baseUrl = 'https://siteigreja-1.onrender.com';
  
  try {
    // Teste 1: Health check
    console.log('\n1️⃣ Testando health check...');
    try {
      const healthResponse = await makeRequest(`${baseUrl}/api/auth/health`);
      console.log('✅ Health check OK:', healthResponse.data);
    } catch (error) {
      console.log('❌ Health check FALHOU:', error.message);
    }
    
    // Teste 2: Login
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
      
      if (loginResponse.status === 200 && loginResponse.data && loginResponse.data.token) {
        console.log('✅ Login OK');
        const token = loginResponse.data.token;
        
        // Teste 3: Rotas admin com token
        console.log('\n3️⃣ Testando rotas admin...');
        
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };
        
        // Teste eventos
        try {
          const eventsResponse = await makeRequest(`${baseUrl}/api/admin/events`, { headers });
          console.log('✅ /admin/events OK:', eventsResponse.data.length || 0, 'eventos');
        } catch (error) {
          console.log('❌ /admin/events FALHOU:', error.message);
        }
        
        // Teste inscrições recentes
        try {
          const recentResponse = await makeRequest(`${baseUrl}/api/admin/registrations/recent`, { headers });
          console.log('✅ /admin/registrations/recent OK:', recentResponse.data.length || 0, 'inscrições');
        } catch (error) {
          console.log('❌ /admin/registrations/recent FALHOU:', error.message);
        }
        
        // Teste estatísticas
        try {
          const statsResponse = await makeRequest(`${baseUrl}/api/admin/stats`, { headers });
          console.log('✅ /admin/stats OK:', statsResponse.data);
        } catch (error) {
          console.log('❌ /admin/stats FALHOU:', error.message);
        }
        
      } else {
        console.log('❌ Login falhou - status:', loginResponse.status, 'data:', loginResponse.data);
      }
      
    } catch (error) {
      console.log('❌ Login FALHOU:', error.message);
    }
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      console.log('❌ Backend não está acessível');
    } else {
      console.log('❌ Erro:', error.message);
    }
  }
}

verificarBackend(); 