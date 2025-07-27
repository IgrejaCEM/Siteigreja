const fs = require('fs');
const path = require('path');

function checkBackups() {
  try {
    console.log('🔍 Verificando backups existentes...');
    
    const backupDir = path.resolve('./backups');
    
    if (!fs.existsSync(backupDir)) {
      console.log('❌ Diretório de backups não existe!');
      return;
    }
    
    const backupFiles = fs.readdirSync(backupDir)
      .filter(f => f.startsWith('database_backup_'))
      .sort()
      .reverse();
    
    console.log(`📁 Total de backups encontrados: ${backupFiles.length}`);
    
    if (backupFiles.length === 0) {
      console.log('⚠️ Nenhum backup encontrado!');
      console.log('💡 Execute: npm run backup');
      return;
    }
    
    console.log('📋 Backups disponíveis:');
    backupFiles.forEach((file, index) => {
      const filePath = path.join(backupDir, file);
      const stats = fs.statSync(filePath);
      const size = (stats.size / 1024 / 1024).toFixed(2);
      const date = stats.mtime.toLocaleString('pt-BR');
      
      console.log(`  ${index + 1}. ${file}`);
      console.log(`     📊 Tamanho: ${size} MB`);
      console.log(`     📅 Data: ${date}`);
      console.log('');
    });
    
    // Verificar backup mais recente
    const latestBackup = backupFiles[0];
    const latestPath = path.join(backupDir, latestBackup);
    const latestStats = fs.statSync(latestPath);
    const hoursAgo = Math.floor((Date.now() - latestStats.mtime.getTime()) / (1000 * 60 * 60));
    
    console.log('�� Backup mais recente:');
    console.log(`  📁 Arquivo: ${latestBackup}`);
    console.log(`  ⏰ Há ${hoursAgo} horas`);
    
    if (hoursAgo > 24) {
      console.log('⚠️ Aviso: Último backup tem mais de 24 horas!');
    } else {
      console.log('✅ Backup recente encontrado!');
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar backups:', error);
  }
}

checkBackups(); 