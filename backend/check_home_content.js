const db = require(./src/database/db');

async function checkHomeContent() {
  try {
    console.log('Verificando conteúdo da home...');
    
    // Verificar se existe configuração da home
    const result = await db('settings').where('key', 'home_content').first();
    console.log('Conteúdo atual da home:');
    console.log(JSON.stringify(result, null, 2));
    if (result && result.value) {
      const content = JSON.parse(result.value);
      console.log('\nConteúdo HTML:');
      console.log(content.content || 'Nenhum conteúdo HTML encontrado');
    }
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    process.exit();
  }
}

checkHomeContent(); 