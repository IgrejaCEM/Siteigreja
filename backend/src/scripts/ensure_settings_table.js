const knex = require('knex');
const path = require('path');
const config = require('../config/database');
const db = knex(config);

async function ensureSettingsTable() {
  try {
    console.log('🔧 Verificando tabela settings...');
    
    // Verificar se a tabela existe
    const hasSettings = await db.schema.hasTable('settings');
    if (!hasSettings) {
      console.log('📋 Criando tabela settings...');
      await db.schema.createTable('settings', table => {
        table.increments('id').primary();
        table.text('homeContent');
        table.text('homeCss');
        table.json('homeLayout');
        table.timestamps(true, true);
      });
    } else {
      // Verificar e adicionar colunas faltantes
      const columns = ['homeContent', 'homeCss', 'homeLayout'];
      for (const column of columns) {
        const hasColumn = await db.schema.hasColumn('settings', column);
        if (!hasColumn) {
          console.log(`📝 Adicionando coluna ${column}...`);
          await db.schema.table('settings', table => {
            if (column === 'homeLayout') {
              table.json(column);
            } else {
              table.text(column);
            }
          });
        }
      }
    }

    // Verificar se há conteúdo
    const settings = await db('settings').first();
    if (!settings) {
      console.log('📝 Inserindo conteúdo padrão...');
      const defaultContent = `
        <div style="width:100%;min-height:60vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
          <div style="text-align:center;color:white;padding:40px;">
            <h1 style="font-size:3rem;margin-bottom:20px;">Bem-vindo à Igreja CEM</h1>
            <p style="font-size:1.2rem;margin-bottom:30px;">Um lugar de fé, esperança e amor</p>
            <button style="background:#ff6b6b;color:white;border:none;padding:15px 30px;border-radius:25px;font-size:1.1rem;cursor:pointer;">
              Conheça Nossos Eventos
            </button>
          </div>
        </div>
      `;
      
      // Verificar se as colunas existem
      const hasCreatedAt = await db.schema.hasColumn('settings', 'createdAt');
      const hasUpdatedAt = await db.schema.hasColumn('settings', 'updatedAt');
      const hasHomeLayout = await db.schema.hasColumn('settings', 'homeLayout');
      
      const insertData = {
        homeContent: defaultContent,
        homeCss: ''
      };
      
      if (hasHomeLayout) insertData.homeLayout = JSON.stringify([]);
      if (hasCreatedAt) insertData.createdAt = new Date();
      if (hasUpdatedAt) insertData.updatedAt = new Date();
      
      await db('settings').insert(insertData);
      console.log('✅ Conteúdo padrão inserido!');
    } else {
      console.log('✅ Tabela settings já existe e tem conteúdo');
    }

    console.log('🎉 Verificação concluída!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

ensureSettingsTable(); 