const { db } = require('./src/database/db');

console.log('🔧 CRIANDO TABELA EVENTS');
console.log('=========================\n');

async function criarTabelaEvents() {
    try {
        // 1. Verificar se a tabela já existe
        console.log('📋 [1/3] Verificando se tabela events existe...');
        const tableExists = await db.schema.hasTable('events');
        console.log('✅ Tabela events existe:', tableExists);
        
        if (tableExists) {
            console.log('✅ Tabela já existe!');
            return;
        }
        
        // 2. Criar tabela events
        console.log('\n🔨 [2/3] Criando tabela events...');
        await db.schema.createTable('events', function(table) {
            table.increments('id').primary();
            table.string('title').notNullable();
            table.text('description').nullable();
            table.datetime('date').notNullable();
            table.string('location').nullable();
            table.string('status').defaultTo('active');
            table.integer('max_participants').defaultTo(0);
            table.decimal('price', 10, 2).defaultTo(0);
            table.string('banner').nullable();
            table.string('banner_home').nullable();
            table.string('banner_evento').nullable();
            table.string('slug').nullable();
            table.text('registration_form').nullable();
            table.boolean('has_payment').defaultTo(false);
            table.string('payment_gateway').nullable();
            table.timestamps(true, true);
        });
        console.log('✅ Tabela events criada!');
        
        // 3. Criar evento de teste
        console.log('\n🎯 [3/3] Criando evento de teste...');
        const [eventId] = await db('events').insert({
            title: 'CONNECT CONF 2025 - INPROVÁVEIS',
            description: 'Vai ter palavra profética, preletores que carregam o Céu, momentos marcantes de adoração e experiências que vão quebrar seus padrões. Você vai viver o que não conseguiria explicar. É um convite para você, o improvável.',
            date: '2025-10-24 19:00:00',
            location: 'Igreja CEM - CAJATI, localizada na Av. dos trabalhadores, N°99 - Centro, Cajati/SP',
            status: 'active',
            max_participants: 1000,
            price: 0,
            slug: 'connect-conf-2025',
            has_payment: false,
            created_at: new Date(),
            updated_at: new Date()
        });
        
        console.log('✅ Evento de teste criado com ID:', eventId);
        
        // 4. Verificar se foi criado
        const event = await db('events').where('id', eventId).first();
        console.log('📋 Evento criado:', event.title);
        
    } catch (error) {
        console.log('❌ Erro:', error.message);
    } finally {
        process.exit(0);
    }
}

criarTabelaEvents(); 