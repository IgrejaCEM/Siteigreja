const fs = require('fs');
const path = require('path');

function verificarScriptsAutomaticos() {
  console.log('🔍 VERIFICANDO SCRIPTS AUTOMÁTICOS...');
  
  const arquivosParaVerificar = [
    'src/app.js',
    'src/server.js',
    'src/database/db.js',
    'src/routes/index.js',
    'src/routes/admin.js',
    'src/routes/events.js'
  ];
  
  let encontrouScriptsAutomaticos = false;
  
  arquivosParaVerificar.forEach(arquivo => {
    const caminhoCompleto = path.join(__dirname, arquivo);
    
    if (fs.existsSync(caminhoCompleto)) {
      const conteudo = fs.readFileSync(caminhoCompleto, 'utf8');
      
      // Verificar palavras-chave que indicam criação automática
      const palavrasChave = [
        'createEvent',
        'insertEvent',
        'seedEvent',
        'defaultEvent',
        'testEvent',
        'autoCreate',
        'createDefault'
      ];
      
      palavrasChave.forEach(palavra => {
        if (conteudo.includes(palavra)) {
          console.log(`⚠️  ARQUIVO SUSPEITO: ${arquivo}`);
          console.log(`   Contém: ${palavra}`);
          encontrouScriptsAutomaticos = true;
        }
      });
    }
  });
  
  if (!encontrouScriptsAutomaticos) {
    console.log('✅ NENHUM SCRIPT AUTOMÁTICO ENCONTRADO!');
    console.log('✅ Seus eventos estão seguros!');
  } else {
    console.log('❌ SCRIPTS AUTOMÁTICOS ENCONTRADOS!');
    console.log('🔧 Recomendação: Remover scripts automáticos');
  }
  
  console.log('\n📋 ARQUIVOS VERIFICADOS:');
  arquivosParaVerificar.forEach(arquivo => {
    const existe = fs.existsSync(path.join(__dirname, arquivo));
    console.log(`   ${existe ? '✅' : '❌'} ${arquivo}`);
  });
}

verificarScriptsAutomaticos(); 