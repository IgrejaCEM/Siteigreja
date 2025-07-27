// Script simples para limpar dados de participantes
// Execute: node limpar_dados_simples.js

const fs = require('fs');
const path = require('path');

// Caminho para o banco de dados
const dbPath = path.join(__dirname, 'backend', 'database.sqlite');

function limparDados() {
  try {
    console.log('🔍 Verificando banco de dados...');
    
    // Verificar se o arquivo existe
    if (!fs.existsSync(dbPath)) {
      console.log('❌ Arquivo do banco de dados não encontrado!');
      console.log('📁 Procurando em:', dbPath);
      return;
    }
    
    console.log('✅ Banco de dados encontrado');
    
    // Fazer backup antes de limpar
    const backupPath = path.join(__dirname, 'database_backup_' + Date.now() + '.sqlite');
    fs.copyFileSync(dbPath, backupPath);
    console.log('💾 Backup criado:', backupPath);
    
    // Confirmar com o usuário
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.question('⚠️  ATENÇÃO: Você está prestes a limpar TODOS os dados de participantes. Digite "SIM" para confirmar: ', (resposta) => {
      rl.close();
      
      if (resposta !== 'SIM') {
        console.log('❌ Operação cancelada pelo usuário.');
        return;
      }
      
      console.log('🗑️  Iniciando limpeza...');
      
      // Usar SQLite3 diretamente
      const sqlite3 = require('sqlite3').verbose();
      const db = new sqlite3.Database(dbPath);
      
      db.serialize(() => {
        // Contar registros antes
        db.get("SELECT COUNT(*) as total FROM registrations", (err, row) => {
          if (err) {
            console.log('❌ Erro ao contar registros:', err.message);
            return;
          }
          
          const totalAntes = row.total;
          console.log(`📊 Total de registros encontrados: ${totalAntes}`);
          
          if (totalAntes === 0) {
            console.log('✅ Nenhum registro para limpar!');
            db.close();
            return;
          }
          
          // Limpar registros
          db.run("DELETE FROM registrations", function(err) {
            if (err) {
              console.log('❌ Erro ao limpar registros:', err.message);
            } else {
              console.log(`✅ Limpeza concluída!`);
              console.log(`📊 Registros removidos: ${this.changes}`);
            }
            
            // Verificar resultado
            db.get("SELECT COUNT(*) as total FROM registrations", (err, row) => {
              if (err) {
                console.log('❌ Erro ao verificar resultado:', err.message);
              } else {
                console.log(`📊 Registros restantes: ${row.total}`);
              }
              db.close();
            });
          });
        });
      });
    });
    
  } catch (error) {
    console.error('❌ Erro durante a limpeza:', error.message);
  }
}

// Executar o script
limparDados(); 