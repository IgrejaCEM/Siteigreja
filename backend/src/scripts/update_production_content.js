const knex = require('knex');
const knexConfig = require('../../knexfile');

async function updateProductionContent() {
  let db;
  try {
    console.log('🚀 Atualizando conteúdo na produção...');
    
    db = knex(knexConfig.production);
    
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

    // Atualizar conteúdo existente com colunas corretas
    const result = await db('settings')
      .where('id', 3)
      .update({
        homeContent: defaultContent,
        homeCss: '',
        updated_at: new Date()
      });

    console.log('✅ Conteúdo atualizado! Linhas afetadas:', result);
    
    // Verificar se foi salvo
    const settings = await db('settings').first();
    console.log('📋 Conteúdo salvo:', settings.homeContent ? 'Sim' : 'Não');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    if (db) {
      await db.destroy();
    }
    process.exit(0);
  }
}

updateProductionContent(); 