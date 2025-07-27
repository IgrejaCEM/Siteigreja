const https = require('https');

async function testarInscricao() {
  console.log('🔍 Testando inscrição unificada...');
  
  const baseUrl = 'https://siteigreja-1.onrender.com';
  
  try {
    // 1. Verificar se o evento existe
    console.log('\n1️⃣ Verificando evento...');
    try {
      const eventResponse = await makeRequest(`${baseUrl}/api/events/1`);
      console.log('✅ Evento encontrado:', eventResponse.data.title);
    } catch (error) {
      console.log('❌ Erro ao buscar evento:', error.message);
      return;
    }
    
    // 2. Verificar se há lotes disponíveis
    console.log('\n2️⃣ Verificando lotes...');
    try {
      const lotsResponse = await makeRequest(`${baseUrl}/api/events/1/lots`);
      console.log('✅ Lotes encontrados:', lotsResponse.data.length);
      if (lotsResponse.data.length > 0) {
        console.log('   Primeiro lote:', lotsResponse.data[0]);
      }
    } catch (error) {
      console.log('❌ Erro ao buscar lotes:', error.message);
    }
    
    // 3. Verificar se há produtos
    console.log('\n3️⃣ Verificando produtos...');
    try {
      const productsResponse = await makeRequest(`${baseUrl}/api/events/1/products`);
      console.log('✅ Produtos encontrados:', productsResponse.data.length);
    } catch (error) {
      console.log('❌ Erro ao buscar produtos:', error.message);
    }
    
    // 4. Testar inscrição unificada
    console.log('\n4️⃣ Testando inscrição unificada...');
    const inscricaoData = {
      participantes: [
        {
          name: 'João Silva',
          email: 'joao@teste.com',
          phone: '(11) 99999-9999',
          cpf: '123.456.789-00'
        }
      ],
      lot_id: 1,
      products: [],
      payment_method: 'pix'
    };
    
    try {
      const inscricaoResponse = await makeRequest(`${baseUrl}/api/events/1/inscricao-unificada`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: inscricaoData
      });
      
      console.log('✅ Inscrição realizada com sucesso!');
      console.log('   Código:', inscricaoResponse.data.registration_code);
      console.log('   Status:', inscricaoResponse.data.status);
      
    } catch (error) {
      console.log('❌ Erro na inscrição:');
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

testarInscricao(); 