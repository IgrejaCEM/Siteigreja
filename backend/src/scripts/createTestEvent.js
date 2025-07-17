const { db } = require('../database/db');

async function createTestEvent() {
  try {
    // Criar evento
    const [eventId] = await db('events').insert({
      title: 'Culto de Celebração',
      description: 'Venha celebrar conosco neste culto especial de adoração e louvor.',
      date: new Date('2024-03-24 19:00:00'),
      location: 'Igreja CEM - Avenida dos trabalhadores, 199 - CAJATI/SP',
      status: 'published',
      slug: 'culto-de-celebracao',
      banner: '/images_site/banner-evento.jpg',
      banner_home: '/images_site/banner-home.jpg',
      created_at: new Date(),
      updated_at: new Date()
    }).returning('id');

    // Criar lotes
    await db('lots').insert([
      {
        event_id: eventId,
        name: 'Lote 1',
        price: 0,
        quantity: 100,
        start_date: new Date('2024-03-01 00:00:00'),
        end_date: new Date('2024-03-23 23:59:59'),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        event_id: eventId,
        name: 'Lote 2',
        price: 0,
        quantity: 100,
        start_date: new Date('2024-03-24 00:00:00'),
        end_date: new Date('2024-03-24 18:00:00'),
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    console.log('Evento de teste criado com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao criar evento de teste:', error);
    process.exit(1);
  }
}

createTestEvent(); 