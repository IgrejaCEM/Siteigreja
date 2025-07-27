const https = require('https');

async function testarParticipantes() {
  console.log('🔍 Testando rotas de participantes...');
  
  const baseUrl = 'https://siteigreja-1.onrender.com';
  
  try {
    // 1. Fazer login
    console.log('\n1️⃣ Fazendo login...');
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
    
    if (!loginResponse.data || !loginResponse.data.token) {
      console.log('❌ Login falhou:', loginResponse.data);
      return;
    }
    
    const token = loginResponse.data.token;
    console.log('✅ Login OK, token obtido');
    
    // 2. Testar rota /participants
    console.log('\n2️⃣ Testando /participants...');
    try {
      const participantsResponse = await makeRequest(`${baseUrl}/api/admin/participants`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ /participants OK:', participantsResponse.data.length || 0, 'participantes');
      if (participantsResponse.data.length > 0) {
        console.log('   Primeiro participante:', participantsResponse.data[0]);
      }
    } catch (error) {
      console.log('❌ /participants FALHOU:', error.message);
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Data:', error.response.data);
      }
    }
    
    // 3. Testar rota /registrations/recent
    console.log('\n3️⃣ Testando /registrations/recent...');
    try {
      const recentResponse = await makeRequest(`${baseUrl}/api/admin/registrations/recent`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ /registrations/recent OK:', recentResponse.data.length || 0, 'inscrições');
      if (recentResponse.data.length > 0) {
        console.log('   Primeira inscrição:', recentResponse.data[0]);
      }
    } catch (error) {
      console.log('❌ /registrations/recent FALHOU:', error.message);
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Data:', error.response.data);
      }
    }
    
    // 4. Testar rota /stats
    console.log('\n4️⃣ Testando /stats...');
    try {
      const statsResponse = await makeRequest(`${baseUrl}/api/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ /stats OK:', statsResponse.data);
    } catch (error) {
      console.log('❌ /stats FALHOU:', error.message);
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Data:', error.response.data);
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

testarParticipantes(); 