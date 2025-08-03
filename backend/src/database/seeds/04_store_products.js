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
          name: 'Bíblia Sagrada',
          description: 'Bíblia Sagrada',
          price: 45.00,
          stock: 20,
          image_url: 'https://via.placeholder.com/300x300?text=Biblia',
          category: 'livros',
          active: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 2,
          name: 'Camiseta "Fé"',
          description: 'Camiseta "Fé"',
          price: 35.00,
          stock: 50,
          image_url: 'https://via.placeholder.com/300x300?text=Camiseta',
          category: 'vestuario',
          active: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 3,
          name: 'Caneca Personalizada',
          description: 'Caneca Personalizada',
          price: 25.00,
          stock: 30,
          image_url: 'https://via.placeholder.com/300x300?text=Caneca',
          category: 'acessorios',
          active: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 4,
          name: 'Livro de Orações',
          description: 'Livro de Orações',
          price: 30.00,
          stock: 14,
          image_url: 'https://via.placeholder.com/300x300?text=Livro',
          category: 'livros',
          active: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 5,
          name: 'Chaveiro da Igreja',
          description: 'Chaveiro da Igreja',
          price: 15.00,
          stock: 40,
          image_url: 'https://via.placeholder.com/300x300?text=Chaveiro',
          category: 'acessorios',
          active: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 6,
          name: 'CD de Louvores',
          description: 'CD de Louvores',
          price: 20.00,
          stock: 22,
          image_url: 'https://via.placeholder.com/300x300?text=CD',
          category: 'musica',
          active: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 7,
          name: 'CAMISET',
          description: 'TESTE',
          price: 50.00,
          stock: 5,
          image_url: 'https://via.placeholder.com/300x300?text=CAMISET',
          category: 'vestuario',
          active: true,
          created_at: new Date(),
          updated_at: new Date()
        }
      ]);
    });
}; 