const fs = require('fs');
const path = require('path');

function updatePackageJson() {
  try {
    console.log('📦 Atualizando package.json...');
    
    const packagePath = path.resolve('../package.json');
    const packageContent = fs.readFileSync(packagePath, 'utf8');
    const packageJson = JSON.parse(packageContent);
    
    // Adicionar novos scripts
    packageJson.scripts = {
      ...packageJson.scripts,
      "backup": "node src/backup_database.js",
      "restore": "node src/restore_database.js",
      "fix-tables": "node src/fix_database_tables.js",
      "check-db": "node src/check_database_persistence.js",
      "check-backups": "node src/check_backups.js",
      "setup-render": "node src/setup_render_backup.js"
    };
    
    // Salvar arquivo atualizado
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
    
    console.log('✅ package.json atualizado com sucesso!');
    console.log('');
    console.log('📋 Novos comandos disponíveis:');
    console.log('  npm run backup          - Criar backup do banco');
    console.log('  npm run restore         - Restaurar backup');
    console.log('  npm run fix-tables      - Corrigir tabelas faltantes');
    console.log('  npm run check-db        - Verificar banco de dados');
    console.log('  npm run check-backups   - Verificar backups');
    console.log('  npm run setup-render    - Configurar Render');
    
  } catch (error) {
    console.error('❌ Erro ao atualizar package.json:', error);
  }
}

updatePackageJson(); 