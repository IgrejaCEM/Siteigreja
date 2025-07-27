// Script para limpar todos os dados de participantes
// Execute: node limpar_participantes.js

const knex = require('knex');
const path = require('path');

// Configuração do banco de dados
const db = knex({
  client: 'sqlite3',
  connection: {
    filename: path.join(__dirname, 'backend/database.sqlite')
  },
  useNullAsDefault: true
});

async function limparParticipantes() {
  try {
    console.log('🔍 Verificando registros existentes...');
    
    // Contar registros antes da limpeza
    const [result] = await db('registrations').count('* as total');
    const totalAntes = result.total;
    
    console.log(`📊 Total de registros encontrados: ${totalAntes}`);
    
    if (totalAntes === 0) {
      console.log('✅ Nenhum registro para limpar!');
      return;
    }
    
    // Confirmar com o usuário
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const resposta = await new Promise((resolve) => {
      rl.question(`⚠️  ATENÇÃO: Você está prestes a remover ${totalAntes} registros de participantes. Esta ação não pode ser desfeita. Digite "CONFIRMAR" para continuar: `, resolve);
    });
    
    rl.close();
    
    if (resposta !== 'CONFIRMAR') {
      console.log('❌ Operação cancelada pelo usuário.');
      return;
    }
    
    console.log('🗑️  Iniciando limpeza...');
    
    // Limpar todos os registros
    const deletedCount = await db('registrations').del();
    
    console.log(`✅ Limpeza concluída com sucesso!`);
    console.log(`📊 Registros removidos: ${deletedCount}`);
    
    // Verificar se a limpeza foi bem-sucedida
    const [resultFinal] = await db('registrations').count('* as total');
    console.log(`📊 Registros restantes: ${resultFinal.total}`);
    
  } catch (error) {
    console.error('❌ Erro durante a limpeza:', error);
  } finally {
    // Fechar conexão com o banco
    await db.destroy();
  }
}

// Executar o script
limparParticipantes(); 