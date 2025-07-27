const fs = require('fs');
const path = require('path');

function restoreDatabase(backupFile) {
  try {
    console.log('🔄 Restaurando banco de dados...');
    
    const dbPath = path.resolve('./database.sqlite');
    const backupPath = path.resolve(`./backups/${backupFile}`);
    
    if (!fs.existsSync(backupPath)) {
      console.log('❌ Arquivo de backup não encontrado:', backupPath);
      console.log('📁 Backups disponíveis:');
      const backupDir = path.dirname(backupPath);
      if (fs.existsSync(backupDir)) {
        const backups = fs.readdirSync(backupDir)
          .filter(f => f.startsWith('database_backup_'))
          .sort()
          .reverse();
        backups.forEach(backup => console.log('  -', backup));
      }
      return;
    }
    
    // Fazer backup do banco atual antes de restaurar
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const currentBackup = path.resolve(`./backups/database_before_restore_${timestamp}.sqlite`);
    fs.copyFileSync(dbPath, currentBackup);
    console.log('💾 Backup do banco atual criado:', currentBackup);
    
    // Restaurar backup
    fs.copyFileSync(backupPath, dbPath);
    console.log('✅ Banco restaurado com sucesso!');
    
    // Verificar dados restaurados
    const stats = fs.statSync(dbPath);
    console.log('📊 Tamanho do banco restaurado:', (stats.size / 1024 / 1024).toFixed(2), 'MB');
    
  } catch (error) {
    console.error('❌ Erro ao restaurar banco:', error);
  }
}

// Verificar argumentos
const backupFile = process.argv[2];
if (!backupFile) {
  console.log('❌ Especifique o arquivo de backup: node restore_database.js database_backup_2024-01-01.sqlite');
  process.exit(1);
}

restoreDatabase(backupFile); 