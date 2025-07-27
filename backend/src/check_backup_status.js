const fs = require('fs');
const path = require('path');

function checkBackupStatus() {
  try {
    console.log('�� Verificando status dos backups...');
    
    const backupDir = path.resolve('../backups');
    
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
      return;
    }
    
    // Verificar backups das últimas 24 horas
    const now = new Date();
    const last24Hours = backupFiles.filter(file => {
      const filePath = path.join(backupDir, file);
      const stats = fs.statSync(filePath);
      const hoursAgo = (now - stats.mtime) / (1000 * 60 * 60);
      return hoursAgo <= 24;
    });
    
    console.log(`📊 Backups nas últimas 24 horas: ${last24Hours.length}`);
    
    if (last24Hours.length > 0) {
      console.log('🕐 Backups recentes:');
      last24Hours.slice(0, 10).forEach((file, index) => {
        const filePath = path.join(backupDir, file);
        const stats = fs.statSync(filePath);
        const hoursAgo = ((now - stats.mtime) / (1000 * 60 * 60)).toFixed(1);
        const size = (stats.size / 1024 / 1024).toFixed(2);
        const time = stats.mtime.toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
        
        console.log(`  ${index + 1}. ${file}`);
        console.log(`     ⏰ ${time} (há ${hoursAgo} horas) | 📊 ${size} MB`);
      });
    }
    
    // Verificar se o sistema está funcionando corretamente
    if (last24Hours.length >= 20) {
      console.log('✅ Sistema de backup funcionando perfeitamente!');
    } else if (last24Hours.length >= 10) {
      console.log('⚠️ Sistema de backup funcionando, mas pode estar perdendo alguns backups');
    } else {
      console.log('❌ Sistema de backup pode não estar funcionando corretamente');
    }
    
    // Mostrar estatísticas
    console.log('');
    console.log('📈 Estatísticas:');
    console.log(`  - Backups nas últimas 24h: ${last24Hours.length}/24 esperados`);
    console.log(`  - Total de backups: ${backupFiles.length}`);
    console.log(`  - Configuração: Backup a cada hora (00:00-23:00)`);
    console.log(`  - Máximo mantido: 24 backups (1 dia completo)`);
    
  } catch (error) {
    console.error('❌ Erro ao verificar backups:', error);
  }
}

checkBackupStatus(); 