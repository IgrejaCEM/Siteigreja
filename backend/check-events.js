const { db } = require('./src/database/db');

async function checkEvents() {
  try {
    console.log('🔍 Verificando eventos no banco...');
    
    const events = await db('events').select('*');
    console.log('📊 Eventos encontrados:', events.length);
    
    events.forEach(event => {
      console.log(`  - ID: ${event.id}, Title: ${event.title}, Status: ${event.status}`);
    });
    
    console.log('\n🔍 Verificando lotes...');
    const lots = await db('lots').select('*');
    console.log('📊 Lotes encontrados:', lots.length);
    
    lots.forEach(lot => {
      console.log(`  - ID: ${lot.id}, Event ID: ${lot.event_id}, Name: ${lot.name}, Price: ${lot.price}`);
    });
    
    console.log('\n🔍 Verificando produtos da loja...');
    const products = await db('store_products').select('*');
    console.log('📊 Produtos encontrados:', products.length);
    
    products.forEach(product => {
      console.log(`  - ID: ${product.id}, Name: ${product.name}, Price: ${product.price}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

checkEvents(); 