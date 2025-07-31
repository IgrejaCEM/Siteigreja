exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('events').del()
    .then(function () {
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