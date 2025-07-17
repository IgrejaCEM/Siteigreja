const { db } = require('./database/db');

async function checkDatabase() {
  try {
    // Verificar eventos
    const events = await db('events').select('*');
    console.log('Eventos encontrados:', events);

    // Verificar lotes
    const lots = await db('lots').select('*');
    console.log('Lotes encontrados:', lots);

    // Verificar configurações
    const settings = await db('settings').select('*');
    console.log('Configurações encontradas:', settings);

    process.exit(0);
  } catch (error) {
    console.error('Erro ao verificar banco de dados:', error);
    process.exit(1);
  }
}

checkDatabase(); 