const { db } = require('./src/database/db');
const fs = require('fs');
const path = require('path');

async function backupDatabase() {
  try {
    console.log('🔄 Iniciando backup automático...');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(__dirname, 'backups');
    
    // Criar diretório de backup se não existir
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Backup completo do banco
    const dbBackupPath = path.join(backupDir, `database_backup_${timestamp}.sqlite`);
    const currentDbPath = path.join(__dirname, 'database.sqlite');
    
    if (fs.existsSync(currentDbPath)) {
      fs.copyFileSync(currentDbPath, dbBackupPath);
      console.log(`✅ Backup completo: ${dbBackupPath}`);
    }

    // Backup específico dos dados críticos (JSON)
    const criticalData = {
      timestamp: new Date().toISOString(),
      events: await db('events').select('*'),
      lots: await db('lots').select('*'),
      registrations: await db('registrations').select('*'),
      users: await db('users').select('*'),
      payments: await db('payments').select('*'),
      tickets: await db('tickets').select('*')
    };

    const jsonBackupPath = path.join(backupDir, `critical_data_${timestamp}.json`);
    fs.writeFileSync(jsonBackupPath, JSON.stringify(criticalData, null, 2));
    console.log(`✅ Backup JSON: ${jsonBackupPath}`);

    // Backup resumido para deploy
    const deployBackup = {
      timestamp: new Date().toISOString(),
      summary: {
        events_count: criticalData.events.length,
        lots_count: criticalData.lots.length,
        registrations_count: criticalData.registrations.length,
        users_count: criticalData.users.length,
        payments_count: criticalData.payments.length,
        tickets_count: criticalData.tickets.length
      },
      events: criticalData.events.map(e => ({
        id: e.id,
        title: e.title,
        date: e.date,
        status: e.status
      })),
      lots: criticalData.lots.map(l => ({
        id: l.id,
        event_id: l.event_id,
        name: l.name,
        price: l.price,
        quantity: l.quantity,
        status: l.status
      }))
    };

    const deployBackupPath = path.join(backupDir, 'deploy_backup.json');
    fs.writeFileSync(deployBackupPath, JSON.stringify(deployBackup, null, 2));
    console.log(`✅ Backup para deploy: ${deployBackupPath}`);

    // Limpar backups antigos (manter apenas os últimos 10)
    const backupFiles = fs.readdirSync(backupDir)
      .filter(file => file.startsWith('database_backup_'))
      .sort()
      .reverse();

    if (backupFiles.length > 10) {
      const filesToDelete = backupFiles.slice(10);
      filesToDelete.forEach(file => {
        fs.unlinkSync(path.join(backupDir, file));
        console.log(`🗑️ Removido backup antigo: ${file}`);
      });
    }

    console.log('🎉 Backup automático concluído com sucesso!');
    return {
      success: true,
      files: {
        database: dbBackupPath,
        json: jsonBackupPath,
        deploy: deployBackupPath
      },
      summary: deployBackup.summary
    };

  } catch (error) {
    console.error('❌ Erro no backup automático:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Função para restaurar backup
async function restoreBackup(backupPath) {
  try {
    console.log(`🔄 Restaurando backup: ${backupPath}`);
    
    if (backupPath.endsWith('.sqlite')) {
      // Restaurar banco completo
      const currentDbPath = path.join(__dirname, 'database.sqlite');
      fs.copyFileSync(backupPath, currentDbPath);
      console.log('✅ Banco restaurado com sucesso!');
    } else if (backupPath.endsWith('.json')) {
      // Restaurar dados específicos
      const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
      
      // Limpar tabelas existentes
      await db('tickets').del();
      await db('payments').del();
      await db('registrations').del();
      await db('lots').del();
      await db('events').del();
      await db('users').del();
      
      // Restaurar dados
      if (backupData.events) await db('events').insert(backupData.events);
      if (backupData.lots) await db('lots').insert(backupData.lots);
      if (backupData.registrations) await db('registrations').insert(backupData.registrations);
      if (backupData.users) await db('users').insert(backupData.users);
      if (backupData.payments) await db('payments').insert(backupData.payments);
      if (backupData.tickets) await db('tickets').insert(backupData.tickets);
      
      console.log('✅ Dados restaurados com sucesso!');
    }
    
    return { success: true };
  } catch (error) {
    console.error('❌ Erro na restauração:', error);
    return { success: false, error: error.message };
  }
}

// Executar backup se chamado diretamente
if (require.main === module) {
  backupDatabase().then(result => {
    if (result.success) {
      console.log('📊 Resumo do backup:', result.summary);
      process.exit(0);
    } else {
      console.error('❌ Backup falhou:', result.error);
      process.exit(1);
    }
  });
}

module.exports = { backupDatabase, restoreBackup }; 