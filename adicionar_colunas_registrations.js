const { db } = require('./backend/src/database/db');

async function adicionarColunasRegistrations() {
  console.log('🔧 Adicionando colunas na tabela registrations...');

  try {
    // Verificar se as colunas existem
    const columns = await db.raw("PRAGMA table_info(registrations)");
    console.log('📋 Colunas atuais da tabela registrations:');
    columns.forEach(col => {
      console.log(`   - ${col.name} (${col.type})`);
    });

    // Verificar se as colunas necessárias existem
    const nameColumn = columns.some(col => col.name === 'name');
    const emailColumn = columns.some(col => col.name === 'email');
    const phoneColumn = columns.some(col => col.name === 'phone');
    const addressColumn = columns.some(col => col.name === 'address');
    const cpfColumn = columns.some(col => col.name === 'cpf');

    console.log('\n🔍 Verificando colunas necessárias:');
    console.log(`   name: ${nameColumn ? '✅ Existe' : '❌ Não existe'}`);
    console.log(`   email: ${emailColumn ? '✅ Existe' : '❌ Não existe'}`);
    console.log(`   phone: ${phoneColumn ? '✅ Existe' : '❌ Não existe'}`);
    console.log(`   address: ${addressColumn ? '✅ Existe' : '❌ Não existe'}`);
    console.log(`   cpf: ${cpfColumn ? '✅ Existe' : '❌ Não existe'}`);

    // Adicionar colunas que não existem
    if (!nameColumn) {
      console.log('\n🔧 Adicionando coluna name...');
      await db.raw("ALTER TABLE registrations ADD COLUMN name TEXT");
      console.log('✅ Coluna name adicionada');
    }

    if (!emailColumn) {
      console.log('\n🔧 Adicionando coluna email...');
      await db.raw("ALTER TABLE registrations ADD COLUMN email TEXT");
      console.log('✅ Coluna email adicionada');
    }

    if (!phoneColumn) {
      console.log('\n🔧 Adicionando coluna phone...');
      await db.raw("ALTER TABLE registrations ADD COLUMN phone TEXT");
      console.log('✅ Coluna phone adicionada');
    }

    if (!addressColumn) {
      console.log('\n🔧 Adicionando coluna address...');
      await db.raw("ALTER TABLE registrations ADD COLUMN address TEXT");
      console.log('✅ Coluna address adicionada');
    }

    if (!cpfColumn) {
      console.log('\n🔧 Adicionando coluna cpf...');
      await db.raw("ALTER TABLE registrations ADD COLUMN cpf TEXT");
      console.log('✅ Coluna cpf adicionada');
    }

    // Verificar novamente após adicionar
    const columnsAfter = await db.raw("PRAGMA table_info(registrations)");
    console.log('\n📋 Colunas após adição:');
    columnsAfter.forEach(col => {
      console.log(`   - ${col.name} (${col.type})`);
    });

    console.log('\n✅ Processo concluído!');

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await db.destroy();
    console.log('🔚 Conexão com banco fechada.');
  }
}

adicionarColunasRegistrations(); 