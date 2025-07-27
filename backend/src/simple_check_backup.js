const fs = require('fs');
const path = require('path');

function simpleCheckBackup() {
  try {
    console.log('🔍 Verificando backups...');
    
    const backupDir = path.resolve('../backups');
    
    if (!fs.existsSync(backupDir)) {
      console.log('❌ Diretório de backups não existe!');
      return;
    }
    
    const backupFiles = fs.readdirSync(backupDir)
      .filter(f => f.startsWith('database_backup_'))
      .sort()
      .reverse();
    
    console.log(`📁 Total de backups: ${backupFiles.length}`);
    
    if (backupFiles.length > 0) {
      console.log('�� Últimos 5 backups:');
      backupFiles.slice(0, 5).forEach((file, index) => {
        const filePath = path.join(backupDir, file);
        const stats = fs.statSync(filePath);
        const size = (stats.size / 1024 / 1024).toFixed(2);
        const time = stats.mtime.toLocaleString('pt-BR');
        
        console.log(`  ${index + 1}. ${file}`);
        console.log(`     📅 ${time} | 📊 ${size} MB`);
      });
    }
    
    console.log('');
    console.log('✅ Verificação concluída!');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

simpleCheckBackup();