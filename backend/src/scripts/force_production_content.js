const knex = require('knex');
const knexConfig = require('../../knexfile');

// Usar configuração de produção do knexfile
const db = knex(knexConfig.production);

async function forceProductionContent() {
  try {
    console.log('🚀 Forçando conteúdo na produção...');
    
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
    }

    // Verificar se há conteúdo
    const settings = await db('settings').first();
    if (settings) {
      console.log('📝 Atualizando conteúdo existente...');
      await db('settings')
        .where('id', settings.id)
        .update({
          homeContent: defaultContent,
          homeCss: '',
          homeLayout: JSON.stringify([]),
          updatedAt: new Date()
        });
    } else {
      console.log('📝 Inserindo novo conteúdo...');
      await db('settings').insert({
        homeContent: defaultContent,
        homeCss: '',
        homeLayout: JSON.stringify([]),
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    console.log('✅ Conteúdo atualizado na produção!');
    
    // Verificar se foi salvo
    const updatedSettings = await db('settings').first();
    console.log('📋 Conteúdo salvo:', updatedSettings.homeContent ? 'Sim' : 'Não');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await db.destroy();
    process.exit(0);
  }
}

forceProductionContent(); 