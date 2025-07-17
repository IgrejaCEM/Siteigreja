const { db } = require('./database/db');
const fs = require('fs');
const path = require('path');

async function resetDatabase() {
  try {
    // Deletar o arquivo do banco de dados se existir
    const dbPath = path.resolve(__dirname, 'database', 'database.sqlite');
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
      console.log('Banco de dados antigo deletado');
    }

    // Criar tabela de eventos
    await db.schema.createTable('events', table => {
      table.increments('id').primary();
      table.string('title').notNullable();
      table.text('description').notNullable();
      table.datetime('date').notNullable();
      table.string('location').notNullable();
      table.string('banner').nullable();
      table.string('banner_home').nullable();
      table.string('banner_evento').nullable();
      table.string('slug').unique().notNullable();
      table.string('status').defaultTo('active');
      table.text('additional_info').nullable();
      table.timestamps(true, true);
    });
    console.log('Tabela de eventos criada');

    // Criar tabela de lotes
    await db.schema.createTable('lots', table => {
      table.increments('id').primary();
      table.integer('event_id').unsigned().references('id').inTable('events');
      table.string('name').notNullable();
      table.decimal('price', 10, 2).notNullable();
      table.integer('quantity').notNullable();
      table.datetime('start_date').notNullable();
      table.datetime('end_date').notNullable();
      table.string('status').defaultTo('active');
      table.timestamps(true, true);
    });
    console.log('Tabela de lotes criada');

    // Criar evento de exemplo
    const [eventId] = await db('events').insert({
      title: 'Congresso de Jovens 2024',
      description: 'Um evento incrível para jovens se conectarem e crescerem em sua fé.',
      date: '2024-05-15 19:00:00',
      location: 'Igreja CEM - Salão Principal',
      banner: '/images_site/banner-home.png',
      banner_home: '/images_site/banner-home.png',
      banner_evento: '/images_site/banner-home.png',
      slug: 'congresso-jovens-2024',
      status: 'active',
      additional_info: 'Traga sua Bíblia e um caderno para anotações.'
    });
    console.log('Evento criado com ID:', eventId);

    // Criar lotes para o evento
    await db('lots').insert([
      {
        event_id: eventId,
        name: '1º Lote',
        price: 49.90,
        quantity: 100,
        start_date: '2024-03-01 00:00:00',
        end_date: '2024-04-15 23:59:59',
        status: 'active'
      },
      {
        event_id: eventId,
        name: '2º Lote',
        price: 69.90,
        quantity: 100,
        start_date: '2024-04-16 00:00:00',
        end_date: '2024-05-14 23:59:59',
        status: 'active'
      }
    ]);
    console.log('Lotes criados com sucesso');

    // Verificar se tudo foi criado corretamente
    const events = await db('events').select('*');
    console.log('Eventos no banco:', events);

    const lots = await db('lots').select('*');
    console.log('Lotes no banco:', lots);

    process.exit(0);
  } catch (error) {
    console.error('Erro ao resetar banco de dados:', error);
    process.exit(1);
  }
}

resetDatabase(); 