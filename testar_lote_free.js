const https = require('https');

async function testarLoteFree() {
  console.log('🔍 Testando inscrição em lote gratuito...');
  
  const baseUrl = 'https://siteigreja-1.onrender.com';
  
  try {
    // 1. Verificar lotes disponíveis
    console.log('\n1️⃣ Verificando lotes...');
    try {
      const lotsResponse = await makeRequest(`${baseUrl}/api/events/1/lots`);
      console.log('✅ Lotes encontrados:', lotsResponse.data.length);
      
      // Procurar lote gratuito
      const freeLot = lotsResponse.data.find(lot => lot.price === 0 || lot.is_free === true);
      if (freeLot) {
        console.log('✅ Lote gratuito encontrado:', freeLot);
      } else {
        console.log('❌ Nenhum lote gratuito encontrado');
        console.log('   Lotes disponíveis:');
        lotsResponse.data.forEach(lot => {
          console.log(`   - ${lot.name}: R$ ${lot.price} (Free: ${lot.is_free})`);
        });
      }
    } catch (error) {
      console.log('❌ Erro ao buscar lotes:', error.message);
    }
    
    // 2. Testar inscrição em lote gratuito
    console.log('\n2️⃣ Testando inscrição em lote gratuito...');
    const inscricaoData = {
      participantes: [
        {
          name: 'Maria Silva',
          email: 'maria@teste.com',
          phone: '(11) 88888-8888',
          cpf: '987.654.321-00'
        }
      ],
      lot_id: 1, // Assumindo que o primeiro lote é gratuito
      products: [],
      payment_method: null // Sem método de pagamento para lote gratuito
    };
    
    try {
      const inscricaoResponse = await makeRequest(`${baseUrl}/api/events/1/inscricao-unificada`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: inscricaoData
      });
      
      console.log('✅ Inscrição gratuita realizada com sucesso!');
      console.log('   Código:', inscricaoResponse.data.registration_code);
      console.log('   Status:', inscricaoResponse.data.status);
      console.log('   Pagamento necessário:', inscricaoResponse.data.payment_required);
      
    } catch (error) {
      console.log('❌ Erro na inscrição gratuita:');
      console.log('   Status:', error.response?.status);
      console.log('   Data:', error.response?.data);
      console.log('   Message:', error.message);
    }
    
    // 3. Testar inscrição em lote pago
    console.log('\n3️⃣ Testando inscrição em lote pago...');
    const inscricaoPagaData = {
      participantes: [
        {
          name: 'João Pago',
          email: 'joao.pago@teste.com',
          phone: '(11) 77777-7777',
          cpf: '111.222.333-44'
        }
      ],
      lot_id: 2, // Assumindo que o segundo lote é pago
      products: [],
      payment_method: 'pix'
    };
    
    try {
      const inscricaoPagaResponse = await makeRequest(`${baseUrl}/api/events/1/inscricao-unificada`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: inscricaoPagaData
      });
      
      console.log('✅ Inscrição paga realizada com sucesso!');
      console.log('   Código:', inscricaoPagaResponse.data.registration_code);
      console.log('   Status:', inscricaoPagaResponse.data.status);
      console.log('   Pagamento necessário:', inscricaoPagaResponse.data.payment_required);
      
    } catch (error) {
      console.log('❌ Erro na inscrição paga:');
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

testarLoteFree(); 