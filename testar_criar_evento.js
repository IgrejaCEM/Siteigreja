const { db } = require('./backend/src/database/db');

async function testarCriarEvento() {
  console.log('🔍 Testando criação de evento...');
  
  try {
    // Teste 1: Verificar estrutura da tabela events
    console.log('\n1️⃣ Verificando estrutura da tabela events...');
    try {
      const columns = await db.raw("PRAGMA table_info(events)");
      console.log('✅ Colunas da tabela events:');
      columns.forEach(col => {
        console.log(`   - ${col.name} (${col.type})`);
      });
    } catch (error) {
      console.log('❌ Erro ao verificar estrutura:', error.message);
    }
    
    // Teste 2: Verificar se há eventos existentes
    console.log('\n2️⃣ Verificando eventos existentes...');
    try {
      const events = await db('events').select('*');
      console.log(`✅ Eventos existentes: ${events.length}`);
      events.forEach(event => {
        console.log(`   - ${event.title} (${event.slug})`);
      });
    } catch (error) {
      console.log('❌ Erro ao buscar eventos:', error.message);
    }
    
    // Teste 3: Tentar criar um evento de teste
    console.log('\n3️⃣ Criando evento de teste...');
    try {
      const eventData = {
        title: 'CONNECT CONF 25 - IMPROVÁVEIS',
        description: 'Vai ter palavra profética, preletores que carregam o Céu, momentos marcantes de adoração e experiências que vão quebrar seus padrões.',
        date: '2025-10-24 19:00:00',
        location: 'Igreja CEM - CAJATI, localizada na Av. dos trabalhadores, N°99 - Centro',
        banner: 'https://i.ibb.co/bjTgK85b/Design-sem-nome.jp',
        banner_home: 'https://i.ibb.co/bjTgK85b/Design-sem-nome.jp',
        banner_evento: 'https://i.ibb.co/bjTgK85b/Design-sem-nome.jp',
        status: 'active',
        has_payment: false,
        payment_gateway: null,
        registration_form: JSON.stringify({
          cpf: false,
          age: false,
          gender: false,
          address: false,
          image_authorization: false,
          custom_fields: []
        }),
        lots: []
      };
      
      // Gerar slug
      const slug = eventData.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      
      console.log('   Slug gerado:', slug);
      
      // Inserir evento
      const [newEvent] = await db('events').insert({
        title: eventData.title,
        description: eventData.description,
        date: eventData.date,
        location: eventData.location,
        banner: eventData.banner,
        banner_home: eventData.banner_home,
        banner_evento: eventData.banner_evento,
        status: eventData.status,
        slug: slug,
        registration_form: eventData.registration_form,
        has_payment: eventData.has_payment,
        payment_gateway: eventData.payment_gateway,
        created_at: db.fn.now(),
        updated_at: db.fn.now()
      }).returning('*');
      
      console.log('✅ Evento criado com sucesso!');
      console.log('   ID:', newEvent.id);
      console.log('   Título:', newEvent.title);
      console.log('   Slug:', newEvent.slug);
      
      // Verificar se foi criado
      const createdEvent = await db('events').where('id', newEvent.id).first();
      if (createdEvent) {
        console.log('✅ Evento encontrado no banco:', createdEvent.title);
      } else {
        console.log('❌ Evento não encontrado após criação');
      }
      
    } catch (error) {
      console.log('❌ Erro ao criar evento:', error.message);
      console.log('   Detalhes:', error);
    }
    
    // Teste 4: Verificar eventos após criação
    console.log('\n4️⃣ Verificando eventos após criação...');
    try {
      const events = await db('events').select('*');
      console.log(`✅ Total de eventos: ${events.length}`);
      events.forEach(event => {
        console.log(`   - ${event.title} (${event.slug})`);
      });
    } catch (error) {
      console.log('❌ Erro ao buscar eventos:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  } finally {
    await db.destroy();
    console.log('\n🔚 Conexão com banco fechada.');
  }
}

testarCriarEvento(); 