const { db } = require('./src/database/db');

async function checkProductionDatabase() {
  try {
    console.log('🔍 Verificando estrutura da tabela events em produção...');
    
    // Verificar estrutura da tabela events
    const columns = await db.raw(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'events'
      ORDER BY ordinal_position
    `);
    
    console.log('📊 Estrutura da tabela events:');
    columns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    // Verificar se campos de banners responsivos existem
    const bannerFields = ['banner_desktop', 'banner_mobile', 'banner_evento_desktop', 'banner_evento_mobile'];
    const existingColumns = columns.rows.map(col => col.column_name);
    
    console.log('\n🔍 Verificando campos de banners responsivos:');
    bannerFields.forEach(field => {
      const exists = existingColumns.includes(field);
      console.log(`  - ${field}: ${exists ? '✅ EXISTE' : '❌ NÃO EXISTE'}`);
    });
    
    // Se algum campo não existe, tentar adicionar
    const missingFields = bannerFields.filter(field => !existingColumns.includes(field));
    
    if (missingFields.length > 0) {
      console.log('\n🔧 Adicionando campos faltantes...');
      
      for (const field of missingFields) {
        try {
          await db.raw(`ALTER TABLE events ADD COLUMN ${field} VARCHAR`);
          console.log(`  ✅ ${field} adicionado`);
        } catch (error) {
          console.log(`  ❌ Erro ao adicionar ${field}:`, error.message);
        }
      }
    } else {
      console.log('\n✅ Todos os campos de banners responsivos existem!');
    }
    
    // Testar inserção simples
    console.log('\n🧪 Testando inserção...');
    const testEvent = {
      title: 'Teste Banners',
      description: 'Evento de teste para verificar banners responsivos',
      date: new Date(),
      location: 'Local de teste',
      slug: 'teste-banners-' + Date.now(),
      status: 'active',
      has_payment: false,
      banner_desktop: 'https://teste.com/banner-desktop.jpg',
      banner_mobile: 'https://teste.com/banner-mobile.jpg'
    };
    
    const [inserted] = await db('events').insert(testEvent).returning('*');
    console.log('✅ Inserção OK:', inserted.id);
    
    // Limpar teste
    await db('events').where('id', inserted.id).del();
    console.log('✅ Limpeza OK');
    
    console.log('\n🎉 Verificação concluída!');
    
  } catch (error) {
    console.error('❌ Erro na verificação:', error);
    console.error('📋 Detalhes:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      hint: error.hint
    });
  } finally {
    process.exit(0);
  }
}

checkProductionDatabase(); 