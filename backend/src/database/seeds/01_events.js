exports.seed = function(knex) {
  // Verificar se já existem eventos
  return knex('events').count('* as count')
    .then(function(result) {
      if (result[0].count > 0) {
        console.log('ℹ️ Eventos já existem, pulando seed...');
        return;
      }
      
      console.log('🌱 Inserindo eventos de teste...');
      // Inserts seed entries
      return knex('events').insert([
        {
          id: 1,
          title: 'CONNECT CONF 2025 - INPROVÁVEIS',
          description: 'Evento de teste para checkout',
          date: '2025-10-24T19:00:00.000Z',
          location: 'Igreja CEM - CAJATI, localizada na Av. dos trabalhadores, Nº99 - Centro, Cajati/SP.',
          max_participants: 100,
          current_participants: 0,
          status: 'active',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 2,
          title: 'EVENTO DE TESTE 2',
          description: 'Segundo evento de teste',
          date: '2025-11-15T20:00:00.000Z',
          location: 'Local de teste',
          max_participants: 50,
          current_participants: 0,
          status: 'active',
          created_at: new Date(),
          updated_at: new Date()
        }
      ]);
    });
}; 