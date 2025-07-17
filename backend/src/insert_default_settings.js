const { db } = require('./database/db');

async function insertDefaultSettings() {
  try {
    const exists = await db('settings').first();
    if (!exists) {
      await db('settings').insert({
        homeContent: JSON.stringify({
          title: 'Bem-vindo à Igreja CEM',
          subtitle: 'Um lugar de fé, esperança e amor',
          description: 'Junte-se a nós em nossos eventos e celebrações'
        }),
        homeCss: '',
        homeLayout: JSON.stringify([]),
        updated_at: new Date().toISOString()
      });
      console.log('Registro padrão inserido na tabela settings!');
    } else {
      console.log('Já existe registro na tabela settings.');
    }
  } catch (error) {
    console.error('Erro ao inserir registro padrão:', error);
    if (error && error.stack) console.error(error.stack);
  } finally {
    process.exit();
  }
}

insertDefaultSettings(); 