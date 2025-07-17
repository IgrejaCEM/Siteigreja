const { db } = require('./database/db');

async function testSettings() {
  try {
    const settings = await db('settings').first();
    console.log('Settings:', settings);
  } catch (error) {
    console.error('Erro ao acessar tabela settings:', error);
    if (error && error.stack) console.error(error.stack);
  } finally {
    process.exit();
  }
}

testSettings(); 