const { db } = require('./database/db');

async function migrate() {
  try {
    // Adicionar coluna banner se não existir
    const hasColumn = await db.schema.hasColumn('events', 'banner');
    if (!hasColumn) {
      await db.schema.table('events', table => {
        table.string('banner');
      });
      console.log('Coluna banner adicionada com sucesso');
    }

    // Adicionar coluna user_id se não existir
    const hasUserId = await db.schema.hasColumn('events', 'user_id');
    if (!hasUserId) {
      await db.schema.table('events', table => {
        table.integer('user_id').references('id').inTable('users');
      });
      console.log('Coluna user_id adicionada com sucesso');
    }

    // Adicionar coluna registration_form se não existir
    const hasRegForm = await db.schema.hasColumn('events', 'registration_form');
    if (!hasRegForm) {
      await db.schema.table('events', table => {
        table.text('registration_form');
      });
      console.log('Coluna registration_form adicionada com sucesso');
    }

    // Adicionar coluna banner_home se não existir
    const hasBannerHome = await db.schema.hasColumn('events', 'banner_home');
    if (!hasBannerHome) {
      await db.schema.table('events', table => {
        table.string('banner_home');
      });
      console.log('Coluna banner_home adicionada com sucesso');
    }

    // Adicionar coluna banner_evento se não existir
    const hasBannerEvento = await db.schema.hasColumn('events', 'banner_evento');
    if (!hasBannerEvento) {
      await db.schema.table('events', table => {
        table.string('banner_evento');
      });
      console.log('Coluna banner_evento adicionada com sucesso');
    }

    // Criar tabela de lotes se não existir
    const hasLotsTable = await db.schema.hasTable('lots');
    if (!hasLotsTable) {
      await db.schema.createTable('lots', table => {
        table.increments('id').primary();
        table.integer('event_id').references('id').inTable('events');
        table.string('name').notNullable();
        table.decimal('price', 10, 2).notNullable();
        table.integer('quantity').notNullable();
        table.string('start_date');
        table.string('end_date');
        table.timestamp('created_at').defaultTo(db.fn.now());
      });
      console.log('Tabela lots criada com sucesso');
    }

    // Adicionar coluna slug se não existir
    const hasSlug = await db.schema.hasColumn('events', 'slug');
    if (!hasSlug) {
      await db.schema.table('events', table => {
        table.string('slug').unique();
      });
      console.log('Coluna slug adicionada com sucesso');

      // Atualizar slugs para eventos existentes
      const events = await db('events').select('id', 'title');
      for (const event of events) {
        const slug = slugify(event.title);
        await db('events')
          .where('id', event.id)
          .update('slug', slug);
      }
      console.log('Slugs atualizados com sucesso');
    }

    console.log('Migração concluída com sucesso');
  } catch (error) {
    console.error('Erro durante a migração:', error);
  } finally {
    process.exit();
  }
}

// Função auxiliar para gerar slugs
function slugify(str) {
  return str.toString().toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

migrate(); 