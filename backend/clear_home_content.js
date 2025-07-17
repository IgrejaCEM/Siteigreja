const { db } = require('./src/database/db');

async function clearHomeContent() {
  try {
    console.log('Limpando conteúdo da home...');
    
    // Criar conteúdo limpo sem seções azuis
    const cleanContent = {
      content: `<div id="proximos-eventos"></div>`,
      css: ''
    };
    
    // Verificar se já existe configuração
    const existing = await db('settings').where('key', 'home_content').first();
    
    if (existing) {
      // Atualizar conteúdo existente
      await db('settings')
        .where('key', 'home_content')
        .update({ 
          value: JSON.stringify(cleanContent),
          updated_at: new Date()
        });
      console.log('Conteúdo da home atualizado!');
    } else {
      // Criar nova configuração
      await db('settings').insert({
        key: 'home_content',
        value: JSON.stringify(cleanContent),
        created_at: new Date(),
        updated_at: new Date()
      });
      console.log('Configuração da home criada!');
    }
    
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    process.exit();
  }
}

clearHomeContent(); 