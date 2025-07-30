const StoreProduct = require('./src/models/StoreProduct');
const { db } = require('./src/database/db');

// Forçar uso do ambiente de produção
process.env.NODE_ENV = 'production';

const sampleProducts = [
  {
    name: 'Bíblia Sagrada',
    description: 'Bíblia Sagrada com capa dura, ideal para estudos e devoção diária.',
    price: 45.00,
    stock: 20,
    image_url: '/images_site/bible.jpg',
    category: 'Livros'
  },
  {
    name: 'Camiseta "Fé"',
    description: 'Camiseta com estampa "Fé" em diferentes cores e tamanhos.',
    price: 35.00,
    stock: 50,
    image_url: '/images_site/tshirt-faith.jpg',
    category: 'Vestuário'
  },
  {
    name: 'Caneca Personalizada',
    description: 'Caneca com logo da igreja, perfeita para café ou chá.',
    price: 25.00,
    stock: 30,
    image_url: '/images_site/mug.jpg',
    category: 'Acessórios'
  },
  {
    name: 'Livro de Orações',
    description: 'Livro com orações para diferentes momentos da vida.',
    price: 30.00,
    stock: 15,
    image_url: '/images_site/prayer-book.jpg',
    category: 'Livros'
  },
  {
    name: 'Chaveiro da Igreja',
    description: 'Chaveiro com logo da igreja, ideal para presente.',
    price: 15.00,
    stock: 40,
    image_url: '/images_site/keychain.jpg',
    category: 'Acessórios'
  },
  {
    name: 'CD de Louvores',
    description: 'CD com músicas de louvor da igreja.',
    price: 20.00,
    stock: 25,
    image_url: '/images_site/cd-worship.jpg',
    category: 'Mídia'
  }
];

async function addStoreProducts() {
  try {
    console.log('🛍️ Adicionando produtos à loja...');
    
    for (const product of sampleProducts) {
      const existingProduct = await StoreProduct.query()
        .where('name', product.name)
        .first();
      
      if (!existingProduct) {
        await StoreProduct.query().insert(product);
        console.log(`✅ Produto adicionado: ${product.name}`);
      } else {
        console.log(`⏭️ Produto já existe: ${product.name}`);
      }
    }
    
    console.log('🎉 Produtos da loja adicionados com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao adicionar produtos:', error);
    process.exit(1);
  }
}

addStoreProducts(); 