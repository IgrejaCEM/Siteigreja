const https = require('https');

function testBackend() {
  console.log('🧪 Testando conectividade com o backend...');
  
  const options = {
    hostname: 'siteigreja.onrender.com',
    port: 443,
    path: '/',
    method: 'GET',
    timeout: 10000
  };

  const req = https.request(options, (res) => {
    console.log('✅ Status:', res.statusCode);
    console.log('✅ Headers:', res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('✅ Response:', data);
    });
  });

  req.on('error', (error) => {
    console.error('❌ Erro:', error.message);
  });

  req.on('timeout', () => {
    console.error('❌ Timeout');
    req.destroy();
  });

  req.end();
}

testBackend(); 