const fs = require('fs');
const path = require('path');

console.log('🚀 FORÇANDO DEPLOY DAS CORREÇÕES');
console.log('=====================================');

// Adicionar comentário temporário no App.jsx
const appPath = path.join(__dirname, 'frontend/src/App.jsx');
let appContent = fs.readFileSync(appPath, 'utf8');

// Adicionar timestamp para cache busting
const timestamp = new Date().toISOString();
const cacheBustingComment = `// CACHE BUSTING: Price.toFixed fix - ${timestamp}\n`;

if (!appContent.includes('CACHE BUSTING')) {
  appContent = cacheBustingComment + appContent;
  fs.writeFileSync(appPath, appContent);
  console.log('✅ Comentário de cache busting adicionado');
} else {
  console.log('ℹ️ Cache busting já existe');
}

// Verificar se as correções estão nos arquivos
const filesToCheck = [
  'frontend/src/components/EventoCompleto.jsx',
  'frontend/src/pages/Evento.jsx', 
  'frontend/src/components/EventProducts.jsx'
];

console.log('\n📋 Verificando correções nos arquivos:');
filesToCheck.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const hasFix = content.includes('parseFloat') && content.includes('price') && content.includes('toFixed');
  console.log(`${hasFix ? '✅' : '❌'} ${file}`);
});

console.log('\n🎯 PRÓXIMOS PASSOS:');
console.log('1. Execute: git add .');
console.log('2. Execute: git commit -m "fix: Cache busting para price.toFixed"');
console.log('3. Execute: git push');
console.log('4. Aguarde 2-3 minutos para o Vercel fazer o build');
console.log('5. Teste o site em https://igrejacemchurch.org');

console.log('\n✨ DEPLOY FORÇADO CRIADO!'); 