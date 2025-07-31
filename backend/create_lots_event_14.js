const { db } = require('./src/database/db');

async function createLotsForEvent14() {
  try {
    console.log('🔧 Criando lotes para o evento 14...');
    
    // Verificar se o evento 14 existe
    const event = await db('events')
      .where('id', 14)
      .first();
    
    if (!event) {
      console.log('❌ Evento 14 não encontrado!');
      return;
    }
    
    console.log('✅ Evento 14 encontrado:', event.name);
    
    // Criar lotes para o evento 14
    const lots = [
      {
        event_id: 14,
        name: '1º Lote',
        price: 29.90,
        quantity: 100,
        start_date: new Date(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        event_id: 14,
        name: '2º Lote',
        price: 39.90,
        quantity: 100,
        start_date: new Date(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        event_id: 14,
        name: '3º Lote',
        price: 49.90,
        quantity: 100,
        start_date: new Date(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
        created_at: new Date(),
        updated_at: new Date()
      }
    ];
    
    for (const lot of lots) {
      const [newLot] = await db('lots').insert(lot).returning('*');
      console.log(`✅ Lote criado: ID ${newLot.id}, Nome: ${newLot.name}, Preço: R$ ${newLot.price}`);
    }
    
    console.log('🎉 Lotes criados com sucesso para o evento 14!');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    process.exit(0);
  }
}

createLotsForEvent14(); 