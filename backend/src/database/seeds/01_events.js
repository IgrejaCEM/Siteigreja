exports.seed = async function(knex) {
  // Deleta todos os registros existentes
  await knex('lots').del();
  await knex('events').del();
  
  // Insere os eventos
  const [event1Obj] = await knex('events').insert([
    {
      title: 'Congresso de Jovens 2024',
      description: 'Um evento incrível para jovens se conectarem e crescerem em sua fé.',
      date: new Date('2024-05-15 19:00:00'),
      location: 'Igreja CEM - Salão Principal',
      banner: '/images_site/banner-home.png',
      banner_home: '/images_site/banner-home.png',
      banner_evento: '/images_site/banner-home.png',
      slug: 'congresso-jovens-2024',
      status: 'active',
      additional_info: 'Traga sua Bíblia e um caderno para anotações.',
      created_at: new Date(),
      updated_at: new Date()
    }
  ]).returning('id');

  // Compatibilidade: pega o id correto (Postgres retorna objeto, SQLite retorna número)
  const event1 = typeof event1Obj === 'object' && event1Obj !== null ? event1Obj.id : event1Obj;

  // Insere os lotes
  await knex('lots').insert([
    {
      event_id: event1,
      name: '1º Lote',
      price: 49.90,
      quantity: 100,
      start_date: new Date('2024-03-01 00:00:00'),
      end_date: new Date('2024-04-15 23:59:59'),
      status: 'active',
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);
}; 