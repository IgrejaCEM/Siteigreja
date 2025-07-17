const { db } = require('./database/db');

async function describeSettings() {
  try {
    const info = await db.raw("PRAGMA table_info('settings')");
    console.log('Estrutura da tabela settings:');
    info.forEach(col => {
      console.log(`- ${col.name} (${col.type})`);
    });
  } catch (error) {
    console.error('Erro ao descrever tabela settings:', error);
    if (error && error.stack) console.error(error.stack);
  } finally {
    process.exit();
  }
}

describeSettings(); 