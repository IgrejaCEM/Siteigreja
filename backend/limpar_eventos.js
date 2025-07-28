const { db } = require('./src/database/db');

async function limparEventos() {
  try {
    console.log('🗑️ Limpando inscrições...');
    await db('registrations').del();
    console.log('🗑️ Limpando lotes...');
    await db('lots').del();
    console.log('🗑️ Limpando eventos...');
    await db('events').del();
    console.log('✅ Todos os eventos, lotes e inscrições foram removidos!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao limpar eventos:', error);
    process.exit(1);
  }
}

limparEventos(); 