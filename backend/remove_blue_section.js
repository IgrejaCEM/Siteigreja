const { db } = require('./src/database/db');

async function removeBlueSection() {
  try {
    console.log('Removendo seção azul do conteúdo da home...');
    
    // Buscar o conteúdo atual
    const result = await db('settings').first();
    if (result && result.homeContent) {
      let htmlContent = result.homeContent;
      // Remover a seção azul com CONNECT CONF
      // Procurar por padrões que possam conter essa seção
      const patterns = [
        /<div[^>]*style[^>]*background[^>]*#[0-9a-fA-F]{6}[^>]*>[\s\S]*?CONNECT CONF[\s\S]*?<\/div>/gi,
        /<section[^>]*style[^>]*background[^>]*#[0-9a-fA-F]{6}[^>]*>[\s\S]*?CONNECT CONF[\s\S]*?<\/section>/gi,
        /<div[^>]*style[^>]*background[^>]*blue[^>]*>[\s\S]*?CONNECT CONF[\s\S]*?<\/div>/gi,
        /<section[^>]*style[^>]*background[^>]*blue[^>]*>[\s\S]*?CONNECT CONF[\s\S]*?<\/section>/gi
      ];
      
      let modified = false;
      patterns.forEach(pattern => {
        if (pattern.test(htmlContent)) {
          htmlContent = htmlContent.replace(pattern, '');
          modified = true;
          console.log('Seção azul removida com sucesso!');
        }
      });
      
      if (!modified) {
        console.log('Nenhuma seção azul encontrada no conteúdo atual.');
        console.log('Conteúdo atual:');
        console.log(htmlContent);
      } else {
        // Atualizar o banco de dados
        await db('settings')
          .update({
            homeContent: htmlContent,
            updated_at: new Date()
          });
        console.log('Conteúdo atualizado no banco de dados!');
      }
    } else {
      console.log('Nenhum conteúdo da home encontrado no banco de dados.');
    }
  } catch (error) {
    console.error('Erro:', error);
  } finally {  process.exit();
  }
}

removeBlueSection(); 