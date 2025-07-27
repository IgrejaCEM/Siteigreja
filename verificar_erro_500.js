const https = require('https');

async function verificarErro500() {
  console.log('🔍 Verificando erro 500 na criação de eventos...');
  
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
    
    // 2. Testar criação de evento com dados exatos do frontend
    console.log('\n2️⃣ Testando criação de evento...');
    const eventData = {
      title: 'CONNECT CONF 2025 - IMPROVÁVEIS',
      description: 'Vai ter palavra profética, preletores que carregam o Céu, momentos marcantes de adoração e experiências que vão quebrar seus padrões.',
      date: '2025-10-24',
      location: 'Igreja CEM - CAJATI, localizada na Av. dos trabalhadores, N°99 - Centro',
      banner: 'https://i.ibb.co/bjTgK85b/Design-sem-nome.jp',
      banner_home: 'https://i.ibb.co/bjTgK85b/Design-sem-nome.jp',
      banner_evento: 'https://i.ibb.co/bjTgK85b/Design-sem-nome.jp',
      status: 'active',
      has_payment: false,
      payment_gateway: null,
      registration_form: {
        cpf: false,
        age: false,
        gender: false,
        address: false,
        image_authorization: false,
        custom_fields: []
      },
      lots: [
        {
          name: 'LOTE 1',
          price: '60',
          quantity: '15',
          start_date: '2025-07-27',
          end_date: '2025-07-30',
          is_free: false
        }
      ]
    };
    
    console.log('📊 Dados do evento:', JSON.stringify(eventData, null, 2));
    
    try {
      const createResponse = await makeRequest(`${baseUrl}/api/admin/events`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: eventData
      });
      
      console.log('✅ Evento criado com sucesso!');
      console.log('   Resposta:', createResponse.data);
      
    } catch (error) {
      console.log('❌ Erro 500 detalhado:');
      console.log('   Status:', error.response?.status);
      console.log('   StatusText:', error.response?.statusText);
      console.log('   Data:', error.response?.data);
      console.log('   Headers:', error.response?.headers);
      console.log('   Message:', error.message);
      
      // Tentar fazer uma requisição GET para ver se o problema é específico do POST
      console.log('\n3️⃣ Testando GET /admin/events...');
      try {
        const getResponse = await makeRequest(`${baseUrl}/api/admin/events`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('✅ GET /admin/events OK:', getResponse.data);
      } catch (getError) {
        console.log('❌ GET /admin/events também falhou:', getError.message);
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

verificarErro500(); 