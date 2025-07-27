async function testarEvento1() {
  console.log('🔍 Testando inscrição no evento ID 1...\n');
  
  try {
    console.log('📝 Testando inscrição unificada...');
    const response = await fetch('https://siteigreja-1.onrender.com/api/events/1/inscricao-unificada', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        participantes: [{
          name: 'Teste Usuario',
          email: 'teste@teste.com',
          phone: '11999999999'
        }],
        lot_id: 1
      })
    });
    
    const data = await response.json();
    
    console.log('✅ Inscrição OK!');
    console.log(`   Status: ${response.status}`);
    console.log(`   Data:`, data);
    
  } catch (error) {
    console.log('❌ Erro na inscrição:');
    console.log(`   Erro:`, error.message);
  }
}

testarEvento1(); 