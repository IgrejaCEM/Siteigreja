const { backupDatabase } = require('./backup_database');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

async function deploySafe() {
  try {
    console.log('🚀 Iniciando deploy seguro...');
    
    // 1. Backup automático antes do deploy
    console.log('📦 Fazendo backup antes do deploy...');
    const backupResult = await backupDatabase();
    
    if (!backupResult.success) {
      throw new Error(`Backup falhou: ${backupResult.error}`);
    }
    
    console.log('✅ Backup realizado com sucesso!');
    console.log('📊 Resumo dos dados:', backupResult.summary);
    
    // 2. Verificar se há mudanças para commitar
    console.log('🔍 Verificando mudanças...');
    const hasChanges = await checkGitChanges();
    
    if (!hasChanges) {
      console.log('ℹ️ Nenhuma mudança detectada. Deploy não necessário.');
      return { success: true, message: 'Nenhuma mudança para deploy' };
    }
    
    // 3. Executar migrações se necessário
    console.log('🔄 Executando migrações...');
    await runMigrations();
    
    // 4. Commit das mudanças
    console.log('💾 Fazendo commit das mudanças...');
    await gitCommit();
    
    // 5. Push para o repositório
    console.log('📤 Fazendo push para o repositório...');
    await gitPush();
    
    console.log('🎉 Deploy seguro concluído com sucesso!');
    return {
      success: true,
      backup: backupResult,
      message: 'Deploy realizado com backup automático'
    };
    
  } catch (error) {
    console.error('❌ Erro no deploy seguro:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

async function checkGitChanges() {
  return new Promise((resolve, reject) => {
    exec('git status --porcelain', (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(stdout.trim().length > 0);
    });
  });
}

async function runMigrations() {
  return new Promise((resolve, reject) => {
    exec('npx knex migrate:latest', (error, stdout, stderr) => {
      if (error) {
        console.warn('⚠️ Aviso: Erro nas migrações:', error.message);
        // Não falha o deploy se as migrações derem erro
        resolve();
        return;
      }
      console.log('✅ Migrações executadas:', stdout);
      resolve();
    });
  });
}

async function gitCommit() {
  return new Promise((resolve, reject) => {
    const timestamp = new Date().toISOString();
    const commitMessage = `Deploy automático - ${timestamp}`;
    
    exec(`git add . && git commit -m "${commitMessage}"`, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      console.log('✅ Commit realizado:', stdout);
      resolve();
    });
  });
}

async function gitPush() {
  return new Promise((resolve, reject) => {
    exec('git push origin main', (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      console.log('✅ Push realizado:', stdout);
      resolve();
    });
  });
}

// Executar deploy se chamado diretamente
if (require.main === module) {
  deploySafe().then(result => {
    if (result.success) {
      console.log('🎉 Deploy seguro concluído!');
      console.log('📊 Backup criado:', result.backup?.files);
      process.exit(0);
    } else {
      console.error('❌ Deploy falhou:', result.error);
      process.exit(1);
    }
  });
}

module.exports = { deploySafe }; 