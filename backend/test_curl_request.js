const { exec } = require('child_process');

async function testCurlRequest() {
  try {
    console.log('🧪 Testando requisição POST via curl...');
    
    const testData = {
      event_id: 14,
      customer: {
        name: 'Teste Curl',
        email: 'teste@teste.com',
        phone: '11999999999'
      },
      items: [
        {
          type: 'event_ticket',
          name: 'Ingresso Teste',
          price: 29.90,
          quantity: 1,
          lot_id: 9
        }
      ]
    };
    
    const curlCommand = `curl -X POST https://siteigreja-1.onrender.com/api/registrations \
      -H "Content-Type: application/json" \
      -H "Origin: https://igrejacemchurch.org" \
      -d '${JSON.stringify(testData)}' \
      -v`;
    
    console.log('🔧 Comando curl:', curlCommand);
    
    exec(curlCommand, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Erro no curl:', error.message);
        return;
      }
      
      console.log('✅ Resposta do curl:');
      console.log(stdout);
      
      if (stderr) {
        console.log('⚠️ Stderr:', stderr);
      }
    });
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testCurlRequest(); 