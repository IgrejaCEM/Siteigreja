const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 FORÇANDO DEPLOY SEM BACKUP');

try {
  // Verificar se estamos no diretório correto
  if (!fs.existsSync('package.json')) {
    console.error('❌ Não estamos no diretório do backend');
    process.exit(1);
  }

  console.log('📦 Instalando dependências...');
  execSync('npm install', { stdio: 'inherit' });

  console.log('🔄 Executando migrações...');
  try {
    execSync('npm run migrate', { stdio: 'inherit' });
  } catch (error) {
    console.log('⚠️ Migrações falharam, continuando...');
  }

  console.log('📝 Adicionando arquivos...');
  execSync('git add .', { stdio: 'inherit' });

  console.log('💾 Fazendo commit...');
  execSync('git commit -m "Force deploy - checkout real"', { stdio: 'inherit' });

  console.log('🚀 Fazendo push...');
  execSync('git push origin main', { stdio: 'inherit' });

  console.log('✅ Deploy forçado concluído!');

} catch (error) {
  console.error('❌ Erro no deploy:', error.message);
  process.exit(1);
} 