const { db } = require('./src/database/db');

async function resetHomeContent() {
  try {
    await db('settings').update({ homeContent: null, homeCss: null });
    console.log('Conteúdo da home resetado!');
  } catch (err) {
    console.error('Erro ao resetar conteúdo da home:', err);
  } finally {
    process.exit(0);
  }
}

resetHomeContent(); 