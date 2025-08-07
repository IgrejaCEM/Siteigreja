exports.seed = function(knex) {
  // Verificar se já existem produtos do evento
  return knex('event_products').count('* as count')
    .then(function(result) {
      if (result[0].count > 0) {
        console.log('ℹ️ Produtos do evento já existem, pulando seed...');
        return;
      }
      
      console.log('🌱 Inserindo produtos do evento de teste...');
      // Inserts seed entries
      return knex('event_products').insert([
        {
          id: 1,
          event_id: 14,
          name: 'Camiseta do Evento',
          description: 'Camiseta oficial do Connect Conf 2025',
          price: 45.00,
          stock: 100,
          image_url: 'https://via.placeholder.com/300x300?text=Camiseta+Evento',
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 2,
          event_id: 14,
          name: 'Caneca Personalizada',
          description: 'Caneca exclusiva do Connect Conf 2025',
          price: 35.00,
          stock: 50,
          image_url: 'https://via.placeholder.com/300x300?text=Caneca+Evento',
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 3,
          event_id: 14,
          name: 'Kit do Evento',
          description: 'Kit com materiais exclusivos do Connect Conf 2025',
          price: 75.00,
          stock: 30,
          image_url: 'https://via.placeholder.com/300x300?text=Kit+Evento',
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        }
      ]);
    });
};