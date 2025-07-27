const fs = require('fs');
const path = require('path');
const knex = require('knex');

async function createBackup() {
  let db = null;
  let backupDb = null;
  
  try {
    console.log('💾 Criando backup completo do banco de dados...');
    
    const dbPath = path.resolve('./database.sqlite');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.resolve(`./backups/database_backup_${timestamp}.sqlite`);
    
    // Criar diretório de backup se não existir
    const backupDir = path.dirname(backupPath);
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Copiar arquivo do banco
    fs.copyFileSync(dbPath, backupPath);
    
    console.log('✅ Backup criado:', backupPath);
    
    // Verificar dados no backup
    backupDb = knex({
      client: 'sqlite3',
      connection: { filename: backupPath },
      useNullAsDefault: true
    });
    
    const events = await backupDb('events').select('*');
    const registrations = await backupDb('registrations').select('*');
    const products = await backupDb('event_products').select('*');
    const payments = await backupDb('payments').select('*');
    const tickets = await backupDb('tickets').select('*');
    
    console.log('📊 Dados no backup:');
    console.log('  - Eventos:', events.length);
    console.log('  - Inscrições:', registrations.length);
    console.log('  - Produtos:', products.length);
    console.log('  - Pagamentos:', payments.length);
    console.log('  - Tickets:', tickets.length);
    
    // Limpar backups antigos (manter apenas os últimos 5)
    const backupFiles = fs.readdirSync(backupDir)
      .filter(f => f.startsWith('database_backup_'))
      .sort()
      .reverse();
    
    if (backupFiles.length > 5) {
      const filesToDelete = backupFiles.slice(5);
      filesToDelete.forEach(file => {
        fs.unlinkSync(path.join(backupDir, file));
        console.log('🗑️ Backup antigo removido:', file);
      });
    }
    
    console.log('✅ Backup concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao criar backup:', error);
  } finally {
    // Fechar conexões
    if (backupDb) {
      await backupDb.destroy();
    }
    if (db) {
      await db.destroy();
    }
  }
}

createBackup(); 