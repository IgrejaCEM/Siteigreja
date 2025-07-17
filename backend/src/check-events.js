const { db } = require('./database/db');

async function checkEvents() {
  try {
    const events = await db('events').select('*');
    console.log('Total de eventos:', events.length);
    console.log('Eventos encontrados:', JSON.stringify(events, null, 2));
  } catch (error) {
    console.error('Erro ao buscar eventos:', error);
  } finally {
    process.exit();
  }
}

checkEvents(); 