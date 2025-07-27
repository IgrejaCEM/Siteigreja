const { db } = require('./database/db');
const fs = require('fs');
const path = require('path');

async function checkDatabasePersistence() {
  try {
    console.log('🔍 Verificando persistência do banco de dados...');
    
    // Verificar se o arquivo do banco existe
    const dbPath = path.resolve('./database.sqlite');
    const dbExists = fs.existsSync(dbPath);
    console.log('📁 Arquivo do banco existe:', dbExists);
    
    if (dbExists) {
      const stats = fs.statSync(dbPath);
      console.log('📊 Tamanho do banco:', (stats.size / 1024 / 1024).toFixed(2), 'MB');
      console.log('�� Última modificação:', stats.mtime);
    }
    
    // Verificar dados no banco
    const events = await db('events').select('*');
    console.log('📅 Eventos no banco:', events.length);
    
    const registrations = await db('registrations').select('*');
    console.log('📝 Inscrições no banco:', registrations.length);
    
    const products = await db('event_products').select('*');
    console.log('��️ Produtos no banco:', products.length);
    
    const payments = await db('payments').select('*');
    console.log('💰 Pagamentos no banco:', payments.length);
    
    // Verificar variáveis de ambiente
    console.log('🌍 Ambiente:', process.env.NODE_ENV || 'development');
    console.log('�� Diretório atual:', process.cwd());
    console.log('�� Arquivos no diretório:', fs.readdirSync('.').filter(f => f.endsWith('.sqlite')));
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await db.destroy();
  }
}

checkDatabasePersistence(); 