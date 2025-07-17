const { db } = require('./database/db');

async function createConnectConfEvents() {
  try {
    console.log('Criando eventos do CONNECT CONF...');
    
    // Verificar se já existem eventos
    const existingEvents = await db('events').where('slug', 'connect-conf-2025').first();
    if (existingEvents) {
      console.log('Evento CONNECT CONF já existe!');
      return;
    }

    // Criar evento principal do CONNECT CONF
    const [eventId] = await db('events').insert({
      title: 'CONNECT CONF 2025',
      description: '1ª CONFERÊNCIA DE ADOLESCENTES - Uma experiência sobrenatural para adolescentes se conectarem, crescerem e viverem algo sobrenatural!',
      date: new Date('2025-07-12 19:00:00'),
      location: 'Igreja CEM - Salão Principal',
      banner: '/uploads/banners/hero.png',
      banner_home: '/uploads/banners/hero.png',
      banner_evento: '/uploads/banners/hero.png',
      slug: 'connect-conf-2025',
      status: 'active',
      created_at: new Date(),
      updated_at: new Date()
    });

    console.log('Evento CONNECT CONF criado com ID:', eventId);

    // Criar lotes para o evento (sem o campo status)
    await db('lots').insert([
      {
        event_id: eventId,
        name: '1º Lote - PROMOCIONAL',
        price: 29.90,
        quantity: 50,
        start_date: new Date('2025-01-01 00:00:00'),
        end_date: new Date('2025-03-31 23:59:59'),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        event_id: eventId,
        name: '2º Lote - NORMAL',
        price: 49.90,
        quantity: 100,
        start_date: new Date('2025-04-01 00:00:00'),
        end_date: new Date('2025-06-30 23:59:59'),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        event_id: eventId,
        name: '3º Lote - ÚLTIMA CHANCE',
        price: 69.90,
        quantity: 50,
        start_date: new Date('2025-07-01 00:00:00'),
        end_date: new Date('2025-07-11 23:59:59'),
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    console.log('Lotes criados com sucesso!');

    // Criar evento adicional
    const [event2Id] = await db('events').insert({
      title: 'ENCONTRO DE JOVENS',
      description: 'Um encontro especial para jovens se conectarem e crescerem em sua fé.',
      date: new Date('2025-08-15 19:00:00'),
      location: 'Igreja CEM - Salão Principal',
      banner: '/uploads/banners/hero.png',
      banner_home: '/uploads/banners/hero.png',
      banner_evento: '/uploads/banners/hero.png',
      slug: 'encontro-jovens-2025',
      status: 'active',
      created_at: new Date(),
      updated_at: new Date()
    });

    console.log('Evento Encontro de Jovens criado com ID:', event2Id);

    // Criar lote para o segundo evento (sem o campo status)
    await db('lots').insert({
      event_id: event2Id,
      name: 'Ingresso Único',
      price: 19.90,
      quantity: 80,
      start_date: new Date('2025-06-01 00:00:00'),
      end_date: new Date('2025-08-14 23:59:59'),
      created_at: new Date(),
      updated_at: new Date()
    });

    console.log('Todos os eventos e lotes criados com sucesso!');
    
    // Listar eventos criados
    const events = await db('events').select('*');
    console.log('Eventos no banco:', events.map(e => ({ id: e.id, title: e.title, slug: e.slug })));

  } catch (error) {
    console.error('Erro ao criar eventos:', error);
    if (error && error.stack) console.error(error.stack);
  } finally {
    process.exit();
  }
}

createConnectConfEvents(); 