const { exec } = require('child_process');

const testData = JSON.stringify({
  event_id: 14,
  customer: {
    name: 'Teste Usuário',
    email: 'teste@teste.com',
    phone: '11999999999',
    cpf: '12345678901'
  },
  items: [
    {
      id: 1,
      type: 'EVENT_PRODUCT',
      quantity: 1,
      lot_id: 1
    }
  ],
  products: [
    {
      product_id: 1,
      quantity: 1,
      unit_price: 25.00
    }
  ],
  totalAmount: 75.00
});

const curlCommand = `curl -X POST https://siteigreja-1.onrender.com/api/registrations -H "Content-Type: application/json" -d '${testData}'`;

console.log('🧪 Testando com produtos da loja...');
console.log('📦 Comando:', curlCommand);

exec(curlCommand, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Erro:', error);
    return;
  }
  if (stderr) {
    console.error('❌ Stderr:', stderr);
  }
  console.log('✅ Resposta:', stdout);
}); 