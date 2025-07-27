const fs = require('fs');
const path = require('path');
const { db } = require('./src/database/db');

async function backupDatabase() {
  try {
    console.log('💾 Iniciando backup automático do banco de dados...');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(__dirname, 'backups');
    
    // Criar diretório de backup se não existir
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Backup do banco SQLite
    const dbPath = path.join(__dirname, 'database.sqlite');
    const dbBackupPath = path.join(backupDir, `database_backup_${timestamp}.sqlite`);
    fs.copyFileSync(dbPath, dbBackupPath);
    console.log(`✅ Backup do banco: ${dbBackupPath}`);

    // Backup em JSON para fácil restauração
    const jsonBackupPath = path.join(backupDir, `data_backup_${timestamp}.json`);
    const backupData = {
      timestamp: new Date().toISOString(),
      events: await db('events').select('*'),
      lots: await db('lots').select('*'),
      registrations: await db('registrations').select('*'),
      users: await db('users').select('*'),
      payments: await db('payments').select('*'),
      tickets: await db('tickets').select('*'),
      event_products: await db('event_products').select('*'),
      registration_products: await db('registration_products').select('*')
    };
    
    fs.writeFileSync(jsonBackupPath, JSON.stringify(backupData, null, 2));
    console.log(`✅ Backup JSON: ${jsonBackupPath}`);

    // Backup para deploy
    const deployBackup = {
      timestamp: new Date().toISOString(),
      summary: {
        events: backupData.events.length,
        lots: backupData.lots.length,
        registrations: backupData.registrations.length,
        users: backupData.users.length,
        payments: backupData.payments.length,
        tickets: backupData.tickets.length,
        products: backupData.event_products.length
      },
      events: backupData.events.map(e => ({
        id: e.id,
        title: e.title,
        date: e.date,
        location: e.location,
        status: e.status
      })),
      lots: backupData.lots.map(l => ({
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

    // Limpar backups antigos (manter apenas os últimos 24 - 1 dia completo)
    const backupFiles = fs.readdirSync(backupDir)
      .filter(file => file.startsWith('database_backup_'))
      .sort()
      .reverse();

    if (backupFiles.length > 24) {
      const filesToDelete = backupFiles.slice(24);
      filesToDelete.forEach(file => {
        fs.unlinkSync(path.join(backupDir, file));
        console.log(`🗑️ Removido backup antigo: ${file}`);
      });
      console.log(`✅ Mantidos os últimos ${backupFiles.length - filesToDelete.length} backups (1 dia completo)`);
    } else {
      console.log(`✅ Total de backups: ${backupFiles.length}`);
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
    console.log(` Restaurando backup: ${backupPath}`);
    
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