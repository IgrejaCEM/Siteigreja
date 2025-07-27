// Script para limpar dados AGORA
// Execute: node limpar_agora.js

const fs = require('fs');
const path = require('path');

console.log('🗑️  LIMPANDO DADOS DE PARTICIPANTES...\n');

// Caminho para o banco
const dbPath = path.join(__dirname, 'backend', 'database.sqlite');

// Verificar se existe
if (!fs.existsSync(dbPath)) {
  console.log('❌ Banco de dados não encontrado!');
  process.exit(1);
}

// Fazer backup
const backupPath = path.join(__dirname, `database_backup_${Date.now()}.sqlite`);
fs.copyFileSync(dbPath, backupPath);
console.log('💾 Backup criado:', backupPath);

// Usar SQLite3
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // Contar antes
  db.get("SELECT COUNT(*) as total FROM registrations", (err, row) => {
    if (err) {
      console.log('❌ Erro:', err.message);
      return;
    }
    
    const total = row.total;
    console.log(`📊 Registros encontrados: ${total}`);
    
    if (total === 0) {
      console.log('✅ Nenhum registro para limpar!');
      db.close();
      return;
    }
    
    // Limpar
    db.run("DELETE FROM registrations", function(err) {
      if (err) {
        console.log('❌ Erro ao limpar:', err.message);
      } else {
        console.log(`✅ LIMPEZA CONCLUÍDA!`);
        console.log(`📊 Registros removidos: ${this.changes}`);
      }
      
      // Verificar resultado
      db.get("SELECT COUNT(*) as total FROM registrations", (err, row) => {
        if (err) {
          console.log('❌ Erro ao verificar:', err.message);
        } else {
          console.log(`📊 Registros restantes: ${row.total}`);
        }
        
        console.log('\n🎉 DADOS LIMPOS! O site deve mostrar 0 participantes agora.');
        db.close();
      });
    });
  });
}); 