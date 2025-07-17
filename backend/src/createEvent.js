const { db } = require('./database/db');

async function createEvent() {
  try {
    // Criar evento
    const [eventId] = await db('events').insert({
      title: 'Congresso de Jovens 2024',
      description: 'Um evento incrível para jovens se conectarem e crescerem em sua fé.',
      date: '2024-08-15 19:00:00',
      location: 'Igreja CEM - Salão Principal',
      banner: '/images_site/banner-home.png',
      banner_home: '/images_site/banner-home.png',
      banner_evento: '/images_site/banner-home.png',
      slug: 'congresso-jovens-2024-2',
      status: 'active',
      additional_info: 'Traga sua Bíblia e um caderno para anotações.'
    });

    console.log('Evento criado com ID:', eventId);

    // Criar lotes
    await db('lots').insert([
      {
        event_id: eventId,
        name: '1º Lote',
        price: 49.90,
        quantity: 100,
        start_date: '2024-06-01 00:00:00',
        end_date: '2024-07-15 23:59:59',
        status: 'active'
      },
      {
        event_id: eventId,
        name: '2º Lote',
        price: 69.90,
        quantity: 100,
        start_date: '2024-07-16 00:00:00',
        end_date: '2024-08-14 23:59:59',
        status: 'active'
      }
    ]);

    console.log('Lotes criados com sucesso');

    // Verificar se o evento foi criado
    const event = await db('events').where('id', eventId).first();
    console.log('Evento criado:', event);

    // Verificar se os lotes foram criados
    const lots = await db('lots').where('event_id', eventId);
    console.log('Lotes criados:', lots);

    process.exit(0);
  } catch (error) {
    console.error('Erro ao criar evento:', error);
    process.exit(1);
  }
}

createEvent(); 