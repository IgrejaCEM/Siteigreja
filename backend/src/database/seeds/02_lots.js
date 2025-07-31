exports.seed = function(knex) {
  // Verificar se já existem lotes
  return knex('lots').count('* as count')
    .then(function(result) {
      if (result[0].count > 0) {
        console.log('ℹ️ Lotes já existem, pulando seed...');
        return;
      }
      
      console.log('🌱 Inserindo lotes de teste...');
      // Inserts seed entries
      return knex('lots').insert([
        {
          id: 1,
          event_id: 1,
          name: 'Lote 1 - Primeiro Lote',
          price: 50.00,
          max_quantity: 50,
          current_quantity: 0,
          start_date: '2025-07-01T00:00:00.000Z',
          end_date: '2025-10-20T23:59:59.000Z',
          is_free: false,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 2,
          event_id: 1,
          name: 'Lote 2 - Segundo Lote',
          price: 75.00,
          max_quantity: 30,
          current_quantity: 0,
          start_date: '2025-10-21T00:00:00.000Z',
          end_date: '2025-10-24T23:59:59.000Z',
          is_free: false,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 3,
          event_id: 2,
          name: 'Lote Único',
          price: 30.00,
          max_quantity: 50,
          current_quantity: 0,
          start_date: '2025-07-01T00:00:00.000Z',
          end_date: '2025-11-14T23:59:59.000Z',
          is_free: false,
          created_at: new Date(),
          updated_at: new Date()
        }
      ]);
    });
}; 