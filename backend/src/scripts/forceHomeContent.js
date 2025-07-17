const knex = require('knex');
const path = require('path');
const config = require('../config/database');
const db = knex(config);

async function forceHomeContent() {
  // Cria a tabela settings se não existir
  const hasSettings = await db.schema.hasTable('settings');
  if (!hasSettings) {
    await db.schema.createTable('settings', table => {
      table.increments('id').primary();
      table.text('homeContent');
      table.text('homeCss');
      table.json('homeLayout');
      table.timestamps(true, true);
    });
    await db('settings').insert({ id: 1 });
    console.log('Tabela settings criada!');
  }

  // Atualiza o conteúdo customizado
  const html = `
    <div style="width:100%;min-height:60vh;display:flex;align-items:center;justify-content:center;background:#222;">
      <img src="/uploads/banners/hero.png" alt="Banner Hero" style="max-width:100%;height:auto;object-fit:cover;">
    </div>
  `;

  const exists = await db('settings').where('id', 1).first();
  if (!exists) {
    await db('settings').insert({ id: 1, homeContent: html, homeCss: '' });
  } else {
    await db('settings').where('id', 1).update({ homeContent: html, homeCss: '' });
  }
  console.log('Home personalizada forçada com sucesso!');
  process.exit(0);
}

forceHomeContent(); 