const fetch = require('node-fetch');

async function verificarBancoUsado() {
  console.log('🔍 Verificando qual banco o Render está usando...\n');
  
  try {
    // Testar se está usando PostgreSQL ou SQLite
    const response = await fetch('https://siteigreja-1.onrender.com/api/health');
    const data = await response.json();
    
    console.log('✅ Health check OK:', data);
    
    // Tentar listar eventos para ver se há dados
    const eventsResponse = await fetch('https://siteigreja-1.onrender.com/api/events');
    const eventsData = await eventsResponse.json();
    
    console.log('📋 Eventos encontrados:', eventsData.length);
    
    if (eventsData.length === 0) {
      console.log('⚠️ Banco vazio - provavelmente SQLite novo');
    } else {
      console.log('✅ Banco tem dados - provavelmente PostgreSQL');
      eventsData.forEach(event => {
        console.log(`   ID: ${event.id} - ${event.title}`);
      });
    }
    
  } catch (error) {
    console.log('❌ Erro:', error.message);
  }
}

verificarBancoUsado(); 