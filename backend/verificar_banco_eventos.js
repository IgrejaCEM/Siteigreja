const { db } = require('./src/database/db');

console.log('🔍 VERIFICANDO BANCO DE EVENTOS');
console.log('================================\n');

async function verificarBanco() {
    try {
        // 1. Verificar se a tabela events existe
        console.log('📋 [1/4] Verificando tabela events...');
        const tableExists = await db.schema.hasTable('events');
        console.log('✅ Tabela events existe:', tableExists);
        
        if (!tableExists) {
            console.log('❌ Tabela events não existe!');
            return;
        }
        
        // 2. Contar eventos
        console.log('\n📊 [2/4] Contando eventos...');
        const countResult = await db('events').count('* as total');
        const total = countResult[0].total;
        console.log('📊 Total de eventos:', total);
        
        // 3. Listar todos os eventos
        console.log('\n📋 [3/4] Listando todos os eventos:');
        const events = await db('events').select('*').orderBy('id', 'asc');
        
        if (events.length === 0) {
            console.log('❌ Nenhum evento encontrado!');
        } else {
            events.forEach(event => {
                console.log(`📄 ID: ${event.id} | Título: ${event.title} | Status: ${event.status}`);
            });
        }
        
        // 4. Verificar evento ID 1 especificamente
        console.log('\n🎯 [4/4] Verificando evento ID 1...');
        const event1 = await db('events').where('id', 1).first();
        
        if (event1) {
            console.log('✅ Evento ID 1 encontrado!');
            console.log('📋 Título:', event1.title);
            console.log('📅 Data:', event1.date);
            console.log('📍 Local:', event1.location);
            console.log('📊 Status:', event1.status);
        } else {
            console.log('❌ Evento ID 1 não encontrado!');
        }
        
    } catch (error) {
        console.log('❌ Erro:', error.message);
    } finally {
        process.exit(0);
    }
}

verificarBanco(); 