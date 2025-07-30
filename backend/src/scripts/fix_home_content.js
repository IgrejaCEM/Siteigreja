const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:WWiZILOORFMgerRjFMPSJLQrfLGFfviU@shuttle.proxy.rlwy.net:14638/railway'
});

async function fixHomeContent() {
  try {
    console.log('🚀 Conectando ao banco...');
    await client.connect();
    
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

    console.log('📝 Atualizando homeContent para HTML...');
    const result = await client.query(
      'UPDATE settings SET "homeContent" = $1, updated_at = NOW() WHERE id = 4',
      [defaultContent]
    );

    console.log('✅ Conteúdo atualizado! Linhas afetadas:', result.rowCount);
    
    // Verificar se foi salvo
    const check = await client.query('SELECT "homeContent" FROM settings WHERE id = 4');
    console.log('📋 Conteúdo salvo:', check.rows[0]?.homeContent ? 'Sim' : 'Não');
    console.log('📋 Primeiros 100 chars:', check.rows[0]?.homeContent?.substring(0, 100));
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await client.end();
    process.exit(0);
  }
}

fixHomeContent(); 