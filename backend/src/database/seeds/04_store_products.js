exports.seed = function(knex) {
  // Verificar se já existem produtos da loja
  return knex('store_products').count('* as count')
    .then(function(result) {
      if (result[0].count > 0) {
        console.log('ℹ️ Produtos da loja já existem, pulando seed...');
        return;
      }
      
      console.log('🌱 Inserindo produtos da loja de teste...');
      // Inserts seed entries
      return knex('store_products').insert([
        {
          id: 1,
          name: 'Camiseta Connect Conf',
          description: 'Camiseta oficial do evento Connect Conf 2025',
          price: 25.00,
          stock: 100,
          image_url: 'https://via.placeholder.com/300x300?text=Camiseta',
          category: 'vestuario',
          status: 'active',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 2,
          name: 'Caneca Personalizada',
          description: 'Caneca personalizada do evento',
          price: 15.00,
          stock: 50,
          image_url: 'https://via.placeholder.com/300x300?text=Caneca',
          category: 'acessorios',
          status: 'active',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 3,
          name: 'Livro Devocional',
          description: 'Livro devocional especial do evento',
          price: 35.00,
          stock: 30,
          image_url: 'https://via.placeholder.com/300x300?text=Livro',
          category: 'livros',
          status: 'active',
          created_at: new Date(),
          updated_at: new Date()
        }
      ]);
    });
}; 