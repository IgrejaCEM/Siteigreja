const axios = require('axios');
const { db } = require('./src/database/db');

const API_BASE_URL = 'https://siteigreja-1.onrender.com/api';

console.log('🔍 Verificando qual evento a API está retornando...');

async function verificarEventoAPI() {
  try {
    console.log('📋 Verificando eventos na API...');
    const eventsResponse = await axios.get(`${API_BASE_URL}/events`);
    console.log(`📊 Total de eventos na API: ${eventsResponse.data.length}`);
    
    if (eventsResponse.data.length > 0) {
      const apiEvent = eventsResponse.data[0];
      console.log(`📋 Evento da API: ${apiEvent.title} (ID: ${apiEvent.id})`);
      
      // Verificar se este evento existe no banco
      console.log('📋 Verificando evento no banco de dados...');
      const dbEvent = await db('events').where('id', apiEvent.id).first();
      
      if (dbEvent) {
        console.log(`✅ Evento encontrado no banco: ${dbEvent.title} (ID: ${dbEvent.id})`);
        
        // Verificar produtos deste evento
        const products = await db('event_products')
          .where('event_id', dbEvent.id)
          .where('is_active', true);
        
        console.log(`📊 Produtos no banco: ${products.length}`);
        
        if (products.length === 0) {
          console.log('❌ Nenhum produto encontrado. Criando produtos...');
          
          const sampleProducts = [
            {
              event_id: dbEvent.id,
              name: 'Camiseta do Evento',
              description: 'Camiseta personalizada do CONNECT CONF 2025',
              price: 35.00,
              stock: 100,
              image_url: 'https://via.placeholder.com/300x200?text=Camiseta',
              is_active: true,
              created_at: new Date(),
              updated_at: new Date()
            },
            {
              event_id: dbEvent.id,
              name: 'Kit Completo',
              description: 'Kit com camiseta, caneca e adesivos',
              price: 55.00,
              stock: 50,
              image_url: 'https://via.placeholder.com/300x200?text=Kit+Completo',
              is_active: true,
              created_at: new Date(),
              updated_at: new Date()
            },
            {
              event_id: dbEvent.id,
              name: 'Caneca Personalizada',
              description: 'Caneca com logo do evento',
              price: 20.00,
              stock: 75,
              image_url: 'https://via.placeholder.com/300x200?text=Caneca',
              is_active: true,
              created_at: new Date(),
              updated_at: new Date()
            }
          ];
          
          const insertedProducts = await db('event_products').insert(sampleProducts).returning('*');
          console.log(`✅ ${insertedProducts.length} produtos criados para o evento ${dbEvent.id}!`);
          
          insertedProducts.forEach((product, index) => {
            console.log(`  ${index + 1}. ${product.name} - R$ ${product.price}`);
          });
          
        } else {
          console.log('✅ Produtos já existem:');
          products.forEach((product, index) => {
            console.log(`  ${index + 1}. ${product.name} - R$ ${product.price}`);
          });
        }
        
      } else {
        console.log(`❌ Evento ${apiEvent.id} não encontrado no banco de dados`);
      }
      
    } else {
      console.log('❌ Nenhum evento encontrado na API');
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar evento:', error.response?.data || error.message);
  } finally {
    process.exit(0);
  }
}

verificarEventoAPI(); 