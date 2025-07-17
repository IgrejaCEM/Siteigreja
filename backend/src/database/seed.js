const db = require('./db');

async function seed() {
  try {
    // Limpar dados existentes
    await db('events').del();
    
    // Inserir eventos de teste
    await db('events').insert([
      {
        title: 'Culto de Páscoa',
        description: 'Celebração especial de Páscoa',
        date: '2024-03-31',
        location: 'Igreja Principal',
        price: 0,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Retiro de Jovens',
        description: 'Retiro anual para jovens',
        date: '2024-04-15',
        location: 'Chácara Recanto',
        price: 150,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Conferência de Família',
        description: 'Conferência sobre vida familiar',
        date: '2024-05-01',
        location: 'Auditório Central',
        price: 50,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    console.log('Dados de teste inseridos com sucesso!');
  } catch (error) {
    console.error('Erro ao inserir dados de teste:', error);
  } finally {
    process.exit();
  }
}

seed(); 